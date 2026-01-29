/**
 * Firebase Admin SDK Configuration
 * 
 * This module initializes the Firebase Admin SDK for server-side operations.
 * It provides privileged access to Firebase services.
 * 
 * SECURITY: The 'server-only' import ensures this module CANNOT be imported
 * in client components. The build will fail if this is attempted.
 */

import 'server-only';

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

/**
 * Validate that all required environment variables are set
 * 
 * Throws a descriptive error if any are missing to fail fast
 * during development rather than with cryptic runtime errors.
 */
function validateEnvironment(): void {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase Admin environment variables: ${missing.join(', ')}. ` +
      'Please check your .env.local file.'
    );
  }
}

/**
 * Sanitize the private key for Firebase Admin SDK
 * 
 * Handles various edge cases with private key formatting:
 * - Base64 encoded keys (recommended for production)
 * - Escaped newlines (\\n) from environment variables
 * - Double-escaped newlines (\\\\n) from some hosting platforms
 * - Quoted keys that may have extra escape sequences
 */
function sanitizePrivateKey(key: string): string {
  let sanitized = key.trim();
  
  // Remove surrounding quotes if present (some platforms add them)
  if ((sanitized.startsWith('"') && sanitized.endsWith('"')) ||
      (sanitized.startsWith("'") && sanitized.endsWith("'"))) {
    sanitized = sanitized.slice(1, -1);
  }
  
  // Check if the key is Base64 encoded (doesn't start with -----)
  if (!sanitized.startsWith('-----')) {
    try {
      sanitized = Buffer.from(sanitized, 'base64').toString('utf-8');
    } catch {
      // Not valid Base64, continue with original
    }
  }
  
  // Handle double-escaped newlines first (\\\\n -> \n)
  sanitized = sanitized.replace(/\\\\n/g, '\n');
  
  // Handle single-escaped newlines (\\n -> \n)
  sanitized = sanitized.replace(/\\n/g, '\n');
  
  return sanitized;
}

/**
 * Initialize Firebase Admin App (singleton pattern)
 * 
 * The Admin SDK should only be initialized once per Node.js process.
 * This checks for existing apps to prevent duplicate initialization
 * during hot module reloading in development.
 */
function getFirebaseAdminApp(): App {
  const existingApps = getApps();

  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // Validate environment before attempting initialization
  validateEnvironment();

  const privateKey = sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY!);

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// Initialize the Admin App
const adminApp = getFirebaseAdminApp();

/**
 * Firebase Admin Auth instance for server-side authentication
 * 
 * Used for:
 * - Verifying session cookies
 * - Creating session cookies
 * - Setting custom claims (admin role)
 * - Managing users
 */
export const adminAuth: Auth = getAuth(adminApp);

/**
 * Firebase Admin Firestore instance for server-side database operations
 * 
 * Used for:
 * - Privileged database reads/writes
 * - Bypassing security rules when necessary
 * - Batch operations
 */
export const adminDb: Firestore = getFirestore(adminApp);

/**
 * Firebase Admin Storage instance for server-side file operations
 * 
 * Used for:
 * - Admin file management
 * - Generating signed URLs
 * - Bulk file operations
 */
export const adminStorage: Storage = getStorage(adminApp);

// Export the admin app for advanced use cases
export { adminApp };

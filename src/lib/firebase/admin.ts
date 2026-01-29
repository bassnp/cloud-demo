/**
 * Firebase Admin SDK Configuration
 * 
 * This module initializes the Firebase Admin SDK for server-side operations.
 * It provides privileged access to Firebase services.
 * 
 * SECURITY: The 'server-only' import ensures this module CANNOT be imported
 * in client components. The build will fail if this is attempted.
 * 
 * CREDENTIALS: Supports two methods:
 * 1. FIREBASE_SERVICE_ACCOUNT_BASE64 - Base64 encoded service account JSON (recommended for production)
 * 2. Individual env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import 'server-only';

import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

/**
 * Service Account credentials interface
 */
interface ServiceAccountCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * Parse service account from Base64-encoded JSON
 * 
 * Base64 encoding is the recommended method for production deployments
 * because it avoids escape character issues that occur when platforms
 * like Sevalla, Vercel, or AWS strip backslashes from environment variables.
 */
function parseServiceAccountBase64(base64: string): ServiceAccountCredentials {
  try {
    // Clean any whitespace that may have been introduced during copy/paste
    const cleanedBase64 = base64.replace(/\s/g, '');
    const json = Buffer.from(cleanedBase64, 'base64').toString('utf-8');
    const parsed = JSON.parse(json);
    
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      throw new Error('Missing required fields in service account JSON');
    }
    
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      // Ensure private key has proper newlines (apply sanitization as safety measure)
      privateKey: sanitizePrivateKey(parsed.private_key),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64: ${message}\n` +
      'Ensure the value is valid Base64-encoded service account JSON.\n' +
      'Generate it with: node scripts/encode-service-account.js <path-to-json>'
    );
  }
}

/**
 * Sanitize and reconstruct the private key for Firebase Admin SDK
 * 
 * This function handles various malformed private key formats that occur
 * when environment variables are improperly escaped by deployment platforms.
 * 
 * Common issues this handles:
 * - Escaped newlines as literal "\n" strings
 * - Double-escaped newlines "\\n"
 * - Keys with quotes wrapped around them
 * - Keys on a single line without any newlines
 * 
 * PEM format requires:
 * - Header on its own line: "-----BEGIN PRIVATE KEY-----"
 * - Base64 content in 64-character lines
 * - Footer on its own line: "-----END PRIVATE KEY-----"
 */
function sanitizePrivateKey(key: string): string {
  let sanitized = key.trim();
  
  // Remove surrounding quotes if present (common in env var copy/paste errors)
  if ((sanitized.startsWith('"') && sanitized.endsWith('"')) ||
      (sanitized.startsWith("'") && sanitized.endsWith("'"))) {
    sanitized = sanitized.slice(1, -1);
  }
  
  // Handle various escape patterns in order of specificity
  // Order matters: handle double-escapes before single escapes
  sanitized = sanitized
    .replace(/\\\\n/g, '\n')  // Double-escaped: \\n -> actual newline
    .replace(/\\n/g, '\n');    // Single-escaped: \n -> actual newline
  
  // Check if key now has proper newlines
  if (sanitized.includes('\n') && 
      sanitized.includes('-----BEGIN PRIVATE KEY-----') &&
      sanitized.includes('-----END PRIVATE KEY-----')) {
    return sanitized;
  }
  
  // Key is malformed - attempt to reconstruct proper PEM format
  const header = '-----BEGIN PRIVATE KEY-----';
  const footer = '-----END PRIVATE KEY-----';
  
  // Extract only the Base64 content between header and footer
  let base64Content = sanitized
    .replace(header, '')
    .replace(footer, '')
    .replace(/[\s\r\n]/g, '') // Remove all whitespace
    .trim();
  
  // Validate we have something that looks like Base64
  if (!/^[A-Za-z0-9+/=]+$/.test(base64Content)) {
    throw new Error(
      'Invalid private key format. The key contains invalid characters. ' +
      'Ensure you are using the correct private key from your service account JSON.'
    );
  }
  
  // Reconstruct proper PEM with 64-character lines (PEM standard)
  const lines: string[] = [];
  for (let i = 0; i < base64Content.length; i += 64) {
    lines.push(base64Content.substring(i, i + 64));
  }
  
  return `${header}\n${lines.join('\n')}\n${footer}\n`;
}

/**
 * Get service account credentials from environment
 * 
 * Priority:
 * 1. FIREBASE_SERVICE_ACCOUNT_BASE64 (recommended for production)
 * 2. Individual environment variables
 */
function getServiceAccountCredentials(): ServiceAccountCredentials {
  // Method 1: Base64-encoded service account JSON (recommended)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return parseServiceAccountBase64(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);
  }
  
  // Method 2: Individual environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set either:\n' +
      '1. FIREBASE_SERVICE_ACCOUNT_BASE64 (recommended), or\n' +
      '2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY'
    );
  }
  
  return {
    projectId,
    clientEmail,
    privateKey: sanitizePrivateKey(privateKey),
  };
}

/**
 * Initialize Firebase Admin App (singleton pattern)
 */
function getFirebaseAdminApp(): App {
  const existingApps = getApps();

  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const credentials = getServiceAccountCredentials();

  return initializeApp({
    credential: cert(credentials as ServiceAccount),
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

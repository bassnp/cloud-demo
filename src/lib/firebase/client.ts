/**
 * Firebase Client SDK Configuration
 * 
 * This module initializes the Firebase Client SDK for browser-side operations.
 * It provides access to Firebase Auth, Firestore, and Storage services.
 * 
 * SECURITY: These are client-side credentials that are safe to expose in the browser.
 * They are protected by Firebase Security Rules, not secrecy.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Firebase client configuration from environment variables
 * 
 * All NEXT_PUBLIC_* variables are bundled into client JavaScript
 * and are visible in the browser. This is intentional and safe.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase App (singleton pattern)
 * 
 * Checks if an app already exists to prevent duplicate initialization
 * during hot module reloading in development.
 */
function getFirebaseApp(): FirebaseApp {
  const existingApps = getApps();
  
  if (existingApps.length > 0) {
    return existingApps[0];
  }
  
  return initializeApp(firebaseConfig);
}

// Initialize the Firebase App
const app = getFirebaseApp();

/**
 * Firebase Auth instance for client-side authentication
 * 
 * Used for:
 * - Sign in with email/password
 * - Sign in with Google OAuth
 * - Sign out
 * - Listen to auth state changes
 */
export const auth: Auth = getAuth(app);

/**
 * Firestore instance for client-side database operations
 * 
 * Used for:
 * - Reading public images
 * - Real-time subscriptions
 * - Client-side queries (protected by Security Rules)
 */
export const db: Firestore = getFirestore(app);

/**
 * Firebase Storage instance for client-side file operations
 * 
 * Used for:
 * - Uploading images
 * - Generating download URLs
 * - Deleting user's own images
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Google OAuth Provider for social sign-in
 * 
 * Used in login and signup forms for one-click Google authentication.
 */
export const googleProvider = new GoogleAuthProvider();

// Export the app instance for advanced use cases
export { app };

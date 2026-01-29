/**
 * Authentication Server Actions
 *
 * Handles session management using HTTP-only cookies for XSS protection.
 * All functions run server-side and use Firebase Admin SDK.
 */

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import {
  isAdminUser,
  SESSION_CONFIG,
  isExpectedSessionError,
} from '@/lib/constants';
import type { SessionUser, ActionResponse } from '@/types';

/**
 * Creates a session cookie from a Firebase ID Token
 *
 * Called after successful client-side authentication (email/password or Google OAuth).
 * The session cookie is HTTP-only to prevent XSS attacks from stealing tokens.
 *
 * @param idToken - Firebase ID token from client-side auth
 * @returns ActionResponse indicating success or failure
 */
export async function createSession(
  idToken: string
): Promise<ActionResponse<void>> {
  try {
    // Verify the ID token and extract claims
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create a session cookie with 5-day expiration
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_CONFIG.DURATION_MS,
    });

    // Set the session cookie with security flags
    const cookieStore = await cookies();
    cookieStore.set(SESSION_CONFIG.COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_CONFIG.DURATION_MS / 1000, // Convert to seconds
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      path: '/',
      sameSite: 'lax', // CSRF protection while allowing normal navigation
    });

    // Create or update user profile in Firestore
    // This is non-blocking - session is valid even if Firestore fails
    try {
      const userRef = adminDb.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();

      const now = new Date();
      if (!userDoc.exists) {
        // Create new user profile
        await userRef.set({
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          displayName: decodedToken.name || null,
          photoURL: decodedToken.picture || null,
          isBanned: false,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        // Update existing user's last login
        await userRef.update({
          updatedAt: now,
        });
      }
    } catch (firestoreError: unknown) {
      // Handle Firestore NOT_FOUND error (database doesn't exist yet)
      // Session is still valid - user can authenticate, just no profile stored
      const fsError = firestoreError as { code?: number };
      if (fsError.code === 5) {
        console.warn(
          'Firestore database not found. User authenticated but profile not stored. ' +
            'Create Firestore database in Firebase Console to enable user profiles.'
        );
      } else {
        // Log other Firestore errors but don't fail authentication
        console.error('Failed to update user profile in Firestore:', firestoreError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Session creation failed:', error);
    return {
      success: false,
      error: 'Authentication failed. Please try again.',
    };
  }
}

/**
 * Destroys the current session and redirects to login
 *
 * Clears the session cookie and redirects the user to the login page.
 * This function never returns - it always redirects.
 */
export async function destroySession(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
  redirect('/login');
}

/**
 * Signs out the current user without redirecting
 *
 * Useful when you need to handle the redirect manually.
 *
 * @returns ActionResponse indicating success
 */
export async function signOut(): Promise<ActionResponse<void>> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
  return { success: true };
}

/**
 * Retrieves the current session user from the cookie
 *
 * Verifies the session cookie using Firebase Admin SDK.
 * Returns null if no valid session exists.
 *
 * NOTE: Admin detection uses hardcoded email check (email === 'admin')
 * NOT Firebase Custom Claims.
 *
 * @returns SessionUser if authenticated, null otherwise
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  try {
    const sessionCookie = cookieStore.get(SESSION_CONFIG.COOKIE_NAME)?.value;

    if (!sessionCookie) {
      // No session cookie - expected for unauthenticated users
      return null;
    }

    // Verify the session cookie with revocation check for security
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true // checkRevoked = true for enhanced security
    );

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      displayName: decodedClaims.name,
      photoURL: decodedClaims.picture,
      isAdmin: isAdminUser(decodedClaims.email),
    };
  } catch (error: unknown) {
    // Extract error info from Firebase Auth errors (properties are non-enumerable)
    const authError = error as { code?: string; message?: string };
    const errorCode = authError.code || 'unknown';
    const errorMessage = authError.message || 'Session verification failed';

    // Clear the invalid session cookie to prevent repeated verification failures
    // This handles: expired sessions, revoked sessions, deleted users, disabled users
    try {
      cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
    } catch {
      // Cookie deletion failed - non-critical, continue
    }

    // Only log unexpected errors (not routine session invalidation scenarios)
    if (!isExpectedSessionError(errorCode)) {
      console.error(
        `Session verification failed [${errorCode}]: ${errorMessage}`
      );
    }

    return null;
  }
}

/**
 * Verifies if the current user has admin privileges
 *
 * Uses hardcoded email check: email === 'admin'
 *
 * @returns true if the current user is an admin
 */
export async function verifyAdminAccess(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.isAdmin === true;
}

/**
 * Checks if there is a valid session
 *
 * Lightweight check that only verifies cookie existence.
 * For full verification, use getSessionUser().
 *
 * @returns true if a session cookie exists
 */
export async function hasSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(SESSION_CONFIG.COOKIE_NAME);
}

/**
 * Settings Server Actions
 *
 * Server-side operations for user profile management.
 * All functions run server-side with Firebase Admin SDK.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminDb, adminAuth, adminStorage } from '@/lib/firebase/admin';
import { getSessionUser, signOut } from '@/lib/auth/actions';
import { profileSchema } from '@/lib/validations/settings';
import { sanitizeInput } from '@/lib/sanitize';
import type { ActionResponse } from '@/types';

/**
 * Update user's display name
 *
 * @param data - Object containing the new display name
 * @returns ActionResponse indicating success or failure
 */
export async function updateProfile(data: {
  displayName: string;
}): Promise<ActionResponse<void>> {
  try {
    // Verify user is authenticated
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input
    const parsed = profileSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || 'Invalid input',
      };
    }

    // Sanitize display name
    const sanitizedName = sanitizeInput(parsed.data.displayName);

    // Update Firebase Auth user
    await adminAuth.updateUser(user.uid, {
      displayName: sanitizedName,
    });

    // Update Firestore user profile
    await adminDb.collection('users').doc(user.uid).update({
      displayName: sanitizedName,
      updatedAt: new Date(),
    });

    // Revalidate pages that show user info
    revalidatePath('/settings');
    revalidatePath('/media');

    return { success: true };
  } catch (error) {
    console.error('Update profile failed:', error);
    return {
      success: false,
      error: 'Failed to update profile. Please try again.',
    };
  }
}

/**
 * Update user's profile photo URL
 *
 * @param photoURL - The new profile photo URL from Firebase Storage
 * @returns ActionResponse indicating success or failure
 */
export async function updateProfilePhoto(
  photoURL: string
): Promise<ActionResponse<void>> {
  try {
    // Verify user is authenticated
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate URL is from allowed domains (Firebase Storage)
    if (!isAllowedPhotoUrl(photoURL)) {
      return { success: false, error: 'Invalid photo URL' };
    }

    // Update Firebase Auth user
    await adminAuth.updateUser(user.uid, {
      photoURL,
    });

    // Update Firestore user profile
    await adminDb.collection('users').doc(user.uid).update({
      photoURL,
      updatedAt: new Date(),
    });

    // Revalidate pages that show user avatar
    revalidatePath('/settings');
    revalidatePath('/media');

    return { success: true };
  } catch (error) {
    console.error('Update profile photo failed:', error);
    return {
      success: false,
      error: 'Failed to update profile photo. Please try again.',
    };
  }
}

/**
 * Validate that a photo URL is from allowed Firebase Storage domains
 */
function isAllowedPhotoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const allowedHosts = [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
    ];
    
    // Check if host matches or is a subdomain of allowed hosts
    return allowedHosts.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    ) || parsed.hostname.endsWith('.firebasestorage.app');
  } catch {
    return false;
  }
}

/**
 * Delete user account and all associated data
 *
 * This action:
 * 1. Deletes all user's images from Storage
 * 2. Deletes all user's image documents from Firestore
 * 3. Deletes the user profile from Firestore
 * 4. Deletes the Firebase Auth user
 * 5. Destroys the session and redirects to login
 *
 * @returns ActionResponse indicating success or failure (only on error)
 */
export async function requestAccountDeletion(): Promise<ActionResponse<void>> {
  try {
    // Verify user is authenticated
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { uid } = user;
    const bucket = adminStorage.bucket();

    // 1. Get all user's images from Firestore
    const imagesSnapshot = await adminDb
      .collection('users')
      .doc(uid)
      .collection('images')
      .get();

    // 2. Delete images from Storage
    const deleteStoragePromises = imagesSnapshot.docs.map(async (doc) => {
      const imageData = doc.data();
      if (imageData.storagePath) {
        try {
          await bucket.file(imageData.storagePath).delete();
        } catch (err) {
          // Continue even if file doesn't exist
          console.warn(`Failed to delete storage file: ${imageData.storagePath}`, err);
        }
      }
    });
    await Promise.all(deleteStoragePromises);

    // 3. Delete avatar from Storage (if exists)
    try {
      const [avatarFiles] = await bucket.getFiles({ prefix: `avatars/${uid}/` });
      await Promise.all(avatarFiles.map((file) => file.delete()));
    } catch (err) {
      console.warn('Failed to delete avatar files:', err);
    }

    // 4. Delete image documents from Firestore
    const batch = adminDb.batch();
    imagesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 5. Delete user profile from Firestore
    batch.delete(adminDb.collection('users').doc(uid));
    await batch.commit();

    // 6. Delete Firebase Auth user
    await adminAuth.deleteUser(uid);

    // 7. Sign out and redirect (clears session cookie)
    await signOut();
    
  } catch (error) {
    console.error('Account deletion failed:', error);
    return {
      success: false,
      error: 'Failed to delete account. Please try again or contact support.',
    };
  }

  // Redirect to login after successful deletion
  redirect('/login');
}

/**
 * Get user profile with extended information
 *
 * Handles cases where Firestore database doesn't exist yet (NOT_FOUND error).
 *
 * @param uid - User ID to get profile for
 * @returns User profile with auth provider info and image counts
 */
export async function getUserProfile(uid: string) {
  try {
    const [profileDoc, authUser] = await Promise.all([
      adminDb.collection('users').doc(uid).get(),
      adminAuth.getUser(uid),
    ]);

    const profile = profileDoc.data();

    // Count user's images
    const imagesSnapshot = await adminDb
      .collection('users')
      .doc(uid)
      .collection('images')
      .get();

    const imageCount = imagesSnapshot.size;
    const publicImageCount = imagesSnapshot.docs.filter(
      (doc) => doc.data().isPublic === true
    ).length;

    // Determine auth providers
    const providers = authUser.providerData.map((p) => p.providerId);
    const hasPassword = providers.includes('password');
    const hasGoogle = providers.includes('google.com');

    return {
      uid,
      email: authUser.email || '',
      displayName: profile?.displayName || authUser.displayName || '',
      photoURL: profile?.photoURL || authUser.photoURL || null,
      createdAt: profile?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      imageCount,
      publicImageCount,
      hasPassword,
      hasGoogle,
      isBanned: profile?.isBanned || false,
    };
  } catch (error: unknown) {
    // Handle Firestore NOT_FOUND error (database doesn't exist yet)
    const firestoreError = error as { code?: number };
    if (firestoreError.code === 5) {
      console.warn(
        'Firestore database not found. Create database in Firebase Console.'
      );
      // Return minimal profile from Auth only
      const authUser = await adminAuth.getUser(uid);
      const providers = authUser.providerData.map((p) => p.providerId);
      return {
        uid,
        email: authUser.email || '',
        displayName: authUser.displayName || '',
        photoURL: authUser.photoURL || null,
        createdAt: new Date().toISOString(),
        imageCount: 0,
        publicImageCount: 0,
        hasPassword: providers.includes('password'),
        hasGoogle: providers.includes('google.com'),
        isBanned: false,
      };
    }
    throw error;
  }
}

/**
 * Admin Server Actions
 *
 * Server actions for admin-only operations.
 * All actions verify admin access before execution using hardcoded email check.
 *
 * SECURITY: Each action calls verifyAdminAccess() which checks:
 * 1. User is authenticated
 * 2. User email === 'admin'
 */

'use server';

import { adminAuth, adminDb, adminStorage } from '@/lib/firebase/admin';
import { getSessionUser } from '@/lib/auth/actions';
import { isAdminUser } from '@/lib/constants';
import { serializeTimestamp } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import type { ActionResponse, AdminStats, SerializedImage } from '@/types';

/**
 * Verify caller is admin (hardcoded email check)
 *
 * @returns True if current user is admin, false otherwise
 */
async function verifyAdminAccess(): Promise<boolean> {
  const user = await getSessionUser();
  return !!user && isAdminUser(user.email);
}

/**
 * User with statistics for admin view
 */
export interface UserWithStats {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  lastSignIn: string | null;
  isDisabled: boolean;
  imageCount: number;
  publicImageCount: number;
}

/**
 * Get admin dashboard statistics
 *
 * @returns AdminStats object with user and image counts
 */
export async function getAdminStats(): Promise<ActionResponse<AdminStats>> {
  try {
    if (!(await verifyAdminAccess())) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Get all users from Firebase Auth
    const usersResult = await adminAuth.listUsers(1000);
    const totalUsers = usersResult.users.length;
    const disabledCount = usersResult.users.filter((u) => u.disabled).length;

    // Get image statistics from Firestore
    const usersSnapshot = await adminDb.collection('users').get();
    let totalImages = 0;
    let publicImages = 0;
    let totalStorageBytes = 0;

    for (const userDoc of usersSnapshot.docs) {
      const imagesSnapshot = await adminDb
        .collection('users')
        .doc(userDoc.id)
        .collection('images')
        .get();

      totalImages += imagesSnapshot.size;

      for (const imageDoc of imagesSnapshot.docs) {
        const imageData = imageDoc.data();
        if (imageData.isPublic) {
          publicImages++;
        }
        if (imageData.size) {
          totalStorageBytes += imageData.size;
        }
      }
    }

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers: totalUsers - disabledCount,
        bannedUsers: disabledCount,
        totalImages,
        publicImages,
        totalStorageBytes,
      },
    };
  } catch (error) {
    console.error('Failed to get admin stats:', error);
    return { success: false, error: 'Failed to get statistics' };
  }
}

/**
 * Get all users with their statistics
 *
 * @returns Array of users with image counts and status
 */
export async function getAllUsers(): Promise<ActionResponse<UserWithStats[]>> {
  try {
    if (!(await verifyAdminAccess())) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const usersResult = await adminAuth.listUsers(100);
    const users: UserWithStats[] = [];

    for (const authUser of usersResult.users) {
      // Get Firestore profile
      const profileDoc = await adminDb.collection('users').doc(authUser.uid).get();
      const profile = profileDoc.data();

      // Count images
      const imagesSnapshot = await adminDb
        .collection('users')
        .doc(authUser.uid)
        .collection('images')
        .get();

      const publicImageCount = imagesSnapshot.docs.filter(
        (doc) => doc.data().isPublic
      ).length;

      users.push({
        uid: authUser.uid,
        email: authUser.email || '',
        displayName: profile?.displayName || authUser.displayName || 'Unknown User',
        photoURL: profile?.photoURL || authUser.photoURL || null,
        createdAt: authUser.metadata.creationTime || new Date().toISOString(),
        lastSignIn: authUser.metadata.lastSignInTime || null,
        isDisabled: authUser.disabled,
        imageCount: imagesSnapshot.size,
        publicImageCount,
      });
    }

    return { success: true, data: users };
  } catch (error) {
    console.error('Failed to get users:', error);
    return { success: false, error: 'Failed to get users' };
  }
}

/**
 * Ban a user (disable their account)
 *
 * Disables the user in Firebase Auth, preventing login.
 * Also revokes their refresh tokens to force immediate logout.
 *
 * @param uid - User ID to ban
 */
export async function banUser(
  uid: string
): Promise<ActionResponse<void>> {
  try {
    if (!(await verifyAdminAccess())) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Get current user to prevent self-ban
    const currentUser = await getSessionUser();
    if (currentUser?.uid === uid) {
      return { success: false, error: 'Cannot ban your own account' };
    }

    // Disable user in Firebase Auth
    await adminAuth.updateUser(uid, { disabled: true });

    // Revoke all refresh tokens to force immediate logout
    await adminAuth.revokeRefreshTokens(uid);

    // Update ban status in Firestore
    await adminDb.collection('users').doc(uid).update({
      isBanned: true,
      updatedAt: new Date(),
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to ban user:', error);
    return { success: false, error: 'Failed to ban user' };
  }
}

/**
 * Unban a user (re-enable their account)
 *
 * @param uid - User ID to unban
 */
export async function unbanUser(
  uid: string
): Promise<ActionResponse<void>> {
  try {
    if (!(await verifyAdminAccess())) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Re-enable user in Firebase Auth
    await adminAuth.updateUser(uid, { disabled: false });

    // Update ban status in Firestore
    await adminDb.collection('users').doc(uid).update({
      isBanned: false,
      updatedAt: new Date(),
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to unban user:', error);
    return { success: false, error: 'Failed to unban user' };
  }
}

/**
 * Delete a user and all their data permanently
 *
 * This operation:
 * 1. Deletes all user images from Storage
 * 2. Deletes all image documents from Firestore
 * 3. Deletes user profile from Firestore
 * 4. Deletes user from Firebase Auth
 *
 * @param uid - User ID to delete
 */
export async function deleteUser(
  uid: string
): Promise<ActionResponse<void>> {
  try {
    if (!(await verifyAdminAccess())) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Get current user to prevent self-deletion
    const currentUser = await getSessionUser();
    if (currentUser?.uid === uid) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    // 1. Delete all images from Storage
    const imagesSnapshot = await adminDb
      .collection('users')
      .doc(uid)
      .collection('images')
      .get();

    const bucket = adminStorage.bucket();
    const deletePromises: Promise<void>[] = [];

    for (const imageDoc of imagesSnapshot.docs) {
      const imageData = imageDoc.data();
      if (imageData.storagePath) {
        deletePromises.push(
          bucket
            .file(imageData.storagePath)
            .delete()
            .then(() => undefined)
            .catch((err) => {
              // Log but don't fail if file doesn't exist
              console.warn(`Failed to delete file ${imageData.storagePath}:`, err);
            })
        );
      }
    }

    await Promise.all(deletePromises);

    // 2. Delete all image documents from Firestore
    const batch = adminDb.batch();
    for (const imageDoc of imagesSnapshot.docs) {
      batch.delete(imageDoc.ref);
    }
    await batch.commit();

    // 3. Delete user profile from Firestore
    await adminDb.collection('users').doc(uid).delete();

    // 4. Delete user from Firebase Auth
    await adminAuth.deleteUser(uid);

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Get all images for a specific user (admin only)
 *
 * @param uid - User ID whose images to retrieve
 */
export async function getUserImages(uid: string): Promise<
  ActionResponse<SerializedImage[]>
> {
  try {
    if (!(await verifyAdminAccess())) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const imagesSnapshot = await adminDb
      .collection('users')
      .doc(uid)
      .collection('images')
      .orderBy('uploadedAt', 'desc')
      .get();

    const images: SerializedImage[] = imagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        url: data.url,
        storagePath: data.storagePath,
        caption: data.caption || '',
        width: data.width || 0,
        height: data.height || 0,
        size: data.size || 0,
        contentType: data.contentType || 'image/jpeg',
        isPublic: data.isPublic || false,
        uploadedAt: serializeTimestamp(data.uploadedAt),
      };
    });

    return { success: true, data: images };
  } catch (error) {
    console.error('Failed to get user images:', error);
    return { success: false, error: 'Failed to get images' };
  }
}

/**
 * Admin delete any user's image
 *
 * @param targetUserId - Owner of the image
 * @param imageId - Firestore document ID
 */
export async function adminDeleteImage(
  targetUserId: string,
  imageId: string
): Promise<ActionResponse<void>> {
  try {
    if (!(await verifyAdminAccess())) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Get image document
    const imageRef = adminDb
      .collection('users')
      .doc(targetUserId)
      .collection('images')
      .doc(imageId);

    const imageDoc = await imageRef.get();
    if (!imageDoc.exists) {
      return { success: false, error: 'Image not found' };
    }

    const imageData = imageDoc.data();

    // Delete from Storage
    if (imageData?.storagePath) {
      const bucket = adminStorage.bucket();
      await bucket.file(imageData.storagePath).delete().catch((err) => {
        console.warn(`Failed to delete file ${imageData.storagePath}:`, err);
      });
    }

    // Delete from Firestore
    await imageRef.delete();

    revalidatePath('/admin');
    revalidatePath('/public');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete image:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}

/**
 * Admin update any user's image
 *
 * @param targetUserId - Owner of the image
 * @param imageId - Firestore document ID
 * @param updates - Fields to update
 */
export async function adminUpdateImage(
  targetUserId: string,
  imageId: string,
  updates: { caption?: string; isPublic?: boolean }
): Promise<ActionResponse<void>> {
  try {
    if (!(await verifyAdminAccess())) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const imageRef = adminDb
      .collection('users')
      .doc(targetUserId)
      .collection('images')
      .doc(imageId);

    const imageDoc = await imageRef.get();
    if (!imageDoc.exists) {
      return { success: false, error: 'Image not found' };
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.caption !== undefined) {
      updateData.caption = updates.caption;
    }

    if (updates.isPublic !== undefined) {
      updateData.isPublic = updates.isPublic;
    }

    await imageRef.update(updateData);

    revalidatePath('/admin');
    revalidatePath('/public');

    return { success: true };
  } catch (error) {
    console.error('Failed to update image:', error);
    return { success: false, error: 'Failed to update image' };
  }
}

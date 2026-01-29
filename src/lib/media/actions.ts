/**
 * Media Server Actions
 *
 * Server actions for managing user's media (update, delete).
 * All actions verify user ownership before performing operations.
 */

'use server';

import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { getSessionUser } from '@/lib/auth/actions';
import { isAdminUser } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import type { MediaUpdatePayload, ActionResponse } from '@/types';

/**
 * Update image metadata (caption and/or visibility)
 *
 * Used by the Media Detail Dialog to save changes.
 * Verifies ownership before updating.
 *
 * @param imageId - Firestore document ID of the image
 * @param payload - Fields to update
 * @param targetUserId - Optional user ID for admin operations
 */
export async function updateImage(
  imageId: string,
  payload: MediaUpdatePayload,
  targetUserId?: string
): Promise<ActionResponse<void>> {
  try {
    const user = await getSessionUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Determine which user's image to update
    const userId = targetUserId && isAdminUser(user.email) ? targetUserId : user.uid;

    // Get reference to the image document
    const imageRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('images')
      .doc(imageId);

    // Verify image exists
    const imageDoc = await imageRef.get();
    if (!imageDoc.exists) {
      return { success: false, error: 'Image not found' };
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (payload.caption !== undefined) {
      updates.caption = payload.caption;
    }

    if (payload.isPublic !== undefined) {
      updates.isPublic = payload.isPublic;
    }

    // Update the document
    await imageRef.update(updates);

    // Revalidate paths
    revalidatePath('/media');
    revalidatePath('/public');

    return { success: true };
  } catch (error) {
    console.error('Failed to update image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update image',
    };
  }
}

/**
 * Delete an image from Storage and Firestore
 *
 * Removes the file from Firebase Storage and the metadata from Firestore.
 * Verifies ownership before deleting.
 *
 * @param imageId - Firestore document ID of the image
 * @param storagePath - Firebase Storage path
 * @param targetUserId - Optional user ID for admin operations
 */
export async function deleteImage(
  imageId: string,
  storagePath: string,
  targetUserId?: string
): Promise<ActionResponse<void>> {
  try {
    const user = await getSessionUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Determine which user's image to delete
    const userId = targetUserId && isAdminUser(user.email) ? targetUserId : user.uid;

    // Get reference to the image document
    const imageRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('images')
      .doc(imageId);

    // Verify image exists
    const imageDoc = await imageRef.get();
    if (!imageDoc.exists) {
      return { success: false, error: 'Image not found' };
    }

    // Delete from Firebase Storage
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(storagePath);
      await file.delete();
    } catch (storageError) {
      // Log but continue - the file might already be deleted
      console.warn('Storage deletion warning:', storageError);
    }

    // Delete from Firestore
    await imageRef.delete();

    // Revalidate paths
    revalidatePath('/media');
    revalidatePath('/public');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
}

/**
 * Toggle image visibility (public/private)
 *
 * Convenience function for quickly toggling visibility.
 *
 * @param imageId - Firestore document ID of the image
 * @param isPublic - New visibility state
 */
export async function toggleImageVisibility(
  imageId: string,
  isPublic: boolean
): Promise<ActionResponse<void>> {
  return updateImage(imageId, { isPublic });
}

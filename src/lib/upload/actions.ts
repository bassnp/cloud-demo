/**
 * Upload Server Actions
 *
 * Server actions for saving image metadata after upload.
 */

'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from '@/lib/auth/actions';
import { revalidatePath } from 'next/cache';
import type { ImageMetadata, ActionResponse } from '@/types';

/**
 * Save image metadata to Firestore after successful upload
 *
 * Called after the image is uploaded to Firebase Storage.
 * Creates a new document in the user's images subcollection.
 *
 * @param metadata - Image metadata to save
 */
export async function saveImageMetadata(
  metadata: ImageMetadata
): Promise<ActionResponse<{ imageId: string }>> {
  try {
    const user = await getSessionUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Create image document
    const imageData = {
      url: metadata.url,
      storagePath: metadata.storagePath,
      caption: '',
      contentType: metadata.contentType,
      size: metadata.size,
      width: metadata.width,
      height: metadata.height,
      isPublic: false, // Default to private
      uploadedAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to user's images subcollection
    const imageRef = await adminDb
      .collection('users')
      .doc(user.uid)
      .collection('images')
      .add(imageData);

    // Revalidate the media page
    revalidatePath('/media');

    return {
      success: true,
      data: { imageId: imageRef.id },
    };
  } catch (error) {
    console.error('Failed to save image metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save image',
    };
  }
}

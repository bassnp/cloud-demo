'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from '@/lib/auth/actions';
import { FieldValue } from 'firebase-admin/firestore';
import type { ActionResponse } from '@/types';

/**
 * Toggle favorite status for an image
 */
export async function toggleFavorite(
  imageId: string, 
  ownerId: string
): Promise<ActionResponse<{ isFavorited: boolean }>> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: 'Authentication required' };
  }

  try {
    const favoriteRef = adminDb
      .collection('users')
      .doc(user.uid)
      .collection('favorites')
      .doc(imageId);

    const doc = await favoriteRef.get();

    if (doc.exists) {
      await favoriteRef.delete();
      return { success: true, data: { isFavorited: false } };
    } else {
      await favoriteRef.set({
        imageId,
        ownerId,
        favoritedAt: FieldValue.serverTimestamp(),
      });
      return { success: true, data: { isFavorited: true } };
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return { success: false, error: 'Failed to update favorite' };
  }
}

/**
 * Get user's favorited image IDs
 */
export async function getUserFavorites(): Promise<ActionResponse<string[]>> {
  const user = await getSessionUser();
  if (!user) {
    return { success: true, data: [] };
  }

  try {
    const favoritesSnapshot = await adminDb
      .collection('users')
      .doc(user.uid)
      .collection('favorites')
      .get();

    const favoriteIds = favoritesSnapshot.docs.map(doc => doc.id);
    return { success: true, data: favoriteIds };
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return { success: true, data: [] };
  }
}

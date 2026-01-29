/**
 * Public Gallery Page
 *
 * Displays all public images from all users.
 * Accessible to everyone including unauthenticated visitors.
 */

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from '@/lib/auth/actions';
import { getUserFavorites } from '@/lib/favorites/actions';
import { serializeTimestamp } from '@/lib/utils';
import { PublicGalleryClient } from '@/components/public/public-gallery-client';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Globe, UserPlus } from 'lucide-react';
import Link from 'next/link';
import type { PublicImageWithOwner } from '@/types';

/**
 * Fetch all public images from all users
 *
 * Queries each user's images subcollection for public images
 * and includes owner information.
 *
 * Handles cases where:
 * - Firestore database doesn't exist yet (NOT_FOUND error)
 * - Users collection is empty
 * - No public images exist
 */
async function getPublicImages(): Promise<PublicImageWithOwner[]> {
  try {
    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();

    // If no users exist, return empty array
    if (usersSnapshot.empty) {
      return [];
    }

    const allPublicImages: PublicImageWithOwner[] = [];

    // For each user, get their public images
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      // Skip banned users
      if (userData.isBanned) continue;

      const imagesSnapshot = await adminDb
        .collection('users')
        .doc(userDoc.id)
        .collection('images')
        .where('isPublic', '==', true)
        .orderBy('uploadedAt', 'desc')
        .get();

      const userImages: PublicImageWithOwner[] = imagesSnapshot.docs.map(
        (doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            url: data.url,
            storagePath: data.storagePath,
            caption: data.caption || '',
            width: data.width || 800,
            height: data.height || 600,
            size: data.size || 0,
            contentType: data.contentType || 'image/jpeg',
            isPublic: true,
            uploadedAt: serializeTimestamp(data.uploadedAt),
            owner: {
              uid: userDoc.id,
              displayName: userData.displayName || null,
              photoURL: userData.photoURL || null,
            },
          };
        }
      );

      allPublicImages.push(...userImages);
    }

    // Sort all images by upload date (newest first)
    allPublicImages.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return allPublicImages;
  } catch (error: unknown) {
    // Handle Firestore NOT_FOUND error (database/collection doesn't exist yet)
    // This is expected when the app is first deployed before any users sign up
    const firestoreError = error as { code?: number };
    if (firestoreError.code === 5) {
      console.warn(
        'Firestore database or collection not found. ' +
          'This is expected if no users have signed up yet.'
      );
      return [];
    }

    console.error('Failed to fetch public images:', error);
    return [];
  }
}

/**
 * Public Gallery Page Component
 *
 * Server component that fetches and displays public images.
 * Shows different UI based on authentication state.
 */
export default async function PublicPage() {
  const user = await getSessionUser();
  const images = await getPublicImages();
  const favoritesResult = await getUserFavorites();
  const initialFavorites = favoritesResult.success ? favoritesResult.data ?? [] : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Public Gallery"
        description={`${images.length} public ${images.length === 1 ? 'image' : 'images'} from the community`}
        icon={<Globe className="h-5 w-5" />}
      />

      {/* Image Grid with Search and Lightbox */}
      {images.length > 0 ? (
        <PublicGalleryClient
          images={images}
          isAuthenticated={!!user}
          initialFavorites={initialFavorites}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No public images yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            {user
              ? "Be the first to share an image! Go to 'My Media' to upload."
              : 'The gallery is empty. Sign up to be the first to share an image!'}
          </p>
          {!user && (
            <Button asChild>
              <Link href="/signup">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up Free
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Call to Action for Unauthenticated Users */}
      {!user && images.length > 0 && (
        <div className="mt-12 text-center py-8 border-t">
          <p className="text-muted-foreground mb-4">
            Want to upload your own images?
          </p>
          <Button asChild>
            <Link href="/signup">
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up Free
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

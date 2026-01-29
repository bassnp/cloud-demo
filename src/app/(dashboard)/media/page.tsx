/**
 * My Media Page
 *
 * User's personal media management page.
 * Upload, view, edit, and delete images.
 */

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from '@/lib/auth/actions';
import { serializeTimestamp } from '@/lib/utils';
import { MediaGrid } from '@/components/media/media-grid';
import { UploadZone } from '@/components/media/upload-zone';
import { PageHeader } from '@/components/layout/page-header';
import { Images } from 'lucide-react';
import type { SerializedImage } from '@/types';

/**
 * Fetch user's images from Firestore
 *
 * Handles cases where Firestore database doesn't exist yet (NOT_FOUND error)
 */
async function getUserImages(uid: string): Promise<SerializedImage[]> {
  try {
    const snapshot = await adminDb
      .collection('users')
      .doc(uid)
      .collection('images')
      .orderBy('uploadedAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
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
        isPublic: data.isPublic ?? false,
        uploadedAt: serializeTimestamp(data.uploadedAt),
      };
    });
  } catch (error: unknown) {
    // Handle Firestore NOT_FOUND error (database doesn't exist yet)
    const firestoreError = error as { code?: number };
    if (firestoreError.code === 5) {
      console.warn(
        'Firestore database not found. Create database in Firebase Console.'
      );
      return [];
    }
    console.error('Failed to fetch user images:', error);
    return [];
  }
}

/**
 * My Media Page Component
 *
 * Server component that displays user's media with upload functionality.
 */
export default async function MediaPage() {
  const user = await getSessionUser();

  // This should never happen due to layout protection, but TypeScript needs it
  if (!user) {
    return null;
  }

  const images = await getUserImages(user.uid);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="My Media"
        description={`${images.length} ${images.length === 1 ? 'image' : 'images'} in your library`}
        icon={<Images className="h-5 w-5" />}
      />

      {/* Upload Zone */}
      <UploadZone />

      {/* Image Grid */}
      {images.length > 0 ? (
        <MediaGrid images={images} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Images className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No images yet</h2>
          <p className="text-muted-foreground max-w-md">
            Upload your first image using the upload zone above. You can drag
            and drop files or click to browse.
          </p>
        </div>
      )}
    </div>
  );
}

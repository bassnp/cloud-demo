/**
 * Media Grid Component
 *
 * Responsive grid layout for user's media with staggered animations.
 * Features click-to-edit dialog and empty state handling.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaCard } from './media-card';
import { MediaDetailDialog } from './media-detail-dialog';
import { updateImage, deleteImage } from '@/lib/media/actions';
import type { SerializedImage, MediaUpdatePayload } from '@/types';

/**
 * Media grid props
 */
interface MediaGridProps {
  images: SerializedImage[];
}

/**
 * Media Grid Component
 *
 * Displays user's images in a responsive grid.
 * Clicking an image opens the detail dialog for editing.
 */
export function MediaGrid({ images: initialImages }: MediaGridProps) {
  const router = useRouter();
  const [images, setImages] = useState<SerializedImage[]>(initialImages);

  /**
   * Sync local state when server data changes (e.g., after upload + router.refresh())
   */
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);
  const [selectedImage, setSelectedImage] = useState<SerializedImage | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle opening the detail dialog
   */
  const handleImageClick = (image: SerializedImage) => {
    setSelectedImage(image);
  };

  /**
   * Handle closing the detail dialog
   */
  const handleDialogClose = () => {
    setSelectedImage(null);
  };

  /**
   * Handle saving image changes (caption, visibility)
   */
  const handleSave = async (payload: MediaUpdatePayload): Promise<boolean> => {
    if (!selectedImage) return false;

    setIsSaving(true);
    try {
      const result = await updateImage(selectedImage.id, payload);

      if (result.success) {
        // Update local state
        setImages((prev) =>
          prev.map((img) =>
            img.id === selectedImage.id
              ? {
                  ...img,
                  caption: payload.caption ?? img.caption,
                  isPublic: payload.isPublic ?? img.isPublic,
                }
              : img
          )
        );
        // Update selected image
        setSelectedImage((prev) =>
          prev
            ? {
                ...prev,
                caption: payload.caption ?? prev.caption,
                isPublic: payload.isPublic ?? prev.isPublic,
              }
            : null
        );
        // Refresh server data
        router.refresh();
        return true;
      } else {
        console.error('Failed to save:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Save error:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle deleting an image
   */
  const handleDelete = async (): Promise<boolean> => {
    if (!selectedImage) return false;

    setIsDeleting(true);
    try {
      const result = await deleteImage(
        selectedImage.id,
        selectedImage.storagePath
      );

      if (result.success) {
        // Remove from local state
        setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
        // Close dialog
        setSelectedImage(null);
        // Refresh server data
        router.refresh();
        return true;
      } else {
        console.error('Failed to delete:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Image Grid - Increased gap for premium spacing */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                'animate-fade-up',
                // Staggered animation delay based on index (max 15 cards)
                'opacity-0'
              )}
              style={{
                animationDelay: `${Math.min(index, 15) * 50}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <MediaCard
                image={image}
                onClick={() => handleImageClick(image)}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State with Animation */
        <div className="col-span-full flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="rounded-full bg-muted p-6 mb-4">
            <ImageOff className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No images yet
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Upload your first image to get started with your media collection.
          </p>
        </div>
      )}

      {/* Detail Dialog */}
      <MediaDetailDialog
        image={selectedImage}
        open={!!selectedImage}
        onOpenChange={(open) => !open && handleDialogClose()}
        onSave={handleSave}
        onDelete={handleDelete}
        isSaving={isSaving}
        isDeleting={isDeleting}
      />
    </>
  );
}

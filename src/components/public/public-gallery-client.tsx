/**
 * Public Gallery Client Wrapper
 *
 * Client component that manages state for the public gallery:
 * - Search query filtering
 * - Lightbox open/close
 * - Currently selected image
 * - Navigation between images
 * - Favorites (if authenticated)
 */

'use client';

import { useState, useMemo, useCallback, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import type { PublicImageWithOwner } from '@/types';
import { PublicSearch } from './public-search';
import { PublicGrid } from './public-grid';
import { ImageLightbox } from './image-lightbox';
import { toggleFavorite } from '@/lib/favorites/actions';
import { useToast } from '@/hooks/use-toast';

/**
 * Props for the public gallery client wrapper
 */
interface PublicGalleryClientProps {
  images: PublicImageWithOwner[];
  isAuthenticated: boolean;
  initialFavorites?: string[];
}

/**
 * Public Gallery Client Component
 *
 * Manages all client-side state and interactions for the public gallery:
 * - Search/filter functionality
 * - Lightbox viewing with navigation
 * - Favorites management (authenticated users)
 */
export function PublicGalleryClient({
  images,
  isAuthenticated,
  initialFavorites = [],
}: PublicGalleryClientProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<PublicImageWithOwner | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(initialFavorites)
  );

  /**
   * Handle ?image= query parameter to open specific image directly
   */
  useEffect(() => {
    const imageId = searchParams.get('image');
    if (imageId) {
      const targetImage = images.find((img) => img.id === imageId);
      if (targetImage) {
        setSelectedImage(targetImage);
        setIsLightboxOpen(true);
      }
    }
  }, [searchParams, images]);

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const query = searchQuery.toLowerCase();
    return images.filter((img) => {
      const captionMatch = img.caption?.toLowerCase().includes(query);
      const ownerMatch = img.owner.displayName?.toLowerCase().includes(query);
      return captionMatch || ownerMatch;
    });
  }, [images, searchQuery]);

  const getCurrentIndex = useCallback(() => {
    if (!selectedImage) return -1;
    return filteredImages.findIndex((img) => img.id === selectedImage.id);
  }, [selectedImage, filteredImages]);

  const handleNext = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex >= 0 && currentIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[currentIndex + 1]);
    }
  }, [getCurrentIndex, filteredImages]);

  const handlePrev = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      setSelectedImage(filteredImages[currentIndex - 1]);
    }
  }, [getCurrentIndex, filteredImages]);

  const handleImageClick = useCallback((image: PublicImageWithOwner) => {
    setSelectedImage(image);
    setIsLightboxOpen(true);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
  }, []);

  const handleToggleFavorite = useCallback(
    (image: PublicImageWithOwner) => {
      if (!isAuthenticated) return;

      const imageId = image.id;
      const ownerId = image.owner.uid;
      const wasInFavorites = favorites.has(imageId);

      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(imageId)) {
          next.delete(imageId);
        } else {
          next.add(imageId);
        }
        return next;
      });

      startTransition(async () => {
        const result = await toggleFavorite(imageId, ownerId);
        if (!result.success) {
          setFavorites((prev) => {
            const rollback = new Set(prev);
            if (wasInFavorites) {
              rollback.add(imageId);
            } else {
              rollback.delete(imageId);
            }
            return rollback;
          });
          toast({
            title: result.error || 'Failed to update favorite',
            variant: 'destructive',
          });
        }
      });
    },
    [isAuthenticated, favorites, toast]
  );

  const currentIndex = getCurrentIndex();
  const hasNext = currentIndex >= 0 && currentIndex < filteredImages.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <>
      <PublicSearch onSearch={setSearchQuery} />

      {filteredImages.length === 0 && searchQuery.trim() ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No images found</h2>
          <p className="text-muted-foreground">
            No images match &quot;{searchQuery}&quot;. Try a different search term.
          </p>
        </div>
      ) : (
        <PublicGrid images={filteredImages} onImageClick={handleImageClick} />
      )}

      <ImageLightbox
        image={selectedImage}
        isOpen={isLightboxOpen}
        onClose={handleLightboxClose}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={hasNext}
        hasPrev={hasPrev}
        isFavorite={selectedImage ? favorites.has(selectedImage.id) : false}
        onToggleFavorite={
          isAuthenticated && selectedImage
            ? () => handleToggleFavorite(selectedImage)
            : undefined
        }
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}

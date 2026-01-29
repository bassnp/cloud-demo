'use client';

/**
 * Lightbox Actions Component
 *
 * Renders action buttons (Download, Share, Favorite, Close) positioned
 * at the top-right of the lightbox with glassmorphism styling.
 */

import { Download, Share2, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { PublicImageWithOwner } from '@/types';

interface LightboxActionsProps {
  image: PublicImageWithOwner;
  onClose: () => void;
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
  isAuthenticated?: boolean;
}

const actionButtonStyles = cn(
  'h-10 w-10 rounded-full',
  'bg-white/10 backdrop-blur-md',
  'hover:bg-white/20',
  'border border-white/20',
  'text-white',
  'transition-all duration-200',
  'flex items-center justify-center'
);

export function LightboxActions({
  image,
  onClose,
  isFavorited = false,
  onFavoriteToggle,
  isAuthenticated = false,
}: LightboxActionsProps) {
  const { toast } = useToast();

  /**
   * Downloads the image by opening it in a new tab (avoids CORS issues with Firebase Storage)
   */
  function handleDownload() {
    const link = document.createElement('a');
    link.href = image.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Opening image in new tab...', description: 'Right-click and "Save image as..." to download', variant: 'success' });
  }

  /**
   * Shares a direct link to view this image on the website
   */
  async function handleShare() {
    const shareUrl = `${window.location.origin}/public?image=${image.id}`;
    const shareData = {
      title: image.caption || 'Shared Image',
      text: `Check out this image${image.owner.displayName ? ` by ${image.owner.displayName}` : ''}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: 'Shared successfully!', variant: 'success' });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Link copied to clipboard!', variant: 'success' });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({ title: 'Link copied to clipboard!', variant: 'success' });
        } catch {
          toast({ title: 'Failed to share', variant: 'destructive' });
        }
      }
    }
  }

  /**
   * Handles favorite toggle
   */
  function handleFavoriteToggle() {
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
  }

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
      <button
        type="button"
        onClick={handleDownload}
        className={actionButtonStyles}
        aria-label="Download image"
      >
        <Download className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={handleShare}
        className={actionButtonStyles}
        aria-label="Share image"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {isAuthenticated && onFavoriteToggle && (
        <button
          type="button"
          onClick={handleFavoriteToggle}
          className={actionButtonStyles}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={cn('h-5 w-5', isFavorited && 'fill-current text-red-500')}
          />
        </button>
      )}

      <button
        type="button"
        onClick={onClose}
        className={actionButtonStyles}
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

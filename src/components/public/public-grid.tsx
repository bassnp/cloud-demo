/**
 * Public Grid Component
 *
 * Premium masonry-style grid for displaying public images.
 * Features shadow lift effects, staggered animations, and owner overlays.
 * Supports theme-aware colors (Pacific Blue light / Lime Moss dark).
 */

'use client';

import Image from 'next/image';
import { formatDate, cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PublicImageWithOwner } from '@/types';

/**
 * Public grid props
 */
interface PublicGridProps {
  images: PublicImageWithOwner[];
  onImageClick?: (image: PublicImageWithOwner) => void;
}

/**
 * Get owner initials for avatar fallback
 */
function getOwnerInitials(owner: PublicImageWithOwner['owner']): string {
  if (owner.displayName) {
    return owner.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return 'U';
}

/**
 * Public Grid Component
 *
 * Premium masonry layout with:
 * - Shadow lift on hover
 * - Staggered fade-in animations
 * - Theme-aware gradient overlays
 * - Owner avatar with ring styling
 */
export function PublicGrid({ images, onImageClick }: PublicGridProps) {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
      {images.map((image, index) => (
        <div
          key={image.id}
          role={onImageClick ? 'button' : undefined}
          tabIndex={onImageClick ? 0 : undefined}
          onClick={() => onImageClick?.(image)}
          onKeyDown={(e) => {
            if (onImageClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onImageClick(image);
            }
          }}
          className={cn(
            // Premium card styling
            'relative overflow-hidden rounded-xl break-inside-avoid group cursor-pointer',
            // Enhanced shadow with hover effects
            'shadow-xl hover:shadow-2xl',
            // Hover lift and z-index for overlap effect
            'hover:-translate-y-2 hover:z-10',
            // Smooth transitions
            'transition-all duration-300 ease-out',
            // Staggered fade-in animation
            'animate-fade-up opacity-0'
          )}
          style={{
            animationDelay: `${Math.min(index, 20) * 75}ms`,
            animationFillMode: 'forwards',
          }}
        >
          {/* Image with zoom effect */}
          <Image
            src={image.url}
            alt={image.caption || 'Public image'}
            width={image.width}
            height={image.height}
            className={cn(
              'w-full h-auto object-cover',
              // Enhanced zoom on hover
              'group-hover:scale-105',
              // Brightness adjustment
              'brightness-100 group-hover:brightness-105',
              // Smooth transition
              'transition-all duration-500 ease-out'
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Hover Overlay - Theme-aware Gradient with Blur */}
          <div
            className={cn(
              'absolute inset-0',
              // Premium gradient - Theme-aware (neutral black in dark mode)
              'bg-gradient-to-t from-oxford-navy-900/90 via-oxford-navy-900/40 to-transparent',
              'dark:from-black/95 dark:via-black/60 dark:to-transparent',
              // Glassmorphism effect
              'backdrop-blur-[2px]',
              // Hover reveal
              'opacity-0 group-hover:opacity-100',
              // Smooth transition
              'transition-opacity duration-300 ease-out'
            )}
          >
            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              {/* Caption */}
              {image.caption && (
                <p className="text-sm font-medium mb-3 line-clamp-2">
                  {image.caption}
                </p>
              )}

              {/* Owner Info */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 ring-2 ring-white/30 ring-offset-2 ring-offset-transparent">
                  <AvatarImage
                    src={image.owner.photoURL ?? undefined}
                    alt={image.owner.displayName ?? ''}
                  />
                  <AvatarFallback className="text-xs bg-pacific-blue-500/80 dark:bg-lime-moss-500/80 text-white dark:text-lime-moss-950 font-medium">
                    {getOwnerInitials(image.owner)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {image.owner.displayName || 'Anonymous'}
                  </p>
                  <p className="text-xs text-white/70">
                    {formatDate(image.uploadedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

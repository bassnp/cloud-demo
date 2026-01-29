/**
 * Media Card Component
 *
 * Individual media item card with premium hover effects and visibility indicators.
 * Features shadow lift, image zoom, brand-colored badges, and caption overlays.
 * Supports theme-aware colors (Pacific Blue light / Lime Moss dark).
 */

'use client';

import Image from 'next/image';
import { Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SerializedImage } from '@/types';

/**
 * Media card props
 */
interface MediaCardProps {
  image: SerializedImage;
  onClick: () => void;
}

/**
 * Media Card Component
 *
 * Premium media card with:
 * - Shadow lift effect on hover
 * - Image zoom with brightness adjustment
 * - Brand-colored visibility badges (Lime Moss/Oxford Navy)
 * - Slide-up caption overlay
 * - Theme-aware border colors
 */
export function MediaCard({ image, onClick }: MediaCardProps) {
  return (
    <div
      className={cn(
        // Base container styles
        'relative overflow-hidden rounded-xl cursor-pointer group',
        // Premium gradient background
        'bg-gradient-to-br from-card to-muted/30',
        // Enhanced shadow with hover lift
        'shadow-lg hover:shadow-2xl',
        // Hover lift animation
        'hover:-translate-y-2',
        // Border transition for focus state - Theme-aware
        'border-2 border-transparent',
        'hover:border-pacific-blue-400 dark:hover:border-lime-moss-400',
        // Smooth transitions
        'transition-all duration-300 ease-out',
        // Performance optimization - GPU acceleration
        'will-change-transform'
      )}
      onClick={onClick}
      // Keyboard accessibility
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View ${image.caption || 'image'} - ${image.isPublic ? 'Public' : 'Private'}`}
    >
      {/* Aspect ratio container */}
      <div className="relative aspect-square">
        {/* Image with zoom and brightness effects */}
        <Image
          src={image.url}
          alt={image.caption || 'Image'}
          fill
          className={cn(
            'object-cover',
            // Enhanced zoom on hover (105 → 110)
            'group-hover:scale-110',
            // Brightness adjustment on hover
            'brightness-100 group-hover:brightness-105',
            // Smooth transition
            'transition-all duration-700 ease-out'
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />

        {/* Visibility Badge - Lime Moss for Public, Neutral for Private - Theme-aware */}
        <div
          className={cn(
            'absolute top-2 right-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
            'shadow-md transition-all duration-200',
            image.isPublic
              ? 'bg-lime-moss-500/90 text-lime-moss-950 shadow-lime-moss-500/30'
              : 'bg-oxford-navy-800/90 text-oxford-navy-100 shadow-oxford-navy-900/30 dark:bg-neutral-800/90 dark:text-neutral-100 dark:shadow-black/30'
          )}
        >
          {image.isPublic ? (
            <>
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">Public</span>
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              <span className="hidden sm:inline">Private</span>
            </>
          )}
        </div>

        {/* Caption Overlay with Slide-up Animation - Theme-aware */}
        {image.caption && (
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 p-3',
              // Premium gradient overlay - Theme-aware
              'bg-gradient-to-t from-oxford-navy-900/90 via-oxford-navy-900/60 to-transparent',
              'dark:from-black/95 dark:via-black/70 dark:to-transparent',
              // Glassmorphism effect
              'backdrop-blur-sm',
              // Slide-up animation from hidden
              'translate-y-full group-hover:translate-y-0',
              // Smooth transition
              'transition-transform duration-300 ease-out'
            )}
          >
            <p className="text-white text-sm font-medium truncate">
              {image.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

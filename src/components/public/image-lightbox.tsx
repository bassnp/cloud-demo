'use client';

/**
 * Image Lightbox Component
 *
 * Fullscreen image viewer with:
 * - Frameless design with max-w-[90vw] max-h-[90vh]
 * - Blurred backdrop using bg-black/90 backdrop-blur-xl
 * - Top-right action buttons (Download, Share, Favorite, Close)
 * - Keyboard support (Escape to close, Arrow keys for navigation)
 * - Click-to-zoom: clicking image toggles zoom, clicking backdrop closes
 * - Proper accessibility (focus trap, aria-labels)
 * - Theme-aware styling matching the design system
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LightboxActions } from './lightbox-actions';
import type { PublicImageWithOwner } from '@/types';

interface ImageLightboxProps {
  image: PublicImageWithOwner | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isAuthenticated?: boolean;
}

export function ImageLightbox({
  image,
  isOpen,
  onClose,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  isFavorite = false,
  onToggleFavorite,
  isAuthenticated = false,
}: ImageLightboxProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const zoomScale = useMemo(() => {
    if (!image || typeof window === 'undefined') return 1;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const baseW = viewportW * 0.9;
    const baseH = viewportH * 0.9;
    const aspectRatio = image.width / image.height;
    let fitW: number, fitH: number;
    if (baseW / baseH > aspectRatio) {
      fitH = baseH;
      fitW = fitH * aspectRatio;
    } else {
      fitW = baseW;
      fitH = fitW / aspectRatio;
    }
    const scaleToFillScreen = Math.min(viewportW / fitW, viewportH / fitH);
    const scaleToNativeSize = Math.max(image.width / fitW, image.height / fitH);
    const maxScale = Math.max(scaleToFillScreen, scaleToNativeSize, 1.5);
    return Math.max(maxScale, 1.1);
  }, [image]);

  useEffect(() => {
    if (!isOpen) setIsZoomed(false);
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          if (isZoomed) {
            setIsZoomed(false);
          } else {
            onClose();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (hasNext && onNext) onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (hasPrev && onPrev) onPrev();
          break;
      }
    },
    [isOpen, isZoomed, onClose, onNext, onPrev, hasNext, hasPrev]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsZoomed((prev) => !prev);
    },
    []
  );

  if (!image) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50',
            'bg-black/90 backdrop-blur-xl',
            'motion-safe:animate-fade-in',
            'motion-reduce:opacity-100'
          )}
        />

        <DialogPrimitive.Content
          ref={contentRef}
          className={cn(
            'fixed inset-0 z-50',
            'flex items-center justify-center',
            'outline-none'
          )}
          aria-label="Image lightbox"
          aria-describedby={undefined}
          onClick={handleBackdropClick}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">
            {image.caption || 'Image viewer'}
          </DialogPrimitive.Title>

          <LightboxActions
            image={image}
            onClose={onClose}
            isFavorited={isFavorite}
            onFavoriteToggle={onToggleFavorite}
            isAuthenticated={isAuthenticated}
          />

          {hasPrev && onPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 z-50',
                'h-12 w-12 rounded-full',
                'bg-white/10 backdrop-blur-md',
                'hover:bg-white/20',
                'border border-white/20',
                'text-white',
                'transition-all duration-200',
                'flex items-center justify-center',
                'opacity-0 hover:opacity-100 focus:opacity-100',
                'group-hover:opacity-100'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div
            ref={imageContainerRef}
            onClick={handleImageClick}
            className={cn(
              'relative',
              'max-w-[90vw] max-h-[90vh]',
              'motion-safe:animate-scale-in',
              'motion-reduce:scale-100',
              'transition-transform duration-300 ease-out',
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            )}
            style={{
              transform: isZoomed ? `scale(${zoomScale})` : 'scale(1)',
            }}
          >
            <Image
              src={image.url}
              alt={image.caption || 'Full size image'}
              width={image.width}
              height={image.height}
              className={cn(
                'max-w-[90vw] max-h-[90vh]',
                'w-auto h-auto',
                'object-contain',
                'rounded-lg',
                'select-none'
              )}
              sizes="90vw"
              priority
              draggable={false}
            />
          </div>

          {hasNext && onNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 z-50',
                'h-12 w-12 rounded-full',
                'bg-white/10 backdrop-blur-md',
                'hover:bg-white/20',
                'border border-white/20',
                'text-white',
                'transition-all duration-200',
                'flex items-center justify-center',
                'opacity-0 hover:opacity-100 focus:opacity-100',
                'group-hover:opacity-100'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

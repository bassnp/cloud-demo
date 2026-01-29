/**
 * Media Page Loading State
 *
 * Displays skeleton loaders while the media page content is loading.
 * Provides visual continuity during data fetching.
 */

import { Skeleton, MediaGridSkeleton } from '@/components/ui/skeleton';
import { Images } from 'lucide-react';

/**
 * Media Loading Component
 *
 * Shows skeleton placeholders for:
 * - Page header
 * - Upload zone
 * - Media grid
 */
export default function MediaLoading() {
  return (
    <div className="space-y-6 page-enter">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
          <Images className="h-5 w-5 text-primary/50" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Upload Zone Skeleton */}
      <div className="relative">
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>

      {/* Media Grid Skeleton */}
      <MediaGridSkeleton count={8} />
    </div>
  );
}

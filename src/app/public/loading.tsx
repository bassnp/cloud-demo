/**
 * Public Gallery Loading State
 *
 * Displays skeleton loaders while the public gallery content is loading.
 * Provides visual continuity during data fetching.
 */

import { Skeleton, MediaGridSkeleton } from '@/components/ui/skeleton';
import { Globe } from 'lucide-react';

/**
 * Public Loading Component
 *
 * Shows skeleton placeholders for:
 * - Page header
 * - Public gallery grid
 */
export default function PublicLoading() {
  return (
    <div className="space-y-6 page-enter">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
          <Globe className="h-5 w-5 text-primary/50" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Gallery Grid Skeleton */}
      <MediaGridSkeleton count={12} />
    </div>
  );
}

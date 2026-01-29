/**
 * Admin Page Loading State
 *
 * Displays skeleton loaders while the admin dashboard content is loading.
 * Provides visual continuity during data fetching.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';

/**
 * Stats Grid Skeleton
 *
 * Skeleton for the admin statistics cards.
 */
function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-3"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * User List Skeleton
 *
 * Skeleton for the user management list.
 */
function UserListSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      {/* Search bar skeleton */}
      <div className="p-4 border-b border-border/50">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>

      {/* User rows skeleton */}
      <div className="divide-y divide-border/50">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Admin Loading Component
 *
 * Shows skeleton placeholders for:
 * - Page header
 * - Statistics cards
 * - User management list
 */
export default function AdminLoading() {
  return (
    <div className="space-y-8 page-enter">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
          <Shield className="h-5 w-5 text-primary/50" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Statistics Section */}
      <section>
        <Skeleton className="h-6 w-36 mb-4" />
        <StatsGridSkeleton />
      </section>

      {/* User Management Section */}
      <section>
        <Skeleton className="h-6 w-40 mb-4" />
        <UserListSkeleton />
      </section>
    </div>
  );
}

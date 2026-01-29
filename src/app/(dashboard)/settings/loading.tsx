/**
 * Settings Page Loading State
 *
 * Displays skeleton loaders while the settings page content is loading.
 * Provides visual continuity during data fetching.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';

/**
 * Settings Loading Component
 *
 * Shows skeleton placeholders for:
 * - Page header
 * - Profile settings card
 * - Danger zone card
 */
export default function SettingsLoading() {
  return (
    <div className="space-y-6 page-enter">
      {/* Page Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
          <Settings className="h-5 w-5 text-primary/50" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Profile Settings Card Skeleton */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        {/* Avatar upload skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Save button skeleton */}
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Password Reset Card Skeleton */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Danger Zone Card Skeleton */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28 bg-destructive/20" />
          <Skeleton className="h-4 w-72 bg-destructive/20" />
        </div>
        <Skeleton className="h-10 w-36 bg-destructive/20" />
      </div>
    </div>
  );
}

/**
 * Login Page Loading State
 *
 * Displays skeleton loaders while the login page content is loading.
 */

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Login Loading Component
 *
 * Shows skeleton placeholders for the login form.
 */
export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 page-enter">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-12 w-12 mx-auto rounded-lg" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Form Card Skeleton */}
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 space-y-6 shadow-lg">
          {/* Email field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Submit button */}
          <Skeleton className="h-11 w-full" />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-px flex-1" />
          </div>

          {/* Google OAuth button */}
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Link to signup */}
        <div className="text-center">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

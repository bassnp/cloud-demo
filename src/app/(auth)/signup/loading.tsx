/**
 * Signup Page Loading State
 *
 * Displays skeleton loaders while the signup page content is loading.
 */

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Signup Loading Component
 *
 * Shows skeleton placeholders for the signup form.
 */
export default function SignupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 page-enter">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-12 w-12 mx-auto rounded-lg" />
          <Skeleton className="h-8 w-56 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>

        {/* Form Card Skeleton */}
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 space-y-6 shadow-lg">
          {/* Display name field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

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

          {/* Confirm password field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
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

        {/* Link to login */}
        <div className="text-center">
          <Skeleton className="h-4 w-52 mx-auto" />
        </div>
      </div>
    </div>
  );
}

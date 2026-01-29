/**
 * Public Header Component
 *
 * Premium header bar for unauthenticated visitors on the public page.
 * Features gradient background, blur effect, and polished CTA buttons.
 */

import Link from 'next/link';
import { Images } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Public Header Component
 *
 * Displayed instead of sidebar for unauthenticated visitors
 * viewing the public gallery. Features:
 * - Gradient background with blur
 * - Bottom border with opacity
 * - Shadow on scroll
 * - Logo scale on hover
 * - Gradient Sign Up button and hover color Login button
 */
export function PublicHeader() {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full',
        'bg-gradient-to-r from-background/95 via-background/90 to-background/95',
        'backdrop-blur-xl',
        'border-b border-border/50',
        'shadow-lg shadow-black/5'
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        {/* Logo with scale hover effect - Theme-aware */}
        <Link
          href="/public"
          className="flex items-center gap-2 group hover:scale-105 transition-transform duration-200"
        >
          <div
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center',
              'bg-gradient-to-br from-pacific-blue-500 to-pacific-blue-600',
              'dark:from-lime-moss-500 dark:to-lime-moss-600',
              'shadow-lg shadow-pacific-blue-500/25 dark:shadow-lime-moss-500/25',
              'group-hover:shadow-xl group-hover:shadow-pacific-blue-500/40 dark:group-hover:shadow-lime-moss-500/40',
              'transition-all duration-300'
            )}
          >
            <Images className="h-4 w-4 text-white dark:text-lime-moss-950" />
          </div>
          <span className="font-bold text-lg group-hover:text-pacific-blue-500 dark:group-hover:text-lime-moss-400 transition-colors duration-200">
            Cloud Demo
          </span>
        </Link>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {/* Login Button - Ghost with color transition - Theme-aware */}
          <Button
            variant="ghost"
            asChild
            className={cn(
              'hover:text-pacific-blue-500 dark:hover:text-lime-moss-400',
              'hover:bg-pacific-blue-50 dark:hover:bg-lime-moss-900/30',
              'transition-colors duration-200'
            )}
          >
            <Link href="/login">Login</Link>
          </Button>

          {/* Sign Up Button - Gradient style */}
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

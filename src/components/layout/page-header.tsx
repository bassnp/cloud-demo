/**
 * Page Header Component
 *
 * Premium reusable header for page titles with enhanced icon container,
 * larger typography, and optional gradient text effect.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Page header props */
interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle or description */
  description?: string;
  /** Optional icon component */
  icon?: ReactNode;
  /** Optional action buttons (right side) */
  actions?: ReactNode;
  /** Enable gradient text for title */
  gradient?: boolean;
}

/**
 * Page Header Component
 *
 * Consistent header layout for all pages with:
 * - Enhanced icon container (12x12, gradient bg, shadow, ring)
 * - Larger title typography (3xl)
 * - Optional gradient text effect
 * - Proper description opacity
 * - Action buttons (optional, right-aligned)
 */
export function PageHeader({
  title,
  description,
  icon,
  actions,
  gradient = false,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br from-pacific-blue-500/20 to-pacific-blue-500/5',
              'dark:from-lime-moss-500/20 dark:to-lime-moss-500/5',
              'shadow-lg shadow-pacific-blue-500/10 dark:shadow-lime-moss-500/10',
              'ring-1 ring-pacific-blue-500/20 dark:ring-lime-moss-500/20',
              '[&_svg]:h-6 [&_svg]:w-6 [&_svg]:text-pacific-blue-500 dark:[&_svg]:text-lime-moss-400'
            )}
          >
            {icon}
          </div>
        )}
        <div>
          <h1
            className={cn(
              'text-3xl font-bold tracking-tight',
              gradient &&
                'bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground/80 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

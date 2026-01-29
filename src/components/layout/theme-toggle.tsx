/**
 * Theme Toggle Component
 *
 * Switch between light and dark mode with smooth transition.
 * Uses next-themes for persistence and SSR support.
 */

'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * ThemeToggle - Sidebar toggle switch for dark/light mode
 *
 * Features:
 * - Smooth icon transition between Sun and Moon
 * - Theme-aware accent colors (Pacific Blue light / Lime Moss dark)
 * - Persists preference via next-themes
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle toggle change
  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  // Show skeleton during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg',
          'text-sm font-medium text-sidebar-foreground/70'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
          <span className="text-sm">Theme</span>
        </div>
        <div className="h-6 w-11 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg',
        'text-sm font-medium text-sidebar-foreground/70',
        'hover:bg-sidebar-accent/50 transition-colors duration-200'
      )}
    >
      <div className="flex items-center gap-3">
        {isDark ? (
          <Moon className="h-5 w-5 text-lime-moss-400" />
        ) : (
          <Sun className="h-5 w-5 text-pacific-blue-600" />
        )}
        <Label htmlFor="theme-toggle" className="cursor-pointer text-sm">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Label>
      </div>
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={handleToggle}
        className={cn(
          'data-[state=checked]:bg-lime-moss-500',
          'data-[state=unchecked]:bg-pacific-blue-600'
        )}
      />
    </div>
  );
}

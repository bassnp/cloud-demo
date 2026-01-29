/**
 * Sidebar Component
 *
 * Premium glassmorphism navigation sidebar for authenticated users.
 * Features smooth hover transitions, active state indicators, theme toggle, and user profile card.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Images, Shield, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAdminUser } from '@/lib/constants';
import { destroySession } from '@/lib/auth/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeToggle } from './theme-toggle';
import type { SessionUser } from '@/types';

/** Navigation item configuration */
interface NavItem {
  title: string;
  href: string;
  icon: typeof Globe;
  adminOnly?: boolean;
}

/** Navigation items for the sidebar */
const navItems: NavItem[] = [
  { title: 'Public', href: '/public', icon: Globe },
  { title: 'My Media', href: '/media', icon: Images },
  { title: 'Admin', href: '/admin', icon: Shield, adminOnly: true },
];

/** Sidebar props */
interface SidebarProps {
  user: SessionUser;
  className?: string;
}

/** Get user initials for avatar fallback */
function getUserInitials(user: SessionUser): string {
  if (user.displayName) {
    return user.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  return 'U';
}

/**
 * Sidebar Component
 *
 * Fixed left navigation with glassmorphism design:
 * - Backdrop blur and gradient background
 * - Smooth hover translateX and icon scale effects
 * - Active state with left border accent and glow shadow
 * - User profile glassmorphism card at bottom
 */
export function Sidebar({ user, className }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = isAdminUser(user.email);

  /** Handle logout action */
  const handleLogout = async () => {
    await destroySession();
  };

  /** Filter navigation items based on user role */
  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0',
          'bg-gradient-to-b from-sidebar/95 to-sidebar backdrop-blur-xl',
          'border-r border-sidebar-border/50',
          className
        )}
      >
        {/* Logo / Brand with hover glow */}
        <div className="flex h-14 items-center border-b border-sidebar-border/50 px-4">
          <Link
            href="/public"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center',
                'bg-gradient-to-br from-pacific-blue-600 to-pacific-blue-700',
                'dark:from-lime-moss-500 dark:to-lime-moss-600',
                'shadow-lg shadow-pacific-blue-600/25 dark:shadow-lime-moss-500/25',
                'group-hover:shadow-xl group-hover:shadow-pacific-blue-600/40 dark:group-hover:shadow-lime-moss-500/40',
                'transition-all duration-300'
              )}
            >
              <Images className="h-4 w-4 text-white dark:text-lime-moss-950" />
            </div>
            <span className="font-bold text-lg group-hover:text-pacific-blue-600 dark:group-hover:text-lime-moss-400 transition-colors duration-200">
              Cloud Demo
            </span>
          </Link>
        </div>

        {/* Navigation with enhanced hover and active states */}
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {visibleNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                        'transition-all duration-200 ease-out',
                        '[&_svg]:transition-transform [&_svg]:duration-200',
                        isActive
                          ? [
                              'bg-gradient-to-r from-pacific-blue-600/20 to-pacific-blue-600/10',
                              'dark:from-lime-moss-500/20 dark:to-lime-moss-500/10',
                              'text-pacific-blue-600 dark:text-lime-moss-400',
                              'border-l-2 border-pacific-blue-600 dark:border-lime-moss-500',
                              'shadow-glow shadow-pacific-blue-600/10 dark:shadow-lime-moss-500/20',
                            ]
                          : [
                              'text-sidebar-foreground/70 hover:text-sidebar-foreground',
                              'hover:translate-x-1 hover:bg-sidebar-accent/50',
                              '[&:hover_svg]:scale-110',
                            ]
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom Section with Theme Toggle, Settings, and User Profile */}
        <div className="mt-auto border-t border-sidebar-border/50">
          {/* Theme Toggle - Above Settings */}
          <nav className="p-2 border-b border-sidebar-border/30">
            <ThemeToggle />
          </nav>

          {/* Settings Link */}
          <nav className="p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                    'transition-all duration-200 ease-out',
                    '[&_svg]:transition-transform [&_svg]:duration-200',
                    pathname === '/settings'
                      ? [
                          'bg-gradient-to-r from-pacific-blue-600/20 to-pacific-blue-600/10',
                          'dark:from-lime-moss-500/20 dark:to-lime-moss-500/10',
                          'text-pacific-blue-600 dark:text-lime-moss-400',
                          'border-l-2 border-pacific-blue-600 dark:border-lime-moss-500',
                          'shadow-glow shadow-pacific-blue-600/10 dark:shadow-lime-moss-500/20',
                        ]
                      : [
                          'text-sidebar-foreground/70 hover:text-sidebar-foreground',
                          'hover:translate-x-1 hover:bg-sidebar-accent/50',
                          '[&:hover_svg]:scale-110',
                        ]
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                Settings
              </TooltipContent>
            </Tooltip>
          </nav>

          {/* User Profile Glassmorphism Card */}
          <div className="p-4 border-t border-sidebar-border/50">
            <div
              className={cn(
                'glass rounded-xl p-3 group',
                'hover:-translate-y-0.5 transition-transform duration-200'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Avatar with gradient ring */}
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-pacific-blue-400 to-pacific-blue-600 dark:from-lime-moss-400 dark:to-lime-moss-600 opacity-75" />
                  <Avatar className="h-9 w-9 relative ring-2 ring-background">
                    <AvatarImage
                      src={user.photoURL}
                      alt={user.displayName ?? ''}
                    />
                    <AvatarFallback className="bg-pacific-blue-500/20 text-pacific-blue-600 dark:bg-lime-moss-500/20 dark:text-lime-moss-400">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground/80 truncate">
                    {user.email}
                  </p>
                </div>
                <Tooltip disableHoverableContent>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className={cn(
                        'h-8 w-8 shrink-0',
                        'hover:bg-destructive/10 hover:text-destructive',
                        'transition-colors duration-200'
                      )}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="sr-only">Log out</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Log out</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

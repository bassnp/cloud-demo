/**
 * Mobile Sidebar Component
 *
 * Off-canvas navigation for mobile and tablet devices.
 * Features smooth sheet animations, staggered nav item entrance,
 * theme toggle, and enhanced touch targets (min 44px).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Globe, Images, Shield, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAdminUser } from '@/lib/constants';
import { destroySession } from '@/lib/auth/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
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

/** Mobile sidebar props */
interface MobileSidebarProps {
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
 * Mobile Sidebar Component
 *
 * Hamburger menu that slides out a navigation sheet.
 * Features:
 * - Blurred overlay backdrop
 * - Staggered nav item animations
 * - Enhanced touch targets (44px minimum)
 * - Active states matching desktop sidebar
 */
export function MobileSidebar({ user, className }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = isAdminUser(user.email);

  /** Handle logout action */
  const handleLogout = async () => {
    setOpen(false);
    await destroySession();
  };

  /** Handle navigation click - closes sheet */
  const handleNavClick = () => {
    setOpen(false);
  };

  /** Filter navigation items based on user role */
  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <div className={cn('lg:hidden', className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px] h-11 w-11"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn(
            'w-72 p-0',
            'bg-gradient-to-b from-sidebar/98 to-sidebar backdrop-blur-xl',
            'border-r border-sidebar-border/50'
          )}
        >
          {/* Header with logo and close button */}
          <SheetHeader className="h-14 border-b border-sidebar-border/50 px-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center',
                  'bg-gradient-to-br from-pacific-blue-600 to-pacific-blue-700',
                  'dark:from-lime-moss-500 dark:to-lime-moss-600',
                  'shadow-lg shadow-pacific-blue-600/25 dark:shadow-lime-moss-500/25'
                )}
              >
                <Images className="h-4 w-4 text-white dark:text-lime-moss-950" />
              </div>
              <SheetTitle className="font-bold text-lg">Cloud Demo</SheetTitle>
            </div>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] h-11 w-11 hover:bg-sidebar-accent/50"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </SheetClose>
          </SheetHeader>

          {/* Navigation with staggered animations */}
          <nav className="flex flex-col gap-1 p-4">
            {visibleNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  style={{
                    animationDelay: `${index * 75}ms`,
                    animationFillMode: 'backwards',
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm font-medium',
                    'transition-all duration-200 ease-out',
                    'animate-fade-up',
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
              );
            })}

            {/* Theme Toggle - NEW */}
            <div className="my-2 h-px bg-sidebar-border/50" />
            <div
              style={{
                animationDelay: `${visibleNavItems.length * 75}ms`,
                animationFillMode: 'backwards',
              }}
              className="animate-fade-up"
            >
              <ThemeToggle />
            </div>

            {/* Settings with staggered animation */}
            <div className="my-2 h-px bg-sidebar-border/50" />
            <Link
              href="/settings"
              onClick={handleNavClick}
              style={{
                animationDelay: `${(visibleNavItems.length + 1) * 75}ms`,
                animationFillMode: 'backwards',
              }}
              className={cn(
                'flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm font-medium',
                'transition-all duration-200 ease-out',
                'animate-fade-up',
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
          </nav>

          {/* User Profile Glassmorphism Card (Bottom) */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border/50 p-4">
            <div
              className={cn(
                'glass rounded-xl p-3',
                'animate-fade-up',
                'hover:-translate-y-0.5 transition-transform duration-200'
              )}
              style={{ animationDelay: '250ms', animationFillMode: 'backwards' }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar with gradient ring */}
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-pacific-blue-400 to-pacific-blue-600 dark:from-lime-moss-400 dark:to-lime-moss-600 opacity-75" />
                  <Avatar className="h-10 w-10 relative ring-2 ring-background">
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
              </div>

              <Button
                variant="outline"
                className={cn(
                  'w-full mt-3 min-h-[44px]',
                  'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50',
                  'transition-colors duration-200'
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

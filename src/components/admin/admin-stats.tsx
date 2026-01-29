/**
 * Admin Stats Component
 *
 * Displays statistics cards for the admin dashboard.
 * Shows user counts, image counts, and other platform metrics.
 * Uses theme-aware icon colors (Pacific Blue light / Lime Moss dark).
 */

import { Users, Image, Globe, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatFileSize, cn } from '@/lib/utils';
import type { AdminStats } from '@/types';

/**
 * Props for AdminStats component
 */
interface AdminStatsProps {
  stats: AdminStats;
}

/**
 * Stat card configuration
 */
interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: typeof Users;
  iconColor: string;
  darkIconColor: string;
}

/**
 * Admin Stats Component
 *
 * Renders a grid of statistics cards showing:
 * - Total users
 * - Total images
 * - Public images
 * - Banned users
 */
export function AdminStats({ stats }: AdminStatsProps) {
  const cards: StatCard[] = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: `${stats.activeUsers} active`,
      icon: Users,
      iconColor: 'text-pacific-blue-600',
      darkIconColor: 'dark:text-lime-moss-400',
    },
    {
      title: 'Total Images',
      value: stats.totalImages,
      description: formatFileSize(stats.totalStorageBytes),
      icon: Image,
      iconColor: 'text-pacific-blue-500',
      darkIconColor: 'dark:text-lime-moss-500',
    },
    {
      title: 'Public Images',
      value: stats.publicImages,
      description: `${stats.totalImages > 0 ? Math.round((stats.publicImages / stats.totalImages) * 100) : 0}% of total`,
      icon: Globe,
      iconColor: 'text-lime-moss-600',
      darkIconColor: 'dark:text-lime-moss-400',
    },
    {
      title: 'Banned Users',
      value: stats.bannedUsers,
      description: stats.bannedUsers === 0 ? 'No banned users' : 'Account(s) disabled',
      icon: UserX,
      iconColor: 'text-tangerine-500',
      darkIconColor: 'dark:text-tangerine-400',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={cn('h-4 w-4', card.iconColor, card.darkIconColor)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

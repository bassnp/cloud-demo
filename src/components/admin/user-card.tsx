/**
 * User Card Component
 *
 * Individual user card for the admin user list.
 * Displays user info and action buttons (view media, ban/unban, delete).
 */

'use client';

import { useState } from 'react';
import { Eye, UserCheck, UserX, Trash2, Image as ImageIcon, Globe, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserMediaDialog } from './user-media-dialog';
import type { UserWithStats } from '@/lib/admin/actions';

/**
 * Props for UserCard component
 */
interface UserCardProps {
  /** User data to display */
  user: UserWithStats;
  /** Whether this is the current admin user */
  isCurrentUser: boolean;
  /** Whether actions are loading */
  loading: boolean;
  /** Handler for banning user */
  onBan: (uid: string) => Promise<void>;
  /** Handler for unbanning user */
  onUnban: (uid: string) => Promise<void>;
  /** Handler for deleting user */
  onDelete: (uid: string) => Promise<void>;
}

/**
 * Get user initials for avatar fallback
 */
function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * User Card Component
 *
 * Displays a single user with:
 * - Avatar and basic info
 * - Image statistics
 * - Status badge (active/banned)
 * - Action buttons
 */
export function UserCard({
  user,
  isCurrentUser,
  loading,
  onBan,
  onUnban,
  onDelete,
}: UserCardProps) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  const initials = getUserInitials(user.displayName || user.email || 'U');

  return (
    <>
      <Card className={user.isDisabled ? 'opacity-60' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {user.photoURL && (
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                )}
                <AvatarFallback className="text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{user.displayName}</h3>
                  {user.isDisabled && (
                    <Badge variant="destructive" className="text-xs">
                      Banned
                    </Badge>
                  )}
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span>{user.imageCount} images</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>{user.publicImageCount} public</span>
            </div>
          </div>

          {/* Dates */}
          <div className="text-xs text-muted-foreground">
            <p>Joined: {formatDate(user.createdAt)}</p>
            {user.lastSignIn && (
              <p>Last sign-in: {formatDate(user.lastSignIn)}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {/* View Media Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMediaDialogOpen(true)}
              disabled={user.imageCount === 0}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Media
            </Button>

            {/* Ban/Unban Button */}
            {!isCurrentUser && (
              <>
                {user.isDisabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnban(user.uid)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-1" />
                    )}
                    Unban
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBan(user.uid)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4 mr-1" />
                    )}
                    Ban
                  </Button>
                )}
              </>
            )}

            {/* Delete Button with Confirmation */}
            {!isCurrentUser && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete{' '}
                      <strong>{user.displayName}</strong>&apos;s account? This
                      will remove:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Their profile and account data</li>
                        <li>All {user.imageCount} uploaded images</li>
                        <li>All associated storage files</li>
                      </ul>
                      <p className="mt-2 font-medium text-destructive">
                        This action cannot be undone.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(user.uid)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Media Dialog */}
      <UserMediaDialog
        user={user}
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
      />
    </>
  );
}

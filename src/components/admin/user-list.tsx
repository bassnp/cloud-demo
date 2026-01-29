/**
 * User List Component
 *
 * Displays a searchable list of all users for the admin dashboard.
 * Provides filtering and actions for each user.
 */

'use client';

import { useState, useTransition } from 'react';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserCard } from './user-card';
import { banUser, unbanUser, deleteUser } from '@/lib/admin/actions';
import { useToast } from '@/hooks/use-toast';
import type { UserWithStats } from '@/lib/admin/actions';

/**
 * Props for UserList component
 */
interface UserListProps {
  /** Array of users to display */
  users: UserWithStats[];
  /** Current admin user ID */
  currentUserId: string;
}

/**
 * User List Component
 *
 * Features:
 * - Search filter by name or email
 * - User cards with actions
 * - Loading states for actions
 */
export function UserList({ users: initialUsers, currentUserId }: UserListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  /**
   * Filter users by search term
   */
  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  /**
   * Handle banning a user
   */
  const handleBan = async (uid: string) => {
    setLoadingUserId(uid);
    startTransition(async () => {
      const result = await banUser(uid);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, isDisabled: true } : u))
        );
        toast({
          title: 'User Banned',
          description: 'The user has been banned and cannot sign in.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to ban user',
        });
      }
      setLoadingUserId(null);
    });
  };

  /**
   * Handle unbanning a user
   */
  const handleUnban = async (uid: string) => {
    setLoadingUserId(uid);
    startTransition(async () => {
      const result = await unbanUser(uid);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, isDisabled: false } : u))
        );
        toast({
          title: 'User Unbanned',
          description: 'The user can now sign in again.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to unban user',
        });
      }
      setLoadingUserId(null);
    });
  };

  /**
   * Handle deleting a user
   */
  const handleDelete = async (uid: string) => {
    setLoadingUserId(uid);
    startTransition(async () => {
      const result = await deleteUser(uid);
      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.uid !== uid));
        toast({
          title: 'User Deleted',
          description: 'The user and all their data have been permanently removed.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to delete user',
        });
      }
      setLoadingUserId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          {search && ` matching "${search}"`}
        </span>
      </div>

      {/* User Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.uid}
              user={user}
              isCurrentUser={user.uid === currentUserId}
              loading={loadingUserId === user.uid || isPending}
              onBan={handleBan}
              onUnban={handleUnban}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No users found</h3>
          <p className="text-sm text-muted-foreground">
            {search
              ? 'Try adjusting your search terms'
              : 'No users have registered yet'}
          </p>
        </div>
      )}
    </div>
  );
}

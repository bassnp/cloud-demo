/**
 * Admin Page
 *
 * Admin dashboard for managing users and content.
 * Only accessible to the admin user (email === 'admin').
 *
 * Features:
 * - Platform statistics (users, images, storage)
 * - User management (view, ban/unban, delete)
 * - Access to all user media
 */

import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import { getSessionUser } from '@/lib/auth/actions';
import { isAdminUser } from '@/lib/constants';
import { getAdminStats, getAllUsers } from '@/lib/admin/actions';
import { PageHeader } from '@/components/layout/page-header';
import { AdminStats } from '@/components/admin/admin-stats';
import { UserList } from '@/components/admin/user-list';

/**
 * Admin Page Component
 *
 * Server component that:
 * 1. Verifies admin access (hardcoded email check)
 * 2. Fetches platform statistics
 * 3. Fetches all users with their stats
 * 4. Renders admin dashboard with stats and user list
 */
export default async function AdminPage() {
  // Verify admin access
  const user = await getSessionUser();
  if (!user || !isAdminUser(user.email)) {
    redirect('/public');
  }

  // Fetch admin data in parallel
  const [statsResult, usersResult] = await Promise.all([
    getAdminStats(),
    getAllUsers(),
  ]);

  // Handle errors gracefully
  const stats = statsResult.success && statsResult.data
    ? statsResult.data
    : {
        totalUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
        totalImages: 0,
        publicImages: 0,
        totalStorageBytes: 0,
      };

  const users = usersResult.success && usersResult.data
    ? usersResult.data
    : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Admin Dashboard"
        description="Manage users and platform content"
        icon={<Shield className="h-5 w-5" />}
      />

      {/* Statistics Cards */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Platform Statistics</h2>
        <AdminStats stats={stats} />
      </section>

      {/* User Management */}
      <section>
        <h2 className="text-lg font-semibold mb-4">User Management</h2>
        <UserList users={users} currentUserId={user.uid} />
      </section>
    </div>
  );
}

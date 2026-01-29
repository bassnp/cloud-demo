/**
 * Dashboard Layout
 *
 * Layout for authenticated routes requiring login.
 * Includes sidebar navigation and mobile menu.
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/actions';
import { AuthProvider } from '@/lib/auth/context';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import type { ReactNode } from 'react';

/**
 * Dashboard Layout
 *
 * Wraps all authenticated routes (media, admin, settings).
 * Redirects to login if user is not authenticated.
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  return (
    <AuthProvider initialUser={user}>
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar user={user} />

        {/* Main Content Area */}
        <div className="lg:pl-60">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
            <MobileSidebar user={user} />
            <span className="font-semibold">Cloud Demo</span>
          </header>

          {/* Page Content with enter animation */}
          <main id="main-content" className="container py-6">
            <div className="page-enter">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

/**
 * Public Page Layout
 *
 * Conditional layout for the public gallery page:
 * - Authenticated users: Full sidebar layout
 * - Unauthenticated visitors: Simple header with login/signup
 */

import { getSessionUser } from '@/lib/auth/actions';
import { AuthProvider } from '@/lib/auth/context';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { PublicHeader } from '@/components/layout/public-header';
import type { ReactNode } from 'react';

/**
 * Public Layout
 *
 * This layout is OUTSIDE the (dashboard) route group,
 * making it accessible to everyone including unauthenticated visitors.
 */
export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();

  // Unauthenticated visitors get a simple header layout
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Skip link for keyboard accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <PublicHeader />
        <main id="main-content" className="flex-1 container py-6">
          <div className="page-enter">{children}</div>
        </main>
      </div>
    );
  }

  // Authenticated users get the full sidebar layout
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

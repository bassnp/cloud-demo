/**
 * Authentication Route Group Layout
 *
 * Layout for login and signup pages.
 * Provides a centered, minimal design for auth forms.
 */

import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Auth Layout Component
 *
 * Renders authentication pages with a gradient background
 * and centered content area. Includes page enter animation.
 */
export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Skip link for keyboard accessibility */}
      <a href="#auth-content" className="skip-link">
        Skip to main content
      </a>
      <div id="auth-content" className="page-enter">
        {children}
      </div>
    </main>
  );
}

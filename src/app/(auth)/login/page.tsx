/**
 * Login Page
 *
 * Server component that handles auth state check
 * and renders the login form with glassmorphism styling.
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/actions';
import { LoginForm } from './login-form';

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

/**
 * Login Page Component
 *
 * Redirects authenticated users away from login page.
 * Renders login form for unauthenticated users with premium styling.
 */
export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const user = await getSessionUser();
  const params = await searchParams;

  // Redirect authenticated users to their intended destination or public page
  if (user) {
    redirect(params.redirect || '/public');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        {/* Header with gradient text - Theme-aware */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-pacific-blue-500 to-foreground dark:via-lime-moss-400 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm redirectTo={params.redirect} />
      </div>
    </div>
  );
}

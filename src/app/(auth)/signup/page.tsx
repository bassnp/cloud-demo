/**
 * Signup Page
 *
 * Server component that handles auth state check
 * and renders the signup form with glassmorphism styling.
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/actions';
import { SignupForm } from './signup-form';

/**
 * Signup Page Component
 *
 * Redirects authenticated users away from signup page.
 * Renders signup form for unauthenticated users with premium styling.
 */
export default async function SignupPage(): Promise<React.JSX.Element> {
  const user = await getSessionUser();

  // Redirect authenticated users to public page
  if (user) {
    redirect('/public');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        {/* Header with gradient text - Theme-aware */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-pacific-blue-500 to-foreground dark:via-lime-moss-400 bg-clip-text text-transparent">
            Create an account
          </h1>
          <p className="text-muted-foreground">
            Sign up to start sharing your images
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

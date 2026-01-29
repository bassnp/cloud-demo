/**
 * Password Reset Button Component
 *
 * Sends a password reset email to the user's email address.
 * Only available for users who signed up with email/password.
 * Features loading states and success/error feedback.
 */

'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PasswordResetButtonProps {
  /** User's email address */
  email: string;
}

/**
 * Button that sends a password reset email
 */
export function PasswordResetButton({ email }: PasswordResetButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send password reset email via Firebase Auth
   */
  const handleReset = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      console.error('Password reset failed:', err);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state with animated feedback
  if (sent) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-lg",
        "bg-lime-moss-50 dark:bg-lime-moss-950/30",
        "border-l-4 border-lime-moss-500",
        "text-sm text-lime-moss-700 dark:text-lime-moss-400",
        "animate-fade-in"
      )}>
        <CheckCircle className="h-4 w-4" />
        <span>Password reset email sent to {email}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleReset}
        disabled={isLoading}
        className={cn(
          "transition-all duration-200",
          "hover:border-pacific-blue-600/50 hover:shadow-sm",
          "dark:hover:border-lime-moss-500/50"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send Password Reset Email
          </>
        )}
      </Button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-tangerine-600 dark:text-tangerine-400 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}

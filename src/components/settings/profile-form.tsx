/**
 * Profile Form Component
 *
 * Allows users to update their display name.
 * Uses React Hook Form with Zod validation.
 * Features enhanced input styling and animated success/error feedback.
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { updateProfile } from '@/lib/settings/actions';
import { profileSchema, type ProfileFormData } from '@/lib/validations/settings';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileFormProps {
  /** Current display name */
  displayName: string;
  /** User's email address (read-only) */
  email: string;
}

/**
 * Form for editing user profile information
 */
export function ProfileForm({ displayName, email }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateProfile(data);

      if (result.success) {
        setSuccess(true);
        router.refresh();
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
      {/* Display Name Field */}
      <div className="space-y-2">
        <Label 
          htmlFor="displayName" 
          className="text-sm font-medium text-foreground/90"
        >
          Display Name
        </Label>
        <Input
          id="displayName"
          placeholder="Enter your display name"
          error={!!errors.displayName}
          {...register('displayName')}
          disabled={isLoading}
        />
        {errors.displayName && (
          <p className="text-sm text-tangerine-600 dark:text-tangerine-400 animate-fade-in">
            {errors.displayName.message}
          </p>
        )}
      </div>

      {/* Email Field (Read-only) */}
      <div className="space-y-2">
        <Label 
          htmlFor="email"
          className="text-sm font-medium text-foreground/90"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-muted/50"
        />
        <p className="text-xs text-muted-foreground">
          Email address cannot be changed
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className={cn(
          "p-3 rounded-lg",
          "bg-tangerine-50 dark:bg-tangerine-950/30",
          "border-l-4 border-tangerine-500",
          "text-sm text-tangerine-700 dark:text-tangerine-300",
          "animate-fade-in"
        )}>
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg",
          "bg-lime-moss-50 dark:bg-lime-moss-950/30",
          "border-l-4 border-lime-moss-500",
          "text-sm text-lime-moss-700 dark:text-lime-moss-400",
          "animate-fade-in"
        )}>
          <CheckCircle className="h-4 w-4" />
          Profile updated successfully
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading || !isDirty}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  );
}

/**
 * Settings Validation Schemas
 * 
 * Zod schemas for validating user settings and profile forms.
 */

import { z } from 'zod';

/**
 * Profile update validation schema
 */
export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
});

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Account deletion confirmation schema
 */
export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine(
      (val) => val.toLowerCase() === 'delete my account',
      'Please type "delete my account" to confirm'
    ),
});

/**
 * Inferred types from schemas
 */
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

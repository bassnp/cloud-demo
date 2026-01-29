/**
 * Settings Validation Tests
 *
 * Tests for settings-related Zod schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  profileSchema,
  passwordChangeSchema,
  deleteAccountSchema,
} from '@/lib/validations/settings';

describe('profileSchema', () => {
  it('should accept valid display name', () => {
    const result = profileSchema.safeParse({ displayName: 'John Doe' });
    expect(result.success).toBe(true);
  });

  it('should require minimum 2 characters', () => {
    const result = profileSchema.safeParse({ displayName: 'J' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 2');
    }
  });

  it('should enforce maximum 50 characters', () => {
    const result = profileSchema.safeParse({
      displayName: 'a'.repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('less than 50');
    }
  });

  it('should accept exactly 2 characters', () => {
    const result = profileSchema.safeParse({ displayName: 'JD' });
    expect(result.success).toBe(true);
  });

  it('should accept exactly 50 characters', () => {
    const result = profileSchema.safeParse({
      displayName: 'a'.repeat(50),
    });
    expect(result.success).toBe(true);
  });
});

describe('passwordChangeSchema', () => {
  const validData = {
    currentPassword: 'OldPassword1',
    newPassword: 'NewPassword1',
    confirmPassword: 'NewPassword1',
  };

  it('should accept valid password change', () => {
    const result = passwordChangeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should require current password', () => {
    const result = passwordChangeSchema.safeParse({
      ...validData,
      currentPassword: '',
    });
    expect(result.success).toBe(false);
  });

  it('should require minimum 8 characters for new password', () => {
    const result = passwordChangeSchema.safeParse({
      ...validData,
      newPassword: 'Short1',
      confirmPassword: 'Short1',
    });
    expect(result.success).toBe(false);
  });

  it('should require uppercase letter', () => {
    const result = passwordChangeSchema.safeParse({
      ...validData,
      newPassword: 'alllowercase1',
      confirmPassword: 'alllowercase1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('uppercase');
    }
  });

  it('should require lowercase letter', () => {
    const result = passwordChangeSchema.safeParse({
      ...validData,
      newPassword: 'ALLUPPERCASE1',
      confirmPassword: 'ALLUPPERCASE1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('lowercase');
    }
  });

  it('should require number', () => {
    const result = passwordChangeSchema.safeParse({
      ...validData,
      newPassword: 'NoNumberHere',
      confirmPassword: 'NoNumberHere',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('number');
    }
  });

  it('should require passwords to match', () => {
    const result = passwordChangeSchema.safeParse({
      ...validData,
      newPassword: 'NewPassword1',
      confirmPassword: 'DifferentPassword1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('match');
    }
  });
});

describe('deleteAccountSchema', () => {
  it('should accept valid confirmation', () => {
    const result = deleteAccountSchema.safeParse({
      confirmation: 'delete my account',
    });
    expect(result.success).toBe(true);
  });

  it('should be case insensitive', () => {
    const result = deleteAccountSchema.safeParse({
      confirmation: 'DELETE MY ACCOUNT',
    });
    expect(result.success).toBe(true);
  });

  it('should accept mixed case', () => {
    const result = deleteAccountSchema.safeParse({
      confirmation: 'Delete My Account',
    });
    expect(result.success).toBe(true);
  });

  it('should reject incorrect confirmation', () => {
    const result = deleteAccountSchema.safeParse({
      confirmation: 'delete account',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty confirmation', () => {
    const result = deleteAccountSchema.safeParse({
      confirmation: '',
    });
    expect(result.success).toBe(false);
  });
});

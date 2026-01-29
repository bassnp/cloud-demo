/**
 * Authentication Validation Schema Tests
 * 
 * Unit tests for login and signup validation schemas.
 */

import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema } from '@/lib/validations/auth';

describe('loginSchema', () => {
  it('validates correct credentials with email', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('signupSchema', () => {
  const validData = {
    displayName: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  };

  it('validates strong password with all requirements', () => {
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase letter', () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes('uppercase'))).toBe(true);
    }
  });

  it('rejects password without lowercase letter', () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: 'PASSWORD123',
      confirmPassword: 'PASSWORD123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes('lowercase'))).toBe(true);
    }
  });

  it('rejects password without number', () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: 'PasswordABC',
      confirmPassword: 'PasswordABC',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes('number'))).toBe(true);
    }
  });

  it('rejects password shorter than 8 characters', () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: 'Pass1',
      confirmPassword: 'Pass1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes('8 characters'))).toBe(true);
    }
  });

  it('rejects mismatched passwords', () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: 'Password123',
      confirmPassword: 'Password456',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('confirmPassword');
    }
  });

  it('rejects short display name', () => {
    const result = signupSchema.safeParse({
      ...validData,
      displayName: 'J',
    });
    expect(result.success).toBe(false);
  });

  it('rejects long display name', () => {
    const result = signupSchema.safeParse({
      ...validData,
      displayName: 'A'.repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = signupSchema.safeParse({
      ...validData,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });
});

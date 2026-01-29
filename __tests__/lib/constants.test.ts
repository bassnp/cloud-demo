/**
 * Constants Tests
 *
 * Unit tests for application constants and helper functions.
 */

import { describe, it, expect } from 'vitest';
import {
  ADMIN_EMAIL,
  isAdminUser,
  EXPECTED_SESSION_ERRORS,
  isExpectedSessionError,
  SESSION_CONFIG,
  UPLOAD_CONFIG,
  ROUTES,
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
  PUBLIC_ROUTES,
} from '@/lib/constants';

describe('ADMIN_EMAIL constant', () => {
  it('has the correct hardcoded value', () => {
    expect(ADMIN_EMAIL).toBe('admin@example.com');
  });
});

describe('isAdminUser function', () => {
  it('returns true for admin email', () => {
    expect(isAdminUser('admin@example.com')).toBe(true);
  });

  it('returns false for regular user emails', () => {
    expect(isAdminUser('user@example.com')).toBe(false);
  });

  it('returns false for null email', () => {
    expect(isAdminUser(null)).toBe(false);
  });

  it('returns false for undefined email', () => {
    expect(isAdminUser(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAdminUser('')).toBe(false);
  });

  it('is case sensitive', () => {
    expect(isAdminUser('Admin@example.com')).toBe(false);
    expect(isAdminUser('ADMIN@EXAMPLE.COM')).toBe(false);
  });

  it('returns false for similar emails', () => {
    expect(isAdminUser('admin@other.com')).toBe(false);
    expect(isAdminUser('superadmin@example.com')).toBe(false);
  });
});

describe('EXPECTED_SESSION_ERRORS constant', () => {
  it('contains all expected Firebase session error codes', () => {
    expect(EXPECTED_SESSION_ERRORS).toContain('auth/session-cookie-expired');
    expect(EXPECTED_SESSION_ERRORS).toContain('auth/session-cookie-revoked');
    expect(EXPECTED_SESSION_ERRORS).toContain('auth/user-not-found');
    expect(EXPECTED_SESSION_ERRORS).toContain('auth/user-disabled');
    expect(EXPECTED_SESSION_ERRORS).toContain('auth/id-token-expired');
    expect(EXPECTED_SESSION_ERRORS).toContain('auth/id-token-revoked');
    expect(EXPECTED_SESSION_ERRORS).toContain('auth/argument-error');
  });

  it('has exactly 7 expected error codes', () => {
    expect(EXPECTED_SESSION_ERRORS.length).toBe(7);
  });
});

describe('isExpectedSessionError function', () => {
  it('returns true for expired session cookie', () => {
    expect(isExpectedSessionError('auth/session-cookie-expired')).toBe(true);
  });

  it('returns true for revoked session cookie', () => {
    expect(isExpectedSessionError('auth/session-cookie-revoked')).toBe(true);
  });

  it('returns true for user-not-found error', () => {
    expect(isExpectedSessionError('auth/user-not-found')).toBe(true);
  });

  it('returns true for user-disabled error', () => {
    expect(isExpectedSessionError('auth/user-disabled')).toBe(true);
  });

  it('returns true for expired ID token', () => {
    expect(isExpectedSessionError('auth/id-token-expired')).toBe(true);
  });

  it('returns true for revoked ID token', () => {
    expect(isExpectedSessionError('auth/id-token-revoked')).toBe(true);
  });

  it('returns true for argument error (malformed cookie)', () => {
    expect(isExpectedSessionError('auth/argument-error')).toBe(true);
  });

  it('returns false for unexpected error codes', () => {
    expect(isExpectedSessionError('auth/internal-error')).toBe(false);
    expect(isExpectedSessionError('auth/network-request-failed')).toBe(false);
    expect(isExpectedSessionError('unknown')).toBe(false);
    expect(isExpectedSessionError('')).toBe(false);
    expect(isExpectedSessionError('random-error')).toBe(false);
  });

  it('returns false for partial matches', () => {
    expect(isExpectedSessionError('auth/session-cookie')).toBe(false);
    expect(isExpectedSessionError('session-cookie-expired')).toBe(false);
    expect(isExpectedSessionError('user-not-found')).toBe(false);
  });
});

describe('SESSION_CONFIG constant', () => {
  it('has correct cookie name', () => {
    expect(SESSION_CONFIG.COOKIE_NAME).toBe('session');
  });

  it('has correct duration in days', () => {
    expect(SESSION_CONFIG.DURATION_DAYS).toBe(5);
  });

  it('has correct duration in milliseconds', () => {
    const expectedMs = 5 * 24 * 60 * 60 * 1000;
    expect(SESSION_CONFIG.DURATION_MS).toBe(expectedMs);
  });

  it('duration in days matches duration in milliseconds', () => {
    const msPerDay = 24 * 60 * 60 * 1000;
    expect(SESSION_CONFIG.DURATION_MS).toBe(
      SESSION_CONFIG.DURATION_DAYS * msPerDay
    );
  });
});

describe('UPLOAD_CONFIG constant', () => {
  it('has 5MB max file size', () => {
    expect(UPLOAD_CONFIG.MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    expect(UPLOAD_CONFIG.MAX_FILE_SIZE_MB).toBe(5);
  });

  it('has correct allowed image types', () => {
    expect(UPLOAD_CONFIG.ALLOWED_TYPES).toContain('image/jpeg');
    expect(UPLOAD_CONFIG.ALLOWED_TYPES).toContain('image/png');
    expect(UPLOAD_CONFIG.ALLOWED_TYPES).toContain('image/gif');
    expect(UPLOAD_CONFIG.ALLOWED_TYPES).toContain('image/webp');
    expect(UPLOAD_CONFIG.ALLOWED_TYPES.length).toBe(4);
  });

  it('has compression quality between 0 and 1', () => {
    expect(UPLOAD_CONFIG.COMPRESSION_QUALITY).toBeGreaterThan(0);
    expect(UPLOAD_CONFIG.COMPRESSION_QUALITY).toBeLessThanOrEqual(1);
  });

  it('has max dimension of 2048px', () => {
    expect(UPLOAD_CONFIG.MAX_DIMENSION).toBe(2048);
  });
});

describe('ROUTES constant', () => {
  it('has all expected route paths', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.PUBLIC).toBe('/public');
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.SIGNUP).toBe('/signup');
    expect(ROUTES.MEDIA).toBe('/media');
    expect(ROUTES.ADMIN).toBe('/admin');
    expect(ROUTES.SETTINGS).toBe('/settings');
  });
});

describe('PROTECTED_ROUTES constant', () => {
  it('includes media, admin, and settings routes', () => {
    expect(PROTECTED_ROUTES).toContain('/media');
    expect(PROTECTED_ROUTES).toContain('/admin');
    expect(PROTECTED_ROUTES).toContain('/settings');
  });

  it('does not include public routes', () => {
    expect(PROTECTED_ROUTES).not.toContain('/');
    expect(PROTECTED_ROUTES).not.toContain('/public');
    expect(PROTECTED_ROUTES).not.toContain('/login');
    expect(PROTECTED_ROUTES).not.toContain('/signup');
  });
});

describe('ADMIN_ROUTES constant', () => {
  it('includes only the admin route', () => {
    expect(ADMIN_ROUTES).toContain('/admin');
    expect(ADMIN_ROUTES.length).toBe(1);
  });
});

describe('PUBLIC_ROUTES constant', () => {
  it('includes home, public, login, and signup routes', () => {
    expect(PUBLIC_ROUTES).toContain('/');
    expect(PUBLIC_ROUTES).toContain('/public');
    expect(PUBLIC_ROUTES).toContain('/login');
    expect(PUBLIC_ROUTES).toContain('/signup');
  });

  it('does not include protected routes', () => {
    expect(PUBLIC_ROUTES).not.toContain('/media');
    expect(PUBLIC_ROUTES).not.toContain('/admin');
    expect(PUBLIC_ROUTES).not.toContain('/settings');
  });
});

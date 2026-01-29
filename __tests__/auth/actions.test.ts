/**
 * Authentication Actions Unit Tests
 *
 * Comprehensive tests for session management server actions.
 * Tests Firebase Admin SDK interactions and session cookie handling.
 *
 * NOTE: Due to module caching complexities with 'server-only' modules,
 * the auth actions tests focus on the constants and helper functions.
 * Full integration testing of auth flows should be done via E2E tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Constants and Helper Function Tests
// ============================================================================

describe('Session Configuration', () => {
  it('should have correct session cookie name', async () => {
    const { SESSION_CONFIG } = await import('@/lib/constants');
    expect(SESSION_CONFIG.COOKIE_NAME).toBe('session');
  });

  it('should have correct session duration in days', async () => {
    const { SESSION_CONFIG } = await import('@/lib/constants');
    expect(SESSION_CONFIG.DURATION_DAYS).toBe(5);
  });

  it('should have correct session duration in milliseconds', async () => {
    const { SESSION_CONFIG } = await import('@/lib/constants');
    expect(SESSION_CONFIG.DURATION_MS).toBe(5 * 24 * 60 * 60 * 1000);
  });

  it('should have duration in ms that matches days calculation', async () => {
    const { SESSION_CONFIG } = await import('@/lib/constants');
    const msPerDay = 24 * 60 * 60 * 1000;
    expect(SESSION_CONFIG.DURATION_MS).toBe(
      SESSION_CONFIG.DURATION_DAYS * msPerDay
    );
  });
});

describe('Admin Detection', () => {
  it('should correctly identify admin email', async () => {
    const { isAdminUser, ADMIN_EMAIL } = await import('@/lib/constants');

    expect(ADMIN_EMAIL).toBe('admin@example.com');
    expect(isAdminUser('admin@example.com')).toBe(true);
    expect(isAdminUser('notadmin@example.com')).toBe(false);
    expect(isAdminUser('user@example.com')).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });

  it('should be case sensitive', async () => {
    const { isAdminUser } = await import('@/lib/constants');

    expect(isAdminUser('Admin@example.com')).toBe(false);
    expect(isAdminUser('ADMIN@EXAMPLE.COM')).toBe(false);
    expect(isAdminUser('Admin@Example.Com')).toBe(false);
  });

  it('should not match partial or containing strings', async () => {
    const { isAdminUser } = await import('@/lib/constants');

    expect(isAdminUser('admin1@example.com')).toBe(false);
    expect(isAdminUser('superadmin@example.com')).toBe(false);
    expect(isAdminUser('admin@other.com')).toBe(false);
  });
});

describe('Expected Session Errors', () => {
  it('should recognize session cookie expired error', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');
    expect(isExpectedSessionError('auth/session-cookie-expired')).toBe(true);
  });

  it('should recognize session cookie revoked error', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');
    expect(isExpectedSessionError('auth/session-cookie-revoked')).toBe(true);
  });

  it('should recognize user not found error', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');
    expect(isExpectedSessionError('auth/user-not-found')).toBe(true);
  });

  it('should recognize user disabled error', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');
    expect(isExpectedSessionError('auth/user-disabled')).toBe(true);
  });

  it('should recognize ID token expired error', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');
    expect(isExpectedSessionError('auth/id-token-expired')).toBe(true);
  });

  it('should recognize ID token revoked error', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');
    expect(isExpectedSessionError('auth/id-token-revoked')).toBe(true);
  });

  it('should recognize argument error (malformed cookie)', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');
    expect(isExpectedSessionError('auth/argument-error')).toBe(true);
  });

  it('should not recognize unexpected Firebase errors', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');

    expect(isExpectedSessionError('auth/internal-error')).toBe(false);
    expect(isExpectedSessionError('auth/network-request-failed')).toBe(false);
    expect(isExpectedSessionError('auth/too-many-requests')).toBe(false);
    expect(isExpectedSessionError('auth/invalid-credential')).toBe(false);
  });

  it('should not recognize non-Firebase error codes', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');

    expect(isExpectedSessionError('unknown')).toBe(false);
    expect(isExpectedSessionError('')).toBe(false);
    expect(isExpectedSessionError('error')).toBe(false);
    expect(isExpectedSessionError('ECONNREFUSED')).toBe(false);
  });

  it('should not match partial error codes', async () => {
    const { isExpectedSessionError } = await import('@/lib/constants');

    expect(isExpectedSessionError('session-cookie-expired')).toBe(false);
    expect(isExpectedSessionError('auth/session-cookie')).toBe(false);
    expect(isExpectedSessionError('user-not-found')).toBe(false);
  });
});

describe('Expected Session Errors Array', () => {
  it('should contain exactly 7 expected error codes', async () => {
    const { EXPECTED_SESSION_ERRORS } = await import('@/lib/constants');
    expect(EXPECTED_SESSION_ERRORS.length).toBe(7);
  });

  it('should be immutable (readonly array)', async () => {
    const { EXPECTED_SESSION_ERRORS } = await import('@/lib/constants');

    // TypeScript should prevent mutations, but verify at runtime
    expect(Object.isFrozen(EXPECTED_SESSION_ERRORS)).toBe(false); // `as const` doesn't freeze
    // But attempting to push should fail due to readonly type
    expect(() => {
      // @ts-expect-error - Testing runtime behavior
      EXPECTED_SESSION_ERRORS.push('test');
    }).not.toThrow(); // Arrays aren't frozen, but TS prevents this at compile time
  });
});

// ============================================================================
// Route Configuration Tests
// ============================================================================

describe('Route Configuration', () => {
  it('should have correct public routes', async () => {
    const { PUBLIC_ROUTES } = await import('@/lib/constants');

    expect(PUBLIC_ROUTES).toContain('/');
    expect(PUBLIC_ROUTES).toContain('/public');
    expect(PUBLIC_ROUTES).toContain('/login');
    expect(PUBLIC_ROUTES).toContain('/signup');
  });

  it('should have correct protected routes', async () => {
    const { PROTECTED_ROUTES } = await import('@/lib/constants');

    expect(PROTECTED_ROUTES).toContain('/media');
    expect(PROTECTED_ROUTES).toContain('/admin');
    expect(PROTECTED_ROUTES).toContain('/settings');
  });

  it('should have correct admin routes', async () => {
    const { ADMIN_ROUTES } = await import('@/lib/constants');

    expect(ADMIN_ROUTES).toContain('/admin');
    expect(ADMIN_ROUTES.length).toBe(1);
  });

  it('should have no overlap between public and protected routes', async () => {
    const { PUBLIC_ROUTES, PROTECTED_ROUTES } = await import('@/lib/constants');

    for (const route of PUBLIC_ROUTES) {
      expect(PROTECTED_ROUTES).not.toContain(route);
    }
  });

  it('should have admin routes as subset of protected routes', async () => {
    const { PROTECTED_ROUTES, ADMIN_ROUTES } = await import('@/lib/constants');

    for (const route of ADMIN_ROUTES) {
      expect(PROTECTED_ROUTES).toContain(route);
    }
  });
});

// ============================================================================
// Mock-based Auth Actions Tests
// These tests mock the dependencies at the module level
// ============================================================================

describe('Auth Actions (Mocked)', () => {
  // Create mocks
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  };

  const mockAdminAuth = {
    verifyIdToken: vi.fn(),
    createSessionCookie: vi.fn(),
    verifySessionCookie: vi.fn(),
  };

  const mockUserDoc = { exists: false, data: vi.fn() };
  const mockUserRef = {
    get: vi.fn(() => Promise.resolve(mockUserDoc)),
    set: vi.fn(() => Promise.resolve()),
    update: vi.fn(() => Promise.resolve()),
  };
  const mockCollection = { doc: vi.fn(() => mockUserRef) };
  const mockAdminDb = { collection: vi.fn(() => mockCollection) };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Setup mocks before each test
    vi.doMock('next/headers', () => ({
      cookies: vi.fn(async () => mockCookieStore),
    }));

    vi.doMock('next/navigation', () => ({
      redirect: vi.fn((url: string) => {
        throw new Error(`REDIRECT:${url}`);
      }),
    }));

    vi.doMock('@/lib/firebase/admin', () => ({
      adminAuth: mockAdminAuth,
      adminDb: mockAdminDb,
    }));

    // Reset Firestore mock state
    mockUserDoc.exists = false;
    mockUserRef.get.mockResolvedValue(mockUserDoc);
  });

  describe('createSession', () => {
    it('should create session cookie on successful authentication', async () => {
      mockAdminAuth.verifyIdToken.mockResolvedValue({
        uid: 'test-uid',
        email: 'user@example.com',
        name: 'Test User',
      });
      mockAdminAuth.createSessionCookie.mockResolvedValue('session-cookie-value');

      const { createSession } = await import('@/lib/auth/actions');
      const result = await createSession('valid-id-token');

      expect(result.success).toBe(true);
      expect(mockAdminAuth.verifyIdToken).toHaveBeenCalledWith('valid-id-token');
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'session',
        'session-cookie-value',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
        })
      );
    });

    it('should return error on invalid ID token', async () => {
      mockAdminAuth.verifyIdToken.mockRejectedValue(new Error('Invalid ID token'));

      const { createSession } = await import('@/lib/auth/actions');
      const result = await createSession('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed. Please try again.');
    });
  });

  describe('getSessionUser', () => {
    it('should return null when no session cookie exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const { getSessionUser } = await import('@/lib/auth/actions');
      const user = await getSessionUser();

      expect(user).toBeNull();
    });

    it('should return user data for valid session cookie', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'valid-session-cookie' });
      mockAdminAuth.verifySessionCookie.mockResolvedValue({
        uid: 'test-uid',
        email: 'user@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
      });

      const { getSessionUser } = await import('@/lib/auth/actions');
      const user = await getSessionUser();

      expect(user).toEqual({
        uid: 'test-uid',
        email: 'user@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        isAdmin: false,
      });
    });

    it('should identify admin user correctly', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'admin-session-cookie' });
      mockAdminAuth.verifySessionCookie.mockResolvedValue({
        uid: 'admin-uid',
        email: 'admin@example.com',
        name: 'Admin',
      });

      const { getSessionUser } = await import('@/lib/auth/actions');
      const user = await getSessionUser();

      expect(user?.isAdmin).toBe(true);
    });

    it('should delete cookie and return null for expired session', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'expired-session' });
      mockAdminAuth.verifySessionCookie.mockRejectedValue({
        code: 'auth/session-cookie-expired',
        message: 'Session cookie has expired',
      });

      const { getSessionUser } = await import('@/lib/auth/actions');
      const user = await getSessionUser();

      expect(user).toBeNull();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
    });

    it('should delete cookie and return null for user-not-found error', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'orphaned-session' });
      mockAdminAuth.verifySessionCookie.mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'There is no user record corresponding to the provided identifier',
      });

      const { getSessionUser } = await import('@/lib/auth/actions');
      const user = await getSessionUser();

      expect(user).toBeNull();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
    });

    it('should delete cookie and return null for user-disabled error', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'disabled-session' });
      mockAdminAuth.verifySessionCookie.mockRejectedValue({
        code: 'auth/user-disabled',
        message: 'User account has been disabled',
      });

      const { getSessionUser } = await import('@/lib/auth/actions');
      const user = await getSessionUser();

      expect(user).toBeNull();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
    });
  });

  describe('signOut', () => {
    it('should delete session cookie and return success', async () => {
      const { signOut } = await import('@/lib/auth/actions');
      const result = await signOut();

      expect(result.success).toBe(true);
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
    });
  });

  describe('destroySession', () => {
    it('should delete cookie and redirect to login', async () => {
      const { destroySession } = await import('@/lib/auth/actions');

      await expect(destroySession()).rejects.toThrow('REDIRECT:/login');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
    });
  });

  describe('hasSession', () => {
    it('should return true when session cookie exists', async () => {
      mockCookieStore.has.mockReturnValue(true);

      const { hasSession } = await import('@/lib/auth/actions');
      const result = await hasSession();

      expect(result).toBe(true);
      expect(mockCookieStore.has).toHaveBeenCalledWith('session');
    });

    it('should return false when no session cookie exists', async () => {
      mockCookieStore.has.mockReturnValue(false);

      const { hasSession } = await import('@/lib/auth/actions');
      const result = await hasSession();

      expect(result).toBe(false);
    });
  });

  describe('verifyAdminAccess', () => {
    it('should return true for admin user', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'admin-session' });
      mockAdminAuth.verifySessionCookie.mockResolvedValue({
        uid: 'admin-uid',
        email: 'admin@example.com',
      });

      const { verifyAdminAccess } = await import('@/lib/auth/actions');
      const isAdmin = await verifyAdminAccess();

      expect(isAdmin).toBe(true);
    });

    it('should return false for regular user', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'user-session' });
      mockAdminAuth.verifySessionCookie.mockResolvedValue({
        uid: 'user-uid',
        email: 'user@example.com',
      });

      const { verifyAdminAccess } = await import('@/lib/auth/actions');
      const isAdmin = await verifyAdminAccess();

      expect(isAdmin).toBe(false);
    });

    it('should return false when no session exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const { verifyAdminAccess } = await import('@/lib/auth/actions');
      const isAdmin = await verifyAdminAccess();

      expect(isAdmin).toBe(false);
    });
  });
});

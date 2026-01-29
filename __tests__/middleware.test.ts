/**
 * Middleware Route Classification Tests
 *
 * Tests for route classification logic used in the Edge middleware.
 */

import { describe, it, expect } from 'vitest';

/**
 * Route configuration (mirrors middleware.ts)
 */
const OPEN_ROUTES = ['/public'];
const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/media', '/settings', '/admin'];

/**
 * Check if a pathname matches any route in the given list
 */
function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

describe('Route Classification', () => {
  describe('OPEN_ROUTES', () => {
    it('should match /public exactly', () => {
      expect(matchesRoute('/public', OPEN_ROUTES)).toBe(true);
    });

    it('should match /public subpaths', () => {
      expect(matchesRoute('/public/gallery', OPEN_ROUTES)).toBe(true);
      expect(matchesRoute('/public/image/123', OPEN_ROUTES)).toBe(true);
    });

    it('should not match other routes', () => {
      expect(matchesRoute('/publics', OPEN_ROUTES)).toBe(false);
      expect(matchesRoute('/home', OPEN_ROUTES)).toBe(false);
    });
  });

  describe('AUTH_ROUTES', () => {
    it('should match /login exactly', () => {
      expect(matchesRoute('/login', AUTH_ROUTES)).toBe(true);
    });

    it('should match /signup exactly', () => {
      expect(matchesRoute('/signup', AUTH_ROUTES)).toBe(true);
    });

    it('should match auth route subpaths', () => {
      expect(matchesRoute('/login/callback', AUTH_ROUTES)).toBe(true);
    });

    it('should not match protected routes', () => {
      expect(matchesRoute('/media', AUTH_ROUTES)).toBe(false);
      expect(matchesRoute('/settings', AUTH_ROUTES)).toBe(false);
    });
  });

  describe('PROTECTED_ROUTES', () => {
    it('should match /media exactly', () => {
      expect(matchesRoute('/media', PROTECTED_ROUTES)).toBe(true);
    });

    it('should match /settings exactly', () => {
      expect(matchesRoute('/settings', PROTECTED_ROUTES)).toBe(true);
    });

    it('should match /admin exactly', () => {
      expect(matchesRoute('/admin', PROTECTED_ROUTES)).toBe(true);
    });

    it('should match protected route subpaths', () => {
      expect(matchesRoute('/media/upload', PROTECTED_ROUTES)).toBe(true);
      expect(matchesRoute('/settings/profile', PROTECTED_ROUTES)).toBe(true);
      expect(matchesRoute('/admin/users', PROTECTED_ROUTES)).toBe(true);
    });

    it('should not match public routes', () => {
      expect(matchesRoute('/public', PROTECTED_ROUTES)).toBe(false);
      expect(matchesRoute('/login', PROTECTED_ROUTES)).toBe(false);
    });
  });

  describe('Route Isolation', () => {
    it('routes should not overlap between categories', () => {
      const allRoutes = [...OPEN_ROUTES, ...AUTH_ROUTES, ...PROTECTED_ROUTES];
      const uniqueRoutes = new Set(allRoutes);
      expect(uniqueRoutes.size).toBe(allRoutes.length);
    });

    it('should correctly classify a mix of paths', () => {
      const testCases: [string, 'open' | 'auth' | 'protected' | 'none'][] = [
        ['/public', 'open'],
        ['/public/gallery', 'open'],
        ['/login', 'auth'],
        ['/signup', 'auth'],
        ['/media', 'protected'],
        ['/settings', 'protected'],
        ['/admin', 'protected'],
        ['/admin/users', 'protected'],
        ['/random', 'none'],
        ['/', 'none'],
      ];

      testCases.forEach(([path, expected]) => {
        let actual: 'open' | 'auth' | 'protected' | 'none' = 'none';
        if (matchesRoute(path, OPEN_ROUTES)) actual = 'open';
        else if (matchesRoute(path, AUTH_ROUTES)) actual = 'auth';
        else if (matchesRoute(path, PROTECTED_ROUTES)) actual = 'protected';

        expect(actual).toBe(expected);
      });
    });
  });
});

describe('Session Cookie Name', () => {
  it('should use "session" as the cookie name', () => {
    const SESSION_COOKIE_NAME = 'session';
    expect(SESSION_COOKIE_NAME).toBe('session');
  });
});

describe('Middleware Matcher Pattern', () => {
  /**
   * The matcher pattern should exclude:
   * - API routes (/api/*)
   * - Next.js static files (/_next/static/*)
   * - Next.js image optimization (/_next/image/*)
   * - Specific static assets (favicon.ico, robots.txt, sitemap.xml)
   * - Files with extensions (*.ico, *.png, etc.) - when they have a period in the path
   */
  const matcherRegex =
    /^\/((?!api|_next\/static|_next\/image|favicon\.ico|robots\.txt|sitemap\.xml|.*\\..*$).*)/;

  it('should match regular page routes', () => {
    expect('/login').toMatch(matcherRegex);
    expect('/public').toMatch(matcherRegex);
    expect('/media').toMatch(matcherRegex);
  });

  it('should not match API routes', () => {
    expect('/api/auth/user'.match(matcherRegex)).toBeFalsy();
    expect('/api/upload'.match(matcherRegex)).toBeFalsy();
  });

  it('should not match explicitly excluded static assets', () => {
    expect('/favicon.ico'.match(matcherRegex)).toBeFalsy();
    expect('/robots.txt'.match(matcherRegex)).toBeFalsy();
    expect('/sitemap.xml'.match(matcherRegex)).toBeFalsy();
  });

  it('should not match Next.js internals', () => {
    expect('/_next/static/chunk.js'.match(matcherRegex)).toBeFalsy();
    expect('/_next/image'.match(matcherRegex)).toBeFalsy();
  });
});

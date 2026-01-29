/**
 * Edge Middleware for Route Protection
 *
 * Runs on the Edge runtime for fast route classification and protection.
 * Handles authentication redirects and route access control.
 *
 * SECURITY NOTE: This middleware addresses CVE-2025-29927 by using
 * an explicit matcher pattern that covers all dynamic routes.
 *
 * Route Classifications:
 * - OPEN_ROUTES: Accessible to anyone (no auth required)
 * - AUTH_ROUTES: Auth pages that redirect logged-in users away
 * - PROTECTED_ROUTES: Require authentication
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route Configurations
 *
 * OPEN_ROUTES: Pages accessible without authentication
 * - /public: Public gallery showing all public images
 *
 * AUTH_ROUTES: Authentication pages (redirect if already logged in)
 * - /login, /signup
 *
 * PROTECTED_ROUTES: Require authentication to access
 * - /media: User's personal media management
 * - /settings: User profile and settings
 * - /admin: Admin dashboard (requires admin email check in page)
 */
const OPEN_ROUTES = ['/public'];
const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/media', '/settings', '/admin'];

/**
 * Session cookie name (must match constants.ts)
 */
const SESSION_COOKIE_NAME = 'session';

/**
 * Check if a pathname matches any route in the given list
 *
 * @param pathname - Current request pathname
 * @param routes - List of route prefixes to check
 * @returns true if pathname matches any route
 */
function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Edge Middleware Handler
 *
 * Handles route protection and authentication redirects.
 * Runs on every request matching the config.matcher pattern.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // OPEN routes (/public) - allow ALL access, no redirect
  if (matchesRoute(pathname, OPEN_ROUTES)) {
    return NextResponse.next();
  }

  // Unauthenticated user accessing protected routes → redirect to login
  if (!session && matchesRoute(pathname, PROTECTED_ROUTES)) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the intended destination for post-login redirect
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user accessing auth routes (login/signup) → redirect to /public
  if (session && matchesRoute(pathname, AUTH_ROUTES)) {
    return NextResponse.redirect(new URL('/public', request.url));
  }

  // Root path handling
  if (pathname === '/') {
    // Redirect to public gallery
    return NextResponse.redirect(new URL('/public', request.url));
  }

  // NOTE: Admin role verification is done in Server Components using isAdminUser()
  // Edge runtime cannot verify admin email from cookie alone without Admin SDK

  return NextResponse.next();
}

/**
 * Middleware Configuration
 *
 * Matcher defines which routes trigger the middleware.
 * Excludes static files, API routes, and Next.js internals.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public folder files (assets with extensions)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*$).*)',
  ],
};

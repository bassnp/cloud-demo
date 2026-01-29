/**
 * Application Constants
 * 
 * Centralized configuration values for the application.
 * These values are used throughout the codebase.
 */

/**
 * Admin Account Configuration
 *
 * The admin email is hardcoded for simplicity and security.
 * There is only ONE admin account in the system.
 *
 * To set up admin: Create a Firebase Auth user with this email and password.
 * Change this value to your admin email address before deploying.
 */
export const ADMIN_EMAIL = 'test@admin.admin';

/**
 * Check if a user is the admin
 * 
 * @param email - The user's email address
 * @returns True if the user is the admin
 * 
 * @example
 * if (isAdminUser(user.email)) {
 *   // Show admin features
 * }
 */
export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return email === ADMIN_EMAIL;
}

/**
 * Session Configuration
 */
export const SESSION_CONFIG = {
  /** Session cookie name */
  COOKIE_NAME: 'session',
  /** Session duration in days */
  DURATION_DAYS: 5,
  /** Session duration in milliseconds */
  DURATION_MS: 5 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Image Upload Configuration
 */
export const UPLOAD_CONFIG = {
  /** Maximum file size in bytes (5MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  /** Maximum file size in MB (for display) */
  MAX_FILE_SIZE_MB: 5,
  /** Allowed MIME types */
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
  /** Compression quality (0-1) */
  COMPRESSION_QUALITY: 0.8,
  /** Maximum dimension (width or height) after compression */
  MAX_DIMENSION: 2048,
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION_CONFIG = {
  /** Default page size for lists */
  DEFAULT_PAGE_SIZE: 20,
  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Route Paths
 */
export const ROUTES = {
  HOME: '/',
  PUBLIC: '/public',
  LOGIN: '/login',
  SIGNUP: '/signup',
  MEDIA: '/media',
  ADMIN: '/admin',
  SETTINGS: '/settings',
} as const;

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  '/media',
  '/admin',
  '/settings',
] as const;

/**
 * Admin-only routes
 */
export const ADMIN_ROUTES = [
  '/admin',
] as const;

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = [
  '/',
  '/public',
  '/login',
  '/signup',
] as const;

/**
 * Firebase Auth Error Codes
 *
 * Error codes that indicate expected session invalidation scenarios.
 * These errors should be handled silently without logging.
 */
export const EXPECTED_SESSION_ERRORS = [
  'auth/session-cookie-expired',    // Session cookie has expired
  'auth/session-cookie-revoked',    // Session was explicitly revoked
  'auth/user-not-found',            // User was deleted from Firebase Auth
  'auth/user-disabled',             // User account was disabled
  'auth/id-token-expired',          // ID token has expired
  'auth/id-token-revoked',          // ID token was revoked
  'auth/argument-error',            // Invalid cookie format (malformed)
] as const;

/**
 * Check if an error code is an expected session error
 *
 * @param code - Firebase Auth error code
 * @returns True if this is an expected/routine session error
 */
export function isExpectedSessionError(code: string): boolean {
  return EXPECTED_SESSION_ERRORS.includes(
    code as (typeof EXPECTED_SESSION_ERRORS)[number]
  );
}

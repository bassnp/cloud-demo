/**
 * Rate Limiting Utilities
 *
 * In-memory rate limiting for server actions.
 * Uses a simple sliding window approach.
 *
 * NOTE: This implementation uses in-memory storage, which works
 * for single-instance deployments. For multi-instance deployments,
 * consider using Redis or a similar distributed cache.
 */

import { headers } from 'next/headers';

/**
 * Rate limit configuration options
 */
interface RateLimitConfig {
  /** Time window in milliseconds */
  interval: number;
  /** Maximum requests allowed within the interval */
  maxRequests: number;
}

/**
 * Rate limit record for tracking requests
 */
interface RateLimitRecord {
  /** Number of requests in the current window */
  count: number;
  /** Timestamp when the window started */
  timestamp: number;
}

/**
 * In-memory store for rate limit records
 * Key format: `${action}:${clientIdentifier}`
 */
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Default rate limit configurations for different action types
 */
export const RATE_LIMIT_CONFIGS = {
  /** Authentication actions (login, signup) */
  auth: { interval: 60000, maxRequests: 5 },
  /** Profile updates */
  profile: { interval: 60000, maxRequests: 10 },
  /** Image uploads */
  upload: { interval: 60000, maxRequests: 20 },
  /** General API requests */
  api: { interval: 60000, maxRequests: 30 },
  /** Account deletion (strict limit) */
  delete: { interval: 3600000, maxRequests: 3 },
} as const;

/**
 * Clean up expired rate limit records to prevent memory leaks
 * Called periodically during rate limit checks
 */
function cleanupExpiredRecords(): void {
  const now = Date.now();
  const maxAge = 3600000; // 1 hour

  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.timestamp > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier from request headers
 * Uses X-Forwarded-For or falls back to a default
 */
async function getClientIdentifier(): Promise<string> {
  const headersList = await headers();
  
  // Try to get real IP from proxy headers
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain (client IP)
    return forwardedFor.split(',')[0].trim();
  }

  // Fallback to x-real-ip
  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Default identifier for local development
  return 'local';
}

/**
 * Check if a request is within rate limits
 *
 * @param action - The action being rate limited (e.g., 'auth', 'upload')
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 *
 * @example
 * const { allowed, remaining } = await checkRateLimit('auth');
 * if (!allowed) {
 *   return { success: false, error: 'Too many requests' };
 * }
 */
export async function checkRateLimit(
  action: string,
  config: RateLimitConfig = { interval: 60000, maxRequests: 10 }
): Promise<{ allowed: boolean; remaining: number }> {
  const clientId = await getClientIdentifier();
  const key = `${action}:${clientId}`;
  const now = Date.now();

  // Periodic cleanup (every 100 checks)
  if (Math.random() < 0.01) {
    cleanupExpiredRecords();
  }

  const record = rateLimitStore.get(key);

  // No existing record - create new window
  if (!record) {
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Check if window has expired
  if (now - record.timestamp > config.interval) {
    // Start new window
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Within current window - check count
  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(key, record);

  return { allowed: true, remaining: config.maxRequests - record.count };
}

/**
 * Reset rate limit for a specific action and client
 * Useful for testing or after successful actions that should reset limits
 *
 * @param action - The action to reset
 */
export async function resetRateLimit(action: string): Promise<void> {
  const clientId = await getClientIdentifier();
  const key = `${action}:${clientId}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without incrementing
 *
 * @param action - The action to check
 * @param config - Rate limit configuration
 * @returns Current count and time until reset
 */
export async function getRateLimitStatus(
  action: string,
  config: RateLimitConfig = { interval: 60000, maxRequests: 10 }
): Promise<{
  count: number;
  remaining: number;
  resetIn: number;
}> {
  const clientId = await getClientIdentifier();
  const key = `${action}:${clientId}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetIn: 0,
    };
  }

  const elapsed = now - record.timestamp;
  
  if (elapsed > config.interval) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetIn: 0,
    };
  }

  return {
    count: record.count,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetIn: config.interval - elapsed,
  };
}

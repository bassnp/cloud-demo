/**
 * Rate Limit Utility Tests
 *
 * Tests for rate limiting functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the headers function from next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'x-forwarded-for') return '127.0.0.1';
      return null;
    }),
  })),
}));

// Import after mocking
import {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  RATE_LIMIT_CONFIGS,
} from '@/lib/rate-limit';

describe('Rate Limit', () => {
  beforeEach(async () => {
    // Reset rate limits between tests
    await resetRateLimit('test');
  });

  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      const result = await checkRateLimit('test', {
        interval: 60000,
        maxRequests: 5,
      });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should track multiple requests', async () => {
      const config = { interval: 60000, maxRequests: 5 };

      // Make 3 requests
      await checkRateLimit('test-multi', config);
      await checkRateLimit('test-multi', config);
      const result = await checkRateLimit('test-multi', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should block when limit exceeded', async () => {
      const config = { interval: 60000, maxRequests: 2 };

      // Exhaust the limit
      await checkRateLimit('test-block', config);
      await checkRateLimit('test-block', config);

      // This should be blocked
      const result = await checkRateLimit('test-block', config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return full remaining for new action', async () => {
      const status = await getRateLimitStatus('new-action', {
        interval: 60000,
        maxRequests: 10,
      });

      expect(status.count).toBe(0);
      expect(status.remaining).toBe(10);
    });

    it('should reflect current state', async () => {
      const config = { interval: 60000, maxRequests: 10 };

      // Make some requests
      await checkRateLimit('status-test', config);
      await checkRateLimit('status-test', config);

      const status = await getRateLimitStatus('status-test', config);
      expect(status.count).toBe(2);
      expect(status.remaining).toBe(8);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for action', async () => {
      const config = { interval: 60000, maxRequests: 2 };

      // Exhaust the limit
      await checkRateLimit('reset-test', config);
      await checkRateLimit('reset-test', config);

      // Reset
      await resetRateLimit('reset-test');

      // Should be allowed again
      const result = await checkRateLimit('reset-test', config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('RATE_LIMIT_CONFIGS', () => {
    it('should have auth config', () => {
      expect(RATE_LIMIT_CONFIGS.auth).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.auth.maxRequests).toBe(5);
    });

    it('should have profile config', () => {
      expect(RATE_LIMIT_CONFIGS.profile).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.profile.maxRequests).toBe(10);
    });

    it('should have upload config', () => {
      expect(RATE_LIMIT_CONFIGS.upload).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.upload.maxRequests).toBe(20);
    });

    it('should have delete config with strict limits', () => {
      expect(RATE_LIMIT_CONFIGS.delete).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.delete.maxRequests).toBe(3);
      expect(RATE_LIMIT_CONFIGS.delete.interval).toBe(3600000); // 1 hour
    });
  });
});

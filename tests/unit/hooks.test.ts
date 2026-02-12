import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    isRateLimited,
    clearRateLimitCache,
    MAX_REQUESTS_PER_WINDOW,
    LOGIN_RATE_LIMIT,
    RATE_LIMIT_WINDOW
} from '$lib/utils/rateLimiter';

describe('Rate Limiting Utility', () => {
    beforeEach(() => {
        clearRateLimitCache();
    });

    describe('isRateLimited function', () => {
        it('should not limit first request from new IP', () => {
            const result = isRateLimited('192.168.1.1');
            expect(result).toBe(false);
        });

        it('should not limit requests within limit', () => {
            const ip = '192.168.1.2';
            for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
                const result = isRateLimited(ip);
                expect(result).toBe(false);
            }
        });

        it('should limit requests exceeding max per window', () => {
            const ip = '192.168.1.3';
            // Make requests up to the limit
            for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
                isRateLimited(ip);
            }
            // Next request should be limited
            const result = isRateLimited(ip);
            expect(result).toBe(true);
        });

        it('should respect custom limit for login', () => {
            const ip = '192.168.1.4';
            // Make requests up to login limit
            for (let i = 0; i < LOGIN_RATE_LIMIT; i++) {
                isRateLimited(ip, LOGIN_RATE_LIMIT);
            }
            // Next request should be limited
            const result = isRateLimited(ip, LOGIN_RATE_LIMIT);
            expect(result).toBe(true);
        });

        it('should track counts per IP independently', () => {
            const ip1 = '192.168.1.6';
            const ip2 = '192.168.1.7';

            // Make requests from IP1 only
            for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
                isRateLimited(ip1);
            }

            // IP1 should be limited
            expect(isRateLimited(ip1)).toBe(true);

            // IP2 should not be limited
            expect(isRateLimited(ip2)).toBe(false);
        });
    });

    describe('Rate Limit Configuration', () => {
        it('should have correct default limits', () => {
            expect(RATE_LIMIT_WINDOW).toBe(60000); // 1 minute
            expect(MAX_REQUESTS_PER_WINDOW).toBe(500);
            expect(LOGIN_RATE_LIMIT).toBe(50);
        });

        it('should have login rate limit more restrictive than general', () => {
            expect(LOGIN_RATE_LIMIT).toBeLessThan(MAX_REQUESTS_PER_WINDOW);
        });
    });
});

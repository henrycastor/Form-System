import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isRateLimited, clearRateLimitCache, RATE_LIMIT_WINDOW } from '../../src/lib/utils/rateLimiter';

describe('rateLimiter', () => {
    beforeEach(() => {
        clearRateLimitCache();
        vi.useFakeTimers();
    });

    it('should allow requests within limit', () => {
        const ip = '127.0.0.1';
        expect(isRateLimited(ip, 5)).toBe(false); // 1
        expect(isRateLimited(ip, 5)).toBe(false); // 2
        expect(isRateLimited(ip, 5)).toBe(false); // 3
        expect(isRateLimited(ip, 5)).toBe(false); // 4
        expect(isRateLimited(ip, 5)).toBe(false); // 5
    });

    it('should block requests exceeding limit', () => {
        const ip = '127.0.0.1';
        const limit = 3;

        isRateLimited(ip, limit); // 1
        isRateLimited(ip, limit); // 2
        isRateLimited(ip, limit); // 3

        expect(isRateLimited(ip, limit)).toBe(true); // 4th request blocked
    });

    it('should reset limit after window expired', () => {
        const ip = '127.0.0.2';
        const limit = 2;

        isRateLimited(ip, limit); // 1
        isRateLimited(ip, limit); // 2
        expect(isRateLimited(ip, limit)).toBe(true); // 3rd blocked

        // Fast forward time
        vi.advanceTimersByTime(RATE_LIMIT_WINDOW + 100);

        expect(isRateLimited(ip, limit)).toBe(false); // Should be allowed again
    });

    it('should track different IPs separately', () => {
        const ip1 = '1.1.1.1';
        const ip2 = '2.2.2.2';
        const limit = 1;

        isRateLimited(ip1, limit);
        expect(isRateLimited(ip1, limit)).toBe(true);

        // ip2 should still be allowed
        expect(isRateLimited(ip2, limit)).toBe(false);
    });
});

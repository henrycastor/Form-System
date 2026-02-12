/**
 * Simple rate limiter implementation
 */
export const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
export const MAX_REQUESTS_PER_WINDOW = 500;
export const LOGIN_RATE_LIMIT = 50;

const ipCache = new Map<string, { count: number; resetTime: number }>();

/**
 * Checks if an IP is rate limited
 */
export function isRateLimited(ip: string, limit: number = MAX_REQUESTS_PER_WINDOW): boolean {
    const now = Date.now();
    const rateData = ipCache.get(ip);

    if (!rateData || now > rateData.resetTime) {
        ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return false;
    }

    rateData.count++;
    return rateData.count > limit;
}

/**
 * Clears the rate limit cache
 */
export function clearRateLimitCache(): void {
    ipCache.clear();
}

/**
 * Periodically cleans up expired entries
 */
export function startCleanupInterval(intervalMs: number = 5 * 60 * 1000): NodeJS.Timeout {
    return setInterval(() => {
        const now = Date.now();
        for (const [ip, data] of ipCache.entries()) {
            if (now > data.resetTime) {
                ipCache.delete(ip);
            }
        }
    }, intervalMs);
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handle } from '../../src/hooks.server';
import { redirect, error } from '@sveltejs/kit';

// Mock SvelteKit modules
vi.mock('@sveltejs/kit', async (importOriginal) => {
    const original = await importOriginal<typeof import('@sveltejs/kit')>();
    return {
        ...original,
        redirect: vi.fn((status, location) => {
            const err = new Error('Redirect') as any;
            err.status = status;
            err.location = location;
            throw err;
        }),
    };
});

// Mock rate limiter
vi.mock('$lib/utils/rateLimiter', () => ({
    isRateLimited: vi.fn(() => false),
    MAX_REQUESTS_PER_WINDOW: 100,
    LOGIN_RATE_LIMIT: 5,
    startCleanupInterval: vi.fn(),
}));

// Mock env
vi.mock('$env/dynamic/private', () => ({
    env: { ADMIN_PASSWORD: 'test-password' }
}));

describe('hooks.server handle', () => {
    const mockResolve = vi.fn((event) => Promise.resolve(new Response('Success', { status: 200 })));

    function createEvent(pathname: string, method = 'GET', cookieValue?: string, headers = {}) {
        const url = new URL(`http://localhost${pathname}`);
        return {
            url,
            request: {
                method,
                headers: new Headers(headers),
            },
            cookies: {
                get: vi.fn((name) => (name === 'admin_session' ? cookieValue : undefined)),
            },
            getClientAddress: vi.fn(() => '127.0.0.1'),
            resolve: mockResolve,
        } as any;
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should allow public access to homepage', async () => {
        const event = createEvent('/');
        const response = await handle({ event, resolve: mockResolve });
        expect(response.status).toBe(200);
        expect(mockResolve).toHaveBeenCalled();
    });

    it('should redirect to login when accessing admin without session', async () => {
        const event = createEvent('/painel_administracao');

        try {
            await handle({ event, resolve: mockResolve });
        } catch (e: any) {
            expect(e.status).toBe(303);
            expect(e.location).toBe('/login');
        }
    });

    it('should allow access to admin with valid session', async () => {
        const event = createEvent('/painel_administracao', 'GET', 'true');
        const response = await handle({ event, resolve: mockResolve });
        expect(response.status).toBe(200);
        expect(mockResolve).toHaveBeenCalled();
    });

    it('should return 401 for API requests without session', async () => {
        const event = createEvent('/api/submissions', 'GET', undefined, {
            'accept': 'application/json'
        });

        const response = await handle({ event, resolve: mockResolve });
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error.message).toContain('Unauthorized');
    });

    it('should allow POST to /api/submissions without session (form submission)', async () => {
        const event = createEvent('/api/submissions', 'POST');
        const response = await handle({ event, resolve: mockResolve });
        expect(response.status).toBe(200);
        expect(mockResolve).toHaveBeenCalled();
    });

    it('should block non-POST to /api/submissions without session', async () => {
        const event = createEvent('/api/submissions', 'GET');

        const response = await handle({ event, resolve: mockResolve });
        expect(response.status).toBe(401);
    });

    it('should block DELETE to /api/submissions without session', async () => {
        const event = createEvent('/api/submissions', 'DELETE');

        const response = await handle({ event, resolve: mockResolve });
        expect(response.status).toBe(401);
    });

    it('should add security headers to toutes', async () => {
        const event = createEvent('/');
        const response = await handle({ event, resolve: mockResolve });

        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
});

import { redirect, error, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

import { isRateLimited, MAX_REQUESTS_PER_WINDOW, LOGIN_RATE_LIMIT, startCleanupInterval } from '$lib/utils/rateLimiter';

// Start cleanup interval
startCleanupInterval();

export const handle: Handle = async ({ event, resolve }) => {
    let clientAddress = '127.0.0.1';
    try {
        clientAddress = event.getClientAddress();
    } catch (e) {
        console.warn('Could not determine client address, using fallback');
    }

    console.log(`[DEBUG] ${event.request.method} ${event.url.pathname} - IP: ${clientAddress}`);

    // 1. DDoS Protection (Rate Limiting)
    const isLoginPost = event.url.pathname === '/login' && event.request.method === 'POST';
    const limit = isLoginPost ? LOGIN_RATE_LIMIT : MAX_REQUESTS_PER_WINDOW;

    if (isRateLimited(clientAddress, limit)) {
        const accept = event.request.headers.get('accept') || '';
        const fetchDest = event.request.headers.get('sec-fetch-dest');
        const isPost = event.request.method === 'POST';

        // Check for any SvelteKit specific headers
        const hasSvelteKitHeader = Array.from(event.request.headers.keys())
            .some(key => key.toLowerCase().startsWith('x-sveltekit'));

        const isJsonExpected = isPost ||
            hasSvelteKitHeader ||
            accept.includes('application/json') ||
            event.url.searchParams.has('__data.json');

        // It's a top-level page navigation (browser address bar)
        // We only show HTML if it's a GET request and specifically a document destination,
        // and NOT an internal SvelteKit data request.
        if (event.request.method === 'GET' &&
            fetchDest === 'document' &&
            !isJsonExpected &&
            accept.includes('text/html')) {

            return new Response(
                `<html>
                    <head>
                        <title>429 - Muitas solicitações</title>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa; color: #333; }
                            .container { text-align: center; padding: 50px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 500px; width: 90%; }
                            h1 { color: #dc3545; font-size: 4rem; margin: 0; }
                            h2 { margin: 10px 0 20px; color: #333; }
                            p { line-height: 1.6; color: #666; margin-bottom: 30px; }
                            .btn { display: inline-block; padding: 12px 24px; background: #0056a6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.2s; }
                            .btn:hover { background: #004485; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>429</h1>
                            <h2>Muitas Solicitações</h2>
                            <p>Detectamos um volume incomum de acessos do seu endereço IP. Para garantir a segurança do sistema, este acesso foi temporariamente bloqueado.</p>
                            <a href="/" class="btn">Voltar para o Início</a>
                        </div>
                    </body>
                </html>`,
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'text/html',
                        'Retry-After': '60'
                    }
                }
            );
        }

        // For EVERYTHING else (Form Actions, Data fetches, API), return JSON.
        // This is critical to prevent "Unexpected token <" in the browser.
        return new Response(JSON.stringify({
            type: 'error',
            status: 429,
            error: { message: 'Muitas solicitações. Por favor, tente novamente mais tarde.' }
        }), {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': '60'
            }
        });
    }

    // 2. Server-side Authentication
    const session = event.cookies.get('admin_session');

    console.log(`[DEBUG] Session present: ${!!session}`);

    // Protected routes pattern
    const isAdminRoute = event.url.pathname.startsWith('/painel_administracao');

    const isApiSubmissionAdmin = event.url.pathname.startsWith('/api/submissions') && event.request.method !== 'POST';

    // Check if this is an API/XHR request (fetch from client-side)
    const accept = event.request.headers.get('accept') || '';
    const contentType = event.request.headers.get('content-type') || '';
    const isApiPath = event.url.pathname.startsWith('/api/') || event.url.pathname.startsWith('/api/submissions');
    const isApiRequest = isApiPath && (accept.includes('application/json') || contentType.includes('application/json') || event.request.method !== 'GET');

    if ((isAdminRoute || isApiSubmissionAdmin) && !session) {
        // Handle browser navigation to API routes (redirect to login)
        const fetchDest = event.request.headers.get('sec-fetch-dest');

        if (event.url.pathname.startsWith('/api/') &&
            (fetchDest === 'document' || accept.includes('text/html'))) {
            console.log(`[DEBUG] Browser navigation to protected API ${event.url.pathname} - redirecting to login`);
            throw redirect(303, '/login');
        }

        // For API requests, return 401 JSON instead of redirect
        if (event.url.pathname.startsWith('/api/')) {
            console.log(`[DEBUG] API request to ${event.url.pathname} without session - returning 401`);
            return new Response(JSON.stringify({
                type: 'error',
                status: 401,
                error: { message: 'Unauthorized. Please log in.' }
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'WWW-Authenticate': 'Bearer realm="api"'
                }
            });
        }
        // For page navigation, redirect to login
        console.log(`[DEBUG] Page request to ${event.url.pathname} without session - redirecting to login`);
        throw redirect(303, '/login');
    }

    // If session exists but we are on login, redirect to admin
    if (session && event.url.pathname === '/login') {
        console.log(`[DEBUG] Session exists and navigating to login - redirecting to /painel_administracao`);
        throw redirect(303, '/painel_administracao');
    }


    const response = await resolve(event);

    // Security Headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

    // Prevent caching for protected routes to ensure back button doesn't bypass auth
    if (isAdminRoute || isApiSubmissionAdmin) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
};

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies, url }) => {
    const session = cookies.get('admin_session');

    // Core Auto-logout logic: 
    // If we have a session but we're NOT in the admin area, delete the session.
    const isAdminArea = url.pathname.startsWith('/painel_administracao') ||
        url.pathname.startsWith('/api/submissions');
    const isAuthPath = url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/logout');

    if (session && !isAdminArea && !isAuthPath) {
        console.log(`[SERVER] Auto-logout: Deleting session as user navigated to ${url.pathname}`);
        cookies.delete('admin_session', { path: '/' });
        return { isAuthenticated: false };
    }

    return {
        isAuthenticated: !!session
    };
};

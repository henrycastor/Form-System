import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const password = data.get('password');

        if (!password) {
            return fail(400, { missing: true });
        }

        if (password === env.ADMIN_PASSWORD) {
            // Set a secure session cookie
            cookies.set('admin_session', 'true', {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 // 1 day
            });

            throw redirect(303, '/painel_administracao');
        }

        return fail(403, { incorrect: true });
    }
};

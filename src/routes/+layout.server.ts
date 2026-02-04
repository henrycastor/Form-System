import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
    return {
        isAuthenticated: !!cookies.get('admin_session')
    };
};

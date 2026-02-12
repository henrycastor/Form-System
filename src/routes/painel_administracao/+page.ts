import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Submission } from '$lib/submissionsStore.svelte';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/submissions');

	if (!response.ok) {
		if (response.status === 429) {
			throw error(429, 'Muitas solicitações. Por favor, tente novamente mais tarde.');
		}
		if (response.status === 401) {
			// Redirect to login if unauthorized
			throw redirect(303, '/login');
		}
		throw error(response.status, `Falha ao carregar envios: ${response.statusText}`);
	}

	const result = await response.json();

	// Handle both old and new API response formats
	const submissions: Submission[] = Array.isArray(result)
		? result
		: (result?.data || result?.submissions || []);

	return {
		submissions: Array.isArray(submissions) ? submissions : []
	};
};

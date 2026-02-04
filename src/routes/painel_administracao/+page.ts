import type { PageLoad } from './$types';
import type { Submission } from '$lib/submissionsStore';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/api/submissions');
		if (!response.ok) {
			throw new Error(`Failed to fetch submissions: ${response.statusText}`);
		}
		const result = await response.json();
		
		// Handle both old and new API response formats
		const submissions: Submission[] = Array.isArray(result) 
			? result 
			: (result?.data || result?.submissions || []);
		
		return {
			submissions: Array.isArray(submissions) ? submissions : []
		};
	} catch (error) {
		return {
			submissions: []
		};
	}
};

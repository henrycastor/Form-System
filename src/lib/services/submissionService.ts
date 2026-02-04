/**
 * Submission service for handling form submissions
 */

import { createErrorResponse } from '$lib/utils/errorHandler';

export interface SubmissionData {
	form: string;
	[key: string]: unknown;
}

export interface SubmissionResponse {
	success: boolean;
	id?: number;
	error?: string;
	details?: string[];
	message?: string;
}

/**
 * Unified error handler for API calls
 */
async function handleApiCall<T>(
	fn: () => Promise<Response>,
	errorMessage: string
): Promise<T> {
	try {
		const response = await fn();

		// Handle 401 Unauthorized - redirect to login
		if (response.status === 401) {
			if (typeof window !== 'undefined') {
				window.location.href = '/login';
			}
			throw new Error('Session expired. Redirecting to login...');
		}

		const data = await response.json() as T;

		if (!response.ok) {
			const error = (data as any)?.error || `HTTP error! status: ${response.status}`;
			throw new Error(error);
		}

		return data;
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error occurred';
		throw new Error(`${errorMessage}: ${message}`);
	}
}

/**
 * Submit form data to the API
 * @param data - The form data to submit
 * @returns Promise resolving to the API response
 * @throws Error if submission fails
 */
export async function submitForm(data: SubmissionData): Promise<SubmissionResponse> {
	return handleApiCall(
		() => fetch("/api/submissions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify(data),
		}),
		'Failed to submit form'
	);
}

/**
 * Delete a submission by ID
 * @param id - The submission ID to delete
 * @returns Promise resolving to the API response
 * @throws Error if deletion fails
 */
export async function deleteSubmission(id: number): Promise<SubmissionResponse> {
	return handleApiCall(
		() => fetch(`/api/submissions?id=${id}`, {
			method: "DELETE",
			headers: { "Accept": "application/json" },
		}),
		'Failed to delete submission'
	);
}

/**
 * Fetch all submissions
 * @param page - Page number for pagination
 * @param perPage - Items per page
 * @param search - Optional search query
 * @returns Promise resolving to submissions data
 * @throws Error if fetch fails
 */
export async function fetchSubmissions(page = 1, perPage = 10, search = '') {
	const params = new URLSearchParams();
	params.append('page', String(page));
	params.append('per_page', String(perPage));
	if (search) params.append('search', search);

	return handleApiCall(
		() => fetch(`/api/submissions?${params}`, {
			method: "GET",
			headers: { "Accept": "application/json" },
		}),
		'Failed to fetch submissions'
	);
}

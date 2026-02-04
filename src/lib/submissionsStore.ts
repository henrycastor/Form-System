import { writable, type Writable } from 'svelte/store';

/**
 * Submission data structure
 */
export interface Submission {
	id: number;
	name: string;
	sector: string;
	title: string;
	date: string;
	status: 'pending' | 'completed';
	data?: Record<string, unknown>;
	submitted_at?: string;
}

/**
 * Svelte store for managing submissions
 */
export const submissions: Writable<Submission[]> = writable<Submission[]>([]);

/**
 * Update submissions in the store
 */
export function setSubmissions(data: Submission[] | null | undefined): void {
	submissions.set(Array.isArray(data) ? data : []);
}

/**
 * Add a new submission to the store
 */
export function addSubmission(submission: Submission): void {
	submissions.update(items => [submission, ...(Array.isArray(items) ? items : [])]);
}

/**
 * Remove a submission from the store by ID
 */
export function removeSubmission(id: number): void {
	submissions.update(items => (Array.isArray(items) ? items.filter(item => item.id !== id) : []));
}

/**
 * Update a submission in the store by ID
 */
export function updateSubmission(id: number, updates: Partial<Submission>): void {
	submissions.update(items =>
		Array.isArray(items)
			? items.map(item => (item.id === id ? { ...item, ...updates } : item))
			: []
	);
}

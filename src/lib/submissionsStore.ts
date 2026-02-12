/**
 * Submission data structure
 */
export interface Submission {
	id: number;
	name: string;
	title: string;
	date: string;
	status: 'pending' | 'completed';
	data?: Record<string, unknown>;
	submitted_at?: string;
}

/**
 * Svelte 5 State class for submissions
 */
export class SubmissionsState {
	private _submissions: Submission[] = $state([]);

	// Svelte 5 reactive getter
	get submissions(): Submission[] {
		return this._submissions;
	}

	// Svelte 5 setter
	set submissions(value: Submission[]) {
		this._submissions = value;
	}

	// Update submissions
	set(data: Submission[] | null | undefined): void {
		this._submissions = Array.isArray(data) ? data : [];
	}

	// Add a new submission
	add(submission: Submission): void {
		this._submissions = [submission, ...this._submissions];
	}

	// Remove a submission by ID
	remove(id: number): void {
		this._submissions = this._submissions.filter(item => item.id !== id);
	}

	// Update a submission by ID
	update(id: number, updates: Partial<Submission>): void {
		this._submissions = this._submissions.map(item =>
			item.id === id ? { ...item, ...updates } : item
		);
	}

	// Get submission by ID
	getById(id: number): Submission | undefined {
		return this._submissions.find(item => item.id === id);
	}

	// Filter submissions
	filter(predicate: (item: Submission) => boolean): Submission[] {
		return this._submissions.filter(predicate);
	}
}

// Singleton instance
export const submissionsState = new SubmissionsState();

// Re-export for convenience
export const submissions = submissionsState;

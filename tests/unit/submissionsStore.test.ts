import { describe, it, expect, beforeEach } from 'vitest';
import { SubmissionsState } from '$lib/submissionsStore.svelte';

describe('SubmissionsState (Svelte 5 Runes)', () => {
    let state: SubmissionsState;

    beforeEach(() => {
        state = new SubmissionsState();
    });

    it('should initialize with empty submissions', () => {
        expect(state.submissions).toEqual([]);
    });

    it('should set submissions', () => {
        const mockSubmissions = [
            { id: 1, name: 'John', title: 'Form 1', date: '2024-01-01', status: 'pending' as const }
        ];
        state.set(mockSubmissions);
        expect(state.submissions).toEqual(mockSubmissions);
    });

    it('should handle null/undefined when setting', () => {
        state.set(null as any);
        expect(state.submissions).toEqual([]);

        state.set(undefined as any);
        expect(state.submissions).toEqual([]);
    });

    it('should add a submission', () => {
        const submission = { id: 1, name: 'John', title: 'Form 1', date: '2024-01-01', status: 'pending' as const };
        state.add(submission);
        expect(state.submissions).toHaveLength(1);
        expect(state.submissions[0]).toEqual(submission);
    });

    it('should remove a submission', () => {
        state.set([
            { id: 1, name: 'John', title: 'Form 1', date: '2024-01-01', status: 'pending' as const },
            { id: 2, name: 'Jane', title: 'Form 2', date: '2024-01-02', status: 'completed' as const }
        ]);
        state.remove(1);
        expect(state.submissions).toHaveLength(1);
        expect(state.submissions[0].id).toBe(2);
    });

    it('should update a submission', () => {
        state.set([
            { id: 1, name: 'John', title: 'Form 1', date: '2024-01-01', status: 'pending' as const }
        ]);
        state.update(1, { status: 'completed' });
        expect(state.submissions[0].status).toBe('completed');
        expect(state.submissions[0].name).toBe('John');
    });

    it('should get a submission by ID', () => {
        const sub = { id: 1, name: 'John', title: 'Form 1', date: '2024-01-01', status: 'pending' as const };
        state.set([sub]);
        expect(state.getById(1)).toEqual(sub);
        expect(state.getById(999)).toBeUndefined();
    });

    it('should filter submissions', () => {
        state.set([
            { id: 1, name: 'John', title: 'Form 1', date: '2024-01-01', status: 'pending' as const },
            { id: 2, name: 'Jane', title: 'Form 2', date: '2024-01-02', status: 'completed' as const }
        ]);
        const pending = state.filter(s => s.status === 'pending');
        expect(pending).toHaveLength(1);
        expect(pending[0].name).toBe('John');
    });
});

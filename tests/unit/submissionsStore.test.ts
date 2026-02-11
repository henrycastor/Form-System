import { describe, it, expect, beforeEach } from 'vitest';
import { SubmissionsState, type Submission } from '$lib/submissionsStore';

describe('SubmissionsState', () => {
    let store: SubmissionsState;

    const mockSubmissions: Submission[] = [
        {
            id: 1,
            name: 'John Doe',
            sector: 'IT',
            title: 'Form 1',
            date: '2024-01-15',
            status: 'pending'
        },
        {
            id: 2,
            name: 'Jane Smith',
            sector: 'HR',
            title: 'Form 2',
            date: '2024-01-16',
            status: 'completed'
        },
        {
            id: 3,
            name: 'Bob Johnson',
            sector: 'Finance',
            title: 'Form 3',
            date: '2024-01-17',
            status: 'pending'
        }
    ];

    beforeEach(() => {
        store = new SubmissionsState();
    });

    describe('initial state', () => {
        it('should initialize with empty submissions array', () => {
            expect(store.submissions).toEqual([]);
        });

        it('should handle null input in set method', () => {
            store.set(null);
            expect(store.submissions).toEqual([]);
        });

        it('should handle undefined input in set method', () => {
            store.set(undefined);
            expect(store.submissions).toEqual([]);
        });
    });

    describe('set method', () => {
        it('should set submissions from array', () => {
            store.set(mockSubmissions);
            expect(store.submissions).toHaveLength(3);
            expect(store.submissions[0].id).toBe(1);
        });

        it('should replace existing submissions', () => {
            store.set(mockSubmissions);
            const newSubmissions: Submission[] = [
                { id: 4, name: 'New User', sector: 'IT', title: 'New Form', date: '2024-01-18', status: 'pending' }
            ];
            store.set(newSubmissions);
            expect(store.submissions).toHaveLength(1);
            expect(store.submissions[0].name).toBe('New User');
        });
    });

    describe('add method', () => {
        it('should add a new submission to the beginning', () => {
            store.set(mockSubmissions);
            const newSubmission: Submission = {
                id: 4,
                name: 'New User',
                sector: 'IT',
                title: 'New Form',
                date: '2024-01-18',
                status: 'pending'
            };
            store.add(newSubmission);
            expect(store.submissions).toHaveLength(4);
            expect(store.submissions[0].id).toBe(4);
            expect(store.submissions[0].name).toBe('New User');
        });

        it('should add to empty store', () => {
            const newSubmission: Submission = {
                id: 1,
                name: 'First User',
                sector: 'IT',
                title: 'First Form',
                date: '2024-01-18',
                status: 'pending'
            };
            store.add(newSubmission);
            expect(store.submissions).toHaveLength(1);
            expect(store.submissions[0]).toEqual(newSubmission);
        });
    });

    describe('remove method', () => {
        it('should remove submission by ID', () => {
            store.set(mockSubmissions);
            store.remove(2);
            expect(store.submissions).toHaveLength(2);
            expect(store.submissions.find(s => s.id === 2)).toBeUndefined();
            expect(store.submissions.find(s => s.id === 1)).toBeDefined();
            expect(store.submissions.find(s => s.id === 3)).toBeDefined();
        });

        it('should not modify store if ID not found', () => {
            store.set(mockSubmissions);
            store.remove(999);
            expect(store.submissions).toHaveLength(3);
        });

        it('should handle removing from empty store', () => {
            store.remove(1);
            expect(store.submissions).toEqual([]);
        });
    });

    describe('update method', () => {
        it('should update submission by ID', () => {
            store.set(mockSubmissions);
            store.update(1, { status: 'completed', name: 'Updated Name' });
            const updated = store.getById(1);
            expect(updated?.status).toBe('completed');
            expect(updated?.name).toBe('Updated Name');
        });

        it('should not modify other submissions', () => {
            store.set(mockSubmissions);
            store.update(1, { status: 'completed' });
            const other = store.getById(2);
            expect(other?.status).toBe('completed');
            expect(other?.name).toBe('Jane Smith');
        });

        it('should not modify store if ID not found', () => {
            store.set(mockSubmissions);
            store.update(999, { status: 'completed' });
            expect(store.submissions).toHaveLength(3);
        });
    });

    describe('getById method', () => {
        it('should return submission by ID', () => {
            store.set(mockSubmissions);
            const submission = store.getById(2);
            expect(submission?.name).toBe('Jane Smith');
            expect(submission?.sector).toBe('HR');
        });

        it('should return undefined if ID not found', () => {
            store.set(mockSubmissions);
            const submission = store.getById(999);
            expect(submission).toBeUndefined();
        });

        it('should return undefined from empty store', () => {
            const submission = store.getById(1);
            expect(submission).toBeUndefined();
        });
    });

    describe('filter method', () => {
        it('should filter submissions by predicate', () => {
            store.set(mockSubmissions);
            const pending = store.filter(s => s.status === 'pending');
            expect(pending).toHaveLength(2);
            expect(pending.every(s => s.status === 'pending')).toBe(true);
        });

        it('should return all submissions if all match predicate', () => {
            store.set(mockSubmissions);
            const all = store.filter(() => true);
            expect(all).toHaveLength(3);
        });

        it('should return empty array if no submissions match', () => {
            store.set(mockSubmissions);
            const none = store.filter(() => false);
            expect(none).toEqual([]);
        });

        it('should filter by sector', () => {
            store.set(mockSubmissions);
            const itSubmissions = store.filter(s => s.sector === 'IT');
            expect(itSubmissions).toHaveLength(1);
            expect(itSubmissions[0].name).toBe('John Doe');
        });
    });

    describe('setter', () => {
        it('should update submissions via setter', () => {
            store.submissions = mockSubmissions;
            expect(store.submissions).toEqual(mockSubmissions);
        });

        it('should handle direct assignment of empty array', () => {
            store.set(mockSubmissions);
            store.submissions = [];
            expect(store.submissions).toEqual([]);
        });
    });
});

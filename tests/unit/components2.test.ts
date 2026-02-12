import { describe, it, expect } from 'vitest';
import {
    shouldShowSubtitle,
    formatBoolean,
    shouldShowComment,
    getValueClass
} from '$lib/utils/formHelpers';
import {
    getAvailablePerPageOptions,
    calculateRange,
    getStatValue,
    getStatCardClass,
    isEmptySearch,
    filterSubmissions,
    sortSubmissions
} from '$lib/utils/adminHelpers';

describe('Admin Panel Logic', () => {
    describe('Pagination Options', () => {
        it('should return all options when count >= 50', () => {
            expect(getAvailablePerPageOptions(100)).toEqual([5, 10, 20, 50]);
        });

        it('should return limited options when count < 10', () => {
            expect(getAvailablePerPageOptions(8)).toEqual([5]);
        });

        it('should return count as option when count < 5', () => {
            expect(getAvailablePerPageOptions(3)).toEqual([3]);
        });
    });

    describe('Pagination Range', () => {
        it('should calculate correct range', () => {
            expect(calculateRange(1, 10, 100)).toEqual({ start: 1, end: 10 });
            expect(calculateRange(3, 10, 25)).toEqual({ start: 21, end: 25 });
        });
    });

    describe('Stat Values', () => {
        it('should return stat value for existing key', () => {
            const stats = { total: 10, pending: 5 };
            expect(getStatValue(stats, 'total')).toBe(10);
        });

        it('should return 0 for non-existing key', () => {
            expect(getStatValue({ total: 10 }, 'pending')).toBe(0);
        });
    });

    describe('Submission Filtering', () => {
        const mockSubmissions = [
            { name: 'Alpha', title: 'Form A' },
            { name: 'Beta', title: 'Form B' },
            { name: 'Gamma', title: 'Form C' }
        ];

        it('should filter by name', () => {
            const result = filterSubmissions(mockSubmissions, 'alpha');
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Alpha');
        });

        it('should filter by title', () => {
            const result = filterSubmissions(mockSubmissions, 'form b');
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Form B');
        });

        it('should return all when query is empty', () => {
            expect(filterSubmissions(mockSubmissions, '')).toHaveLength(3);
        });
    });

    describe('Submission Sorting', () => {
        const mockSubmissions = [
            { id: 2, name: 'Zebra' },
            { id: 1, name: 'Apple' },
            { id: 3, name: 'Mango' }
        ];

        it('should sort by name ascending', () => {
            const result = sortSubmissions(mockSubmissions, 'name', 'asc');
            expect(result[0].name).toBe('Apple');
            expect(result[2].name).toBe('Zebra');
        });

        it('should sort by name descending', () => {
            const result = sortSubmissions(mockSubmissions, 'name', 'desc');
            expect(result[0].name).toBe('Zebra');
            expect(result[2].name).toBe('Apple');
        });
    });
});

describe('Component Display Logic', () => {
    describe('Subtitle Processing', () => {
        it('should show subtitle when not empty', () => {
            expect(shouldShowSubtitle('Some subtitle')).toBe(true);
            expect(shouldShowSubtitle('')).toBe(false);
            expect(shouldShowSubtitle(null)).toBe(false);
        });
    });

    describe('Boolean Display', () => {
        it('should return Sim for true', () => {
            expect(formatBoolean(true)).toBe('Sim');
            expect(formatBoolean(false)).toBe('Não');
        });
    });

    describe('Comment Display', () => {
        it('should show comment when not empty', () => {
            expect(shouldShowComment('A comment')).toBe(true);
            expect(shouldShowComment('')).toBe(false);
        });
    });

    describe('CSS Classes', () => {
        it('should return correct classes', () => {
            expect(getValueClass(true, false)).toBe('text-success');
            expect(getValueClass(false, true)).toBe('text-warning');
            expect(getValueClass(false, false)).toBe('');
        });
    });

    describe('Search Detection', () => {
        it('should detect empty search', () => {
            expect(isEmptySearch('')).toBe(true);
            expect(isEmptySearch('  ')).toBe(true);
            expect(isEmptySearch('test')).toBe(false);
        });
    });
});

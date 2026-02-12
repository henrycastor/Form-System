import { describe, it, expect } from 'vitest';
import { getAvailablePerPageOptions, calculateRange } from '$lib/utils/adminHelpers';

/**
 * Tests for the PaginationInfo logic (extracted to adminHelpers).
 * The component itself relies on bits-ui's Pagination.Root which uses
 * setContext, making direct component rendering impractical in unit tests.
 * Instead we test the pure logic functions that drive the component.
 */
describe('PaginationInfo Logic', () => {
    describe('getAvailablePerPageOptions', () => {
        it('should return all standard options for large counts', () => {
            expect(getAvailablePerPageOptions(100)).toEqual([5, 10, 20, 50]);
            expect(getAvailablePerPageOptions(50)).toEqual([5, 10, 20, 50]);
        });

        it('should return only fitting options for small counts', () => {
            expect(getAvailablePerPageOptions(15)).toEqual([5, 10]);
            expect(getAvailablePerPageOptions(8)).toEqual([5]);
        });

        it('should return count itself when count < 5 and > 0', () => {
            expect(getAvailablePerPageOptions(3)).toEqual([3]);
            expect(getAvailablePerPageOptions(1)).toEqual([1]);
        });

        it('should return default [10] when count is 0', () => {
            expect(getAvailablePerPageOptions(0)).toEqual([10]);
        });

        it('should return [5] when count is exactly 5', () => {
            expect(getAvailablePerPageOptions(5)).toEqual([5]);
        });
    });

    describe('calculateRange', () => {
        it('should calculate first page range', () => {
            expect(calculateRange(1, 10, 100)).toEqual({ start: 1, end: 10 });
        });

        it('should calculate middle page range', () => {
            expect(calculateRange(3, 10, 100)).toEqual({ start: 21, end: 30 });
        });

        it('should clamp end to total on last page', () => {
            expect(calculateRange(3, 10, 25)).toEqual({ start: 21, end: 25 });
        });

        it('should return start 0 when total is 0', () => {
            expect(calculateRange(1, 10, 0)).toEqual({ start: 0, end: 0 });
        });

        it('should work with perPage of 5', () => {
            expect(calculateRange(2, 5, 12)).toEqual({ start: 6, end: 10 });
            expect(calculateRange(3, 5, 12)).toEqual({ start: 11, end: 12 });
        });
    });
});

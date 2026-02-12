import { describe, it, expect } from 'vitest';
import { cn, formatDate } from '$lib/utils';

describe('Utility Functions', () => {
    describe('cn (class name merger)', () => {
        it('should merge simple class strings', () => {
            const result = cn('foo', 'bar');
            expect(result).toBe('foo bar');
        });

        it('should handle conditional classes via clsx', () => {
            const result = cn('base', false && 'hidden', 'visible');
            expect(result).toBe('base visible');
        });

        it('should merge conflicting Tailwind classes (last wins)', () => {
            const result = cn('p-4', 'p-8');
            expect(result).toBe('p-8');
        });

        it('should handle empty inputs', () => {
            const result = cn();
            expect(result).toBe('');
        });

        it('should handle undefined and null', () => {
            const result = cn('base', undefined, null, 'end');
            expect(result).toBe('base end');
        });

        it('should handle array inputs via clsx', () => {
            const result = cn(['foo', 'bar']);
            expect(result).toBe('foo bar');
        });

        it('should handle object inputs via clsx', () => {
            const result = cn({ active: true, disabled: false });
            expect(result).toBe('active');
        });
    });

    describe('formatDate', () => {
        it('should return "N/A" for undefined', () => {
            expect(formatDate(undefined)).toBe('N/A');
        });

        it('should return "N/A" for empty string', () => {
            expect(formatDate('')).toBe('N/A');
        });

        it('should format SQLite date string (YYYY-MM-DD HH:MM:SS)', () => {
            const result = formatDate('2024-06-15 14:30:00');
            // Should be formatted in pt-BR with São Paulo timezone
            expect(result).toContain('/');
            expect(result).toContain(':');
            // UTC 14:30 -> São Paulo (UTC-3) = 11:30
            expect(result).toContain('11:30');
        });

        it('should format ISO date string with T separator', () => {
            const result = formatDate('2024-06-15T14:30:00');
            expect(result).toContain('/');
            expect(result).toContain(':');
        });

        it('should format ISO date string with Z suffix', () => {
            const result = formatDate('2024-06-15T14:30:00Z');
            expect(result).toContain('/');
            expect(result).toContain(':');
        });

        it('should format Date object', () => {
            const date = new Date('2024-06-15T14:30:00Z');
            const result = formatDate(date);
            expect(result).toContain('/');
            expect(result).toContain(':');
        });

        it('should format numeric timestamp', () => {
            const ts = new Date('2024-06-15T14:30:00Z').getTime();
            const result = formatDate(ts);
            expect(result).toContain('/');
            expect(result).toContain(':');
        });

        it('should return original string for invalid date', () => {
            const result = formatDate('not-a-date');
            expect(result).toBe('not-a-date');
        });

        it('should produce pt-BR formatted day/month/year', () => {
            // UTC midnight Jan 2, 2024 -> São Paulo: Jan 1 at 21:00 (UTC-3)
            const result = formatDate('2024-01-02 00:00:00');
            // pt-BR format: DD/MM/YYYY
            expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        });

        it('should include hours and minutes', () => {
            const result = formatDate('2024-07-20 18:45:00');
            expect(result).toContain(':');
            // UTC 18:45 -> São Paulo (UTC-3) = 15:45
            expect(result).toContain('15:45');
        });
    });
});

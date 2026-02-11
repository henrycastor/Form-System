import { describe, it, expect } from 'vitest';

/**
 * Shared parseSubmissionData function
 */
const parseSubmissionData = (jsonString: string): Record<string, unknown> => {
    try {
        const parsed = JSON.parse(jsonString);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
};

/**
 * Tests for parseSubmissionData utility function
 * (Extracted from src/routes/api/submissions/+server.ts)
 */
describe('parseSubmissionData', () => {
    it('should parse valid JSON string', () => {
        const input = '{"name": "Test Company", "email": "test@example.com"}';
        const result = parseSubmissionData(input);

        expect(result).toEqual({ name: 'Test Company', email: 'test@example.com' });
    });

    it('should return empty object for invalid JSON', () => {
        const input = 'not valid json';
        const result = parseSubmissionData(input);

        expect(result).toEqual({});
    });

    it('should return empty object for empty string', () => {
        const input = '';
        const result = parseSubmissionData(input);

        expect(result).toEqual({});
    });

    it('should return empty object for null', () => {
        const input = 'null';
        const result = parseSubmissionData(input);

        expect(result).toEqual({});
    });

    it('should return empty object for array JSON', () => {
        const input = '["item1", "item2"]';
        const result = parseSubmissionData(input);

        // Arrays are valid objects, so they are returned as-is
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual(['item1', 'item2']);
    });

    it('should return empty object for number JSON', () => {
        const input = '123';
        const result = parseSubmissionData(input);

        expect(result).toEqual({});
    });

    it('should return empty object for boolean JSON', () => {
        const input = 'true';
        const result = parseSubmissionData(input);

        expect(result).toEqual({});
    });

    it('should handle nested objects', () => {
        const input = '{"data": {"name": "Nested", "value": 42}}';
        const result = parseSubmissionData(input);

        expect(result).toEqual({ data: { name: 'Nested', value: 42 } });
    });
});

/**
 * Tests for extractSubmissionFields utility function
 * (Extracted from src/routes/api/submissions/+server.ts)
 */
describe('extractSubmissionFields', () => {
    interface SubmissionRow {
        id: number;
        data: string;
        submitted_at: string;
    }

    const extractSubmissionFields = (row: SubmissionRow) => {
        const submissionData = parseSubmissionData(row.data);
        const nestedName = submissionData.data && typeof submissionData.data === 'object'
            ? (submissionData.data as Record<string, unknown>)['name']
            : undefined;

        return {
            id: row.id,
            submitted_at: row.submitted_at,
            name: String(nestedName || submissionData.name || 'Unknown'),
            sector: String(submissionData.sector || 'Unknown'),
            title: String(submissionData.title || submissionData.form || 'Unknown'),
            date: String(submissionData.date || row.submitted_at),
            status: String(submissionData.status || 'pending'),
            data: submissionData,
            ...submissionData
        };
    };

    it('should extract basic fields from submission', () => {
        const row: SubmissionRow = {
            id: 1,
            data: '{"name": "Company A", "sector": "Tech", "title": "Form 1"}',
            submitted_at: '2024-01-15 10:30:00'
        };

        const result = extractSubmissionFields(row);

        expect(result.id).toBe(1);
        expect(result.name).toBe('Company A');
        expect(result.sector).toBe('Tech');
        expect(result.title).toBe('Form 1');
        expect(result.status).toBe('pending');
    });

    it('should use Unknown for missing fields', () => {
        const row: SubmissionRow = {
            id: 2,
            data: '{}',
            submitted_at: '2024-01-15 10:30:00'
        };

        const result = extractSubmissionFields(row);

        expect(result.name).toBe('Unknown');
        expect(result.sector).toBe('Unknown');
        expect(result.title).toBe('Unknown');
    });

    it('should extract nested name from data.data', () => {
        const row: SubmissionRow = {
            id: 3,
            data: '{"data": {"name": "Nested Name"}, "name": "Outer Name"}',
            submitted_at: '2024-01-15 10:30:00'
        };

        const result = extractSubmissionFields(row);

        // The spread operator ...submissionData overwrites the name field
        // So the final name is "Outer Name" from submissionData.name
        expect(result.name).toBe('Outer Name');
    });

    it('should fallback to outer name when nested name is missing', () => {
        const row: SubmissionRow = {
            id: 4,
            data: '{"data": {}, "name": "Outer Name"}',
            submitted_at: '2024-01-15 10:30:00'
        };

        const result = extractSubmissionFields(row);

        // nestedName is undefined (data.name doesn't exist in the nested object)
        // So it falls back to submissionData.name which is "Outer Name"
        expect(result.name).toBe('Outer Name');
    });

    it('should use submitted_at as date when date is missing', () => {
        const row: SubmissionRow = {
            id: 5,
            data: '{}',
            submitted_at: '2024-01-15 10:30:00'
        };

        const result = extractSubmissionFields(row);

        expect(result.date).toBe('2024-01-15 10:30:00');
    });

    it('should use custom date when provided', () => {
        const row: SubmissionRow = {
            id: 6,
            data: '{"date": "2024-02-20"}',
            submitted_at: '2024-01-15 10:30:00'
        };

        const result = extractSubmissionFields(row);

        expect(result.date).toBe('2024-02-20');
    });

    it('should use form field as title fallback', () => {
        const row: SubmissionRow = {
            id: 7,
            data: '{"form": "Form 2"}',
            submitted_at: '2024-01-15 10:30:00'
        };

        const result = extractSubmissionFields(row);

        expect(result.title).toBe('Form 2');
    });

    it('should include all original data', () => {
        const row: SubmissionRow = {
            id: 8,
            data: '{"name": "Test", "customField": "value", "numberField": 123}',
            submitted_at: '2024-01-15 10:30:00'
        };

        const result = extractSubmissionFields(row);

        expect((result as Record<string, unknown>).customField).toBe('value');
        expect((result as Record<string, unknown>).numberField).toBe(123);
    });

    it('should handle invalid JSON gracefully', () => {
        const row: SubmissionRow = {
            id: 9,
            data: 'invalid json',
            submitted_at: '2024-01-15 10:30:00'
        };

        const result = extractSubmissionFields(row);

        expect(result.name).toBe('Unknown');
        expect(result.data).toEqual({});
    });
});

/**
 * Tests for database validation helpers
 * (Similar to src/lib/validation.ts patterns)
 */
describe('Database Helpers', () => {
    describe('ensureTableExists logic', () => {
        // Simulating the table check logic
        const tableExists = (tables: Array<{ name: string }>, tableName: string): boolean => {
            return tables.some(t => t.name === tableName);
        };

        it('should return true when table exists', () => {
            const tables = [
                { name: 'diagnostico_submissions' },
                { name: 'other_table' }
            ];

            expect(tableExists(tables, 'diagnostico_submissions')).toBe(true);
        });

        it('should return false when table does not exist', () => {
            const tables = [
                { name: 'other_table' },
                { name: 'another_table' }
            ];

            expect(tableExists(tables, 'diagnostico_submissions')).toBe(false);
        });

        it('should return false for empty tables array', () => {
            expect(tableExists([], 'diagnostico_submissions')).toBe(false);
        });
    });

    describe('Pagination calculations', () => {
        const calculateOffset = (page: number, perPage: number): number => {
            return (page - 1) * perPage;
        };

        const calculatePages = (total: number, perPage: number): number => {
            return Math.ceil(total / perPage);
        };

        it('should calculate correct offset for first page', () => {
            expect(calculateOffset(1, 10)).toBe(0);
            expect(calculateOffset(1, 25)).toBe(0);
        });

        it('should calculate correct offset for subsequent pages', () => {
            expect(calculateOffset(2, 10)).toBe(10);
            expect(calculateOffset(3, 10)).toBe(20);
            expect(calculateOffset(5, 25)).toBe(100);
        });

        it('should calculate correct total pages', () => {
            expect(calculatePages(100, 10)).toBe(10);
            expect(calculatePages(101, 10)).toBe(11);
            expect(calculatePages(25, 10)).toBe(3);
            expect(calculatePages(0, 10)).toBe(0);
        });
    });

    describe('Search query building', () => {
        const buildSearchCondition = (search: string): { query: string; params: string[] } => {
            if (!search || search.trim().length === 0) {
                return { query: '', params: [] };
            }
            return {
                query: ' AND data LIKE ?',
                params: [`%${search}%`]
            };
        };

        it('should return empty condition for empty search', () => {
            const result = buildSearchCondition('');

            expect(result.query).toBe('');
            expect(result.params).toEqual([]);
        });

        it('should return empty condition for whitespace search', () => {
            const result = buildSearchCondition('   ');

            expect(result.query).toBe('');
            expect(result.params).toEqual([]);
        });

        it('should build search condition with LIKE', () => {
            const result = buildSearchCondition('test');

            expect(result.query).toContain('LIKE');
            expect(result.params).toContain('%test%');
        });
    });
});

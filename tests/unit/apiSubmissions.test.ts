import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '$lib/../routes/api/submissions/+server';
import { DELETE } from '$lib/../routes/api/submissions/[id]/+server';
import { getDbConnection } from '$lib/db';
import { json } from '@sveltejs/kit';

// Mock the modules
vi.mock('$lib/db');
vi.mock('@sveltejs/kit', () => ({
    json: vi.fn((data, options) => ({ body: data, status: options?.status || 200 }))
}));

describe('Submissions API Route', () => {
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockDb = {
            get: vi.fn(),
            all: vi.fn(),
            run: vi.fn(),
            exec: vi.fn(),
            close: vi.fn()
        };

        vi.mocked(getDbConnection).mockResolvedValue(mockDb);
    });

    describe('GET handler', () => {
        it('should return paginated submissions', async () => {
            const mockUrl = new URL('http://localhost/api/submissions?page=1&per_page=10');
            const mockRows = [
                { id: 1, data: JSON.stringify({ name: 'Test', title: 'Form 1' }), submitted_at: '2024-01-01' }
            ];

            mockDb.get.mockResolvedValueOnce({ name: 'diagnostico_submissions' }); // Table check
            mockDb.get.mockResolvedValueOnce({ count: 1 }); // Total count
            mockDb.all.mockResolvedValueOnce(mockRows); // Results

            const response: any = await GET({ url: mockUrl } as any);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].id).toBe(1);
            expect(response.body.data[0].name).toBe('Test');
            expect(response.body.pagination.total).toBe(1);
        });

        it('should handle search filter', async () => {
            const mockUrl = new URL('http://localhost/api/submissions?search=test');

            mockDb.get.mockResolvedValueOnce({ name: 'diagnostico_submissions' });
            mockDb.get.mockResolvedValueOnce({ count: 1 });
            mockDb.all.mockResolvedValueOnce([]);

            await GET({ url: mockUrl } as any);

            expect(mockDb.all).toHaveBeenCalledWith(
                expect.stringContaining('AND data LIKE ?'),
                expect.arrayContaining(['%test%'])
            );
        });

        it('should handle errors gracefully', async () => {
            const mockUrl = new URL('http://localhost/api/submissions');
            vi.mocked(getDbConnection).mockRejectedValue(new Error('DB Error'));

            const response: any = await GET({ url: mockUrl } as any);

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to fetch submissions');
        });
    });

    describe('POST handler', () => {
        it('should save a valid submission', async () => {
            const mockSubmission = { companyName: 'New Corp', email: 'test@example.com', q1: 'yes' };
            const mockRequest = {
                json: vi.fn().mockResolvedValue(mockSubmission)
            };

            mockDb.get.mockResolvedValueOnce({ name: 'diagnostico_submissions' });
            mockDb.run.mockResolvedValueOnce({ lastID: 123 });

            const response: any = await POST({ request: mockRequest } as any);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.id).toBe(123);
            expect(mockDb.run).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO'),
                [JSON.stringify(mockSubmission)]
            );
        });

        it('should reject invalid JSON', async () => {
            const mockRequest = {
                json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
            };

            const response: any = await POST({ request: mockRequest } as any);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid JSON in request body');
        });

        it('should reject invalid data', async () => {
            const mockSubmission = { companyName: 'A' }; // Too short
            const mockRequest = {
                json: vi.fn().mockResolvedValue(mockSubmission)
            };

            const response: any = await POST({ request: mockRequest } as any);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });
    });

    describe('DELETE handler', () => {
        it('should delete an existing submission', async () => {
            const mockUrl = new URL('http://localhost/api/submissions?id=1');

            mockDb.get.mockResolvedValueOnce({ name: 'diagnostico_submissions' });
            mockDb.run.mockResolvedValueOnce({ changes: 1 });

            const response: any = await DELETE({ url: mockUrl } as any);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(mockDb.run).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM'),
                [1]
            );
        });

        it('should return 404 if submission not found', async () => {
            const mockUrl = new URL('http://localhost/api/submissions?id=999');

            mockDb.get.mockResolvedValueOnce({ name: 'diagnostico_submissions' });
            mockDb.run.mockResolvedValueOnce({ changes: 0 });

            const response: any = await DELETE({ url: mockUrl } as any);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Submission not found');
        });

        it('should reject missing ID', async () => {
            const mockUrl = new URL('http://localhost/api/submissions');
            const response: any = await DELETE({ url: mockUrl } as any);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Missing id parameter');
        });

        it('should reject invalid ID format', async () => {
            const mockUrl = new URL('http://localhost/api/submissions?id=abc');
            const response: any = await DELETE({ url: mockUrl } as any);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid id format');
        });
    });
});

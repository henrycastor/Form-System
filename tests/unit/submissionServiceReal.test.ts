import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// We need to import after mocking
import { submitForm, deleteSubmission, fetchSubmissions } from '$lib/services/submissionService';

describe('Submission Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('submitForm', () => {
        it('should POST form data and return success response', async () => {
            const mockResponse = { success: true, id: 42 };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const data = { form: 'form1', companyName: 'Test Corp', email: 'test@test.com' };
            const result = await submitForm(data);

            expect(result).toEqual(mockResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
        });

        it('should throw on HTTP error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'Validation failed' })
            });

            await expect(submitForm({ form: 'form1' }))
                .rejects.toThrow('Failed to submit form');
        });

        it('should throw on network error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(submitForm({ form: 'form1' }))
                .rejects.toThrow('Failed to submit form');
        });

        it('should redirect on 401 response', async () => {
            // Mock window.location
            const originalLocation = globalThis.window?.location;
            Object.defineProperty(globalThis, 'window', {
                value: { location: { href: '' } },
                writable: true,
                configurable: true
            });

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Unauthorized' })
            });

            await expect(submitForm({ form: 'form1' }))
                .rejects.toThrow('Session expired');

            expect((globalThis.window as any).location.href).toBe('/login');

            // Restore
            if (originalLocation) {
                (globalThis.window as any).location = originalLocation;
            }
        });
    });

    describe('deleteSubmission', () => {
        it('should DELETE submission by id and return success', async () => {
            const mockResponse = { success: true, message: 'Deleted' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await deleteSubmission(5);

            expect(result).toEqual(mockResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/submissions?id=5', {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });
        });

        it('should throw on 404 response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Submission not found' })
            });

            await expect(deleteSubmission(999))
                .rejects.toThrow('Failed to delete submission');
        });
    });

    describe('fetchSubmissions', () => {
        it('should GET submissions with default params', async () => {
            const mockResponse = { success: true, data: [], pagination: { total: 0 } };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await fetchSubmissions();

            expect(result).toEqual(mockResponse);
            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).toContain('page=1');
            expect(calledUrl).toContain('per_page=10');
        });

        it('should include search param when provided', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, data: [] })
            });

            await fetchSubmissions(2, 25, 'test');

            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).toContain('page=2');
            expect(calledUrl).toContain('per_page=25');
            expect(calledUrl).toContain('search=test');
        });

        it('should NOT include search param when empty', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, data: [] })
            });

            await fetchSubmissions(1, 10, '');

            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).not.toContain('search=');
        });

        it('should throw on server error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Internal server error' })
            });

            await expect(fetchSubmissions())
                .rejects.toThrow('Failed to fetch submissions');
        });
    });
});

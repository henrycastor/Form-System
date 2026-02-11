import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    submitForm,
    deleteSubmission,
    fetchSubmissions
} from '../../src/lib/services/submissionService';
import type {
    SubmissionData
} from '../../src/lib/services/submissionService';

describe('submissionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: { href: '' },
            writable: true
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('submitForm', () => {
        it('should return success response on valid submission', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: true,
                id: 1,
                message: 'Submission created'
            }), { status: 200 });

            vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            const data: SubmissionData = {
                form: 'form1',
                companyName: 'Test Company',
                email: 'test@example.com'
            };

            const result = await submitForm(data);

            expect(result.success).toBe(true);
            expect(result.id).toBe(1);
        });

        it('should throw error on failed submission', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: false,
                error: 'Validation failed'
            }), { status: 400 });

            vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            const data: SubmissionData = {
                form: 'form1',
                companyName: 'Test'
            };

            await expect(submitForm(data)).rejects.toThrow();
        });

        it('should redirect to login on 401', async () => {
            const mockResponse = new Response(null, { status: 401 });

            vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            const data: SubmissionData = {
                form: 'form1',
                companyName: 'Test'
            };

            await expect(submitForm(data)).rejects.toThrow('Session expired');

            expect(window.location.href).toBe('/login');
        });

        it('should call fetch with correct arguments', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: true,
                id: 1
            }), { status: 200 });

            const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            const data: SubmissionData = {
                form: 'form1',
                question1: 'answer'
            };

            await submitForm(data);

            expect(fetchSpy).toHaveBeenCalledWith(
                '/api/submissions',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
            );
        });
    });

    describe('deleteSubmission', () => {
        it('should return success on valid deletion', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: true,
                message: 'Submission deleted'
            }), { status: 200 });

            vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            const result = await deleteSubmission(1);

            expect(result.success).toBe(true);
        });

        it('should call fetch with correct ID', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: true
            }), { status: 200 });

            const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            await deleteSubmission(42);

            expect(fetchSpy).toHaveBeenCalledWith(
                '/api/submissions?id=42',
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
        });

        it('should throw error on failed deletion', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: false,
                error: 'Not found'
            }), { status: 404 });

            vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            await expect(deleteSubmission(999)).rejects.toThrow();
        });
    });

    describe('fetchSubmissions', () => {
        it('should return submissions data', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: true,
                data: [{ id: 1, form: 'form1' }],
                total: 1,
                page: 1,
                per_page: 10
            }), { status: 200 });

            vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            const result = await fetchSubmissions() as { success: boolean; data: unknown[] };

            expect(result.success).toBe(true);
            expect((result.data as unknown[])).toHaveLength(1);
        });

        it('should pass pagination parameters', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: true,
                data: [],
                total: 0
            }), { status: 200 });

            const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            await fetchSubmissions(2, 25, 'search term');

            expect(fetchSpy).toHaveBeenCalledWith(
                '/api/submissions?page=2&per_page=25&search=search%20term',
                expect.any(Object)
            );
        });

        it('should use default pagination values', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: true,
                data: [],
                total: 0
            }), { status: 200 });

            const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            await fetchSubmissions();

            expect(fetchSpy).toHaveBeenCalledWith(
                '/api/submissions?page=1&per_page=10',
                expect.any(Object)
            );
        });

        it('should not include search when empty', async () => {
            const mockResponse = new Response(JSON.stringify({
                success: true,
                data: []
            }), { status: 200 });

            const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

            await fetchSubmissions(1, 10, '');

            const calledUrl = fetchSpy.mock.calls[0][0] as string;
            expect(calledUrl).not.toContain('search=');
        });
    });
});

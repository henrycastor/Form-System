import { describe, it, expect } from 'vitest';
import {
    formatApiError,
    safeExecute,
    isApiError,
    createErrorResponse
} from '../../src/lib/utils/errorHandler';

describe('formatApiError', () => {
    it('should format error with default message and status', () => {
        const result = formatApiError(new Error('Test error'), 'Default error');

        expect(result).toEqual({
            success: false,
            error: 'Default error',
            message: 'Test error',
            status: 500
        });
    });

    it('should use custom status code', () => {
        const result = formatApiError(new Error('Not found'), 'Resource not found', 404);

        expect(result.status).toBe(404);
    });

    it('should handle Error instance with message', () => {
        const error = new Error('Something went wrong');
        const result = formatApiError(error, 'Operation failed');

        expect(result.message).toBe('Something went wrong');
    });

    it('should handle string error', () => {
        const result = formatApiError('String error', 'Failed', 400);

        expect(result.message).toBe('String error');
    });

    it('should handle unknown error types', () => {
        const result = formatApiError(null, 'Null error', 500);

        expect(result.message).toBe('null');
    });

    it('should handle undefined error', () => {
        const result = formatApiError(undefined, 'Undefined error', 500);

        expect(result.message).toBe('undefined');
    });

    it('should fallback to default message when error has no message', () => {
        const result = formatApiError({}, 'Default message', 500);

        expect(result.message).toBe('[object Object]');
    });
});

describe('safeExecute', () => {
    it('should return successful result', async () => {
        const operation = async () => ({ success: true, data: 'test' });
        const result = await safeExecute(operation, 'Failed', 500);

        expect(result).toEqual({ success: true, data: 'test' });
    });

    it('should return error response on failure', async () => {
        const operation = async () => {
            throw new Error('Operation failed');
        };
        const result = await safeExecute(operation, 'Custom error', 400);

        expect(result).toEqual({
            success: false,
            error: 'Custom error',
            message: 'Operation failed',
            status: 400
        });
    });

    it('should use default error message', async () => {
        const operation = async () => {
            throw new Error('Error');
        };
        const result = await safeExecute(operation);

        expect(result).toHaveProperty('error', 'Operation failed');
    });

    it('should use default status code', async () => {
        const operation = async () => {
            throw new Error('Error');
        };
        const result = await safeExecute(operation);

        expect(result).toHaveProperty('status', 500);
    });
});

describe('isApiError', () => {
    it('should return true for API error', () => {
        const error = {
            success: false,
            error: 'Something went wrong',
            status: 500
        };

        expect(isApiError(error)).toBe(true);
    });

    it('should return false for successful response', () => {
        const response = { success: true, data: 'test' };

        expect(isApiError(response)).toBe(false);
    });

    it('should return false for null', () => {
        expect(isApiError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
        expect(isApiError(undefined)).toBe(false);
    });

    it('should return false for object without success property', () => {
        const obj = { error: 'test' };

        expect(isApiError(obj)).toBe(false);
    });

    it('should return false when success is true', () => {
        const obj = { success: true, error: 'test' };

        expect(isApiError(obj)).toBe(false);
    });

    it('should return false when success is truthy but not false', () => {
        const obj = { success: 'false' as any, error: 'test' };

        expect(isApiError(obj)).toBe(false);
    });
});

describe('createErrorResponse', () => {
    it('should create error response with message', () => {
        const result = createErrorResponse('Test error', 'Detailed message', 400);

        expect(result).toEqual({
            success: false,
            error: 'Test error',
            message: 'Detailed message',
            status: 400
        });
    });

    it('should create error response without message', () => {
        const result = createErrorResponse('Test error');

        expect(result).toEqual({
            success: false,
            error: 'Test error',
            status: 500
        });
    });

    it('should handle Error instance for message', () => {
        const error = new Error('Error message');
        const result = createErrorResponse('Error', error);

        expect(result.message).toBe('Error message');
    });

    it('should handle string for message', () => {
        const result = createErrorResponse('Error', 'String message');

        expect(result.message).toBe('String message');
    });

    it('should use default status code', () => {
        const result = createErrorResponse('Error');

        expect(result.status).toBe(500);
    });

    it('should not include message when undefined', () => {
        const result = createErrorResponse('Error', undefined);

        expect(result).not.toHaveProperty('message');
    });
});

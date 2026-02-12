import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '$lib/utils/logger';

describe('Logger Utility', () => {
    beforeEach(() => {
        vi.spyOn(console, 'info').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    it('should log info messages in JSON format', () => {
        logger.info('Test info', { user: 'test' });

        expect(console.info).toHaveBeenCalled();
        const output = JSON.parse(vi.mocked(console.info).mock.calls[0][0]);

        expect(output.level).toBe('info');
        expect(output.message).toBe('Test info');
        expect(output.meta).toEqual({ user: 'test' });
        expect(output.ts).toBeDefined();
    });

    it('should log warn messages', () => {
        logger.warn('Test warn');

        expect(console.warn).toHaveBeenCalled();
        const output = JSON.parse(vi.mocked(console.warn).mock.calls[0][0]);
        expect(output.level).toBe('warn');
    });

    it('should log error messages', () => {
        logger.error('Test error', { stack: '...' });

        expect(console.error).toHaveBeenCalled();
        const output = JSON.parse(vi.mocked(console.error).mock.calls[0][0]);
        expect(output.level).toBe('error');
        expect(output.meta).toEqual({ stack: '...' });
    });
});

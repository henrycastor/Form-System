import { describe, it, expect, vi, afterEach } from 'vitest';
import { logger } from '$lib/utils/logger';
import { formatDisplayValue, createFormsByTitleMap } from '$lib/utils/formHelpers';
import { createModalManager } from '$lib/utils/modalManager.svelte';

describe('Logger Utility', () => {
    // Mock console methods
    const mockConsoleInfo = vi.spyOn(console, 'info').mockImplementation(() => { });
    const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('logger methods', () => {
        it('should call console.info for info level', () => {
            logger.info('Test info message');

            expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
            const output = JSON.parse(mockConsoleInfo.mock.calls[0][0]);
            expect(output.level).toBe('info');
            expect(output.message).toBe('Test info message');
        });

        it('should call console.warn for warn level', () => {
            logger.warn('Test warning message');

            expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
            const output = JSON.parse(mockConsoleWarn.mock.calls[0][0]);
            expect(output.level).toBe('warn');
            expect(output.message).toBe('Test warning message');
        });

        it('should call console.error for error level', () => {
            logger.error('Test error message');

            expect(mockConsoleError).toHaveBeenCalledTimes(1);
            const output = JSON.parse(mockConsoleError.mock.calls[0][0]);
            expect(output.level).toBe('error');
            expect(output.message).toBe('Test error message');
        });

        it('should include metadata when provided', () => {
            logger.info('Test with meta', { userId: 123, action: 'login' });

            const output = JSON.parse(mockConsoleInfo.mock.calls[0][0]);
            expect(output.meta).toEqual({ userId: 123, action: 'login' });
        });
    });
});

describe('Form Helpers Utility', () => {
    describe('formatDisplayValue', () => {
        it('should convert "true" to "Sim"', () => {
            expect(formatDisplayValue('true')).toBe('Sim');
        });

        it('should convert "false" to "Não"', () => {
            expect(formatDisplayValue('false')).toBe('Não');
        });

        it('should handle boolean true', () => {
            expect(formatDisplayValue(true)).toBe('Sim');
        });

        it('should handle boolean false', () => {
            expect(formatDisplayValue(false)).toBe('Não');
        });

        it('should return string for non-boolean values', () => {
            expect(formatDisplayValue('Hello')).toBe('Hello');
            expect(formatDisplayValue(123)).toBe('123');
        });
    });

    describe('createFormsByTitleMap', () => {
        it('should create a map with form titles', () => {
            const result = createFormsByTitleMap();
            // We expect at least the forms from $lib/form/forms to be there
            // Since it uses real data, we just check if it's an object and has some keys
            expect(typeof result).toBe('object');
            expect(Object.keys(result).length).toBeGreaterThan(0);
            expect(result).toHaveProperty('Intro');
        });
    });
});

describe('Modal Manager', () => {
    describe('createModalManager', () => {
        it('should start with visible false and item null', () => {
            const manager = createModalManager();

            expect(manager.visible).toBe(false);
            expect(manager.item).toBeNull();
        });

        it('should open modal and set item', () => {
            const manager = createModalManager<{ id: number }>();

            manager.open({ id: 123 });

            expect(manager.visible).toBe(true);
            expect(manager.item).toEqual({ id: 123 });
        });

        it('should close modal and clear item', () => {
            const manager = createModalManager<{ id: number }>();

            manager.open({ id: 123 });
            manager.close();

            expect(manager.visible).toBe(false);
            expect(manager.item).toBeNull();
        });

        it('should toggle modal state', () => {
            const manager = createModalManager();

            manager.toggle();
            expect(manager.visible).toBe(true);

            manager.toggle();
            expect(manager.visible).toBe(false);
        });
    });
});

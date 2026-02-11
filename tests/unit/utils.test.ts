import { describe, it, expect, vi } from 'vitest';

describe('Logger Utility', () => {
    // Mock console methods
    const mockConsoleInfo = vi.spyOn(console, 'info').mockImplementation(() => { });
    const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('format', () => {
        const format = (level: string, message: string, meta?: Record<string, unknown> | undefined) => {
            const timestamp = new Date().toISOString();
            const payload: Record<string, unknown> = {
                ts: timestamp,
                level,
                message,
                ...(meta && { meta })
            };
            return JSON.stringify(payload);
        };

        it('should format log entry with timestamp', () => {
            const result = format('info', 'Test message');
            const parsed = JSON.parse(result);

            expect(parsed.level).toBe('info');
            expect(parsed.message).toBe('Test message');
            expect(parsed.ts).toBeDefined();
        });

        it('should include meta when provided', () => {
            const result = format('info', 'Test message', { userId: 123 });
            const parsed = JSON.parse(result);

            expect(parsed.meta).toEqual({ userId: 123 });
        });

        it('should not include meta when undefined', () => {
            const result = format('info', 'Test message');
            const parsed = JSON.parse(result);

            expect(parsed.meta).toBeUndefined();
        });

        it('should format different log levels', () => {
            const infoResult = format('info', 'Info message');
            const warnResult = format('warn', 'Warning message');
            const errorResult = format('error', 'Error message');

            expect(JSON.parse(infoResult).level).toBe('info');
            expect(JSON.parse(warnResult).level).toBe('warn');
            expect(JSON.parse(errorResult).level).toBe('error');
        });

        it('should produce valid JSON output', () => {
            const result = format('info', 'Test message');

            expect(() => JSON.parse(result)).not.toThrow();
        });
    });

    describe('logger methods', () => {
        const logger = {
            info: (message: string, meta?: Record<string, unknown> | undefined) => {
                const timestamp = new Date().toISOString();
                const payload: Record<string, unknown> = {
                    ts: timestamp,
                    level: 'info',
                    message,
                    ...(meta && { meta })
                };
                console.info(JSON.stringify(payload));
            },
            warn: (message: string, meta?: Record<string, unknown> | undefined) => {
                const timestamp = new Date().toISOString();
                const payload: Record<string, unknown> = {
                    ts: timestamp,
                    level: 'warn',
                    message,
                    ...(meta && { meta })
                };
                console.warn(JSON.stringify(payload));
            },
            error: (message: string, meta?: Record<string, unknown> | undefined) => {
                const timestamp = new Date().toISOString();
                const payload: Record<string, unknown> = {
                    ts: timestamp,
                    level: 'error',
                    message,
                    ...(meta && { meta })
                };
                console.error(JSON.stringify(payload));
            }
        };

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

        it('should not include meta field when no metadata', () => {
            logger.info('Test without meta');

            const output = JSON.parse(mockConsoleInfo.mock.calls[0][0]);
            expect(output.meta).toBeUndefined();
        });
    });
});

describe('Form Helpers Utility', () => {
    describe('formatDisplayValue', () => {
        const formatDisplayValue = (value: unknown): string => {
            const stringValue = String(value);
            const isBoolValue = ['true', 'false'].includes(stringValue.toLowerCase());

            if (isBoolValue) {
                return stringValue.toLowerCase() === 'true' ? 'Sim' : 'Não';
            }

            return stringValue;
        };

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

        it('should handle case insensitive boolean strings', () => {
            expect(formatDisplayValue('TRUE')).toBe('Sim');
            expect(formatDisplayValue('FALSE')).toBe('Não');
            expect(formatDisplayValue('True')).toBe('Sim');
            expect(formatDisplayValue('False')).toBe('Não');
        });

        it('should return string for non-boolean values', () => {
            expect(formatDisplayValue('Hello')).toBe('Hello');
            expect(formatDisplayValue(123)).toBe('123');
            expect(formatDisplayValue('text with spaces')).toBe('text with spaces');
        });

        it('should handle empty string', () => {
            expect(formatDisplayValue('')).toBe('');
        });

        it('should handle numbers as string', () => {
            expect(formatDisplayValue('123')).toBe('123');
        });
    });

    describe('createFormsByTitleMap', () => {
        const createFormsByTitleMap = (forms: Array<{ title: string; id: number }>): Record<string, any> => {
            return forms.reduce(
                (acc, form) => {
                    acc[form.title] = form;
                    return acc;
                },
                {} as Record<string, any>,
            );
        };

        it('should create a map with form titles as keys', () => {
            const forms = [
                { title: 'Form 1', id: 1 },
                { title: 'Form 2', id: 2 }
            ];

            const result = createFormsByTitleMap(forms);

            expect(result['Form 1']).toEqual({ title: 'Form 1', id: 1 });
            expect(result['Form 2']).toEqual({ title: 'Form 2', id: 2 });
        });

        it('should return empty object for empty input', () => {
            const result = createFormsByTitleMap([]);

            expect(result).toEqual({});
        });

        it('should handle duplicate titles (last one wins)', () => {
            const forms = [
                { title: 'Duplicate', id: 1 },
                { title: 'Duplicate', id: 2 }
            ];

            const result = createFormsByTitleMap(forms);

            expect(result['Duplicate']).toEqual({ title: 'Duplicate', id: 2 });
        });
    });
});

describe('Modal Manager', () => {
    describe('createModalManager', () => {
        const createModalManager = <T = any>() => {
            let visible = false;
            let item: T | null = null;

            return {
                get visible(): boolean {
                    return visible;
                },
                get item(): T | null {
                    return item;
                },
                open: (newItem: T): void => {
                    item = newItem;
                    visible = true;
                },
                close: (): void => {
                    visible = false;
                    item = null;
                },
                toggle: (newItem?: T): void => {
                    if (visible) {
                        visible = false;
                        item = null;
                    } else if (newItem !== undefined) {
                        item = newItem;
                        visible = true;
                    } else {
                        visible = true;
                    }
                }
            };
        };

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

        it('should close modal when already visible (toggle)', () => {
            const manager = createModalManager();

            manager.toggle();
            expect(manager.visible).toBe(true);

            manager.toggle();
            expect(manager.visible).toBe(false);
        });

        it('should open with item when toggle called with item while closed', () => {
            const manager = createModalManager<{ id: number }>();

            manager.toggle({ id: 456 });

            expect(manager.visible).toBe(true);
            expect(manager.item).toEqual({ id: 456 });
        });

        it('should open without item when toggle called without item while closed', () => {
            const manager = createModalManager();

            manager.toggle();

            expect(manager.visible).toBe(true);
            expect(manager.item).toBeNull();
        });

        it('should reset item to null when closing via toggle', () => {
            const manager = createModalManager<{ id: number }>();

            manager.open({ id: 789 });
            manager.toggle();

            expect(manager.visible).toBe(false);
            expect(manager.item).toBeNull();
        });

        it('should support different types', () => {
            const numberManager = createModalManager<number>();
            const stringManager = createModalManager<string>();

            numberManager.open(42);
            stringManager.open('test');

            expect(numberManager.item).toBe(42);
            expect(stringManager.item).toBe('test');
        });
    });
});

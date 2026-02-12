import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get, writable } from 'svelte/store';
import { toasts, addToast, removeToast, updateToast, toast } from '$lib/components/toast';

// Mock $app/environment
vi.mock('$app/environment', () => ({
    browser: true
}));

describe('Toast Utility', () => {
    beforeEach(() => {
        toasts.set([]);
        vi.useFakeTimers();
    });

    it('should add a toast message', () => {
        const id = addToast('Test message', 'success', 3000);
        const currentToasts = get(toasts);

        expect(currentToasts).toHaveLength(1);
        expect(currentToasts[0]).toMatchObject({
            id,
            message: 'Test message',
            type: 'success',
            duration: 3000
        });
    });

    it('should remove a toast after duration', () => {
        addToast('Auto remove', 'info', 1000);
        expect(get(toasts)).toHaveLength(1);

        vi.advanceTimersByTime(1000);
        expect(get(toasts)).toHaveLength(0);
    });

    it('should remove toast manually', () => {
        const id = addToast('Manual remove');
        expect(get(toasts)).toHaveLength(1);

        removeToast(id);
        expect(get(toasts)).toHaveLength(0);
    });

    it('should update an existing toast', () => {
        const id = addToast('Original', 'loading', 0);
        updateToast(id, { message: 'Updated', type: 'success' });

        const currentToasts = get(toasts);
        expect(currentToasts[0].message).toBe('Updated');
        expect(currentToasts[0].type).toBe('success');
    });

    describe('toast helper methods', () => {
        it('should have shorthand methods for types', () => {
            toast.success('Success');
            toast.error('Error');
            toast.warning('Warning');
            toast.info('Info');
            toast.loading('Loading');

            const currentToasts = get(toasts);
            expect(currentToasts).toHaveLength(5);
            expect(currentToasts[0].type).toBe('success');
            expect(currentToasts[1].type).toBe('error');
            expect(currentToasts[2].type).toBe('warning');
            expect(currentToasts[3].type).toBe('info');
            expect(currentToasts[4].type).toBe('loading');
        });

        it('should handle promise toasts', async () => {
            let resolvePromise: any;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            toast.promise(promise, {
                loading: 'Loading...',
                success: 'Done!',
                error: 'Failed'
            });

            expect(get(toasts)[0]).toMatchObject({ message: 'Loading...', type: 'loading' });

            resolvePromise('Success');

            // Wait for microtasks
            await Promise.resolve();
            await Promise.resolve();

            expect(get(toasts)[0]).toMatchObject({ message: 'Done!', type: 'success' });
        });

        it('should handle failed promise toasts', async () => {
            let rejectPromise: any;
            const promise = new Promise((_, reject) => {
                rejectPromise = reject;
            });

            toast.promise(promise, {
                loading: 'Loading...',
                success: 'Done!',
                error: 'Failed'
            });

            expect(get(toasts)[0]).toMatchObject({ message: 'Loading...', type: 'loading' });

            rejectPromise(new Error('Fail'));

            // Wait for microtasks
            await Promise.resolve();
            await Promise.resolve();

            expect(get(toasts)[0]).toMatchObject({ message: 'Failed', type: 'error' });
        });

        it('should validate emails and show toast on error', () => {
            const valid = toast.validateEmail('test@example.com');
            expect(valid).toBe(true);
            expect(get(toasts)).toHaveLength(0);

            const invalid = toast.validateEmail('invalid-email');
            expect(invalid).toBe(false);
            expect(get(toasts)).toHaveLength(1);
            expect(get(toasts)[0].type).toBe('error');
        });
    });
});

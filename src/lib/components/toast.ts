import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastMessage {
    id: number;
    type: ToastType;
    message: string;
    duration: number;
}

// Initialize store with browser check to prevent SSR issues
const initialToasts = browser ? [] : undefined;
export const toasts = writable<ToastMessage[]>(initialToasts || []);

let idCounter = 0;

export const addToast = (message: string, type: ToastType = 'info', duration = 3000) => {
	const id = ++idCounter;
	const toast: ToastMessage = { id, type, message, duration };

	toasts.update((all) => [...all, toast]);

	if (duration > 0) {
		setTimeout(() => {
			removeToast(id);
		}, duration);
	}
	return id;
};

export const removeToast = (id: number) => {
    toasts.update((all) => all.filter((t) => t.id !== id));
};

export const updateToast = (id: number, updates: Partial<ToastMessage>) => {
    toasts.update((all) => all.map((t) => t.id === id ? { ...t, ...updates } : t));
    if (updates.duration && updates.duration > 0) {
        setTimeout(() => {
            removeToast(id);
        }, updates.duration);
    }
};

export const toast = {
    success: (msg: string, duration = 3000) => addToast(msg, 'success', duration),
    error: (msg: string, duration = 4000) => addToast(msg, 'error', duration),
    warning: (msg: string, duration = 4000) => addToast(msg, 'warning', duration),
    info: (msg: string, duration = 3000) => addToast(msg, 'info', duration),
    loading: (msg: string, duration = 0) => addToast(msg, 'loading', duration),
    promise: <T>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) => {
        const id = addToast(msgs.loading, 'loading', 0);
        promise
            .then(() => {
                updateToast(id, { type: 'success', message: msgs.success, duration: 3000 });
            })
            .catch(() => {
                updateToast(id, { type: 'error', message: msgs.error, duration: 4000 });
            });
        return promise;
    },
    validateEmail: (email: string) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValid) {
            addToast('Por favor, insira um endereço de e-mail válido.', 'error');
        }
        return isValid;
    }
};
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import Header from '../../src/lib/components/Header.svelte';
import BackButton from '../../src/lib/components/BackButton.svelte';
import Toast from '../../src/lib/components/Toast.svelte';
import { toasts, removeToast, addToast } from '../../src/lib/components/toast.ts';

describe('Header Component', () => {
    it('should render header with brand', () => {
        render(Header, { activePage: 'home' });

        expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('should show navigation links', () => {
        render(Header, { activePage: 'home' });

        expect(screen.getByText('Tela Inicial')).toBeInTheDocument();
        expect(screen.getByText('Formulários')).toBeInTheDocument();
        expect(screen.getByText('Painel Administrador')).toBeInTheDocument();
    });

    it('should mark active page', () => {
        render(Header, { activePage: 'home' });

        const homeLink = screen.getByText('Tela Inicial').closest('a');
        expect(homeLink).toHaveClass('active');
    });
});

describe('BackButton Component', () => {
    it('should render back button with text', () => {
        render(BackButton);

        expect(screen.getByText('Voltar')).toBeInTheDocument();
    });

    it('should have correct href attribute', () => {
        render(BackButton);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/');
    });
});

describe('Toast Store', () => {
    beforeEach(() => {
        const currentToasts = get(toasts);
        currentToasts.forEach((t) => removeToast(t.id));
    });

    afterEach(() => {
        const currentToasts = get(toasts);
        currentToasts.forEach((t) => removeToast(t.id));
    });

    it('should add success toast', () => {
        addToast('Operation successful', 'success');

        const currentToasts = get(toasts);
        expect(currentToasts).toHaveLength(1);
        expect(currentToasts[0].message).toBe('Operation successful');
        expect(currentToasts[0].type).toBe('success');
    });

    it('should add error toast', () => {
        addToast('Error occurred', 'error');

        const currentToasts = get(toasts);
        expect(currentToasts).toHaveLength(1);
        expect(currentToasts[0].type).toBe('error');
    });

    it('should add warning toast', () => {
        addToast('Warning message', 'warning');

        const currentToasts = get(toasts);
        expect(currentToasts[0].type).toBe('warning');
    });

    it('should add info toast', () => {
        addToast('Info message', 'info');

        const currentToasts = get(toasts);
        expect(currentToasts[0].type).toBe('info');
    });

    it('should add multiple toasts', () => {
        addToast('First toast', 'success');
        addToast('Second toast', 'error');

        const currentToasts = get(toasts);
        expect(currentToasts).toHaveLength(2);
    });

    it('should remove toast by id', () => {
        const id = addToast('Toast to remove', 'info');
        expect(get(toasts)).toHaveLength(1);

        removeToast(id);
        expect(get(toasts)).toHaveLength(0);
    });

    it('should remove correct toast when multiple exist', () => {
        const id1 = addToast('Toast 1', 'success');
        const id2 = addToast('Toast 2', 'error');

        expect(get(toasts)).toHaveLength(2);

        removeToast(id1);

        const remaining = get(toasts);
        expect(remaining).toHaveLength(1);
        expect(remaining[0].message).toBe('Toast 2');
    });

    it('should have default duration', () => {
        addToast('Default duration toast', 'info');

        const currentToasts = get(toasts);
        expect(currentToasts[0].duration).toBe(3000);
    });

    it('should have longer duration for error', () => {
        addToast('Error toast', 'error');

        const currentToasts = get(toasts);
        expect(currentToasts[0].duration).toBe(4000);
    });

    it('should have zero duration for loading', () => {
        addToast('Loading toast', 'loading');

        const currentToasts = get(toasts);
        expect(currentToasts[0].duration).toBe(0);
    });
});

describe('Toast Component', () => {
    beforeEach(() => {
        const currentToasts = get(toasts);
        currentToasts.forEach((t) => removeToast(t.id));
    });

    afterEach(() => {
        const currentToasts = get(toasts);
        currentToasts.forEach((t) => removeToast(t.id));
    });

    it('should render toast container', () => {
        render(Toast);

        const container = document.querySelector('.toast-container');
        expect(container).toBeInTheDocument();
    });

    it('should show success toast message', async () => {
        addToast('Operation successful', 'success');

        render(Toast);

        await new Promise(resolve => setTimeout(resolve, 50));
        expect(screen.getByText('Operation successful')).toBeInTheDocument();
    });

    it('should show error toast message', async () => {
        addToast('Error occurred', 'error');

        render(Toast);

        await new Promise(resolve => setTimeout(resolve, 50));
        expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('should render close button', async () => {
        addToast('Toast with close', 'success');

        render(Toast);

        await new Promise(resolve => setTimeout(resolve, 50));
        expect(screen.getByLabelText('Fechar')).toBeInTheDocument();
    });
});

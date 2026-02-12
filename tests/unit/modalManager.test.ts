import { describe, it, expect } from 'vitest';
import { createModalManager } from '$lib/utils/modalManager.svelte';

describe('Modal Manager Utility', () => {
    it('should initialize as hidden', () => {
        const modal = createModalManager();
        expect(modal.visible).toBe(false);
        expect(modal.item).toBe(null);
    });

    it('should open with an item', () => {
        const modal = createModalManager<string>();
        modal.open('test-item');

        expect(modal.visible).toBe(true);
        expect(modal.item).toBe('test-item');
    });

    it('should close and reset item', () => {
        const modal = createModalManager<number>();
        modal.open(42);
        modal.close();

        expect(modal.visible).toBe(false);
        expect(modal.item).toBe(null);
    });

    it('should toggle visibility', () => {
        const modal = createModalManager();

        modal.toggle();
        expect(modal.visible).toBe(true);

        modal.toggle();
        expect(modal.visible).toBe(false);
    });

    it('should toggle with a new item', () => {
        const modal = createModalManager<string>();

        modal.toggle('item-1');
        expect(modal.visible).toBe(true);
        expect(modal.item).toBe('item-1');

        modal.toggle();
        expect(modal.visible).toBe(false);
        expect(modal.item).toBe(null);
    });
});

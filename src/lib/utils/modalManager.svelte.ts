export function createModalManager<T = any>() {
    let visible = $state(false);
    let item: T | null = $state(null);

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
}

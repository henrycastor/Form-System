/**
 * Helper functions for the administration panel and its components
 */

/**
 * Calculates the range of items being shown in pagination
 */
export function calculateRange(page: number, perPage: number, total: number) {
    const start = total === 0 ? 0 : (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return { start, end };
}

/**
 * Returns available options for items per page based on total count
 */
export function getAvailablePerPageOptions(count: number): number[] {
    const allOptions = [5, 10, 20, 50];
    const availableOptions = allOptions.filter((option) => option <= count);

    if (availableOptions.length === 0 && count > 0) {
        return [count];
    } else if (count === 0) {
        return [10];
    }
    return availableOptions;
}

/**
 * Returns the CSS class for a stat card based on its key
 */
export function getStatCardClass(key: string): string {
    const validKeys = ['total', 'pending', 'completed', 'recent'];
    return validKeys.includes(key) ? `stat-card ${key}` : 'stat-card';
}

/**
 * Returns a stat value from a stats object, defaulting to 0
 */
export function getStatValue(stats: Record<string, number> | undefined, key: string): number {
    if (!stats) return 0;
    return stats[key] || 0;
}

/**
 * Checks if a search query is empty or just whitespace
 */
export function isEmptySearch(query: string | null | undefined): boolean {
    return !query || query.trim() === '';
}

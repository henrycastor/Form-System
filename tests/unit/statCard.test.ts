import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte/svelte5';
import StatCard from '$lib/components/StatCard.svelte';
import { Activity, Clock, CheckCircle, BarChart3 } from 'lucide-svelte';

describe('StatCard Component', () => {
    const mockStatConfig = [
        { key: 'total', label: 'Total', icon: Activity },
        { key: 'pending', label: 'Pendente', icon: Clock }
    ];

    const mockStats = {
        total: 150,
        pending: 45,
        completed: 105,
        recent: 12
    };

    it('should render all stat cards from config', () => {
        render(StatCard, { props: { stats: mockStats, statConfig: mockStatConfig } });

        expect(screen.getByText('Total')).toBeDefined();
        expect(screen.getByText('Pendente')).toBeDefined();
        expect(screen.getByText('150')).toBeDefined();
        expect(screen.getByText('45')).toBeDefined();
    });

    it('should apply correct CSS classes based on key', () => {
        const { container } = render(StatCard, { props: { stats: mockStats, statConfig: mockStatConfig } });

        const totalCard = container.querySelector('.stat-card.total');
        const pendingCard = container.querySelector('.stat-card.pending');

        expect(totalCard).toBeDefined();
        expect(pendingCard).toBeDefined();
    });
});

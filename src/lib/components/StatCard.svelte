<script lang="ts">
    import type { StatConfigItem, SubmissionStats } from "$lib/types/admin";

    const { stats, statConfig }: {
        stats: SubmissionStats;
        statConfig: StatConfigItem[];
    } = $props();
</script>

<div class="stats-cards">
    {#each statConfig as stat}
        <div class="stat-card {stat.key}">
            <div class="stat-icon">
                <i class="bi {stat.icon}"></i>
            </div>
            <div class="stat-value">{stats[stat.key]}</div>
            <div class="stat-label">{stat.label}</div>
        </div>
    {/each}
</div>

<style>
    .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }

    .stat-card {
        background-color: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        border-left: 6px solid var(--primary-color);
    }

    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .stat-card.total {
        border-left-color: var(--primary-color);
    }

    .stat-card.pending {
        border-left-color: var(--secondary-color);
    }

    .stat-card.completed {
        border-left-color: var(--success-color);
    }

    .stat-card.recent {
        border-left-color: var(--accent-color);
    }

    .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        font-size: 1.8rem;
        color: white;
    }

    .stat-card.total .stat-icon {
        background-color: var(--primary-color);
    }

    .stat-card.pending .stat-icon {
        background-color: var(--secondary-color);
    }

    .stat-card.completed .stat-icon {
        background-color: var(--success-color);
    }

    .stat-card.recent .stat-icon {
        background-color: var(--accent-color);
    }

    .stat-value {
        font-size: 2.2rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 5px;
    }

    .stat-label {
        color: #666;
        font-size: 1rem;
        font-weight: 500;
    }
</style>

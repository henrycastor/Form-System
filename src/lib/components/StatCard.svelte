<script lang="ts">
  import type { StatConfigItem, SubmissionStats } from '$lib/types/admin';

  const {
    stats,
    statConfig,
  }: {
    stats: SubmissionStats;
    statConfig: StatConfigItem[];
  } = $props();
</script>

<div class="stats-cards">
  {#each statConfig as stat}
    <div class="stat-card {stat.key}">
      <div class="stat-icon">
        <stat.icon size={28} />
      </div>
      <div class="stat-value">{stats[stat.key]}</div>
      <div class="stat-label">{stat.label}</div>
    </div>
  {/each}
</div>

<style>
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xxl);
  }

  .stat-card {
    background: white;
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    transition: var(--transition-normal);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .stat-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: var(--primary-color);
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary-color);
  }

  .stat-card.total::after {
    background: var(--primary-gradient);
  }
  .stat-card.pending::after {
    background: var(--secondary-color);
  }
  .stat-card.completed::after {
    background: var(--success-color);
  }
  .stat-card.recent::after {
    background: var(--accent-color);
  }

  .stat-icon {
    width: 52px;
    height: 52px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-md);
    background: var(--light-bg);
    color: var(--text-main);
    transition: var(--transition-normal);
  }

  /* Specific Default States for Contrast */
  .stat-card.total .stat-icon {
    background: var(--primary-bg-light);
    color: var(--primary-color);
  }
  .stat-card.pending .stat-icon {
    background: var(--secondary-bg);
    color: var(--warning-color);
  }
  .stat-card.completed .stat-icon {
    background: var(--success-bg);
    color: var(--success-color);
  }
  .stat-card.recent .stat-icon {
    background: var(--accent-bg-light);
    color: var(--accent-color);
  }

  .stat-card:hover .stat-icon {
    transform: scale(1.1) translateY(-2px);
    background: var(--primary-color);
    color: var(--white);
    box-shadow: var(--shadow-md);
  }

  .stat-card.pending:hover .stat-icon {
    background: var(--secondary-color);
    color: var(--primary-color); /* Dark color on yellow for contrast */
  }

  .stat-card.completed:hover .stat-icon {
    background: var(--success-color);
    color: var(--white);
  }

  .stat-card.recent:hover .stat-icon {
    background: var(--accent-color);
    color: var(--white);
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-main);
    line-height: 1;
    margin-bottom: var(--spacing-xs);
    letter-spacing: -1px;
  }

  .stat-label {
    color: var(--text-muted);
    font-size: 0.95rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>

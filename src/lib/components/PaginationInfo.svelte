<script lang="ts">
  import { Pagination } from 'bits-ui';
  import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-svelte';

  let {
    count,
    perPage = 10,
    page = $bindable(1),
  }: {
    count: number;
    perPage?: number;
    page: number;
  } = $props();
</script>

<div class="pagination-wrap">
  <Pagination.Root {count} {perPage} bind:page class="pagination-root">
    {#snippet children({ pages, range })}
      <div class="pagination-info">
        Mostrando <span class="font-bold">{range.start + 1}</span> a
        <span class="font-bold">{range.end}</span>
        de <span class="font-bold">{count}</span> registros
      </div>

      <div class="pagination-controls">
        <Pagination.PrevButton class="page-btn">
          <ChevronLeft size={18} />
        </Pagination.PrevButton>

        {#each pages as page (page.key)}
          {#if page.type === 'page'}
            <Pagination.Page {page} class="page-btn page-num">
              {page.value}
            </Pagination.Page>
          {:else}
            <div class="page-ellipsis">
              <MoreHorizontal size={18} />
            </div>
          {/if}
        {/each}

        <Pagination.NextButton class="page-btn">
          <ChevronRight size={18} />
        </Pagination.NextButton>
      </div>
    {/snippet}
  </Pagination.Root>
</div>

<style>
  .pagination-wrap {
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
  }

  :global(.pagination-root) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }

  .pagination-info {
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .font-bold {
    font-weight: 700;
    color: var(--text-main);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  :global(.page-btn) {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    background: white;
    color: var(--text-main);
    cursor: pointer;
    transition: var(--transition-fast);
    padding: 0;
  }

  :global(.page-btn:hover:not(:disabled)) {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-bg-light);
  }

  :global(.page-btn:disabled) {
    opacity: 0.4;
    cursor: not-allowed;
  }

  :global(.page-num[data-selected]) {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }

  .page-ellipsis {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-light);
  }

  @media (max-width: 640px) {
    :global(.pagination-root) {
      flex-direction: column;
      text-align: center;
    }
  }
</style>

<script lang="ts">
  import { Pagination } from 'bits-ui';
  import { Select } from 'bits-ui';
  import { ChevronLeft, ChevronRight, MoreHorizontal, Check, ChevronsUpDown } from 'lucide-svelte';

  import { getAvailablePerPageOptions } from '$lib/utils/adminHelpers';

  let {
    count,
    perPage = $bindable(10),
    page = $bindable(1),
  }: {
    count: number;
    perPage?: number;
    page: number;
  } = $props();

  // Track first render to only validate perPage once
  let isFirstRender = $state(true);

  $effect(() => {
    const options = getAvailablePerPageOptions(count);

    // Only validate perPage on first render, not on every count change
    if (isFirstRender) {
      isFirstRender = false;

      // Ensure perPage is valid for the current options
      if (!options.includes(perPage)) {
        perPage = options[options.length - 1];
        page = 1; // Reset to first page when perPage changes
      }
    }
  });

  function handlePerPageChange(value: string) {
    perPage = Number(value);
    page = 1; // Reset to first page when changing per page
  }
</script>

<div class="pagination-wrap">
  <Pagination.Root {count} {perPage} bind:page class="pagination-root">
    {#snippet children({ pages, range })}
      <div class="pagination-info">
        Mostrando <span class="font-bold">{range.start}</span> a
        <span class="font-bold">{range.end}</span>
        de <span class="font-bold">{count}</span> registros
        <span class="per-page-selector">
          <label for="per-page"> Ver:</label>
          <Select.Root type="single" value={String(perPage)} onValueChange={handlePerPageChange}>
            <Select.Trigger class="select-trigger" id="per-page">
              {perPage}
              <ChevronsUpDown size={16} class="ms-2 opacity-50" />
            </Select.Trigger>
            <Select.Content class="select-content">
              <Select.Viewport>
                <Select.Group>
                  {#each getAvailablePerPageOptions(count) as val}
                    <Select.Item value={String(val)} label={String(val)} class="select-item">
                      {#snippet children({ selected })}
                        {val}
                        {#if selected}
                          <Check size={14} class="ms-auto" />
                        {/if}
                      {/snippet}
                    </Select.Item>
                  {/each}
                </Select.Group>
              </Select.Viewport>
            </Select.Content>
          </Select.Root>
        </span>
      </div>

      <div class="page-controls">
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

  .per-page-selector {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.9rem;
    color: var(--text-muted);
    font-weight: 600;
    margin-left: var(--spacing-md);
  }

  :global(.select-trigger) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-weight: 700;
    color: var(--text-main);
    cursor: pointer;
    min-width: 70px;
    transition: var(--transition-fast);
  }

  :global(.select-trigger:hover) {
    border-color: var(--primary-color);
  }

  :global(.select-content) {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--spacing-xs);
    min-width: 70px;
    z-index: 100;
  }

  :global(.select-item) {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-weight: 600;
    color: var(--text-main);
    transition: var(--transition-fast);
  }

  :global(.select-item[data-highlighted]) {
    background: var(--primary-bg-light);
    color: var(--primary-color);
    outline: none;
  }

  :global(.select-item[data-selected]) {
    background: var(--primary-color);
    color: white;
  }

  .page-controls {
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

    .per-page-selector {
      margin-left: 0;
      margin-top: var(--spacing-sm);
    }
  }
</style>

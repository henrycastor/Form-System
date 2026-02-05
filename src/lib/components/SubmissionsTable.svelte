<script lang="ts">
  import SearchBar from './SearchBar.svelte';
  import SubmissionRow from './SubmissionRow.svelte';
  import PaginationInfo from './PaginationInfo.svelte';
  import { Select } from 'bits-ui';
  import type { Submission, TableHeader, ModalCallback } from '$lib/types/admin';
  import { ChevronUp, ChevronDown, Check, ChevronsUpDown } from 'lucide-svelte';

  let {
    submissions = [],
    searchQuery = $bindable(''),
    openViewModal,
    openDeleteModal,
    headers = [],
  }: {
    submissions?: Submission[];
    searchQuery?: string;
    openViewModal: ModalCallback;
    openDeleteModal: ModalCallback;
    headers?: TableHeader[];
  } = $props();

  let sortColumn = $state('date');
  let sortDirection = $state<'asc' | 'desc'>('desc');
  let currentPage = $state(1);
  let perPage = $state(10);

  function handleSort(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
  }

  let allFilteredSubmissions = $derived.by(() => {
    const query = searchQuery.toLowerCase();
    const filtered = submissions.filter((s: Submission) => {
      const name = s.name || '';
      const sector = s.sector || '';
      const form = s.title || '';

      return (
        name.toLowerCase().includes(query) ||
        sector.toLowerCase().includes(query) ||
        form.toLowerCase().includes(query)
      );
    });

    return filtered.sort((a: Submission, b: Submission) => {
      const valA = (a[sortColumn as keyof Submission] as string | number) ?? '';
      const valB = (b[sortColumn as keyof Submission] as string | number) ?? '';

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  });

  let paginatedSubmissions = $derived.by(() => {
    const start = (currentPage - 1) * perPage;
    return allFilteredSubmissions.slice(start, start + perPage);
  });
</script>

<div class="admin-table-container">
  <div class="table-header">
    <div class="header-left">
      <h3 class="table-title">Formulários Preenchidos</h3>

      <div class="per-page-selector">
        <label for="per-page">Ver:</label>
        <Select.Root
          type="single"
          value={String(perPage)}
          onValueChange={(v) => {
            perPage = Number(v);
            currentPage = 1;
          }}
        >
          <Select.Trigger class="select-trigger" id="per-page">
            {perPage}
            <ChevronsUpDown size={16} class="ms-2 opacity-50" />
          </Select.Trigger>
          <Select.Content class="select-content" portal={null}>
            <Select.Group>
              {#each [5, 10, 20, 50] as val}
                <Select.Item value={String(val)} label={String(val)} class="select-item">
                  {val}
                  <Select.ItemIndicator class="ms-auto">
                    <Check size={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </div>
    </div>

    <SearchBar bind:searchQuery />
  </div>

  <table class="table table-hover">
    <thead>
      <tr>
        {#each headers as header}
          <th onclick={() => handleSort(header.column)} role="button" class={header.class || ''}>
            <div class="header-content">
              {header.label}
              {#if sortColumn === header.column}
                <span class="sort-icon">
                  {#if sortDirection === 'asc'}
                    <ChevronUp size={16} />
                  {:else}
                    <ChevronDown size={16} />
                  {/if}
                </span>
              {/if}
            </div>
          </th>
        {/each}
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedSubmissions as item}
        <SubmissionRow {item} {openViewModal} {openDeleteModal} />
      {/each}
      {#if paginatedSubmissions.length === 0}
        <tr>
          <td colspan={headers.length + 1} class="empty-state"> Nenhum formulário encontrado. </td>
        </tr>
      {/if}
    </tbody>
  </table>
  <PaginationInfo count={allFilteredSubmissions.length} bind:page={currentPage} {perPage} />
</div>

<style>
  .admin-table-container {
    background-color: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
    margin-bottom: 40px;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    flex-wrap: wrap;
    gap: 15px;
  }

  .table-title {
    color: var(--primary-color);
    font-weight: 800;
    font-size: 1.5rem;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
    flex-wrap: wrap;
  }

  .per-page-selector {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.9rem;
    color: var(--text-muted);
    font-weight: 600;
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

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  thead th {
    background-color: var(--light-bg);
    color: var(--primary-color);
    font-weight: 600;
    padding: 15px 10px;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
  }

  thead th[role='button'] {
    cursor: pointer;
  }

  .sort-icon {
    margin-left: 5px;
    float: right;
  }

  .date-header {
    min-width: 165px;
  }

  .name-header {
    min-width: 100px;
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xxl) !important;
    color: var(--text-muted);
    font-size: 1.1rem;
    font-weight: 500;
  }
</style>

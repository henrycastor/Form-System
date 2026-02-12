<script lang="ts">
  import SearchBar from './SearchBar.svelte';
  import SubmissionRow from './SubmissionRow.svelte';
  import PaginationInfo from './PaginationInfo.svelte';
  import type { Submission, TableHeader, ModalCallback } from '$lib/types/admin';
  import { ChevronUp, ChevronDown } from 'lucide-svelte';

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

  let searchPlaceholder = $derived(
    headers
      .filter((h) => h.column !== 'date' && h.column !== 'status')
      .map((h) => h.label.toLowerCase())
      .join(' ou ')
  );

  let filteredPlaceholder = $derived(
    searchPlaceholder ? `Buscar por ${searchPlaceholder}` : 'Buscar'
  );

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
      const form = s.title || '';

      return name.toLowerCase().includes(query) || form.toLowerCase().includes(query);
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
    </div>

    <SearchBar bind:searchQuery placeholder={filteredPlaceholder} />
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
    background-color: var(--white);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--spacing-xl);
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    flex-wrap: wrap;
    gap: var(--spacing-md);
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

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  thead th {
    background-color: var(--light-bg);
    color: var(--primary-color);
    font-weight: 600;
    padding: var(--spacing-md) var(--spacing-sm);
    border-bottom: 2px solid var(--primary-color);
    position: relative;
  }

  thead th[role='button'] {
    cursor: pointer;
  }

  .sort-icon {
    margin-left: var(--spacing-xs);
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

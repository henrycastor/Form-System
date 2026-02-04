<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  import type { Submission } from '$lib/submissionsStore'; // Import only the type
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import SubmissionsTable from '$lib/components/SubmissionsTable.svelte';
  import ViewSubmissionModal from '$lib/components/ViewSubmissionModal.svelte';
  import DeleteSubmissionModal from '$lib/components/DeleteSubmissionModal.svelte';
  import { toast } from '$lib/components/toast';
  import { createModalManager } from '$lib/utils/modalManager.svelte';
  import type { PageData } from './$types';
  import type { StatConfigItem } from '$lib/types/admin';

  let { data }: { data: PageData } = $props();
  let isAuthorized = $state(true);

  // Initialize submissions store with empty array
  const submissions = writable<Submission[]>([]);

  onMount(() => {
    // Update submissions store from page data
    const initialSubmissions = Array.isArray(data.submissions) ? data.submissions : [];
    submissions.set(initialSubmissions);
  });

  let searchQuery = $state('');

  // Modal managers for view and delete modals
  const viewModal = createModalManager<Submission>();
  const deleteModal = createModalManager<Submission>();

  const tableHeaders = [
    { column: 'name', label: 'Nome', class: 'name-header' },
    { column: 'sector', label: 'Setor' },
    { column: 'title', label: 'Formulário' },
    { column: 'date', label: 'Data de Envio', class: 'date-header' },
    { column: 'status', label: 'Status' },
  ];

  const stats = $derived({
    total: Array.isArray($submissions) ? $submissions.length : 0,
    pending: Array.isArray($submissions)
      ? $submissions.filter((s) => s.status === 'pending').length
      : 0,
    completed: Array.isArray($submissions)
      ? $submissions.filter((s) => s.status === 'completed').length
      : 0,
    recent: Array.isArray($submissions) ? Math.ceil($submissions.length * 0.1) : 0,
  });

  const statConfig: StatConfigItem[] = [
    {
      key: 'total',
      icon: 'bi-file-text',
      label: 'Total de Envios',
      color: 'var(--primary-color)',
    },
    {
      key: 'pending',
      icon: 'bi-clock',
      label: 'Pendentes de Revisão',
      color: 'var(--secondary-color)',
    },
    {
      key: 'completed',
      icon: 'bi-check-circle',
      label: 'Completos',
      color: 'var(--success-color)',
    },
    {
      key: 'recent',
      icon: 'bi-calendar-week',
      label: 'Últimos 7 dias',
      color: 'var(--accent-color)',
    },
  ];

  async function deleteSubmission() {
    if (!deleteModal.item || !deleteModal.item.id) {
      console.error('No valid item selected for deletion.');
      toast.error('Nenhum formulário selecionado para exclusão.');
      return;
    }

    try {
      const response = await fetch(`/api/submissions?id=${deleteModal.item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }

      submissions.update((items) => items.filter((i) => i.id !== deleteModal.item!.id));
      deleteModal.close();
      toast.success('Formulário excluído com sucesso!');
    } catch (e) {
      console.error('Delete error:', e);
      toast.error(`Erro ao excluir o formulário: ${(e as Error).message}`);
    }
  }

  // Wrapper functions for modal callbacks
  function handleOpenViewModal(item: Submission) {
    viewModal.open(item);
  }

  function handleOpenDeleteModal(item: Submission) {
    deleteModal.open(item);
  }
</script>

<Header activePage="admin" />

{#if isAuthorized}
  <main class="main-content">
    <div class="container">
      <div class="admin-container">
        <!-- Cabeçalho do Painel -->
        <div class="admin-header">
          <div>
            <h1 class="page-title">Painel Administrador</h1>
            <p class="page-subtitle">Gerencie todos os formulários preenchidos no sistema</p>
          </div>
        </div>

        <!-- Cartões de Estatísticas -->
        <StatCard {stats} {statConfig} />

        <!-- Tabela de Formulários -->
        <SubmissionsTable
          submissions={$submissions}
          headers={tableHeaders}
          {searchQuery}
          openViewModal={handleOpenViewModal}
          openDeleteModal={handleOpenDeleteModal}
        />
      </div>
    </div>
  </main>
{:else}
  <div class="loading-full-page">
    <div class="spinner"></div>
  </div>
{/if}

<Footer />

<!-- Modals -->
<ViewSubmissionModal
  isVisible={viewModal.visible}
  item={viewModal.item}
  closeModal={viewModal.close}
/>

<DeleteSubmissionModal
  isVisible={deleteModal.visible}
  item={deleteModal.item}
  closeModal={deleteModal.close}
  {deleteSubmission}
/>

<style>
  :root {
    --primary-color: #0056a6;
    --secondary-color: #ffcc00;
    --accent-color: #34b5e5;
    --light-bg: #f8f9fa;
    --danger-color: #dc3545;
    --success-color: #28a745;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 30px 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
    min-height: calc(100vh - 150px);
  }

  .admin-container {
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 20px;
  }

  .page-title {
    color: var(--primary-color);
    font-weight: 700;
    font-size: 2.5rem;
    margin: 0;
  }

  .page-subtitle {
    color: #666;
    font-size: 1.1rem;
    margin-top: 10px;
  }

  .loading-full-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 86, 166, 0.1);
    border-radius: 50%;
    border-top-color: #0056a6;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

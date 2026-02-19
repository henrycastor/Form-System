<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  import type { Submission } from '$lib/submissionsStore.svelte'; // Import only the type
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import SubmissionTable from '$lib/components/SubmissionTable.svelte';
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

  import { FileText, Clock, CircleCheck, Calendar } from 'lucide-svelte';

  const statConfig: StatConfigItem[] = [
    {
      key: 'total',
      icon: FileText,
      label: 'Total de Envios',
      color: 'var(--primary-color)',
    },
    {
      key: 'pending',
      icon: Clock,
      label: 'Pendentes de Revisão',
      color: 'var(--secondary-color)',
    },
    {
      key: 'completed',
      icon: CircleCheck,
      label: 'Completos',
      color: 'var(--success-color)',
    },
    {
      key: 'recent',
      icon: Calendar,
      label: 'Últimos 7 dias',
      color: 'var(--accent-color)',
    },
  ];

  async function deleteSubmission() {
    console.log('deleteSubmission() called');
    if (!deleteModal.item || !deleteModal.item.id) {
      toast.error('Nenhum formulário selecionado para exclusão.');
      return;
    }

    try {
      console.log('Attempting to delete submission with ID:', deleteModal.item.id);
      const response = await fetch(`/api/submissions/${deleteModal.item.id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      const responseData = await response.json();
      console.log('Delete response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Unknown error');
      }

      console.log('Deleting from local store. Current items:', $submissions);
      submissions.update((items) => {
        const newItems = items.filter((i) => i.id !== deleteModal.item!.id);
        console.log('New items after deletion:', newItems);
        return newItems;
      });
      deleteModal.close();
      toast.success('Formulário excluído com sucesso!');
    } catch (e) {
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
        <SubmissionTable
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
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--spacing-xxl) var(--spacing-md);
    background: var(--body-bg);
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
    margin-bottom: var(--spacing-xxl);
    flex-wrap: wrap;
    gap: var(--spacing-xl);
  }

  .page-title {
    color: var(--primary-color);
    font-weight: 900;
    font-size: 2.75rem;
    margin: 0;
    letter-spacing: -1.5px;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .page-subtitle {
    color: var(--text-muted);
    font-size: 1.15rem;
    margin-top: var(--spacing-xs);
    font-weight: 500;
  }

  .loading-full-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--white);
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid var(--primary-bg-light);
    border-radius: var(--radius-circle);
    border-top-color: var(--primary-color);
    animation: spin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

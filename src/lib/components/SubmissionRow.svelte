<script lang="ts">
  import { formatDate } from '$lib/utils';
  import type { Submission } from '$lib/types/admin';
  import { Eye, Trash2 } from 'lucide-svelte';

  const {
    item,
    openViewModal,
    openDeleteModal,
  }: {
    item: Submission;
    openViewModal: (item: Submission) => void;
    openDeleteModal: (item: Submission) => void;
  } = $props();

  function getStatusText(status: string): string {
    return status === 'completed' || status === 'Completo' ? 'Completo' : 'Pendente';
  }

  function getStatusClass(status: string): string {
    return status === 'completed' || status === 'Completo' ? 'completed' : 'pending';
  }
</script>

<tr>
  <td>{item.name || 'N/A'}</td>
  <td>{item.sector || 'N/A'}</td>
  <td>
    <span class="form-badge form1">{item.title || 'N/A'}</span>
  </td>
  <td class="date-cell">{formatDate(item.date || item.submitted_at)}</td>
  <td class="status-cell {getStatusClass(item.status)}">
    {getStatusText(item.status)}
  </td>
  <td>
    <div class="action-buttons">
      <button class="btn-action view" onclick={() => openViewModal(item)}>
        <Eye size={16} class="me-1" /> Visualizar
      </button>
      <button class="btn-action delete" onclick={() => openDeleteModal(item)}>
        <Trash2 size={16} class="me-1" /> Excluir
      </button>
    </div>
  </td>
</tr>

<style>
  .form-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: var(--radius-full);
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
    background-color: var(--primary-bg-light);
    color: var(--primary-color);
    border: 1px solid rgba(0, 86, 166, 0.1);
    white-space: nowrap;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .btn-action {
    padding: 8px 14px;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid transparent;
    transition: var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .btn-action.view {
    background-color: var(--accent-bg-light);
    color: var(--accent-color);
    border-color: rgba(52, 181, 229, 0.2);
  }

  .btn-action.view:hover {
    background-color: var(--accent-color);
    color: white;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .btn-action.delete {
    background-color: var(--danger-bg);
    color: var(--danger-color);
    border-color: rgba(239, 68, 68, 0.2);
  }

  .btn-action.delete:hover {
    background-color: var(--danger-color);
    color: white;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .date-cell {
    color: var(--text-muted);
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;
  }

  .status-cell {
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-cell.completed {
    color: var(--success-color);
  }

  .status-cell.pending {
    color: var(--warning-color);
  }
</style>

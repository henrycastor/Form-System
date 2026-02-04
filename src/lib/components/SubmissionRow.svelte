<script lang="ts">
    import { formatDate } from "$lib/utils";
    import type { Submission } from "$lib/types/admin";

    const { item, openViewModal, openDeleteModal }: {
        item: Submission;
        openViewModal: (item: Submission) => void;
        openDeleteModal: (item: Submission) => void;
    } = $props();

    function getStatusText(status: string): string {
        return status === "completed" || status === "Completo"
            ? "Completo"
            : "Pendente";
    }

    function getStatusClass(status: string): string {
        return status === "completed" || status === "Completo"
            ? "completed"
            : "pending";
    }
</script>

<tr>
    <td>{item.name || "N/A"}</td>
    <td>{item.sector || "N/A"}</td>
    <td>
        <span class="form-badge form1">{item.title || "N/A"}</span>
    </td>
    <td class="date-cell">{formatDate(item.date || item.submitted_at)}</td>
    <td class="status-cell {getStatusClass(item.status)}">
        {getStatusText(item.status)}
    </td>
    <td>
        <div class="action-buttons">
            <button class="btn-action view" onclick={() => openViewModal(item)}>
                <i class="bi bi-eye"></i> Visualizar
            </button>
            <button
                class="btn-action delete"
                onclick={() => openDeleteModal(item)}
            >
                <i class="bi bi-trash"></i> Excluir
            </button>
        </div>
    </td>
</tr>

<style>
    .form-badge {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        text-align: center;
        min-width: 100px;
    }

    .form-badge.form1 {
        background-color: rgba(0, 86, 166, 0.1);
        color: var(--primary-color);
        border: 1px solid rgba(0, 86, 166, 0.2);
    }

    .action-buttons {
        display: flex;
        gap: 10px;
    }

    .btn-action {
        padding: 8px 15px;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        border: none;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .btn-action.view {
        background-color: rgba(52, 181, 229, 0.1);
        color: var(--accent-color);
        border: 1px solid rgba(52, 181, 229, 0.3);
    }

    .btn-action.view:hover {
        background-color: var(--accent-color);
        color: white;
    }

    .btn-action.delete {
        background-color: rgba(220, 53, 69, 0.1);
        color: var(--danger-color);
        border: 1px solid rgba(220, 53, 69, 0.3);
    }

    .btn-action.delete:hover {
        background-color: var(--danger-color);
        color: white;
    }

    .btn-action i {
        margin-right: 5px;
    }

    .date-cell {
        color: #666;
        font-size: 0.9rem;
    }

    .status-cell {
        font-weight: 500;
    }

    .status-cell.completed {
        color: var(--success-color);
    }

    .status-cell.pending {
        color: var(--secondary-color);
    }
</style>

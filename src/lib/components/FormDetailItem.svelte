<script lang="ts">
    const { label, value, isSuccess = false, isWarning = false, comment = null }: {
        label: string;
        value: unknown;
        isSuccess?: boolean;
        isWarning?: boolean;
        comment?: string | null;
    } = $props();
</script>

<div class="detail-item">
    <div class="detail-label">{label}</div>
    <div
        class="detail-value {isSuccess
            ? 'text-success'
            : isWarning
              ? 'text-warning'
              : ''}"
    >
        {#if typeof value === "boolean"}
            {value ? "Sim" : "Não"}
        {:else}
            {value}
        {/if}
    </div>
    {#if comment}
        <div class="detail-comment mt-2 text-muted small">
            <strong>Comentário:</strong>
            {comment}
        </div>
    {/if}
</div>

<style>
    .detail-item {
        margin-bottom: 15px;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 10px;
    }

    .detail-item:last-child {
        border-bottom: none;
    }

    .detail-label {
        font-weight: 600;
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 4px;
    }

    .detail-value {
        font-weight: 500;
        color: #333;
        font-size: 1.05rem;
    }

    .text-success {
        color: var(--success-color);
    }

    .text-warning {
        color: var(--secondary-color);
    }

    .mt-2 {
        margin-top: 0.5rem;
    }

    .text-muted {
        color: #6c757d;
    }

    .small {
        font-size: 0.875em;
    }
</style>

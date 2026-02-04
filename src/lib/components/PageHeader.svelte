<script lang="ts">
    const { title, subtitle = "", center = false }: {
        title: string;
        subtitle?: string;
        center?: boolean;
    } = $props();
</script>

<div class="page-header {center ? 'text-center' : ''}">
    <h1 class="page-title">{title}</h1>
    {#if subtitle}
        <p class="page-subtitle">{subtitle}</p>
    {/if}
</div>

<style>
    .page-header {
        margin-bottom: var(--spacing-xxl);
    }

    .page-title {
        color: var(--primary-color);
        font-weight: 700;
        font-size: 2.5rem;
        margin: 0;
    }

    .page-subtitle {
        color: var(--text-muted);
        font-size: 1.2rem;
        margin-top: var(--spacing-sm);
        max-width: 700px;
        margin-left: auto;
        margin-right: auto;
    }

    .text-center {
        text-align: center;
    }
</style>

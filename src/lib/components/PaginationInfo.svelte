<script lang="ts">
    const { filteredCount, totalCount }: {
        filteredCount: number;
        totalCount: number;
    } = $props();
</script>

<div class="pagination-info">
    Mostrando {filteredCount} de {totalCount} registros
    {#if filteredCount === 0}
        <p>Nenhum registro encontrado. Tente alterar os critérios de busca.</p>
    {/if}
</div>

<style>
    .pagination-info {
        color: #666;
        font-size: 0.9rem;
        margin-top: 15px;
    }
</style>

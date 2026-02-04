<script lang="ts">
    import { page } from "$app/state";
</script>

<div class="container mt-5 text-center">
    <h1 class="display-1">{page.status}</h1>
    <p class="lead">{page.error?.message || "Erro interno do servidor"}</p>
    {#if (page.error as any)?.stack}
        <pre
            class="text-start bg-light p-3 mt-4"
            style="max-height: 400px; overflow: auto;">
            {(page.error as any).stack}
        </pre>
    {/if}
    <a href="/" class="btn btn-primary mt-3">Voltar para o Início</a>
</div>

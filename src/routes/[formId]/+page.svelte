<script lang="ts">
    import { page } from "$app/stores";
    import FormPage from "$lib/components/FormPage.svelte";
    import { error } from "@sveltejs/kit";

    $: formId = $page.params.formId;

    async function loadFormData(id: string) {
        try {
            const module = await import(`$lib/form/${id}.ts`);

            const form = module[id];
            const formSubtitle = module[id + "Subtitle"];

            if (!form || !formSubtitle) {
                throw error(404, `Form "${id}" not found`);
            }

            return { formData: form, subtitles: formSubtitle };
        } catch (e) {
            if (e instanceof Error && e.message.includes("404")) {
                throw e;
            }
            throw error(404, `Form "${id}" not found`);
        }
    }
</script>

{#if formId}
    {#await loadFormData(formId) then result}
        <FormPage
            formData={result.formData}
            subtitles={result.subtitles}
            activePage="forms"
        />
    {:catch err}
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h2>Oops! Algo deu errado</h2>
            <p class="error-message">
                {err.message || "Formulário não encontrado"}
            </p>
            <a href="/formularios" class="error-button"
                >Voltar aos Formulários</a
            >
        </div>
    {/await}
{/if}

<style>
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        text-align: center;
        padding: 2rem;
        background: var(--bg-secondary, #f8f9fa);
        border-radius: var(--radius-lg, 12px);
        margin: 2rem;
    }

    .error-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .error-container h2 {
        color: var(--text-primary, #1a1a2e);
        font-size: 1.75rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
    }

    .error-message {
        color: var(--text-secondary, #6c757d);
        font-size: 1.1rem;
        margin-bottom: 2rem;
        max-width: 400px;
    }

    .error-button {
        display: inline-block;
        padding: 0.875rem 2rem;
        background: var(--primary-color, #0066cc);
        color: white;
        text-decoration: none;
        border-radius: var(--radius-md, 8px);
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .error-button:hover {
        background: var(--primary-hover, #0052a3);
        transform: translateY(-2px);
    }
</style>

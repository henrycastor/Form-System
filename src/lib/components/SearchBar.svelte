<script lang="ts">
    let { searchQuery = $bindable("") }: {
        searchQuery?: string;
    } = $props();
</script>

<div class="search-box">
    <i class="bi bi-search"></i>
    <input
        type="text"
        placeholder="Buscar por nome, setor ou formulário..."
        bind:value={searchQuery}
    />
</div>

<style>
    .search-box {
        position: relative;
        max-width: 300px;
    }

    .search-box input {
        padding: 10px 15px 10px 45px;
        border: 2px solid #e1e5eb;
        border-radius: 8px;
        width: 100%;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .search-box input:focus {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 0.25rem rgba(52, 181, 229, 0.25);
        outline: none;
    }

    .search-box i {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #666;
    }
</style>

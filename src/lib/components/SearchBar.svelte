<script lang="ts">
  import { Search } from 'lucide-svelte';
  let {
    searchQuery = $bindable(''),
  }: {
    searchQuery?: string;
  } = $props();
</script>

<div class="search-box">
  <Search size={18} class="search-icon" />
  <input
    type="text"
    placeholder="Buscar por nome, setor ou formulário..."
    bind:value={searchQuery}
  />
</div>

<style>
  .search-box {
    position: relative;
    max-width: 350px;
    width: 100%;
  }

  .search-box input {
    padding: 12px 16px 12px 48px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    width: 100%;
    font-size: 0.95rem;
    font-weight: 500;
    transition: var(--transition-normal);
    background-color: var(--white);
    color: var(--text-main);
  }

  .search-box input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px var(--primary-bg-light);
    outline: none;
    transform: translateY(-1px);
  }

  .search-box :global(.search-icon) {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    transition: var(--transition-fast);
  }

  .search-box input:focus + :global(.search-icon) {
    color: var(--primary-color);
  }

  .search-box input::placeholder {
    color: var(--text-light);
  }
</style>

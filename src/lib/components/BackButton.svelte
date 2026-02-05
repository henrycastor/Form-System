<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';
</script>

<a href="/" class="back-btn">
  <ArrowLeft class="me-2" size={18} /> Voltar
</a>

<style>
  .back-btn {
    background-color: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: 1rem;
    font-weight: 600;
    border-radius: var(--radius-lg);
    transition: var(--transition-normal);
    display: inline-flex;
    align-items: center;
    width: fit-content;
    margin-bottom: var(--spacing-xl);
    cursor: pointer;
    text-decoration: none;
  }

  .back-btn:hover {
    background-color: var(--primary-color);
    color: var(--white);
  }
</style>

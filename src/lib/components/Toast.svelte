<script lang="ts">
  import { toasts, removeToast } from './toast.ts';
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { CheckCircle, XCircle, AlertTriangle, Loader2, Info, X as XIcon } from 'lucide-svelte';
</script>

<div class="toast-container">
  {#each $toasts as t (t.id)}
    <div
      class="toast toast-{t.type}"
      animate:flip
      in:fly={{ y: 20, duration: 300 }}
      out:fade
      role="alert"
    >
      <div class="toast-icon">
        {#if t.type === 'success'}
          <CheckCircle size={20} />
        {:else if t.type === 'error'}
          <XCircle size={20} />
        {:else if t.type === 'warning'}
          <AlertTriangle size={20} />
        {:else if t.type === 'loading'}
          <Loader2 size={20} class="spin" />
        {:else}
          <Info size={20} />
        {/if}
      </div>
      <div class="toast-content">
        {t.message}
      </div>
      <button class="toast-close" onclick={() => removeToast(t.id)} aria-label="Fechar">
        <XIcon size={20} />
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    min-width: 300px;
    max-width: 400px;
    padding: 12px 16px;
    border-radius: 4px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: flex-start;
    font-family: 'Proxima Nova', Helvetica, Arial, sans-serif;
    font-size: 0.95rem;
    border-left: 4px solid #ccc;
    color: #333;
  }

  .toast-success {
    border-left-color: #28a745;
  }
  .toast-success .toast-icon {
    color: #28a745;
  }

  .toast-error {
    border-left-color: #dc3545;
  }
  .toast-error .toast-icon {
    color: #dc3545;
  }

  .toast-warning {
    border-left-color: #f3c500;
  }
  .toast-warning .toast-icon {
    color: #f3c500;
  }

  .toast-info {
    border-left-color: #17a2b8;
  }
  .toast-info .toast-icon {
    color: #17a2b8;
  }

  .toast-loading {
    border-left-color: #6c757d;
  }
  .toast-loading .toast-icon {
    color: #6c757d;
  }

  .toast-icon {
    margin-right: 12px;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    height: 100%;
    margin-top: 2px;
  }

  .toast-content {
    flex: 1;
    margin-right: 10px;
    align-self: center;
  }

  .toast-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    padding: 0;
    margin-left: auto;
    line-height: 0.8;
  }

  .toast-close:hover {
    color: #333;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
</style>

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
    top: 32px;
    right: 32px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    min-width: 320px;
    max-width: 450px;
    padding: 16px 20px;
    border-radius: var(--radius-lg);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    display: flex;
    align-items: center;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-main);
    transition: var(--transition-normal);
  }

  .toast::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    height: 60%;
    width: 4px;
    border-radius: 0 4px 4px 0;
  }

  .toast-success::before {
    background-color: var(--success-color);
  }
  .toast-success .toast-icon {
    color: var(--success-color);
  }

  .toast-error::before {
    background-color: var(--danger-color);
  }
  .toast-error .toast-icon {
    color: var(--danger-color);
  }

  .toast-warning::before {
    background-color: var(--warning-color);
  }
  .toast-warning .toast-icon {
    color: var(--warning-color);
  }

  .toast-info::before {
    background-color: var(--accent-color);
  }
  .toast-info .toast-icon {
    color: var(--accent-color);
  }

  .toast-loading::before {
    background-color: var(--text-muted);
  }
  .toast-loading .toast-icon {
    color: var(--text-muted);
  }

  .toast-icon {
    margin-right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .toast-content {
    flex: 1;
    margin-right: 12px;
    line-height: 1.4;
  }

  .toast-close {
    background: rgba(0, 0, 0, 0.05);
    border: none;
    border-radius: var(--radius-circle);
    cursor: pointer;
    color: var(--text-muted);
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-fast);
  }

  .toast-close:hover {
    background: rgba(0, 0, 0, 0.1);
    color: var(--text-main);
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

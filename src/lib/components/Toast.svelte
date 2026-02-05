<script lang="ts">
  import { toasts, removeToast } from './toast.ts';
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { CheckCircle, XCircle, AlertTriangle, Loader2, Info, X as XIcon } from 'lucide-svelte';
</script>

<div class="toast-container">
  {#each $toasts as t (t.id)}
    <div
      class="toast-card toast-{t.type}"
      animate:flip
      in:fly={{ y: 20, duration: 300 }}
      out:fade
      role="alert"
    >
      <div class="toast-icon">
        {#if t.type === 'success'}
          <CheckCircle size={22} strokeWidth={2.5} />
        {:else if t.type === 'error'}
          <XCircle size={22} strokeWidth={2.5} />
        {:else if t.type === 'warning'}
          <AlertTriangle size={22} strokeWidth={2.5} />
        {:else if t.type === 'loading'}
          <Loader2 size={22} class="spin" />
        {:else}
          <Info size={22} strokeWidth={2.5} />
        {/if}
      </div>
      <div class="toast-body">
        <div class="toast-message">{t.message}</div>
      </div>
      <button class="toast-close-btn" onclick={() => removeToast(t.id)} aria-label="Fechar">
        <XIcon size={18} />
      </button>
      <div class="toast-progress-bar">
        <div class="toast-progress-fill" style="animation-duration: {t.duration}ms"></div>
      </div>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
    max-width: 420px;
    width: 100%;
  }

  .toast-card {
    pointer-events: auto;
    position: relative;
    padding: 16px 20px;
    border-radius: var(--radius-xl);
    background: var(--white);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-xl);
    display: flex;
    align-items: center;
    gap: 16px;
    overflow: hidden;
    transition: var(--transition-normal);
  }

  /* Success State */
  .toast-success {
    border-top: 4px solid var(--success-color);
  }
  .toast-success .toast-icon {
    color: var(--success-color);
  }
  .toast-success .toast-progress-fill {
    background-color: var(--success-color);
  }

  /* Error State */
  .toast-error {
    border-top: 4px solid var(--danger-color);
  }
  .toast-error .toast-icon {
    color: var(--danger-color);
  }
  .toast-error .toast-progress-fill {
    background-color: var(--danger-color);
  }

  /* Warning State */
  .toast-warning {
    border-top: 4px solid var(--warning-color);
  }
  .toast-warning .toast-icon {
    color: var(--warning-color);
  }
  .toast-warning .toast-progress-fill {
    background-color: var(--warning-color);
  }

  /* Info/Loading State */
  .toast-info,
  .toast-loading {
    border-top: 4px solid var(--primary-color);
  }
  .toast-info .toast-icon,
  .toast-loading .toast-icon {
    color: var(--primary-color);
  }
  .toast-info .toast-progress-fill,
  .toast-loading .toast-progress-fill {
    background-color: var(--primary-color);
  }

  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .toast-body {
    flex: 1;
  }

  .toast-message {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1.4;
  }

  .toast-close-btn {
    background: var(--light-bg);
    border: none;
    border-radius: var(--radius-circle);
    cursor: pointer;
    color: var(--text-muted);
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-fast);
    flex-shrink: 0;
  }

  .toast-close-btn:hover {
    background: var(--border-color);
    color: var(--text-main);
  }

  .toast-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--light-bg);
    opacity: 0.3;
  }

  .toast-progress-fill {
    height: 100%;
    width: 100%;
    transform-origin: left;
    animation: shrink linear forwards;
  }

  @keyframes shrink {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
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

  @media (max-width: 480px) {
    .toast-container {
      top: auto;
      bottom: 24px;
      right: 20px;
      left: 20px;
      max-width: none;
      width: auto;
    }
  }
</style>

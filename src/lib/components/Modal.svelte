<script lang="ts">
  import { Dialog } from 'bits-ui';
  import type { Snippet } from 'svelte';
  import type { ModalCallback } from '$lib/types/admin';
  import { fade, scale } from 'svelte/transition';

  const {
    isVisible = false,
    title = '',
    size = 'sm',
    closeModal,
    body,
    footer,
  }: {
    isVisible?: boolean;
    title?: string;
    size?: 'sm' | 'lg';
    closeModal: ModalCallback;
    body?: Snippet;
    footer?: Snippet;
  } = $props();
</script>

<Dialog.Root open={isVisible} onOpenChange={(open) => !open && closeModal()}>
  <Dialog.Portal>
    <Dialog.Overlay class="modal-backdrop">
      {#snippet child({ props })}
        <div {...props} transition:fade={{ duration: 150 }}></div>
      {/snippet}
    </Dialog.Overlay>
    <div class="modal-wrapper">
      <Dialog.Content class="modal-dialog {size === 'lg' ? 'modal-lg' : ''}">
        {#snippet child({ props })}
          <div {...props} transition:scale={{ duration: 200, start: 0.95 }}>
            <div class="modal-content">
              <div class="modal-header">
                <Dialog.Title class="modal-title h5">{title}</Dialog.Title>
                <Dialog.Close class="btn-close" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </Dialog.Close>
              </div>
              <div class="modal-body">
                {@render body?.()}
              </div>
              {#if footer}
                <div class="modal-footer">
                  {@render footer()}
                </div>
              {/if}
            </div>
          </div>
        {/snippet}
      </Dialog.Content>
    </div>
  </Dialog.Portal>
</Dialog.Root>

<style>
  .modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1050;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow-y: auto;
    padding: 1.75rem;
    pointer-events: none;
  }

  :global(.modal-dialog) {
    position: relative;
    width: 100%;
    max-width: 500px;
    pointer-events: auto;
    margin: 0;
    outline: none;
  }

  :global(.modal-dialog.modal-lg) {
    max-width: 800px;
  }

  .modal-content {
    background-color: #fff;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }

  :global(.modal-title) {
    margin: 0;
    font-weight: 700;
    color: var(--primary-color);
    font-size: 1.25rem;
  }

  :global(.btn-close) {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
    transition: var(--transition-fast);
    padding: var(--spacing-sm);
    line-height: 1;
    margin: calc(var(--spacing-sm) * -1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.btn-close:hover) {
    color: var(--danger-color);
    transform: rotate(90deg);
  }

  .modal-body {
    padding: var(--spacing-xl);
    overflow-y: auto;
    max-height: 70vh;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
    gap: var(--spacing-md);
    background-color: var(--light-bg);
  }

  :global(.modal-backdrop) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
  }
</style>

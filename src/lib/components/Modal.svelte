<script lang="ts">
    import type { ModalCallback } from "$lib/types/admin";

    const { isVisible = false, title = "", size = "sm", closeModal }: {
        isVisible?: boolean;
        title?: string;
        size?: "sm" | "lg";
        closeModal: ModalCallback;
    } = $props();

    function handleClose() {
        closeModal();
    }
</script>

{#if isVisible}
    <div
        class="modal fade show"
        tabindex="-1"
        aria-hidden="true"
        style="display: block;"
        role="dialog"
    >
        <div class="modal-dialog {size === 'lg' ? 'modal-lg' : ''}">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{title}</h5>
                    <button
                        type="button"
                        class="btn-close"
                        onclick={handleClose}
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <slot name="body"></slot>
                </div>
                <div class="modal-footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show"></div>
{/if}

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1050;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        outline: 0;
    }

    .modal-dialog {
        position: relative;
        width: auto;
        margin: 1.75rem auto;
        pointer-events: none;
    }

    .modal-dialog.modal-lg {
        max-width: 800px;
    }

    .modal-content {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        pointer-events: auto;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 0.5rem;
        outline: 0;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1rem;
        border-bottom: 1px solid #dee2e6;
    }

    .modal-title {
        margin-bottom: 0;
        line-height: 1.5;
    }

    .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        margin: -0.5rem -0.5rem -0.5rem auto;
        color: #000;
        opacity: 0.5;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-close:hover {
        opacity: 0.75;
        color: #000;
    }

    .modal-body {
        position: relative;
        flex: 1 1 auto;
        padding: 1rem;
        overflow-y: auto;
        max-height: 75vh;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem;
        border-top: 1px solid #dee2e6;
        gap: 10px;
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1040;
        width: 100vw;
        height: 100vh;
        background-color: #000;
        opacity: 0.5;
    }
</style>

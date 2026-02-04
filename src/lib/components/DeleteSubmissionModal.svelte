<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import type { Submission, ModalCallback } from "$lib/types/admin";

    const { isVisible = false, item = null, closeModal, deleteSubmission }: {
        isVisible?: boolean;
        item?: Submission | null;
        closeModal: ModalCallback;
        deleteSubmission: ModalCallback;
    } = $props();
</script>

<Modal {isVisible} title="Confirmar Exclusão" size="sm" {closeModal}>
    <div slot="body">
        <p>
            Tem certeza que deseja excluir o formulário de <strong
                >{item?.name}</strong
            >?
        </p>
        <p class="text-danger">
            <small
                >Esta ação não pode ser desfeita. Todos os dados serão
                permanentemente removidos.</small
            >
        </p>
    </div>
    <div slot="footer">
        <button
            type="button"
            class="btn btn-secondary"
            onclick={() => closeModal()}>Cancelar</button
        >
        <button type="button" class="btn btn-danger" onclick={deleteSubmission}
            >Excluir Permanentemente</button
        >
    </div>
</Modal>

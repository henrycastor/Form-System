<script lang="ts">
  import { formatDate } from '$lib/utils';
  import { getQuestionsForForm, formatDisplayValue, printElement } from '$lib/utils/formHelpers';
  import Modal from '$lib/components/Modal.svelte';
  import FormDetailItem from './FormDetailItem.svelte';
  import type { Submission, ModalCallback } from '$lib/types/admin';
  import { Printer } from 'lucide-svelte';

  let {
    isVisible = false,
    item = null,
    closeModal,
  }: {
    isVisible?: boolean;
    item?: Submission | null;
    closeModal: ModalCallback;
  } = $props();

  function handlePrint() {
    printElement('printable-content');
  }
</script>

<Modal {isVisible} title="Detalhes do Formulário" size="lg" {closeModal}>
  {#snippet body()}
    <div id="printable-content">
      <div class="form-details">
        <FormDetailItem label="Nome Completo" value={item?.name} />
        <FormDetailItem label="Setor/Área" value={item?.sector} />
        <FormDetailItem label="Formulário" value={item?.title} />
        <FormDetailItem label="Data de Envio" value={formatDate(item?.date)} />
        <FormDetailItem
          label="Status"
          value={item?.status === 'completed' ? 'Completo' : 'Pendente de revisão'}
          isSuccess={item?.status === 'completed'}
          isWarning={item?.status !== 'completed'}
        />
      </div>

      {#if item?.data}
        <h5 class="mb-3 mt-4">Respostas do Formulário</h5>
        {#each getQuestionsForForm(item.title) as question}
          {#if item.data?.[String(question.id)] !== undefined}
            {@const rawValue = item.data[String(question.id)]}
            {@const displayValue = formatDisplayValue(rawValue)}
            <FormDetailItem
              label={question.text}
              value={displayValue}
              comment={String(item.data[String(question.id) + '_comment'] || '')}
            />
          {:else}
            <FormDetailItem
              label={question.text}
              value={`Resposta não encontrada para: ${question.id}`}
              isWarning={true}
            />
          {/if}
        {/each}
      {:else if item?.details}
        <h5 class="mb-3 mt-4">Respostas do Formulário (Formato Antigo)</h5>
        {#each Object.entries(item.details) as [key, value]}
          <FormDetailItem label={key} {value} />
        {/each}
      {:else}
        <FormDetailItem
          label="Debug: No Data or Details"
          value="Nenhum dado ou detalhes encontrados."
          isWarning={true}
        />
      {/if}
    </div>
  {/snippet}
  {#snippet footer()}
    <button type="button" class="btn btn-secondary" onclick={() => closeModal()}>Fechar</button>
    <button type="button" class="btn btn-primary" onclick={handlePrint}>
      <Printer size={18} class="me-2" />Imprimir
    </button>
  {/snippet}
</Modal>

<style>
  .form-details {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .mb-3 {
    margin-bottom: 1rem;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }
</style>

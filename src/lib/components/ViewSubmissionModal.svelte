<script lang="ts">
  import { formatDate } from '$lib/utils';
  import { getQuestionsForForm, formatDisplayValue, printElement } from '$lib/utils/formHelpers';
  import Modal from '$lib/components/Modal.svelte';
  import FormDetailItem from './FormDetailItem.svelte';
  import type { Submission, ModalCallback } from '$lib/types/admin';
  import type { Question } from '$lib/types/validation';
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

  function getFormTitle(item: Submission | null): string {
    if (!item) return '';
    if (item.title) return item.title;
    if (item.data && typeof item.data === 'object' && 'form' in item.data) {
      return String(item.data.form);
    }
    return '';
  }

  function getValidQuestions(questions: Question[]): Question[] {
    return questions.filter((q) => q && q.id) as Question[];
  }
</script>

<Modal {isVisible} title="Detalhes do Formulário" size="lg" {closeModal}>
  {#snippet body()}
    <div id="printable-content">
      <div class="form-details">
        <FormDetailItem label="Nome Completo" value={item?.name} />
        <FormDetailItem label="Formulário" value={getFormTitle(item)} />
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
        {@const formTitle = getFormTitle(item)}
        {@const questions = getQuestionsForForm(formTitle)}
        {@const validQuestions = getValidQuestions(questions)}

        {#each validQuestions as question}
          {@const answerValue = item.data[String(question.id)]}
          {#if answerValue !== undefined && answerValue !== null && answerValue !== ''}
            <FormDetailItem
              label={question.text ?? question.id}
              value={formatDisplayValue(answerValue)}
              comment={String(item.data[String(question.id) + '_cmt'] || '')}
            />
          {:else}
            <FormDetailItem
              label={question.text ?? question.id}
              value="(Sem resposta)"
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
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .mb-3 {
    margin-bottom: 1rem;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }
</style>

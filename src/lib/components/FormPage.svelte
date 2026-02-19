<script lang="ts">
  import type { QuestionCategory } from '$lib/types/validation';
  import { validateIntroFields, validateAllQuestionsAnswered } from '$lib/validation';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import FormSection from '$lib/components/FormSection.svelte';
  import { toast } from '$lib/components/toast';
  import { formIntro } from '$lib/form/formIntro';
  import { CircleX, CircleCheck } from 'lucide-svelte';

  // Props
  const {
    formData,
    subtitles,
    activePage = 'forms',
  }: {
    formData: {
      title: string;
      questions: QuestionCategory[];
    };
    subtitles: string[];
    activePage?: string;
  } = $props();

  // Form state using Svelte 5 runes
  let formState = $state({
    companyName: '',
    email: '',
  });

  // Comments state for link_attachment fields
  let comments = $state<Record<string, string>>({});

  // Errors state
  let errors = $state<Record<string, string>>({});

  // Loading state
  let delayed = $state(false);

  // Derived state - check if intro fields are valid
  let isIntroValid = $derived(formState.companyName.trim() !== '' && formState.email.includes('@'));

  // Derived state - check if all questions are answered
  let questionValidation = $derived(validateAllQuestionsAnswered(formState, formData.questions));

  // Derived state - overall form is valid when intro AND all questions are complete
  let isFormComplete = $derived(isIntroValid && questionValidation.isValid);

  // Update form state (values)
  function handleUpdate(key: string, value: unknown) {
    formState = { ...formState, [key]: value };
    // Clear error when user starts typing
    if (errors[key]) {
      errors = { ...errors, [key]: '' };
    }
  }

  // Update comments state
  function handleCommentUpdate(key: string, value: string) {
    comments = { ...comments, [key]: value };
  }

  // Submit handler
  async function handleSubmit(event: Event) {
    event.preventDefault();

    // Validate intro fields
    const introErrors = validateIntroFields(formState);

    // Check if all questions are answered
    const questionCheck = validateAllQuestionsAnswered(formState, formData.questions);

    if (!questionCheck.isValid) {
      errors = { ...errors, [questionCheck.missingIds[0]]: 'Esta pergunta é obrigatória.' };
      toast.error(
        `Por favor, responda todas as perguntas. Faltam ${questionCheck.missingIds.length} perguntas.`
      );
      return;
    }

    if (Object.keys(introErrors).length > 0) {
      errors = introErrors;

      if (introErrors.companyName && introErrors.email) {
        toast.error('Por favor, preencha o nome da empresa e um email válido.');
      } else if (introErrors.companyName) {
        toast.error('Nome da empresa é obrigatório.');
      } else if (introErrors.email) {
        toast.error('Por favor, insira um endereço de e-mail válido.');
      }
      return;
    }

    // Clear errors
    errors = {};

    const submissionData = {
      form: formData.title,
      ...formState,
    };

    delayed = true;

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      delayed = false;

      if (result.success) {
        toast.success(
          'Formulário enviado com sucesso! Analisaremos os dados e entraremos em contato.',
          3000
        );
        setTimeout(() => {
          window.location.href = '/formularios';
        }, 3000);
      } else {
        toast.error(
          'Ocorreu um erro ao enviar o formulário. Tente novamente.\n\nDetalhes: ' +
            (result.error || 'Erro desconhecido')
        );
      }
    } catch (error) {
      delayed = false;
      toast.error(
        'Ocorreu um erro ao enviar o formulário. Tente novamente.\n\nDetalhes: ' +
          (error as Error).message
      );
    }
  }
</script>

<Header {activePage} />

<main class="main-content">
  <div class="container">
    <div class="form-container">
      <div class="form-header">
        <h1 class="form-title">
          {formData.title}
        </h1>
        {#each subtitles as subtitle}
          <p class="form-subtitle">
            {subtitle}
          </p>
        {/each}
      </div>

      <!-- Progress -->
      <ProgressBar
        formData={formState}
        questions={formData.questions}
        label="Progresso da avaliação"
      />

      <form method="POST" autocomplete="on" onsubmit={handleSubmit}>
        <!-- Form Intro Questions -->
        {#each formIntro as category}
          <FormSection
            title={category.category}
            icon={category.icon || CircleCheck}
            questions={category.questions}
            values={formState}
            comments={{}}
            {errors}
            showIds={false}
            onchange={handleUpdate}
          />
        {/each}

        <!-- Questions loop -->
        {#each formData.questions as category}
          <FormSection
            title={category.category || 'Seção'}
            icon={category.icon || CircleCheck}
            questions={category.questions}
            values={formState}
            {comments}
            {errors}
            showIds={true}
            onchange={handleUpdate}
          />
        {/each}

        <div class="form-actions mb-5">
          <a href="/formularios" class="btn btn-secondary">
            <CircleX class="me-2" size={18} />Sair
          </a>
          <button type="submit" class="btn btn-primary" disabled={delayed || !isFormComplete}>
            {#if delayed}<span class="spinner-border spinner-border-sm me-2"></span>{/if}
            Enviar Formulário
          </button>
        </div>
      </form>
    </div>
  </div>
</main>

<Footer />

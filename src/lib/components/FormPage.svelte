<script lang="ts">
  import { writable } from 'svelte/store';
  import type { QuestionCategory } from '$lib/types/validation';
  import { validateIntroFields } from '$lib/validation';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import FormSection from '$lib/components/FormSection.svelte';
  import { toast } from '$lib/components/toast';
  import { formIntro } from '$lib/form/formIntro';
  import { XCircle, CheckCircle } from 'lucide-svelte';

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

  // Create form state manually
  const formState = writable<Record<string, any>>({
    companyName: '',
    email: '',
  });

  // Update form state with a new object reference to trigger reactivity
  function updateFormState(key: string, value: any) {
    formState.update((state) => {
      return { ...state, [key]: value };
    });
  }

  const errors = writable<Record<string, any>>({});
  const delayed = writable(false);

  // Submit handler
  async function handleSubmit(event: Event) {
    event.preventDefault();

    const data = $formState;

    // Validate intro fields using centralized validation module
    const introErrors = validateIntroFields(data);

    if (Object.keys(introErrors).length > 0) {
      $errors = introErrors;

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
    $errors = {};

    const submissionData = {
      form: formData.title,
      ...data,
    };

    $delayed = true;

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      $delayed = false;

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
      $delayed = false;
      console.error('Error submitting form:', error);
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
        formData={$formState}
        questions={formData.questions}
        label="Progresso da avaliação"
      />

      <form method="POST" onsubmit={handleSubmit}>
        <!-- Form Intro Questions -->
        {#each formIntro as category}
          <FormSection
            title={category.category}
            icon={category.icon || CheckCircle}
            questions={category.questions}
            values={$formState}
            comments={{}}
            errors={$errors}
            showIds={false}
            onUpdate={updateFormState}
          />
        {/each}

        <!-- Questions loop -->
        {#each formData.questions as category}
          <FormSection
            title={category.category || 'Seção'}
            icon={category.icon || CheckCircle}
            questions={category.questions}
            values={$formState}
            comments={$formState}
            errors={$errors}
            showIds={true}
            onUpdate={updateFormState}
          />
        {/each}

        <div class="form-actions mb-5">
          <a href="/formularios" class="btn btn-secondary">
            <XCircle class="me-2" size={18} />Sair
          </a>
          <button type="submit" class="btn btn-primary" disabled={$delayed}>
            {#if $delayed}<span class="spinner-border spinner-border-sm me-2"></span>{/if}
            Enviar Formulário
          </button>
        </div>
      </form>
    </div>
  </div>
</main>

<Footer />

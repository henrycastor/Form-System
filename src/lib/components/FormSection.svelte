<script lang="ts">
  import type { Question } from '$lib/types/validation';
  import { Paperclip, CircleCheck } from 'lucide-svelte';
  import { RadioGroup } from 'bits-ui';

  // Callbacks using Svelte 5 event pattern
  let {
    title,
    icon: Icon = CircleCheck,
    questions,
    values,
    comments,
    errors,
    showIds = true,
    onchange,
  }: {
    title: string;
    icon?: any;
    questions: Question[];
    values: Record<string, unknown>;
    comments: Record<string, string>;
    errors: Record<string, string>;
    showIds?: boolean;
    onchange?: (key: string, value: unknown) => void;
  } = $props();

  function handleValueChange(key: string, value: unknown) {
    onchange?.(key, value);
  }

  function getError(id: string): string {
    return errors[id] || '';
  }
</script>

<div class="form-section">
  <h3 class="section-title">
    <Icon size={24} />
    {title}
  </h3>

  {#each questions as q}
    <div class="question-container mb-4" data-testid="question-{q.id}">
      {#if showIds}
        <div class="question-title">{q.id}. {q.text || ''}</div>
      {:else}
        <div class="question-title">{q.text || ''}</div>
      {/if}

      {#if q.type === 'choice' || q.type === 'bool'}
        <RadioGroup.Root
          onValueChange={(v) => handleValueChange(q.id, v)}
          class="radio-group-container"
        >
          {#if q.type === 'bool'}
            <div class="radio-option-wrapper">
              <RadioGroup.Item value="true" id="{q.id}-true" name={q.id} class="radio-item" />
              <label for="{q.id}-true" class="radio-label">Sim</label>
            </div>
            <div class="radio-option-wrapper">
              <RadioGroup.Item value="false" id="{q.id}-false" name={q.id} class="radio-item" />
              <label for="{q.id}-false" class="radio-label">Não</label>
            </div>
          {:else}
            {#each q.options || [] as option}
              <div class="radio-option-wrapper">
                <RadioGroup.Item
                  value={option}
                  id="{q.id}-{option}"
                  name={q.id}
                  class="radio-item"
                />
                <label for="{q.id}-{option}" class="radio-label">{option}</label>
              </div>
            {/each}
          {/if}
        </RadioGroup.Root>
      {:else if q.type === 'text'}
        <div class="text-input-container">
          <input
            type="text"
            class="form-control {errors[q.id] ? 'is-invalid' : ''}"
            id={q.id}
            name={q.id}
            value={String(values[q.id] || '')}
            autocomplete={(q.autocomplete as any) || 'off'}
            oninput={(e) => {
              const target = e.target as HTMLInputElement;
              if (target) {
                handleValueChange(q.id, target.value);
              }
            }}
            placeholder="Digite sua resposta aqui..."
          />
        </div>
      {:else}
        <div class="text-area-container">
          <textarea
            class="form-control {errors[q.id] ? 'is-invalid' : ''}"
            id={q.id}
            name={q.id}
            rows="3"
            value={String(values[q.id] || '')}
            autocomplete={(q.autocomplete as any) || 'off'}
            oninput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              if (target) {
                handleValueChange(q.id, target.value);
              }
            }}
            placeholder="Digite sua resposta aqui..."
          ></textarea>
        </div>
      {/if}

      {#if q.link_attachment}
        <div class="mt-3">
          <label for="{q.id}-comment" class="form-label small text-muted"
            >Comentários (opcional)</label
          >
          <textarea
            id="{q.id}-cmt"
            name={`${q.id}_cmt`}
            class="form-control form-control-sm"
            rows="2"
            value={comments[`${q.id}_cmt`] || ''}
            oninput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              if (target) {
                handleValueChange(`${q.id}_cmt`, target.value);
              }
            }}
            placeholder="Adicione um comentário..."
          ></textarea>
        </div>
      {/if}

      {#if getError(q.id)}
        <div class="text-danger small mt-1">{getError(q.id)}</div>
      {/if}

      {#if q.link_attachment && q.link_attachment.trim() !== '' && values[q.id] === 'true'}
        <div class="mt-2">
          <a
            href={q.link_attachment}
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm btn-outline-primary"
          >
            <Paperclip size={14} class="me-1" /> Anexar evidência
          </a>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .form-section {
    background: white;
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }

  .section-title {
    color: var(--primary-color);
    font-weight: 800;
    margin-bottom: var(--spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    font-size: 1.5rem;
    letter-spacing: -0.5px;
  }

  .question-container {
    padding: var(--spacing-xl);
    background-color: var(--body-bg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    transition: var(--transition-normal);
  }

  .question-container:focus-within {
    border-color: var(--primary-color);
    background-color: white;
    box-shadow: var(--shadow-sm);
  }

  .question-title {
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: var(--spacing-lg);
    font-size: 1.1rem;
    line-height: 1.4;
  }

  :global(.radio-group-container) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .radio-option-wrapper {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: white;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    transition: var(--transition-fast);
    cursor: pointer;
  }

  .radio-option-wrapper:hover {
    border-color: var(--primary-color);
    background: var(--primary-bg-light);
  }

  :global(.radio-option-wrapper:has(button[data-state='checked'])) {
    border-color: var(--primary-color);
    background: var(--primary-bg-light);
    box-shadow: var(--shadow-sm);
  }

  :global(.radio-item) {
    width: 22px;
    height: 22px;
    border-radius: var(--radius-circle);
    border: 2px solid var(--border-color);
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    transition: var(--transition-fast);
    flex-shrink: 0;
  }

  :global(.radio-item[data-state='checked']) {
    border-color: var(--primary-color);
    border-width: 6px;
  }

  :global(.radio-indicator) {
    display: none;
  }

  .radio-label {
    font-weight: 600;
    color: var(--text-main);
    cursor: pointer;
    flex: 1;
    margin: 0;
    font-size: 1rem;
  }

  .form-label {
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: var(--spacing-xs);
  }

  .form-control {
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    padding: var(--spacing-md);
    transition: var(--transition-fast);
  }

  .form-control:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-bg-light);
    outline: none;
  }
</style>

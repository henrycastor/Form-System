<script lang="ts">
  import type { Question } from '$lib/types/validation';
  import { getIcon } from '$lib/utils/iconMap';
  import { Paperclip } from 'lucide-svelte';

  const {
    title,
    icon = 'bi-check2-square',
    questions,
    values,
    comments,
    errors,
    showIds = true,
    onUpdate = () => {},
  }: {
    title: string;
    icon?: string;
    questions: Question[];
    values: Record<string, unknown>;
    comments: Record<string, string>;
    errors: Record<string, unknown>;
    showIds?: boolean;
    onUpdate?: (key: string, value: unknown) => void;
  } = $props();

  const Icon = $derived(getIcon(icon));

  function getError(id: string): string {
    const error = errors[id];
    if (typeof error === 'string') return error;
    if (Array.isArray(error)) return error.join(', ');
    return '';
  }

  function handleValueChange(key: string, value: unknown) {
    onUpdate(key, value);
  }
</script>

<div class="form-section">
  <h3 class="section-title">
    <Icon size={24} />
    {title}
  </h3>

  {#each questions as q}
    <div class="question-container mb-4">
      {#if showIds}
        <div class="question-title">{q.id}. {q.text || ''}</div>
      {:else}
        <div class="question-title">{q.text || ''}</div>
      {/if}

      {#if q.type === 'choice'}
        <div class="radio-group">
          {#each (q.options as string[]) || [] as option}
            <label class="radio-option">
              <input
                type="radio"
                name={q.id}
                value={option}
                checked={values[q.id] === option}
                onchange={() => handleValueChange(q.id, option)}
              />
              <span class="radio-custom"></span>
              <span class="radio-label">{option}</span>
            </label>
          {/each}
        </div>
      {:else if q.type === 'bool'}
        <div class="radio-group">
          <label class="radio-option">
            <input
              type="radio"
              name={q.id}
              value="true"
              checked={values[q.id] === 'true'}
              onchange={() => handleValueChange(q.id, 'true')}
            />
            <span class="radio-custom"></span>
            <span class="radio-label">Sim</span>
          </label>
          <label class="radio-option">
            <input
              type="radio"
              name={q.id}
              value="false"
              checked={values[q.id] === 'false'}
              onchange={() => handleValueChange(q.id, 'false')}
            />
            <span class="radio-custom"></span>
            <span class="radio-label">Não</span>
          </label>
        </div>
      {:else}
        <div class="text-area-container">
          <textarea
            class="form-control {errors[q.id] ? 'is-invalid' : ''}"
            name={q.id}
            rows="3"
            value={String(values[q.id] || '')}
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
            id="{q.id}-comment"
            class="form-control form-control-sm"
            rows="2"
            value={comments[`${q.id}_comment`] || ''}
            oninput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              if (target) {
                handleValueChange(`${q.id}_comment`, target.value);
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
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }

  .section-title {
    color: var(--primary-color);
    font-weight: 600;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .question-container {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  .question-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .radio-option {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .radio-option input {
    margin-right: 8px;
  }

  .text-area-container {
    margin-top: 10px;
  }

  .text-area-container textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
</style>

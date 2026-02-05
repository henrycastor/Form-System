<script lang="ts">
  import { Progress } from 'bits-ui';
  import type { QuestionCategory } from '$lib/types/validation';

  const {
    formData = {},
    questions = [],
    requiredFields = ['companyName', 'email'],
    label = 'Progresso',
  }: {
    formData?: Record<string, unknown>;
    questions?: QuestionCategory[];
    requiredFields?: string[];
    label?: string;
  } = $props();

  function validateProgress(value: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
      return 0;
    }
    return Math.max(0, Math.min(100, value));
  }

  function calculateProgress(): number {
    let count = 0;

    requiredFields.forEach((field: string) => {
      if (formData[field]) count++;
    });

    questions.forEach((cat: QuestionCategory) => {
      cat.questions.forEach((q) => {
        if (formData[q.id]) count++;
      });
    });

    const total =
      questions.reduce((acc: number, cat: QuestionCategory) => acc + cat.questions.length, 0) +
      requiredFields.length;
    return Math.round((count / total) * 100);
  }

  let safeProgress = $derived(validateProgress(calculateProgress()));
</script>

<div class="progress-wrap">
  <div class="progress-header">
    <span class="progress-label">{label}</span>
    <span class="progress-value">{safeProgress}%</span>
  </div>
  <Progress.Root value={safeProgress} max={100} class="progress-root">
    <div class="progress-indicator" style="transform: translateX(-{100 - safeProgress}%)"></div>
  </Progress.Root>
</div>

<style>
  .progress-wrap {
    background: white;
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  .progress-label {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .progress-value {
    font-size: 1rem;
    font-weight: 800;
    color: var(--primary-color);
  }

  :global(.progress-root) {
    position: relative;
    height: 12px;
    width: 100%;
    overflow: hidden;
    border-radius: var(--radius-full);
    background-color: var(--body-bg);
  }

  .progress-indicator {
    height: 100%;
    width: 100%;
    background: var(--primary-gradient);
    transition: transform 660ms cubic-bezier(0.65, 0, 0.35, 1);
  }
</style>

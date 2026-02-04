<script lang="ts">
    import type { QuestionCategory } from "$lib/types/validation";

    const { formData = {}, questions = [], requiredFields = ["companyName", "email"], label = "Progresso" }: {
        formData?: Record<string, unknown>;
        questions?: QuestionCategory[];
        requiredFields?: string[];
        label?: string;
    } = $props();

    function validateProgress(value: number): number {
        if (typeof value !== "number" || isNaN(value)) {
            console.warn("ProgressBar: progress must be a valid number");
            return 0;
        }
        if (value < 0 || value > 100) {
            console.warn(
                `ProgressBar: progress value ${value} clamped to [0, 100]`,
            );
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

<div class="progress-container">
    <div class="progress-label">
        <span>{label}</span>
        <span>{safeProgress}%</span>
    </div>
    <div class="progress">
        <div class="progress-bar" style="width: {safeProgress}%;"></div>
    </div>
</div>

<style>
    .progress-container {
        margin-bottom: 20px;
    }

    .progress-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 0.9rem;
        color: #666;
    }

    .progress {
        height: 20px;
        background-color: #e9ecef;
        border-radius: 10px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background-color: var(--primary-color);
        transition: width 0.3s ease;
    }
</style>

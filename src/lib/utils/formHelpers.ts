/**
 * Utility functions for form handling
 */
import { forms } from "$lib/form/forms";
import { formIntro } from "$lib/form/formIntro";
import type { Question, QuestionCategory } from "$lib/types/validation";

/**
 * Creates a map of forms by their title for efficient lookup
 */
export function createFormsByTitleMap(): Record<string, any> {
	const formsByTitle = forms.reduce(
		(acc, form) => {
			acc[form.title] = form;
			return acc;
		},
		{} as Record<string, any>,
	);

	// Also include formIntro as a form so submissions with "Intro" title can be found
	formsByTitle['Intro'] = { title: 'Intro', questions: formIntro };

	return formsByTitle;
}

/**
 * Gets all questions for a form, including intro questions
 * @param formName - The name/title of the form
 * @returns Array of questions with category information
 */
export function getQuestionsForForm(formName: string): Question[] {
	const formsByTitle = createFormsByTitleMap();
	const form = formsByTitle[formName];

	// Get questions from formIntro (included in all forms)
	const introQuestions = formIntro.flatMap((category: QuestionCategory) =>
		category.questions.map((q: Question) => ({
			...q,
			category: category.category,
			categoryIcon: category.icon,
		})),
	);

	if (!form) {
		// If form not found, return intro questions combined with questions from all available forms
		const allFormQuestions = forms.flatMap((formItem) => {
			const questions = formItem.questions as any[] | undefined;
			if (!questions) return [];
			// Check if questions are categories or plain questions
			const firstItem = questions[0];
			if (firstItem && typeof firstItem === 'object' && 'category' in firstItem) {
				// Questions are wrapped in categories
				return (questions as QuestionCategory[]).flatMap((cat) => cat.questions);
			} else {
				// Questions are plain questions (like form1)
				return questions as Question[];
			}
		});
		return [...introQuestions, ...allFormQuestions];
	}

	if (!form.questions) {
		return introQuestions;
	}

	// Check if form.questions are categories or plain questions
	const questions = form.questions as any[];
	const firstItem = questions[0];
	let formQuestions: Question[];

	if (firstItem && typeof firstItem === 'object' && 'category' in firstItem) {
		// Questions are wrapped in categories
		formQuestions = (questions as QuestionCategory[]).flatMap(
			(category: QuestionCategory) => category.questions,
		);
	} else {
		// Questions are plain questions (like form1)
		formQuestions = questions as Question[];
	}

	// Combine intro questions with form questions
	return [...introQuestions, ...formQuestions];
}

/**
 * Converts a value to display format (handles booleans specially)
 * @param value - The value to convert
 * @returns Formatted display value
 */
export function formatDisplayValue(value: unknown): string {
	const stringValue = String(value);
	const isBoolValue = ["true", "false"].includes(stringValue.toLowerCase());

	if (isBoolValue) {
		return stringValue.toLowerCase() === "true" ? "Sim" : "Não";
	}

	return stringValue;
}

/**
 * Initiates a print dialog for the given HTML element content
 * @param elementId - The ID of the element to print
 */
export function printElement(elementId: string): void {
	const printContent = document.getElementById(elementId);
	if (!printContent) return;

	const iframe = document.createElement("iframe");
	iframe.style.position = "absolute";
	iframe.style.width = "0px";
	iframe.style.height = "0px";
	iframe.style.border = "none";
	document.body.appendChild(iframe);

	const doc = iframe.contentWindow?.document;
	if (doc) {
		const styles = document.querySelectorAll(
			"style, link[rel='stylesheet']",
		);
		const styleTags = Array.from(styles)
			.map((s) => s.outerHTML)
			.join("");

		doc.write(
			`<html><head><title>Imprimir</title>${styleTags}</head><body>${printContent.innerHTML}</body></html>`,
		);
		doc.close();

		setTimeout(() => {
			iframe.contentWindow?.focus();
			iframe.contentWindow?.print();
			document.body.removeChild(iframe);
		}, 500);
	}
}

/**
 * Checks if a subtitle should be shown
 */
export function shouldShowSubtitle(subtitle: string | null | undefined): boolean {
	return !!subtitle && subtitle.trim() !== "";
}

/**
 * Formats a boolean value as Sim/Não
 */
export function formatBoolean(value: boolean): string {
	return value ? "Sim" : "Não";
}

/**
 * Checks if a comment should be shown
 */
export function shouldShowComment(comment: string | null | undefined): boolean {
	return !!comment && comment.trim() !== "";
}

/**
 * Returns the CSS class for a value based on success/warning status
 */
export function getValueClass(isSuccess: boolean, isWarning: boolean): string {
	if (isSuccess) return "text-success";
	if (isWarning) return "text-warning";
	return "";
}


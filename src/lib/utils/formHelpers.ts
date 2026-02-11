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
	return forms.reduce(
		(acc, form) => {
			acc[form.title] = form;
			return acc;
		},
		{} as Record<string, any>,
	);
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
		return introQuestions;
	}

	if (!form.questions) {
		return introQuestions;
	}

	// Get questions from the regular form
	const formQuestions = form.questions.flatMap(
		(category: QuestionCategory) => category.questions,
	);

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

/**
 * Type definitions for form validation
 */

/**
 * Additional properties that can be attached to a question
 */
export interface QuestionExtra {
	[key: string]: unknown;
}

/**
 * Represents a question in a form section
 */
export interface Question {
	id: string;
	text: string;
	type?: string;
	link_attachment?: string;
	/** HTML autocomplete attribute value for browser autofill support */
	autocomplete?: string;
	/** Options for choice-type questions */
	options?: string[];
	/** Additional properties for extensibility */
	extra?: QuestionExtra;
}

/**
 * Additional properties that can be attached to a category
 */
export interface CategoryExtra {
	[key: string]: unknown;
}

/**
 * Represents a category of questions
 */
export interface QuestionCategory {
	category?: string;
	icon?: unknown;
	questions: Question[];
	/** Additional properties for extensibility */
	extra?: CategoryExtra;
}

/**
 * Form submission data with known fields and index signature for dynamic fields
 */
export interface FormData {
	companyName?: string;
	email?: string;
	/** Allow dynamic field access while maintaining type safety for known fields */
	[key: string]: unknown;
}

/**
 * Validation error response
 */
export interface ValidationErrors {
	[fieldName: string]: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

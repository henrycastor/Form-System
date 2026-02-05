/**
 * Type definitions for form validation
 */

/**
 * Represents a question in a form section
 */
export interface Question {
	id: string;
	text: string;
	type?: string;
	link_attachment?: string;
	[key: string]: unknown;
}

/**
 * Represents a category of questions
 */
export interface QuestionCategory {
	category?: string;
	icon?: any;
	questions: Question[];
	[key: string]: unknown;
}

/**
 * Form submission data
 */
export interface FormData {
	companyName?: string;
	email?: string;
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

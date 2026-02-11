/**
 * Comprehensive validation utilities for TypeScript/SvelteKit
 *
 * This module contains:
 * - Input validation functions (email, strings, pagination)
 * - Data sanitization utilities
 * - Submission data validation
 * - Form schema building with Zod
 */

import { z } from "zod";
import type { Question, QuestionCategory, FormData, ValidationErrors, ValidationResult } from "$lib/types/validation";

// ============================================================================
// CONSTANTS - Magic numbers extracted for maintainability
// ============================================================================

export const VALIDATION_CONSTANTS = {
	/** Maximum length for company name */
	COMPANY_NAME_MIN_LENGTH: 2,
	/** Maximum length for search queries */
	SEARCH_QUERY_MAX_LENGTH: 100,
	/** Maximum length for general text fields */
	TEXT_FIELD_MAX_LENGTH: 5000,
	/** Maximum length for sanitized strings */
	SANITIZE_STRING_MAX_LENGTH: 1000,
	/** Minimum page number for pagination */
	PAGINATION_MIN_PAGE: 1,
	/** Default items per page */
	PAGINATION_DEFAULT_PER_PAGE: 10,
	/** Maximum items per page */
	PAGINATION_MAX_PER_PAGE: 100,
} as const;

// ============================================================================
// BASIC VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email format using RFC 5322 simplified pattern
 */
export function validateEmail(email: string): boolean {
	if (!email || typeof email !== 'string') return false;
	const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return pattern.test(email.trim());
}

/**
 * Sanitize string input by trimming and limiting length
 */
export function sanitizeString(value: string, maxLength: number = VALIDATION_CONSTANTS.SANITIZE_STRING_MAX_LENGTH): string {
	if (typeof value !== 'string') return '';
	return value.trim().substring(0, maxLength);
}

/**
 * Validate page number for pagination
 */
export function validatePageNumber(page: unknown, minPage: number = VALIDATION_CONSTANTS.PAGINATION_MIN_PAGE): number {
	try {
		const pageNum = Number(page);
		if (isNaN(pageNum)) return minPage;
		return Math.max(pageNum, minPage);
	} catch {
		return minPage;
	}
}

/**
 * Validate per_page parameter
 */
export function validatePerPage(
	perPage: unknown,
	maxPerPage: number = VALIDATION_CONSTANTS.PAGINATION_MAX_PER_PAGE,
	defaultValue: number = VALIDATION_CONSTANTS.PAGINATION_DEFAULT_PER_PAGE
): number {
	try {
		const value = Number(perPage);
		if (isNaN(value) || value <= 0) return defaultValue;
		return Math.min(value, maxPerPage);
	} catch {
		return defaultValue;
	}
}

/**
 * Validate and sanitize search query
 * Note: For SQL injection prevention, rely on parameterized queries in database operations.
 * This function provides basic sanitization for display/logging purposes only.
 */
export function validateSearchQuery(query: string, maxLength: number = VALIDATION_CONSTANTS.SEARCH_QUERY_MAX_LENGTH): string {
	if (typeof query !== 'string') return '';

	// Trim to max length
	let sanitized = query.trim().substring(0, maxLength);

	// Basic sanitization for potentially dangerous characters
	// This is a defense-in-depth measure; primary SQL injection prevention is via parameterized queries
	const dangerousPattern = /[;'"\\]/g;
	sanitized = sanitized.replace(dangerousPattern, '');

	return sanitized;
}

// ============================================================================
// SUBMISSION DATA VALIDATION
// ============================================================================

/**
 * Validate submission data structure and content
 */
export function validateSubmissionData(
	data: Record<string, unknown>
): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!data || typeof data !== 'object') {
		errors.push('Submission data must be a JSON object');
		return { isValid: false, errors };
	}

	if (Object.keys(data).length === 0) {
		errors.push('Submission data cannot be empty');
		return { isValid: false, errors };
	}

	// Validate company name if present
	if ('companyName' in data) {
		const companyName = data.companyName;
		if (typeof companyName !== 'string' || companyName.trim().length < VALIDATION_CONSTANTS.COMPANY_NAME_MIN_LENGTH) {
			errors.push(`Company name must be at least ${VALIDATION_CONSTANTS.COMPANY_NAME_MIN_LENGTH} characters`);
		}
	}

	// Validate email if present
	if ('email' in data) {
		const email = data.email;
		if (typeof email !== 'string' || !validateEmail(email)) {
			errors.push('Invalid email address');
		}
	}

	// Validate string length limits
	for (const [key, value] of Object.entries(data)) {
		if (typeof value === 'string' && value.length > VALIDATION_CONSTANTS.TEXT_FIELD_MAX_LENGTH) {
			errors.push(`Field '${key}' exceeds maximum length of ${VALIDATION_CONSTANTS.TEXT_FIELD_MAX_LENGTH} characters`);
		}
	}

	return { isValid: errors.length === 0, errors };
}

// ============================================================================
// ZOD FORM SCHEMA VALIDATION
// ============================================================================

/**
 * Build dynamic Zod schema for diagnostic form questions
 * Used for real-time form validation during keystroke
 */
export const buildDynamicSchema = (questions: QuestionCategory[]) => {
	const dynamicSchema: Record<string, z.ZodTypeAny> = {};
	const initialData: Record<string, unknown> = { companyName: "", email: "" };

	questions.forEach((cat) => {
		cat.questions.forEach((q: Question) => {
			// Make main questions optional for partial submission
			// Only intro fields (companyName, email) are required on submit
			dynamicSchema[q.id] = z.string().optional();
			initialData[q.id] = "";

			if (q.link_attachment) {
				dynamicSchema[`${q.id}_cmt`] = z.string().optional();
				initialData[`${q.id}_cmt`] = "";
			}
		});
	});

	// Intro fields are optional during keystroke validation
	// They will be validated on form submit via validateIntroFields()
	dynamicSchema.companyName = z.string().optional();
	dynamicSchema.email = z.string().optional();

	return { schema: z.object(dynamicSchema), initialData };
};

/**
 * Validate form data against a Zod schema
 */
export const validateFormData = (data: FormData, schema: z.ZodObject<z.ZodRawShape>) => {
	const result = schema.safeParse(data);
	if (result.success) return {};

	const fieldErrors: Record<string, string[]> = {};
	result.error.issues.forEach((issue) => {
		const key = issue.path[0] as string;
		if (!fieldErrors[key]) fieldErrors[key] = [];
		fieldErrors[key].push(issue.message);
	});

	return fieldErrors;
};

/**
 * Validate intro/required fields specifically on form submit
 */
export const validateIntroFields = (data: FormData): ValidationErrors => {
	const errors: ValidationErrors = {};

	if (!data.companyName || (typeof data.companyName === 'string' && data.companyName.trim().length < VALIDATION_CONSTANTS.COMPANY_NAME_MIN_LENGTH)) {
		errors.companyName = `Nome da empresa é obrigatório (mínimo ${VALIDATION_CONSTANTS.COMPANY_NAME_MIN_LENGTH} caracteres)`;
	}

	if (!data.email || !validateEmail(String(data.email))) {
		errors.email = "Email inválido";
	}

	return errors;
};

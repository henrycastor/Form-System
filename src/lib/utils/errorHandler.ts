/**
 * Error handling utilities for API endpoints
 * Centralizes error handling patterns to reduce code duplication
 */

/**
 * API error response
 */
export interface ApiError {
	success: false;
	error: string;
	message?: string;
	status: number;
}

/**
 * Format an error for JSON response
 */
export function formatApiError(
	error: unknown,
	defaultMessage: string,
	statusCode: number = 500
): ApiError {
	const message = error instanceof Error ? error.message : String(error);
	
	return {
		success: false,
		error: defaultMessage,
		message: message || 'Unknown error occurred',
		status: statusCode
	};
}

/**
 * Safely execute an async operation and return error response if it fails
 * @param operation - The async operation to execute
 * @param errorMessage - Default error message if operation fails
 * @param statusCode - HTTP status code for error response
 * @returns Result of operation or formatted error
 */
export async function safeExecute<T>(
	operation: () => Promise<T>,
	errorMessage: string = 'Operation failed',
	statusCode: number = 500
): Promise<T | ApiError> {
	try {
		return await operation();
	} catch (error) {
		return formatApiError(error, errorMessage, statusCode);
	}
}

/**
 * Type guard to check if result is an error
 */
export function isApiError(result: unknown): result is ApiError {
	return (
		typeof result === 'object' &&
		result !== null &&
		'success' in result &&
		result.success === false &&
		'error' in result
	);
}

/**
 * Create a typed error response for JSON returns
 */
export function createErrorResponse(
	error: string,
	details?: string | Error,
	statusCode: number = 500
) {
	const message = details instanceof Error ? details.message : details;
	
	return {
		success: false,
		error,
		...(message && { message }),
		status: statusCode
	};
}

import { json, type RequestHandler } from '@sveltejs/kit';
import { getDbConnection } from '$lib/db';
import { validateSubmissionData, validatePageNumber, validatePerPage, validateSearchQuery } from '$lib/validation';
import type { Database } from 'sqlite';

const TABLE_NAME = 'diagnostico_submissions';

interface SubmissionRow {
	id: number;
	data: string;
	submitted_at: string;
}

interface ParsedSubmission {
	id: number;
	submitted_at: string;
	name: string;
	title: string;
	date: string;
	status: string;
	data: Record<string, unknown>;
	[key: string]: unknown;
}

/**
 * Parse JSON string safely
 */
const parseSubmissionData = (jsonString: string): Record<string, unknown> => {
	try {
		const parsed = JSON.parse(jsonString);
		return typeof parsed === 'object' && parsed !== null ? parsed : {};
	} catch {
		// Silently handle parse errors
		return {};
	}
};

/**
 * Extract and normalize submission fields
 */
const extractSubmissionFields = (row: SubmissionRow): ParsedSubmission => {
	const submissionData = parseSubmissionData(row.data);
	const nestedName = submissionData.data && typeof submissionData.data === 'object'
		? (submissionData.data as Record<string, unknown>)['name']
		: undefined;

	return {
		id: row.id,
		submitted_at: row.submitted_at,
		name: String(nestedName || submissionData.name || 'Unknown'),
		title: String(submissionData.title || submissionData.form || 'Unknown'),
		date: String(submissionData.date || row.submitted_at),
		status: String(submissionData.status || 'pending'),
		data: submissionData,
		...submissionData
	};
};

/**
 * Ensure the table exists
 */
const ensureTableExists = async (db: Database): Promise<void> => {
	try {
		const table = await db.get(
			`SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
			[TABLE_NAME]
		);

		if (!table) {
			await db.exec(`
				CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					data TEXT NOT NULL,
					submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * GET endpoint - Fetch all submissions with optional filtering
 */
export const GET: RequestHandler = async ({ url }) => {
	let db;
	try {
		// Validate query parameters
		const page = validatePageNumber(url.searchParams.get('page') || 1);
		const perPage = validatePerPage(url.searchParams.get('per_page') || 10);
		const search = validateSearchQuery(url.searchParams.get('search') || '');

		db = await getDbConnection();
		await ensureTableExists(db);

		// Build query with parameterized statements
		let query = `SELECT id, data, submitted_at FROM ${TABLE_NAME} WHERE 1=1`;
		const params: (string | number)[] = [];

		if (search) {
			query += ` AND data LIKE ?`;
			params.push(`%${search}%`);
		}

		// Get total count
		const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as count FROM');
		const countResult = await db.get(countQuery, params);
		const total = countResult?.count || 0;

		// Get paginated results
		query += ` ORDER BY submitted_at DESC LIMIT ? OFFSET ?`;
		params.push(perPage, (page - 1) * perPage);

		const rows = (await db.all(query, params)) as SubmissionRow[];
		const submissions = rows.map(extractSubmissionFields);

		return json({
			success: true,
			data: submissions,
			pagination: {
				page,
				perPage,
				total,
				pages: Math.ceil(total / perPage)
			}
		});
	} catch (error) {
		return json(
			{
				success: false,
				error: 'Failed to fetch submissions',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	} finally {
		if (db) await db.close();
	}
};

/**
 * POST endpoint - Create a new submission
 */
export const POST: RequestHandler = async ({ request }) => {
	let db;
	try {
		// Parse request body
		let submission: Record<string, unknown>;
		try {
			submission = await request.json();
		} catch {
			return json(
				{ success: false, error: 'Invalid JSON in request body' },
				{ status: 400 }
			);
		}

		if (!submission) {
			return json(
				{ success: false, error: 'Empty submission data' },
				{ status: 400 }
			);
		}

		// Validate submission data
		const { isValid, errors } = validateSubmissionData(submission);
		if (!isValid) {
			return json(
				{
					success: false,
					error: 'Validation failed',
					details: errors
				},
				{ status: 400 }
			);
		}

		db = await getDbConnection();
		await ensureTableExists(db);

		// Serialize to JSON
		const data = JSON.stringify(submission);

		// Use parameterized query to prevent SQL injection
		const result = await db.run(
			`INSERT INTO ${TABLE_NAME} (data) VALUES (?)`,
			[data]
		);

		return json({ success: true, id: result.lastID }, { status: 201 });
	} catch (error) {
		return json(
			{
				success: false,
				error: 'Failed to save submission',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	} finally {
		if (db) await db.close();
	}
};

/**
 * DELETE endpoint - Delete a submission by ID
 */
export const DELETE: RequestHandler = async ({ url }) => {
	let db;
	try {
		const id = url.searchParams.get('id');

		if (!id) {
			return json(
				{ success: false, error: 'Missing id parameter' },
				{ status: 400 }
			);
		}

		// Validate ID is a number
		const numId = Number(id);
		if (isNaN(numId)) {
			return json(
				{ success: false, error: 'Invalid id format' },
				{ status: 400 }
			);
		}

		db = await getDbConnection();
		await ensureTableExists(db);

		// Use parameterized query to prevent SQL injection
		const result = await db.run(
			`DELETE FROM ${TABLE_NAME} WHERE id = ?`,
			[numId]
		);

		if (result.changes === 0) {
			return json(
				{ success: false, error: 'Submission not found' },
				{ status: 404 }
			);
		}

		return json({ success: true, message: 'Submission deleted' });
	} catch (error) {
		return json(
			{
				success: false,
				error: 'Failed to delete submission',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	} finally {
		if (db) await db.close();
	}
};

import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * Proxy API requests to Flask backend with SQLAlchemy
 * This ensures we're using the same database layer as the Python tests
 */

const FLASK_API_BASE = 'http://localhost:5000/api';

/**
 * GET endpoint - Proxy to Flask backend
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const params = url.searchParams.toString();
		const response = await fetch(`${FLASK_API_BASE}/submissions${params ? `?${params}` : ''}`);

		if (!response.ok) {
			return json(
				{
					success: false,
					error: `Failed to fetch submissions`,
					message: `HTTP ${response.status}: ${response.statusText}`
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		return json({
			success: true,
			data: data.submissions,
			pagination: data.pagination
		});
	} catch (error) {
		return json(
			{
				success: false,
				error: 'Failed to connect to backend',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 503 }
		);
	}
};

/**
 * POST endpoint - Proxy to Flask backend
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const response = await fetch(`${FLASK_API_BASE}/submissions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body)
		});

		const data = await response.json();

		if (!response.ok) {
			return json(
				{
					success: false,
					error: data.error || 'Failed to create submission',
					details: data.details
				},
				{ status: response.status }
			);
		}

		return json({
			success: true,
			id: data.id,
			message: data.message
		}, { status: 201 });
	} catch (error) {
		return json(
			{
				success: false,
				error: 'Failed to connect to backend',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 503 }
		);
	}
};



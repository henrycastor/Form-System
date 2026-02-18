import { json, type RequestHandler } from '@sveltejs/kit';

const FLASK_API_BASE = 'http://localhost:5000/api';

/**
 * DELETE endpoint - Proxy to Flask backend to delete a specific submission
 */
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        const { id } = params;

        if (!id) {
            return json(
                { success: false, error: 'Missing id parameter' },
                { status: 400 }
            );
        }

        const response = await fetch(`${FLASK_API_BASE}/submissions/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            return json(
                {
                    success: false,
                    error: data.error || 'Failed to delete submission',
                    message: data.message
                },
                { status: response.status }
            );
        }

        return json({
            success: true,
            message: data.message
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
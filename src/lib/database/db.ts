import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';

const DB_FILE = 'respostas.db';

let dbInstance: Database | null = null;

/**
 * Get or create a database connection singleton
 * Uses a single connection for better performance in development
 */
export async function getDbConnection(): Promise<Database> {
	if (dbInstance) {
		return dbInstance;
	}

	dbInstance = await open({
		filename: DB_FILE,
		driver: sqlite3.Database
	});

	return dbInstance;
}

/**
 * Close the database connection
 * Should be called during application shutdown
 */
export async function closeDbConnection(): Promise<void> {
	if (dbInstance) {
		await dbInstance.close();
		dbInstance = null;
	}
}

/**
 * Execute a query with automatic connection management
 * Preferred method for database operations
 */
export async function withDb<T>(
	callback: (db: Database) => Promise<T>
): Promise<T> {
	const db = await getDbConnection();
	try {
		return await callback(db);
	} finally {
		// Note: In production with connection pooling, don't close here
		// For singleton pattern in development, we keep the connection open
	}
}

/**
 * Initialize the database schema
 */
export async function initDb(): Promise<void> {
	const db = await getDbConnection();
	try {
		await db.exec(`
			CREATE TABLE IF NOT EXISTS diagnostico_submissions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				data TEXT NOT NULL,
				submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);
	} finally {
		// Keep connection open for reuse
	}
}

// Initialize the database when the application starts
// Using try-catch to prevent startup failures from crashing the app
initDb().catch((err) => {
	// Error handled silently to prevent app crash on startup
});

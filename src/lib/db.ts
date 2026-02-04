import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const DB_FILE = 'respostas.db';

/**
 * Get a database connection
 * @returns Promise resolving to database connection
 * @throws Error if connection fails
 */
export async function getDbConnection() {
	try {
		const db = await open({
			filename: DB_FILE,
			driver: sqlite3.Database
		});
		return db;
	} catch (error) {
		throw new Error('Database connection failed');
	}
}

/**
 * Initialize the database with required tables
 * @throws Error if initialization fails
 */
export async function initDb() {
	const db = await getDbConnection();
	try {
		const table = await db.get(
			"SELECT name FROM sqlite_master WHERE type='table' AND name='diagnostico_submissions'"
		);
		
		if (!table) {
			await db.exec(`
                CREATE TABLE diagnostico_submissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data TEXT NOT NULL,
                    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
		}
	} catch (error) {
		// Try to create the table anyway
		await db.exec(`
            CREATE TABLE IF NOT EXISTS diagnostico_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data TEXT NOT NULL,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
	} finally {
		await db.close();
	}
}

// Initialize the database when the application starts
initDb().catch(() => {
	// Silently handle initialization errors
});

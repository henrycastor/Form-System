import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_FILE = 'respostas.db';

export async function getDbConnection() {
	const db = await open({
		filename: DB_FILE,
		driver: sqlite3.Database
	});
	return db;
}

export async function initDb() {
	const db = await getDbConnection();
	await db.exec(`
        CREATE TABLE IF NOT EXISTS diagnostico_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
	await db.close();
}

// Initialize the database when the application starts
initDb().catch((err) => {
	console.error('Error initializing database:', err);
});

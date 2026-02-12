import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDbConnection, closeDbConnection, withDb, initDb } from '$lib/database/db';

// Mock sqlite3 and sqlite
vi.mock('sqlite3', () => ({
    default: {
        Database: class { }
    }
}));

vi.mock('sqlite', () => ({
    open: vi.fn()
}));

import { open } from 'sqlite';

describe('Database Singleton Utility', () => {
    const mockDb = {
        exec: vi.fn(),
        close: vi.fn(),
        get: vi.fn(),
        all: vi.fn(),
        run: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(open).mockResolvedValue(mockDb as any);
    });

    afterEach(async () => {
        await closeDbConnection();
    });

    it('should return a singleton database connection', async () => {
        const db1 = await getDbConnection();
        const db2 = await getDbConnection();

        expect(open).toHaveBeenCalledTimes(1);
        expect(db1).toBe(db2);
        expect(db1).toBe(mockDb);
    });

    it('should close the connection and reset the singleton', async () => {
        await getDbConnection();
        await closeDbConnection();

        expect(mockDb.close).toHaveBeenCalledTimes(1);

        await getDbConnection();
        expect(open).toHaveBeenCalledTimes(2);
    });

    it('should execute a callback with withDb', async () => {
        const callback = vi.fn().mockResolvedValue('result');
        const result = await withDb(callback);

        expect(callback).toHaveBeenCalledWith(mockDb);
        expect(result).toBe('result');
        // Singleton connection stays open by default in development
        expect(mockDb.close).not.toHaveBeenCalled();
    });

    it('should initialize the database schema', async () => {
        await initDb();

        expect(mockDb.exec).toHaveBeenCalledWith(
            expect.stringContaining('CREATE TABLE IF NOT EXISTS diagnostico_submissions')
        );
    });
});

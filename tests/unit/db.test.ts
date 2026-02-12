import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDbConnection, initDb, DB_FILE } from '$lib/db';

// Mock sqlite modules
vi.mock('sqlite3', () => ({
    default: { Database: vi.fn() }
}));

vi.mock('sqlite', () => ({
    open: vi.fn()
}));

import { open } from 'sqlite';

describe('Database Module', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('DB_FILE', () => {
        it('should be defined as a string', () => {
            expect(DB_FILE).toBe('respostas.db');
        });
    });

    describe('getDbConnection', () => {
        it('should call open with correct params', async () => {
            const mockDb = { close: vi.fn() };
            vi.mocked(open).mockResolvedValueOnce(mockDb as any);

            const db = await getDbConnection();

            expect(open).toHaveBeenCalledWith({
                filename: 'respostas.db',
                driver: expect.anything()
            });
            expect(db).toBe(mockDb);
        });

        it('should throw on connection failure', async () => {
            vi.mocked(open).mockRejectedValueOnce(new Error('Connection refused'));

            await expect(getDbConnection())
                .rejects.toThrow('Database connection failed');
        });
    });

    describe('initDb', () => {
        it('should create table if it does not exist', async () => {
            const mockDb = {
                get: vi.fn().mockResolvedValueOnce(null), // table doesn't exist
                exec: vi.fn().mockResolvedValueOnce(undefined),
                close: vi.fn().mockResolvedValueOnce(undefined)
            };
            vi.mocked(open).mockResolvedValueOnce(mockDb as any);

            await initDb();

            expect(mockDb.get).toHaveBeenCalledWith(
                expect.stringContaining('sqlite_master')
            );
            expect(mockDb.exec).toHaveBeenCalledWith(
                expect.stringContaining('CREATE TABLE')
            );
            expect(mockDb.close).toHaveBeenCalled();
        });

        it('should skip table creation if table already exists', async () => {
            const mockDb = {
                get: vi.fn().mockResolvedValueOnce({ name: 'diagnostico_submissions' }),
                exec: vi.fn(),
                close: vi.fn().mockResolvedValueOnce(undefined)
            };
            vi.mocked(open).mockResolvedValueOnce(mockDb as any);

            await initDb();

            expect(mockDb.exec).not.toHaveBeenCalled();
            expect(mockDb.close).toHaveBeenCalled();
        });

        it('should use CREATE TABLE IF NOT EXISTS on error fallback', async () => {
            const mockDb = {
                get: vi.fn().mockRejectedValueOnce(new Error('Query failed')),
                exec: vi.fn().mockResolvedValueOnce(undefined),
                close: vi.fn().mockResolvedValueOnce(undefined)
            };
            vi.mocked(open).mockResolvedValueOnce(mockDb as any);

            await initDb();

            expect(mockDb.exec).toHaveBeenCalledWith(
                expect.stringContaining('CREATE TABLE IF NOT EXISTS')
            );
            expect(mockDb.close).toHaveBeenCalled();
        });
    });
});

#!/usr/bin/env python3
"""
Database connection pooling for SQLite.
Manages reusable database connections to improve performance.
"""

import sqlite3
import os
from pathlib import Path
from queue import Queue
from typing import Optional
from logger import setup_logger

logger = setup_logger(__name__)

class DatabasePool:
    """Simple connection pool for SQLite databases."""
    
    def __init__(self, db_path: str, pool_size: int = 5):
        """
        Initialize the connection pool.
        
        Args:
            db_path: Path to the SQLite database file
            pool_size: Number of connections to maintain
        """
        self.db_path = db_path
        self.pool_size = pool_size
        self.pool: Queue = Queue(maxsize=pool_size)
        self._initialized = False
        self._init_pool()
    
    def _init_pool(self) -> None:
        """Initialize the connection pool with new connections."""
        try:
            # Ensure database file exists
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
            
            for _ in range(self.pool_size):
                conn = sqlite3.connect(self.db_path, check_same_thread=False)
                conn.row_factory = sqlite3.Row
                conn.execute('PRAGMA journal_mode=WAL')
                conn.execute('PRAGMA synchronous=NORMAL')
                self.pool.put(conn)
            
            self._initialized = True
            logger.info(f"Database pool initialized with {self.pool_size} connections")
        except sqlite3.Error as e:
            logger.error(f"Failed to initialize database pool: {e}")
            raise
    
    def get_connection(self) -> sqlite3.Connection:
        """
        Get a connection from the pool.
        
        Returns:
            A sqlite3.Connection object
        """
        if not self._initialized:
            logger.error("Database pool not initialized")
            raise RuntimeError("Database pool not initialized")
        
        try:
            conn = self.pool.get(timeout=5)
            # Verify connection is still valid
            try:
                conn.execute('SELECT 1')
                return conn
            except sqlite3.Error:
                # Connection is dead, create a new one
                logger.warning("Dead connection detected, creating new one")
                conn = sqlite3.connect(self.db_path, check_same_thread=False)
                conn.row_factory = sqlite3.Row
                return conn
        except Exception as e:
            logger.error(f"Failed to get connection from pool: {e}")
            raise
    
    def return_connection(self, conn: sqlite3.Connection) -> None:
        """
        Return a connection to the pool.
        
        Args:
            conn: The connection to return
        """
        try:
            self.pool.put(conn, timeout=1)
        except Exception as e:
            logger.warning(f"Failed to return connection to pool: {e}")
            try:
                conn.close()
            except Exception:
                pass
    
    def close_all(self) -> None:
        """Close all connections in the pool."""
        try:
            while not self.pool.empty():
                try:
                    conn = self.pool.get_nowait()
                    conn.close()
                except Exception as e:
                    logger.warning(f"Error closing connection: {e}")
            self._initialized = False
            logger.info("All database connections closed")
        except Exception as e:
            logger.error(f"Error closing all connections: {e}")


# Global pool instance
_db_pool: Optional[DatabasePool] = None


def init_db_pool(db_path: str, pool_size: int = 5) -> DatabasePool:
    """
    Initialize the global database pool.
    
    Args:
        db_path: Path to the database file
        pool_size: Number of connections to maintain
    
    Returns:
        The initialized DatabasePool instance
    """
    global _db_pool
    if _db_pool is None:
        _db_pool = DatabasePool(db_path, pool_size)
    return _db_pool


def get_db_pool() -> DatabasePool:
    """
    Get the global database pool.
    
    Returns:
        The DatabasePool instance
    
    Raises:
        RuntimeError: If pool not initialized
    """
    if _db_pool is None:
        raise RuntimeError("Database pool not initialized. Call init_db_pool first.")
    return _db_pool

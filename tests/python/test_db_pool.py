#!/usr/bin/env python3
"""
Unit tests for db_pool.py
"""
import pytest
import sqlite3
import os
import sys
import tempfile
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from db_pool import DatabasePool, init_db_pool, get_db_pool

class TestDatabasePool:
    """Tests for DatabasePool class."""
    
    @pytest.fixture
    def temp_db(self):
        """Create a temporary database file."""
        fd, path = tempfile.mkstemp()
        os.close(fd)
        yield path
        if os.path.exists(path):
            os.remove(path)
            
    def test_init_pool(self, temp_db):
        pool = DatabasePool(temp_db, pool_size=3)
        assert pool.pool_size == 3
        assert pool.pool.qsize() == 3
        assert pool._initialized is True
        pool.close_all()

    def test_get_and_return_connection(self, temp_db):
        pool = DatabasePool(temp_db, pool_size=2)
        
        # Get connections
        conn1 = pool.get_connection()
        conn2 = pool.get_connection()
        
        assert isinstance(conn1, sqlite3.Connection)
        assert isinstance(conn2, sqlite3.Connection)
        assert pool.pool.empty()
        
        # Return connections
        pool.return_connection(conn1)
        assert pool.pool.qsize() == 1
        
        pool.return_connection(conn2)
        assert pool.pool.qsize() == 2
        
        pool.close_all()

    def test_dead_connection_replacement(self, temp_db):
        pool = DatabasePool(temp_db, pool_size=1)
        conn = pool.get_connection()
        
        # Manually close the connection to simulate it dying
        conn.close()
        
        # Re-returning it is tricky, but get_connection should handle it if it was in the pool
        # Let's put it back closed
        pool.pool.put(conn)
        
        # This should detect it's closed and give us a new one
        new_conn = pool.get_connection()
        assert new_conn is not conn
        
        # Verify it works
        cursor = new_conn.execute('SELECT 1')
        assert cursor.fetchone()[0] == 1
        
        pool.return_connection(new_conn)
        pool.close_all()

    def test_global_pool_instance(self, temp_db):
        # Reset global pool if it exists (for testing)
        import db_pool
        db_pool._db_pool = None
        
        with pytest.raises(RuntimeError):
            get_db_pool()
            
        pool = init_db_pool(temp_db, pool_size=2)
        assert get_db_pool() is pool
        assert pool.pool_size == 2
        
        # Clean up
        pool.close_all()
        db_pool._db_pool = None

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

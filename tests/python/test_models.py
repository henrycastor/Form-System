#!/usr/bin/env python3
"""
Unit tests for SQLAlchemy models
"""
import pytest
import sys
import os
import tempfile
from datetime import datetime
from pathlib import Path

import tempfile
import importlib

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Set environment variables for testing BEFORE importing the app
fd, temp_db_path = tempfile.mkstemp()
os.close(fd)
os.environ['DATABASE_PATH'] = temp_db_path
os.environ['FLASK_DEBUG'] = 'False'

import flask_app
importlib.reload(flask_app)
from flask_app import app
from extensions import db
from models import Submission

class TestModels:
    @pytest.fixture
    def app_context(self):
        # We already set DATABASE_PATH, so app is initialized with it.
        # But we still want to ensure clean state for each test if possible.
        # Since we use a file, one file per module is what we have now.
        # To be cleaner, we could recreate it. 
        # But since we are inside a Class, the module import happened once.
        # app is already configured with temp_db_path.
        
        app.config['TESTING'] = True
        # We don't need to override SQLALCHEMY_DATABASE_URI again if 'DATABASE_PATH' was respected.
        # But to be safe:
        app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{temp_db_path}"

        with app.app_context():
            db.create_all()
            yield
            db.session.remove()
            db.drop_all()

    # Cleanup is tricky if it's at module level but we are in a class.
    # We can rely on OS cleaning /tmp or use a pytest hook.
    # For now, let's just leave the temp file or add a teardown.

    def test_submission_creation(self, app_context):
        """Test creating a submission model instance."""
        data = {"key": "value", "number": 123}
        submission = Submission(data=data)
        
        db.session.add(submission)
        db.session.commit()
        
        saved_submission = Submission.query.first()
        assert saved_submission.id is not None
        # Verify data is stored correctly (JSON serialization)
        # Note: SQLAlchemy might return dict directly for JSON type
        assert saved_submission.data == data
        assert isinstance(saved_submission.submitted_at, datetime)

    def test_submission_to_dict(self, app_context):
        """Test the to_dict method."""
        data = {"test": "data"}
        submission = Submission(data=data)
        db.session.add(submission)
        db.session.commit()
        
        result = submission.to_dict()
        assert result['id'] == submission.id
        assert result['data'] == data
        assert 'submitted_at' in result

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

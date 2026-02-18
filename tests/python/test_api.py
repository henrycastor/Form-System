#!/usr/bin/env python3
"""
Integration tests for the Flask API using SQLAlchemy
"""
import pytest
import os
import json
import sys
import tempfile
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Set environment variables for testing BEFORE importing the app
fd, temp_db_path = tempfile.mkstemp()
os.close(fd)
os.environ['DATABASE_PATH'] = temp_db_path
os.environ['FLASK_DEBUG'] = 'False'

# Now import the app and db
from flask_app import app
from extensions import db
from models import Submission

class TestAPI:
    """Tests for Flask API endpoints."""
    
    @pytest.fixture
    def client(self):
        """Configure the app for testing and return a test client."""
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{temp_db_path}"
        
        with app.test_client() as client:
            with app.app_context():
                db.create_all()
            yield client
            with app.app_context():
                db.session.remove()
                db.drop_all()

    def test_index_route(self, client):
        """Test the home page."""
        response = client.get('/')
        assert response.status_code == 200
        # Check if it returns the "Not Built" page or index content
        assert b"SvelteKit Application" in response.data

    def test_create_submission(self, client):
        """Test creating a new submission."""
        data = {
            "companyName": "Test Company",
            "email": "test@example.com",
            "answers": {"q1": "yes"}
        }
        response = client.post(
            '/api/submissions',
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 201
        res_data = json.loads(response.data)
        assert "id" in res_data
        assert res_data["message"] == "Submission created successfully"

    def test_get_submissions(self, client):
        """Test retrieving all submissions."""
        # Create a test record
        client.post(
            '/api/submissions',
            data=json.dumps({"companyName": "Sample", "email": "a@b.com"}),
            content_type='application/json'
        )
        
        response = client.get('/api/submissions')
        assert response.status_code == 200
        res_data = json.loads(response.data)
        assert len(res_data["submissions"]) == 1
        assert res_data["submissions"][0]["data"]["companyName"] == "Sample"

    def test_get_submission_by_id(self, client):
        """Test retrieving a single submission."""
        # Create record
        post_res = client.post(
            '/api/submissions',
            data=json.dumps({"companyName": "Specific"}),
            content_type='application/json'
        )
        sub_id = json.loads(post_res.data)["id"]
        
        response = client.get(f'/api/submissions/{sub_id}')
        assert response.status_code == 200
        res_data = json.loads(response.data)
        assert res_data["id"] == sub_id
        assert res_data["data"]["companyName"] == "Specific"

    def test_delete_submission(self, client):
        """Test deleting a submission."""
        # Create record
        post_res = client.post(
            '/api/submissions',
            data=json.dumps({"target": "delete-me"}),
            content_type='application/json'
        )
        sub_id = json.loads(post_res.data)["id"]
        
        response = client.delete(f'/api/submissions/{sub_id}')
        assert response.status_code == 200
        
        # Verify it's gone
        get_res = client.get(f'/api/submissions/{sub_id}')
        assert get_res.status_code == 404

    def test_stats(self, client):
        """Test the statistics endpoint."""
        client.post('/api/submissions', data=json.dumps({"test": "1"}), content_type='application/json')
        client.post('/api/submissions', data=json.dumps({"test": "2"}), content_type='application/json')
        
        response = client.get('/api/stats')
        assert response.status_code == 200
        res_data = json.loads(response.data)
        assert res_data["total"] == 2
        assert res_data["recent"] == 2

    def test_404_handling(self, client):
        """Test non-existent API routes."""
        response = client.get('/api/invalid-route')
        assert response.status_code == 404
        assert b"error" in response.data

# Cleanup temp file after all tests
def teardown_module(module):
    if os.path.exists(temp_db_path):
        os.remove(temp_db_path)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

#!/usr/bin/env python3
"""
Flask Backend for SvelteKit Application
Designed for deployment on PythonAnywhere
"""

import os
# import json  <-- keeping it just in case, but let's check deeper usage.
# actually, create_submission used request.get_json() which is flask method.
# models.py uses json.
# let's modify imports cleanly.

import os
import json # Keeping json if needed for error handling or other things, but looks unused now.
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, send_from_directory, jsonify, request, render_template_string
from werkzeug.exceptions import NotFound

from logger import setup_logger
from logger import setup_logger
from extensions import db
from models import Submission
from validators import (
    validate_submission_data,
    validate_page_number,
    validate_per_page,
    validate_search_query,
)
from sqlalchemy import or_, func, cast, String

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger(__name__)

app = Flask(__name__, static_folder='build')

# Configuration from environment
BASE_DIR = Path(__file__).parent
BUILD_DIR = BASE_DIR / os.getenv('BUILD_DIR', 'build')
DB_PATH = BASE_DIR / os.getenv('DATABASE_PATH', 'respostas.db')
SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-key')

app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Ensure build directory exists
if not BUILD_DIR.exists():
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"Created build directory: {BUILD_DIR}")


def init_db():
    """Initialize the database tables."""
    try:
        with app.app_context():
            db.create_all()
            logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


# Initialize database on startup
try:
    init_db()
    logger.info("Application startup complete")
except Exception as e:
    logger.error(f"Fatal error during initialization: {e}")
    # We might not want to crash completely if DB init fails, 
    # but for critical components, raising is appropriate.
    raise


@app.route('/')
def index():
    """Serve the main index.html file."""
    index_path = BUILD_DIR / 'index.html'
    if index_path.exists():
        return send_from_directory(BUILD_DIR, 'index.html')
    return render_template_string('''
        <!DOCTYPE html>
        <html>
        <head>
            <title>SvelteKit App - Not Built</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: #f0f0f0;
                }
                .container {
                    text-align: center;
                    padding: 40px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { color: #333; }
                p { color: #666; }
                code {
                    background: #f4f4f4;
                    padding: 2px 6px;
                    border-radius: 3px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 SvelteKit Application</h1>
                <p>The application has not been built yet.</p>
                <p>Run <code>npm run build</code> to build the application.</p>
            </div>
        </body>
        </html>
    ''')


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from the build directory."""
    try:
        return send_from_directory(BUILD_DIR, path)
    except NotFound:
        # If file not found, serve index.html for SPA routing
        index_path = BUILD_DIR / 'index.html'
        if index_path.exists():
            return send_from_directory(BUILD_DIR, 'index.html')
        raise


# API Routes
@app.route('/api/submissions', methods=['GET'])
def get_submissions():
    """Get all submissions with optional filtering and pagination."""
    try:
        # Validate and sanitize input parameters
        page = validate_page_number(request.args.get('page', 1, type=int))
        per_page = validate_per_page(request.args.get('per_page', 10, type=int))
        search = validate_search_query(request.args.get('search', ''))
        
        query = Submission.query

        if search:
            # Using cast to string because data is JSON type now
            # SQLite supports JSON searching differently, but simple LIKE works on text representation usually.
            query = query.filter(cast(Submission.data, String).like(f'%{search}%'))
        
        # Get total count
        total = query.count()
        
        # Get paginated results
        pagination = query.order_by(Submission.submitted_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        submissions = pagination.items
        
        # Convert to list of dicts
        result = [sub.to_dict() for sub in submissions]
        
        logger.info(f"Retrieved {len(result)} submissions (page {page}, per_page {per_page})")
        
        # Transform submissions to include fields at top level
        transformed_submissions = []
        for submission in result:
            data = submission.get('data', {})
            transformed_submission = {
                'id': submission.get('id'),
                'name': data.get('name') or data.get('companyName') or 'N/A',
                'title': data.get('title') or data.get('form') or 'N/A',
                'date': data.get('date') or submission.get('submitted_at'),
                'status': data.get('status') or 'pending',
                'data': data,
                'submitted_at': submission.get('submitted_at')
            }
            transformed_submissions.append(transformed_submission)

        return jsonify({
            'success': True,
            'submissions': transformed_submissions,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': pagination.pages
            }
        })
    except Exception as e:
        logger.error(f"Unexpected error in get_submissions: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@app.route('/api/submissions/<int:submission_id>', methods=['GET'])
def get_submission(submission_id):
    """Get a specific submission by ID."""
    try:
        submission = Submission.query.get(submission_id)
        
        if submission:
            logger.info(f"Retrieved submission {submission_id}")
            return jsonify({'success': True, 'data': submission.to_dict()})
        
        logger.warning(f"Submission {submission_id} not found")
        return jsonify({'success': False, 'error': 'Submission not found'}), 404
    except Exception as e:
        logger.error(f"Unexpected error in get_submission: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@app.route('/api/submissions', methods=['POST'])
def create_submission():
    """Create a new submission."""
    try:
        # Parse JSON body
        try:
            data = request.get_json(force=True)
        except Exception as e:
            logger.warning(f"Invalid JSON in request body: {e}")
            return jsonify({'success': False, 'error': 'Invalid JSON'}), 400
        
        if not data:
            logger.warning("Empty submission data")
            return jsonify({'success': False, 'error': 'Missing submission data'}), 400
        
        # Validate submission data
        is_valid, errors = validate_submission_data(data)
        if not is_valid:
            logger.warning(f"Invalid submission data: {errors}")
            return jsonify({'success': False, 'error': 'Validation failed', 'details': errors}), 400
        
        try:
            # SQLAlchemy handles JSON serialization automatically if we pass the dict to the JSON column
            submission = Submission(data=data)
            db.session.add(submission)
            db.session.commit()
            
            logger.info(f"Submission {submission.id} created successfully")
            return jsonify({
                'success': True,
                'id': submission.id,
                'message': 'Submission created successfully'
            }), 201
        except Exception as e:
            logger.error(f"Database error creating submission: {e}")
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Failed to save submission'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in create_submission: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@app.route('/api/submissions/<int:submission_id>', methods=['DELETE'])
def delete_submission(submission_id):
    """Delete a submission by ID."""
    try:
        try:
            submission = Submission.query.get(submission_id)
            
            if submission:
                db.session.delete(submission)
                db.session.commit()
                logger.info(f"Submission {submission_id} deleted successfully")
                return jsonify({'success': True, 'message': 'Submission deleted successfully'})
            
            logger.warning(f"Attempted to delete non-existent submission {submission_id}")
            return jsonify({'success': False, 'error': 'Submission not found'}), 404
        except Exception as e:
            logger.error(f"Database error deleting submission {submission_id}: {e}")
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Failed to delete submission'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in delete_submission: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get submission statistics."""
    try:
        try:
            # Total submissions
            total = Submission.query.count()
            
            # Recent submissions (last 7 days)
            # Using SQLite specific modification for datetime if needed, or SQLAlchemy func
            # Since we defaulted submitted_at to utcnow, we can filter naturally
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent = Submission.query.filter(Submission.submitted_at >= seven_days_ago).count()
            
            logger.info(f"Stats retrieved: total={total}, recent={recent}")
            
            return jsonify({
                'success': True,
                'total': total,
                'recent': recent
            })
        except Exception as e:
            logger.error(f"Database error fetching stats: {e}")
            return jsonify({'success': False, 'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_stats: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    logger.warning(f"404 error: {request.path}")
    # For SPA, return index.html for non-API routes
    if not request.path.startswith('/api/'):
        index_path = BUILD_DIR / 'index.html'
        if index_path.exists():
            return send_from_directory(BUILD_DIR, 'index.html')
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"500 error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Development server
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)

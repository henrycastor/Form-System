#!/usr/bin/env python3
"""
Flask Backend for SvelteKit Application
Designed for deployment on PythonAnywhere
"""

import os
import json
import sqlite3
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, send_from_directory, jsonify, request, render_template_string
from werkzeug.exceptions import NotFound

from logger import setup_logger
from db_pool import init_db_pool, get_db_pool
from validators import (
    validate_submission_data,
    validate_page_number,
    validate_per_page,
    validate_search_query,
)

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger(__name__)

app = Flask(__name__, static_folder='build')

# Configuration from environment
BASE_DIR = Path(__file__).parent
BUILD_DIR = BASE_DIR / os.getenv('BUILD_DIR', 'build')
DB_PATH = BASE_DIR / os.getenv('DATABASE_PATH', 'respostas.db')
DB_POOL_SIZE = int(os.getenv('DATABASE_POOL_SIZE', '5'))
SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-key')

app.config['SECRET_KEY'] = SECRET_KEY

# Ensure build directory exists
if not BUILD_DIR.exists():
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"Created build directory: {BUILD_DIR}")


def init_db():
    """Initialize the database if it doesn't exist."""
    try:
        pool = get_db_pool()
        conn = pool.get_connection()
        try:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS diagnostico_submissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data TEXT NOT NULL,
                    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            logger.info("Database initialized successfully")
        finally:
            pool.return_connection(conn)
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


# Initialize database pool and database on startup
try:
    init_db_pool(str(DB_PATH), DB_POOL_SIZE)
    init_db()
    logger.info("Application startup complete")
except Exception as e:
    logger.error(f"Fatal error during initialization: {e}")
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
        page = validate_page_number(request.args.get('page', 1))
        per_page = validate_per_page(request.args.get('per_page', 10))
        search = validate_search_query(request.args.get('search', ''))
        
        pool = get_db_pool()
        conn = pool.get_connection()
        
        try:
            # Build query with parameterized statements to prevent SQL injection
            query = 'SELECT * FROM diagnostico_submissions WHERE 1=1'
            params = []
            
            if search:
                query += ' AND data LIKE ?'
                params.append(f'%{search}%')
            
            # Get total count
            count_query = query.replace('SELECT *', 'SELECT COUNT(*)')
            total = conn.execute(count_query, params).fetchone()[0]
            
            # Get paginated results
            query += ' ORDER BY submitted_at DESC LIMIT ? OFFSET ?'
            params.extend([per_page, (page - 1) * per_page])
            
            submissions = conn.execute(query, params).fetchall()
            
            # Convert to list of dicts
            result = []
            for sub in submissions:
                try:
                    submission_data = json.loads(sub['data'])
                    result.append({
                        'id': sub['id'],
                        'data': submission_data,
                        'submitted_at': sub['submitted_at']
                    })
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse submission {sub['id']}: {e}")
                    # Skip invalid JSON records
                    continue
            
            logger.info(f"Retrieved {len(result)} submissions (page {page}, per_page {per_page})")
            
            return jsonify({
                'submissions': result,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'pages': (total + per_page - 1) // per_page
                }
            })
        except sqlite3.Error as e:
            logger.error(f"Database error while fetching submissions: {e}")
            return jsonify({'error': 'Database error'}), 500
        finally:
            pool.return_connection(conn)
    except Exception as e:
        logger.error(f"Unexpected error in get_submissions: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/submissions/<int:submission_id>', methods=['GET'])
def get_submission(submission_id):
    """Get a specific submission by ID."""
    try:
        pool = get_db_pool()
        conn = pool.get_connection()
        
        try:
            # Use parameterized query to prevent SQL injection
            submission = conn.execute(
                'SELECT * FROM diagnostico_submissions WHERE id = ?',
                (submission_id,)
            ).fetchone()
            
            if submission:
                try:
                    submission_data = json.loads(submission['data'])
                    logger.info(f"Retrieved submission {submission_id}")
                    return jsonify({
                        'id': submission['id'],
                        'data': submission_data,
                        'submitted_at': submission['submitted_at']
                    })
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse submission {submission_id}: {e}")
                    return jsonify({'error': 'Invalid submission data'}), 500
            
            logger.warning(f"Submission {submission_id} not found")
            return jsonify({'error': 'Submission not found'}), 404
        except sqlite3.Error as e:
            logger.error(f"Database error fetching submission {submission_id}: {e}")
            return jsonify({'error': 'Database error'}), 500
        finally:
            pool.return_connection(conn)
    except Exception as e:
        logger.error(f"Unexpected error in get_submission: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/submissions', methods=['POST'])
def create_submission():
    """Create a new submission."""
    try:
        # Parse JSON body
        try:
            data = request.get_json(force=True)
        except Exception as e:
            logger.warning(f"Invalid JSON in request body: {e}")
            return jsonify({'error': 'Invalid JSON'}), 400
        
        if not data:
            logger.warning("Empty submission data")
            return jsonify({'error': 'Missing submission data'}), 400
        
        # Validate submission data
        is_valid, errors = validate_submission_data(data)
        if not is_valid:
            logger.warning(f"Invalid submission data: {errors}")
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        # Serialize to JSON
        try:
            submission_json = json.dumps(data)
        except (TypeError, ValueError) as e:
            logger.error(f"Failed to serialize submission data: {e}")
            return jsonify({'error': 'Data serialization failed'}), 400
        
        pool = get_db_pool()
        conn = pool.get_connection()
        
        try:
            # Use parameterized query to prevent SQL injection
            cursor = conn.execute(
                'INSERT INTO diagnostico_submissions (data) VALUES (?)',
                (submission_json,)
            )
            conn.commit()
            submission_id = cursor.lastrowid
            
            logger.info(f"Submission {submission_id} created successfully")
            return jsonify({
                'id': submission_id,
                'message': 'Submission created successfully'
            }), 201
        except sqlite3.Error as e:
            logger.error(f"Database error creating submission: {e}")
            conn.rollback()
            return jsonify({'error': 'Failed to save submission'}), 500
        finally:
            pool.return_connection(conn)
    except Exception as e:
        logger.error(f"Unexpected error in create_submission: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/submissions/<int:submission_id>', methods=['DELETE'])
def delete_submission(submission_id):
    """Delete a submission by ID."""
    try:
        pool = get_db_pool()
        conn = pool.get_connection()
        
        try:
            # Use parameterized query to prevent SQL injection
            cursor = conn.execute(
                'DELETE FROM diagnostico_submissions WHERE id = ?',
                (submission_id,)
            )
            conn.commit()
            
            if cursor.rowcount > 0:
                logger.info(f"Submission {submission_id} deleted successfully")
                return jsonify({'message': 'Submission deleted successfully'})
            
            logger.warning(f"Attempted to delete non-existent submission {submission_id}")
            return jsonify({'error': 'Submission not found'}), 404
        except sqlite3.Error as e:
            logger.error(f"Database error deleting submission {submission_id}: {e}")
            conn.rollback()
            return jsonify({'error': 'Failed to delete submission'}), 500
        finally:
            pool.return_connection(conn)
    except Exception as e:
        logger.error(f"Unexpected error in delete_submission: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get submission statistics."""
    try:
        pool = get_db_pool()
        conn = pool.get_connection()
        
        try:
            # Total submissions
            total = conn.execute('SELECT COUNT(*) FROM diagnostico_submissions').fetchone()[0]
            
            # Recent submissions (last 7 days)
            recent = conn.execute('''
                SELECT COUNT(*) FROM diagnostico_submissions
                WHERE submitted_at >= datetime('now', '-7 days')
            ''').fetchone()[0]
            
            logger.info(f"Stats retrieved: total={total}, recent={recent}")
            
            return jsonify({
                'total': total,
                'recent': recent
            })
        except sqlite3.Error as e:
            logger.error(f"Database error fetching stats: {e}")
            return jsonify({'error': 'Database error'}), 500
        finally:
            pool.return_connection(conn)
    except Exception as e:
        logger.error(f"Unexpected error in get_stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500


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

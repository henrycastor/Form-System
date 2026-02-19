from flask import Blueprint, jsonify, request, redirect, abort, send_from_directory
from extensions import db
from models import Submission
from validators import validate_submission_data, validate_page_number, validate_per_page, validate_search_query
from logger import setup_logger
from sqlalchemy import cast, String
from datetime import datetime, timedelta
from config import BUILD_DIR

logger = setup_logger(__name__)

main_bp = Blueprint('main', __name__)
api_bp = Blueprint('api', __name__)

@main_bp.route('/')
def index():
    return redirect('http://localhost:5175')

@main_bp.route('/<path:path>')
def redirect_to_sveltekit(path):
    if path.startswith('api/'):
        if path == 'api/submissions' or path.startswith('api/submissions/'):
            abort(404)
        return send_from_directory(BUILD_DIR, path)
    return redirect(f'http://localhost:5175/{path}')

@api_bp.route('/submissions', methods=['GET'])
def get_submissions():
    try:
        page = validate_page_number(request.args.get('page', 1, type=int))
        per_page = validate_per_page(request.args.get('per_page', 10, type=int))
        search = validate_search_query(request.args.get('search', ''))
        
        query = Submission.query
        if search:
            query = query.filter(cast(Submission.data, String).like(f'%{search}%'))
        
        total = query.count()
        pagination = query.order_by(Submission.submitted_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        submissions = pagination.items
        result = [sub.to_dict() for sub in submissions]
        
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
        
        logger.info(f"Retrieved {len(result)} submissions (page {page}, per_page {per_page})")
        
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

@api_bp.route('/submissions/<int:submission_id>', methods=['GET'])
def get_submission(submission_id):
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

@api_bp.route('/submissions', methods=['POST'])
def create_submission():
    try:
        try:
            data = request.get_json(force=True)
        except Exception as e:
            logger.warning(f"Invalid JSON in request body: {e}")
            return jsonify({'success': False, 'error': 'Invalid JSON'}), 400
        
        if not data:
            logger.warning("Empty submission data")
            return jsonify({'success': False, 'error': 'Missing submission data'}), 400
        
        is_valid, errors = validate_submission_data(data)
        if not is_valid:
            logger.warning(f"Invalid submission data: {errors}")
            return jsonify({'success': False, 'error': 'Validation failed', 'details': errors}), 400
        
        try:
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

@api_bp.route('/submissions', methods=['DELETE'])
@api_bp.route('/submissions/<int:submission_id>', methods=['DELETE'])
def delete_submission(submission_id=None):
    try:
        if not submission_id:
            submission_id = request.args.get('id', type=int)
        
        if not submission_id:
            logger.warning("Attempted to delete submission without providing an ID")
            return jsonify({'success': False, 'error': 'Missing submission ID'}), 400
            
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

@api_bp.route('/stats', methods=['GET'])
def get_stats():
    try:
        try:
            total = Submission.query.count()
            
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

@api_bp.route('/<path:path>')
def api_proxy(path):
    return jsonify({'error': 'Not found'}), 404

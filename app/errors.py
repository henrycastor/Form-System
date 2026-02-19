from flask import jsonify, request, send_from_directory
from logger import setup_logger
from config import BUILD_DIR

logger = setup_logger(__name__)

def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(error):
        logger.warning(f"404 error: {request.path}")
        if not request.path.startswith('/api/') and not request.path == '/__data.json':
            index_path = BUILD_DIR / 'index.html'
            if index_path.exists():
                return send_from_directory(BUILD_DIR, 'index.html')
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 error: {error}")
        return jsonify({'error': 'Internal server error'}), 500

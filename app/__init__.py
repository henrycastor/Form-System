from flask import Flask
from extensions import db
from config import Config, BUILD_DIR
from logger import setup_logger

logger = setup_logger(__name__)

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='build')
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    
    # Ensure build directory exists
    if not BUILD_DIR.exists():
        BUILD_DIR.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created build directory: {BUILD_DIR}")
    
    # Register blueprints
    from app.routes import main_bp, api_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Register error handlers
    from app.errors import register_error_handlers
    register_error_handlers(app)
    
    return app

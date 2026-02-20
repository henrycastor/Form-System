import os
import sys
import subprocess
import atexit
from logger import setup_logger
from extensions import db
from config import FLASK_DEBUG

logger = setup_logger(__name__)

def start_sveltekit():
    try:
        logger.info("Starting SvelteKit frontend server...")
        npm_check = subprocess.run(
            [sys.executable, '-m', 'npm', '--version'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if npm_check.returncode != 0:
            logger.warning("npm not found. SvelteKit server not started.")
            return None
        
        sveltekit_process = subprocess.Popen(
            [sys.executable, '-m', 'npm', 'run', 'dev'],
            shell=(sys.platform == 'win32')
        )
        
        logger.info(f"SvelteKit server started with PID: {sveltekit_process.pid}")
        return sveltekit_process
    except Exception as e:
        logger.error(f"Failed to start SvelteKit server: {e}")
        return None

def init_db(app):
    try:
        with app.app_context():
            db.create_all()
            logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

def initialize_app(app):
    try:
        init_db(app)
        logger.info("Application startup complete")
        
        if FLASK_DEBUG:
            sveltekit_process = start_sveltekit()
            if sveltekit_process:
                def cleanup_sveltekit():
                    try:
                        logger.info("Stopping SvelteKit server...")
                        sveltekit_process.terminate()
                        sveltekit_process.wait(timeout=5)
                        logger.info("SvelteKit server stopped successfully")
                    except Exception as e:
                        logger.error(f"Error stopping SvelteKit server: {e}")
                        try:
                            sveltekit_process.kill()
                            logger.info("SvelteKit server killed")
                        except Exception as kill_error:
                            logger.error(f"Failed to kill SvelteKit server: {kill_error}")
                
                atexit.register(cleanup_sveltekit)
    except Exception as e:
        logger.error(f"Fatal error during initialization: {e}")
        raise

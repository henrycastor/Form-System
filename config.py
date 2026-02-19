import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent
BUILD_DIR = BASE_DIR / os.getenv('BUILD_DIR', 'build')
DB_PATH = BASE_DIR / os.getenv('DATABASE_PATH', 'respostas.db')
SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-key')
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

class Config:
    SECRET_KEY = SECRET_KEY
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DB_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

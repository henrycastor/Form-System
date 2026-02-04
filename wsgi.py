#!/usr/bin/env python3
"""
WSGI configuration for PythonAnywhere deployment
"""

import sys
import os
from pathlib import Path

# Add the project directory to the Python path
project_dir = Path(__file__).parent
sys.path.insert(0, str(project_dir))

# Set the FLASK_APP environment variable
os.environ['FLASK_APP'] = 'flask_app.py'

# Import the Flask app
from flask_app import app as application

# This is what PythonAnywhere looks for
if __name__ == '__main__':
    application.run()

#!/usr/bin/env python3
"""Flask Backend for SvelteKit Application"""

from app import create_app
from app.startup import initialize_app
from config import FLASK_DEBUG

app = create_app()

if __name__ == '__main__':
    initialize_app(app)
    app.run(debug=FLASK_DEBUG, host='0.0.0.0', port=5000)

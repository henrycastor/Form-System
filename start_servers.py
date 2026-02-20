#!/usr/bin/env python3
"""
Script to start both Flask backend and SvelteKit frontend servers
"""

import subprocess
import sys
import os
import signal
from pathlib import Path

def main():
    # Get the current directory
    current_dir = Path(__file__).parent

    # Check if virtual environment exists
    venv_dir = current_dir / 'venv'
    if not venv_dir.exists():
        print("Error: Virtual environment 'venv' not found. Please create it first.")
        sys.exit(1)

    # Start Flask backend
    print("Starting Flask backend...")
    flask_process = subprocess.Popen(
        [str(venv_dir / 'bin' / 'python'), 'flask_app.py'],
        cwd=current_dir
    )

    # Start SvelteKit frontend
    print("Starting SvelteKit frontend...")
    # npm is a Node.js package manager, not a Python module, so we run it directly
    if sys.platform == 'win32':
        sveltekit_process = subprocess.Popen(
            ['npm', 'run', 'dev'],
            cwd=current_dir,
            shell=True
        )
    else:
        sveltekit_process = subprocess.Popen(
            ['npm', 'run', 'dev'],
            cwd=current_dir
        )

    print(f"Servers started. Flask PID: {flask_process.pid}, SvelteKit PID: {sveltekit_process.pid}")

    # Function to stop servers on exit
    def cleanup():
        print("\nStopping servers...")
        try:
            flask_process.terminate()
            flask_process.wait(timeout=5)
            print(f"Flask server stopped")
        except Exception as e:
            print(f"Error stopping Flask server: {e}")
            flask_process.kill()
        
        try:
            sveltekit_process.terminate()
            sveltekit_process.wait(timeout=5)
            print(f"SvelteKit server stopped")
        except Exception as e:
            print(f"Error stopping SvelteKit server: {e}")
            sveltekit_process.kill()
        
        sys.exit(0)

    # Register cleanup function
    signal.signal(signal.SIGINT, lambda sig, frame: cleanup())
    signal.signal(signal.SIGTERM, lambda sig, frame: cleanup())

    # Wait for user to interrupt
    try:
        flask_process.wait()
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()

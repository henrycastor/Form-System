#!/usr/bin/env python3
"""
SvelteKit Project Executor
A Python script to execute and manage the SvelteKit project.
"""

import subprocess
import sys
import os
import argparse
from pathlib import Path


class SvelteKitExecutor:
    """Manages the execution of the SvelteKit project."""
    
    def __init__(self, project_dir=None):
        """Initialize the executor with the project directory."""
        self.project_dir = Path(project_dir) if project_dir else Path(__file__).parent
        self.npm_cmd = self._find_npm_command()
    
    def _find_npm_command(self):
        """Find the appropriate npm command for the system."""
        # Try npm first, then npm.cmd on Windows
        for cmd in ['npm', 'npm.cmd']:
            try:
                result = subprocess.run(
                    [cmd, '--version'],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    return cmd
            except (subprocess.TimeoutExpired, FileNotFoundError):
                continue
        return None
    
    def run_command(self, command, check=True):
        """Run a command in the project directory."""
        if not self.npm_cmd:
            print("Error: npm not found. Please ensure Node.js and npm are installed.")
            sys.exit(1)
        
        full_command = [self.npm_cmd] + command
        print(f"Running: {' '.join(full_command)}")
        
        try:
            result = subprocess.run(
                full_command,
                cwd=self.project_dir,
                check=check,
                text=True
            )
            return result
        except subprocess.CalledProcessError as e:
            print(f"Error running command: {e}")
            sys.exit(1)
    
    def dev(self, host='localhost', port=5173):
        """Run the development server."""
        print(f"Starting development server on {host}:{port}")
        print("Press Ctrl+C to stop the server")
        
        try:
            subprocess.run(
                [self.npm_cmd, 'run', 'dev', '--', '--host', host, '--port', str(port)],
                cwd=self.project_dir,
                check=True
            )
        except KeyboardInterrupt:
            print("\nDevelopment server stopped.")
        except subprocess.CalledProcessError as e:
            print(f"Error starting development server: {e}")
            sys.exit(1)
    
    def build(self):
        """Build the project for production."""
        print("Building project for production...")
        self.run_command(['run', 'build'])
        print("Build completed successfully!")
    
    def preview(self, host='localhost', port=4173):
        """Preview the production build."""
        print(f"Previewing production build on {host}:{port}")
        print("Press Ctrl+C to stop the server")
        
        try:
            subprocess.run(
                [self.npm_cmd, 'run', 'preview', '--', '--host', host, '--port', str(port)],
                cwd=self.project_dir,
                check=True
            )
        except KeyboardInterrupt:
            print("\nPreview server stopped.")
        except subprocess.CalledProcessError as e:
            print(f"Error starting preview server: {e}")
            sys.exit(1)
    
    def install(self):
        """Install project dependencies."""
        print("Installing dependencies...")
        self.run_command(['install'])
        print("Dependencies installed successfully!")
    
    def check(self):
        """Run type checking and linting."""
        print("Running type checking...")
        self.run_command(['run', 'check'])
        print("Type checking completed!")
    
    def sync(self):
        """Sync SvelteKit."""
        print("Syncing SvelteKit...")
        self.run_command(['run', 'prepare'])
        print("SvelteKit synced successfully!")

    def test(self, target='all'):
        """Run tests."""
        if target in ['all', 'python']:
            print("Running Python tests...")
            venv_python = self.project_dir / 'venv' / 'bin' / 'python3'
            if not venv_python.exists():
                venv_python = 'python3'
            
            try:
                subprocess.run(
                    [str(venv_python), '-m', 'pytest', 'tests/python', '-v'],
                    cwd=self.project_dir,
                    check=True
                )
                print("Python tests passed!")
            except subprocess.CalledProcessError:
                print("Python tests failed!")
                if target == 'python': sys.exit(1)
        
        if target in ['all', 'unit']:
            print("\nRunning SvelteKit unit tests...")
            self.run_command(['run', 'test:unit'], check=False)
            
        if target in ['all', 'e2e']:
            print("\nRunning SvelteKit E2E tests...")
            self.run_command(['run', 'test:e2e'], check=False)


def main():
    """Main entry point for the application."""
    parser = argparse.ArgumentParser(
        description='SvelteKit Project Executor - Run and manage the SvelteKit project',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python app.py dev              # Start development server
  python app.py dev --port 3000  # Start on custom port
  python app.py build            # Build for production
  python app.py preview          # Preview production build
  python app.py install          # Install dependencies
  python app.py check            # Run type checking
        """
    )
    
    parser.add_argument(
        'command',
        choices=['dev', 'build', 'preview', 'install', 'check', 'sync', 'test'],
        help='Command to execute'
    )
    
    parser.add_argument(
        '--host',
        default='localhost',
        help='Host to bind to (default: localhost)'
    )
    
    parser.add_argument(
        '--port',
        type=int,
        help='Port to use (default: 5173 for dev, 4173 for preview)'
    )

    parser.add_argument(
        '--target',
        choices=['all', 'python', 'unit', 'e2e'],
        default='all',
        help='Test target (default: all)'
    )
    
    parser.add_argument(
        '--dir',
        help='Project directory (default: current directory)'
    )
    
    args = parser.parse_args()
    
    # Create executor
    executor = SvelteKitExecutor(args.dir)
    
    # Execute command
    if args.command == 'dev':
        port = args.port or 5173
        executor.dev(args.host, port)
    elif args.command == 'build':
        executor.build()
    elif args.command == 'preview':
        port = args.port or 4173
        executor.preview(args.host, port)
    elif args.command == 'install':
        executor.install()
    elif args.command == 'check':
        executor.check()
    elif args.command == 'sync':
        executor.sync()
    elif args.command == 'test':
        executor.test(args.target)


if __name__ == '__main__':
    main()

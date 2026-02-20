#!/usr/bin/env python3
"""
Script to stop both Flask backend and SvelteKit frontend servers
"""

import subprocess
import sys
import os
import signal

def find_processes(process_name):
    """Find processes by name"""
    try:
        # Using pgrep to find process IDs
        result = subprocess.run(
            ['pgrep', '-f', process_name],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return list(map(int, result.stdout.strip().split('\n')))
    except FileNotFoundError:
        # Fallback for Windows or if pgrep is not available
        try:
            result = subprocess.run(
                ['tasklist', '/v'],
                capture_output=True,
                text=True,
                shell=True
            )
            if result.returncode == 0:
                # This is a simplified version for Windows - may need improvement
                return []
        except:
            pass
    
    return []

def kill_processes(pids, process_name):
    """Kill processes by their IDs"""
    killed = []
    for pid in pids:
        try:
            os.kill(pid, signal.SIGTERM)
            killed.append(pid)
            print(f"Killed {process_name} process with PID: {pid}")
        except ProcessLookupError:
            print(f"{process_name} process with PID: {pid} not found")
        except Exception as e:
            print(f"Error killing {process_name} process with PID: {pid}: {e}")
            try:
                os.kill(pid, signal.SIGKILL)
                killed.append(pid)
                print(f"Force killed {process_name} process with PID: {pid}")
            except:
                pass
    return killed

def main():
    print("Stopping Flask and SvelteKit servers...")

    # Stop Flask processes
    flask_pids = find_processes("python.*flask_app.py")
    if flask_pids:
        kill_processes(flask_pids, "Flask")
    else:
        print("Flask server not running")

    # Stop SvelteKit processes
    sveltekit_pids = find_processes("npm run dev")
    if sveltekit_pids:
        kill_processes(sveltekit_pids, "SvelteKit")
    else:
        print("SvelteKit server not running")

    # Stop Node processes (common for SvelteKit)
    node_pids = find_processes("node")
    if node_pids:
        kill_processes(node_pids, "Node.js")

    print("All servers stopped")

if __name__ == "__main__":
    main()

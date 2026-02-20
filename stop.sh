#!/bin/bash
echo "Stopping Flask and SvelteKit servers..."

# Find and kill Flask processes
FLASK_PIDS=$(pgrep -f "python.*flask_app.py" 2>/dev/null)
if [ -n "$FLASK_PIDS" ]; then
    kill $FLASK_PIDS
    echo "Flask server(s) stopped"
else
    echo "Flask server not running"
fi

# Find and kill SvelteKit processes
SVELTEKIT_PIDS=$(pgrep -f "npm run dev" 2>/dev/null)
if [ -n "$SVELTEKIT_PIDS" ]; then
    kill $SVELTEKIT_PIDS
    echo "SvelteKit server(s) stopped"
else
    echo "SvelteKit server not running"
fi

# Also check for any leftover node processes
NODE_PIDS=$(pgrep -f "node" 2>/dev/null)
if [ -n "$NODE_PIDS" ]; then
    kill $NODE_PIDS
    echo "Node process(es) stopped"
fi

echo "All servers stopped"

#!/bin/bash
echo "Starting Flask backend..."
venv/bin/python flask_app.py &
FLASK_PID=$!

echo "Starting SvelteKit frontend..."
npm run dev &
SVELTEKIT_PID=$!

echo "Servers started. Flask PID: $FLASK_PID, SvelteKit PID: $SVELTEKIT_PID"

# Function to stop servers on exit
cleanup() {
    echo "Stopping servers..."
    kill $FLASK_PID $SVELTEKIT_PID
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for user to interrupt
wait

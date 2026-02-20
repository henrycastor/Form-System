#!/bin/bash
echo "Starting Flask backend with Gunicorn WSGI server..."
venv/bin/gunicorn wsgi:application --bind 0.0.0.0:5000 --workers 4 &
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

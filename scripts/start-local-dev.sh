#!/bin/bash

echo "🚀 Starting FairPlay NIL Local Development Environment"

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping local development servers..."
    pkill -f "npm run dev"
    pkill -f "uvicorn"
    exit 0
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend server
echo "📡 Starting backend server on http://localhost:8000"
cd backend
source venv/bin/activate
export $(cat .env | xargs)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Backend server is running on http://localhost:8000"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend server
echo "🌐 Starting frontend server on http://localhost:3000"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server is running on http://localhost:3000"
else
    echo "❌ Frontend server failed to start"
    exit 1
fi

echo ""
echo "🎉 Local development environment is ready!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📊 Backend API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep script running
wait 
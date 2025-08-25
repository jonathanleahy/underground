#!/bin/bash

echo "🚇 Starting Underground Development Server..."
echo "================================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting Vite dev server..."
echo "📍 Local: http://localhost:3000"
echo "================================================"
echo ""

# Start the development server
npm run dev
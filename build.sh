#!/bin/bash
set -e

echo "🔨 Building AI E-commerce Platform..."

# Install and build frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo "🔨 Building frontend..."
npm run build
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ Build complete!"

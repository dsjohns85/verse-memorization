#!/bin/bash
# This file must be executable: chmod +x .devcontainer/setup.sh
set -e

echo "🚀 Setting up Verse Memorization development environment..."

# Install API dependencies (Azure Functions)
echo "📦 Installing API dependencies..."
cd api
npm install

echo "✅ API setup complete!"
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "✅ Frontend setup complete!"
cd ..

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "The Azure Functions API will start automatically."
echo ""
echo "To start the frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Access:"
echo "  - Frontend: Forwarded port (check Ports tab)"
echo "  - API: http://localhost:7071"

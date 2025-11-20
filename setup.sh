#!/bin/bash

# Simple Setup Script for Verse Memorization App
# This script sets up the app with SQLite for quick local development

set -e  # Exit on error

echo "🚀 Setting up Verse Memorization App (SQLite mode)"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. You have: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install root dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Setup backend
echo "🔧 Setting up backend with SQLite..."
cd backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "CHANGE-THIS-SECRET-$(date +%s)-$(shuf -i 1000-9999 -n 1)")
    
    cat > .env << EOF
DATABASE_URL=file:./dev.db
NODE_ENV=development
PORT=3001
JWT_SECRET=${JWT_SECRET}
EOF
    echo "✅ Created backend/.env with random JWT secret"
    echo "⚠️  For production, use a strong, unique JWT secret!"
fi

# Install backend dependencies
npm install

# Generate Prisma client and run migrations
echo "🗄️  Setting up SQLite database..."
npx prisma generate
npx prisma migrate dev --name init
echo "✅ Database ready!"
echo ""

# Setup frontend
echo "🎨 Setting up frontend..."
cd ../frontend
npm install
echo "✅ Frontend ready!"
echo ""

cd ..

echo "✨ Setup complete! ✨"
echo ""
echo "To start the app:"
echo "  npm run dev"
echo ""
echo "Or start services separately:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Access the app at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:3001"
echo ""

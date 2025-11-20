#!/bin/bash
set -e

echo "🚀 Setting up Verse Memorization development environment..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating backend .env file from example..."
  cp .env.example .env
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating frontend .env file from example..."
  cp .env.example .env
fi

cd ..

# Start PostgreSQL using docker compose
echo "🐘 Starting PostgreSQL database..."
docker compose -f .devcontainer/docker-compose.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker compose -f .devcontainer/docker-compose.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ PostgreSQL failed to start"
    exit 1
  fi
  sleep 1
done

# Run database migrations
echo "🔄 Running database migrations..."
cd backend
npx prisma migrate deploy || npx prisma migrate dev --name init

cd ..

echo "✅ Development environment setup complete!"
echo ""
echo "To start the development servers:"
echo "  - Frontend: npm run dev:frontend"
echo "  - Backend: npm run dev:backend"
echo "  - Both: npm run dev"
echo ""
echo "Ports:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend: http://localhost:3001"
echo "  - Database: localhost:5432"

# Getting Started with Verse Memorization

This guide will help you set up the development environment and start working with the Verse Memorization application.

## Prerequisites

- **Node.js** 20+ and npm 10+
- **Git**
- **Docker** and Docker Compose (optional - for PostgreSQL)
- **ESV API Key** (optional - free from https://api.esv.org)

## ESV API Setup

The application uses the official ESV (English Standard Version) API for automatic verse lookup:

1. Visit https://api.esv.org
2. Create a free account
3. Generate an API key
4. Add the key to your `.env` file (see below)

**Note**: The ESV API is free for personal use with reasonable rate limits. The app works without an API key, but automatic verse lookup won't be available.

## Quick Start

### Using the Setup Script (Easiest)

The fastest way to get started:

```bash
# 1. Clone the repository
git clone https://github.com/dsjohns85/verse-memorization.git
cd verse-memorization

# 2. Run the setup script
./setup.sh

# 3. Start the app
npm run dev
```

The setup script automatically:
- Installs all dependencies
- Creates SQLite database with migrations
- Generates a secure JWT secret
- Sets up the environment

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Manual Setup (SQLite)

If you prefer to set up manually:

```bash
# 1. Clone the repository
git clone https://github.com/dsjohns85/verse-memorization.git
cd verse-memorization

# 2. Install all dependencies
npm install

# 3. Setup backend with SQLite
cd backend
cp .env.example .env
# The .env is already configured for SQLite by default
npx prisma generate
npx prisma migrate dev
npm run dev &

# 4. In a new terminal, start frontend
cd ../frontend
npm install
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Using Docker (PostgreSQL)

For a production-like setup with PostgreSQL:

```bash
# Clone the repository
git clone https://github.com/dsjohns85/verse-memorization.git
cd verse-memorization

# Start all services (database, backend, frontend)
docker-compose up
```

This will:
- Start PostgreSQL database on port 5432
- Start backend API on http://localhost:3001
- Start frontend on http://localhost:5173

## Manual Backend Setup (Alternative)

If you want more control over the backend setup:

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment file
cp .env.example .env

# SQLite is configured by default:
# DATABASE_URL="file:./dev.db"

# For PostgreSQL (if you have it running):
# 1. Copy the PostgreSQL schema: cp prisma/schema.postgresql.prisma prisma/schema.prisma
# 2. Update DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/verse_memorization"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Optional: Seed the database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

The backend API will be available at http://localhost:3001

## Manual Frontend Setup (Alternative)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env to point to your backend
# VITE_API_URL=http://localhost:3001

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173

## Development with GitHub Codespaces

This repository is configured for GitHub Codespaces:

1. Click "Code" → "Codespaces" → "Create codespace on main"
2. Wait for the container to build
3. All dependencies will be installed automatically
4. Start developing!

## Testing the Application

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

```
verse-memorization/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/           # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── prisma/
│   └── package.json
├── infra/             # Azure Bicep IaC
├── .devcontainer/     # GitHub Codespaces config
├── .github/           # GitHub Actions workflows
└── docs/              # Documentation
```

## Environment Variables

### Backend (.env)

```env
# Database - SQLite (default, simplest)
DATABASE_URL="file:./dev.db"

# For PostgreSQL:
# 1. Copy schema: cp prisma/schema.postgresql.prisma prisma/schema.prisma
# 2. Use: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/verse_memorization"

NODE_ENV="development"
PORT=3001

# JWT secret (only needed for production authentication)
JWT_SECRET="your-secret-key"

# Optional: ESV API for automatic verse lookup
ESV_API_KEY="your-api-key"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
# Optional: ESV API key for automatic verse lookup
VITE_ESV_API_KEY=your-api-key-from-api.esv.org
```

**Getting an ESV API Key:**
1. Visit https://api.esv.org
2. Sign up for a free account
3. Create a new API application
4. Copy the API key to your `.env` file

## Common Issues

### Database Connection Error

**With SQLite**: Make sure the backend directory is writable and you ran `npx prisma generate` and `npx prisma migrate dev`.

**With PostgreSQL**:
1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in backend/.env
3. Verify the database exists: `createdb verse_memorization`
4. Ensure you've copied the PostgreSQL schema: `cp prisma/schema.postgresql.prisma prisma/schema.prisma`

### Port Already in Use

If port 3001 or 5173 is already in use:

1. Stop the conflicting process
2. Or change the port in the respective .env file

### Prisma Client Not Generated

If you see Prisma Client errors:

```bash
cd backend
npx prisma generate
```

## Next Steps

- [Development Guide](./DEVELOPMENT.md) - Learn about the development workflow
- [API Documentation](./API.md) - Explore the REST API
- [Azure Deployment Guide](./DEPLOYMENT.md) - Deploy to Azure

## Getting Help

- Check existing [GitHub Issues](https://github.com/dsjohns85/verse-memorization/issues)
- Create a new issue if you need help
- Review the documentation in the `/docs` folder

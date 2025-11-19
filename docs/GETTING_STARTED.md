# Getting Started with Verse Memorization

This guide will help you set up the development environment and start working with the Verse Memorization application.

## Prerequisites

- **Node.js** 18+ and npm 9+
- **Docker** and Docker Compose
- **Git**
- **PostgreSQL** (or use Docker)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/dsjohns85/verse-memorization.git
cd verse-memorization
```

### 2. Setup with Docker (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Start all services (database, backend, frontend)
docker-compose up
```

This will:
- Start PostgreSQL database on port 5432
- Start backend API on http://localhost:3001
- Start frontend on http://localhost:5173

### 3. Setup Locally (Alternative)

If you prefer to run services locally:

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database connection
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/verse_memorization"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npm run prisma:seed

# Start development server
npm run dev
```

The backend API will be available at http://localhost:3001

#### Frontend Setup

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
DATABASE_URL="postgresql://user:password@localhost:5432/verse_memorization"
NODE_ENV="development"
PORT=3001
JWT_SECRET="your-secret-key"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

## Common Issues

### Database Connection Error

If you get a database connection error:

1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in backend/.env
3. Verify the database exists: `createdb verse_memorization`

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
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to Azure

## Getting Help

- Check existing [GitHub Issues](https://github.com/dsjohns85/verse-memorization/issues)
- Create a new issue if you need help
- Review the documentation in the `/docs` folder

# Development Container Configuration

This directory contains the configuration for GitHub Codespaces and VS Code Dev Containers.

## Files

- **devcontainer.json** - Main configuration file for the dev container
- **Dockerfile** - Custom Docker image with Node.js 20, PostgreSQL client tools, and required dependencies
- **docker-compose.yml** - PostgreSQL service configuration for the development environment
- **setup.sh** - Automated setup script that runs after container creation

## What Happens on Container Creation

When you open this repository in GitHub Codespaces or VS Code Dev Containers:

1. A custom Docker container is built with Node.js 20 and PostgreSQL client tools
2. Docker-in-Docker is enabled for running services
3. The setup.sh script automatically:
   - Installs all npm dependencies (root, backend, frontend)
   - Generates Prisma client
   - Starts PostgreSQL database in a container
   - Runs database migrations

## Port Forwarding

The following ports are automatically forwarded:

- **5173** - Frontend (Vite dev server)
- **3001** - Backend API (Express server)
- **5432** - PostgreSQL database

## VS Code Extensions

The following extensions are automatically installed:

- ESLint
- Prettier
- Prisma
- Docker
- Azure Tools
- TypeScript
- Tailwind CSS

## Manual Setup (if needed)

If the automatic setup fails, you can manually run:

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start PostgreSQL
docker-compose -f .devcontainer/docker-compose.yml up -d postgres

# Generate Prisma client and run migrations
cd backend
npx prisma generate
npx prisma migrate dev
```

## Starting Development Servers

After setup is complete:

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

## Database Access

The PostgreSQL database is accessible at:

- **Host**: localhost
- **Port**: 5432
- **Database**: verse_memorization
- **User**: postgres
- **Password**: postgres

You can use the Prisma Studio to view and edit data:

```bash
cd backend
npx prisma studio
```

## Troubleshooting

### PostgreSQL not starting

If PostgreSQL fails to start, try:

```bash
# Check container status
docker ps -a

# Restart PostgreSQL
docker-compose -f .devcontainer/docker-compose.yml restart postgres

# View logs
docker-compose -f .devcontainer/docker-compose.yml logs postgres
```

### Prisma Client errors

If you see Prisma Client errors:

```bash
cd backend
npx prisma generate
```

### Port conflicts

If ports are already in use, you can modify the port forwarding in devcontainer.json or stop conflicting services.

## More Information

- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)

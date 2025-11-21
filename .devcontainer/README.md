# Development Container

This directory contains the configuration for GitHub Codespaces and VS Code Dev Containers.

## What's Included

- Node.js 20
- Azure CLI
- Azure Functions Core Tools
- GitHub CLI
- VS Code extensions for Azure Functions, TypeScript, and ESLint

## Quick Start

### GitHub Codespaces (Recommended)

1. Click "Code" → "Codespaces" → "Create codespace on main"
2. Wait for setup to complete (~2-3 minutes)
3. Azure Functions API starts automatically on port 7071
4. Start frontend: `cd frontend && npm run dev`

### VS Code Dev Containers

1. Install Docker Desktop
2. Install "Dev Containers" extension in VS Code
3. Open this repository in VS Code
4. Click "Reopen in Container" when prompted

## What Happens Automatically

- All dependencies are installed
- Azure Functions Core Tools configured
- API starts automatically on port 7071
- Ports 5173 (frontend) and 7071 (API) are forwarded

## Development Workflow

### Starting Services

API (Azure Functions):
- Starts automatically
- Access at http://localhost:7071
- Logs appear in terminal

Frontend:
```bash
cd frontend
npm run dev
```

### Testing API

```bash
# Health check
curl http://localhost:7071/api/health

# Get verses
curl http://localhost:7071/api/verses \
  -H "x-user-email: test@example.com"
```

### Database

SQLite database is created automatically in `api/data/verses.db`.

View/edit:
```bash
cd api
sqlite3 data/verses.db
```

## Ports

- **5173**: Frontend (React app)
- **7071**: API (Azure Functions)

## Extensions

The following VS Code extensions are automatically installed:

- **Azure Functions**: Manage and deploy Functions
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Bicep**: Infrastructure as Code
- **TypeScript**: Enhanced TypeScript support

## Troubleshooting

### API Not Starting

Check the terminal for errors. Common issues:
- Port 7071 already in use
- Missing dependencies (run `cd api && npm install`)

### Frontend Not Starting

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Issues

The database is created automatically. To reset:
```bash
rm api/data/verses.db
# Restart API - it will recreate the database
```

## Environment Variables

Set in Azure Portal for production deployment. For local development, defaults are used.

## Files

- `devcontainer.json`: Dev container configuration
- `Dockerfile`: Container image definition
- `setup.sh`: Initialization script
- `docker-compose.yml`: Services configuration (unused in Codespaces)

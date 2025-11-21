# Getting Started with Verse Memorization

This guide will help you start working with the Verse Memorization application.

## Quick Start: GitHub Codespaces (Recommended)

The easiest way to get started is using GitHub Codespaces:

1. Go to the [repository on GitHub](https://github.com/dsjohns85/verse-memorization)
2. Click the "Code" button
3. Select "Codespaces" → "Create codespace on main"
4. Wait for the environment to set up (2-3 minutes)

The Codespace includes:
- VS Code in your browser
- All dependencies pre-installed
- Azure Functions Core Tools
- SQLite database ready to use
- Development environment fully configured

### Working in Codespaces

The API (Azure Functions) starts automatically. To access the frontend:

```bash
cd frontend
npm install  # First time only
npm run dev
```

Access the app:
- Frontend: Forwarded port (Codespaces will show you the URL)
- API: http://localhost:7071

## ESV API Setup (Optional)

The application can use the ESV (English Standard Version) API for automatic verse lookup:

1. Visit https://api.esv.org
2. Create a free account
3. Generate an API key
4. Add to Azure Static Web App configuration (in Azure Portal)

**Note**: The app works fine without an API key for manual verse entry.

## Deploying to Azure

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Azure Static Web Apps deployment instructions.

### Quick Deploy

1. Create Static Web App in Azure Portal
2. Connect to GitHub repository
3. Configure:
   - App location: `frontend`
   - API location: `api`
   - Output location: `dist`
4. Azure automatically builds and deploys

## Project Structure

```
verse-memorization/
├── frontend/              # React + Vite app
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── api/                   # Azure Functions
│   ├── health/
│   ├── verses/
│   └── host.json
├── .devcontainer/         # Codespaces configuration
└── docs/                  # Documentation
```

## Environment Variables

### For Azure Deployment

Configure in Azure Portal → Static Web App → Configuration:

```
DATABASE_PATH=/mnt/database/verses.db
NODE_ENV=production
JWT_SECRET=<generate-secure-secret>
```

Generate secure secret:
```bash
openssl rand -base64 32
```

### For Codespaces

Environment variables are configured in `.devcontainer/devcontainer.json`.

## Development Workflow

1. Make changes in Codespace
2. Test locally (Functions run automatically)
3. Commit and push to GitHub
4. Azure automatically deploys to production

## Common Tasks

### View Logs (Azure)

- Go to Azure Portal
- Navigate to your Static Web App
- Click "Functions" or "Application Insights"
- View execution logs and traces

### Test Functions Locally

Functions run automatically in Codespaces at http://localhost:7071

Test endpoints:
```bash
curl http://localhost:7071/api/health
curl http://localhost:7071/api/verses
```

### Database

The app uses SQLite, stored as a file. In Azure, it's mounted from Azure Storage.

## Troubleshooting

### Codespace Issues

- **Port not forwarding**: Check Ports tab in VS Code
- **Functions not starting**: Check Terminal for errors
- **Dependencies missing**: Run `npm install` in the appropriate directory

### Azure Deployment Issues

See [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section.

## Next Steps

- [API Documentation](./API.md) - Explore the API endpoints
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to Azure
- [Development Guide](./DEVELOPMENT.md) - Development best practices

## Support

- Create an issue on GitHub
- Check existing documentation in `/docs`
- Review Azure Static Web Apps documentation

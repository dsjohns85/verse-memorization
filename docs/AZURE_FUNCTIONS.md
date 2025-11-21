# Azure Static Web Apps + Functions Deployment

This simplified deployment uses **Azure Static Web Apps** with integrated **Azure Functions API** instead of Container Apps.

## Why This Is Simpler

### Before (Container Apps):
- Azure Container Apps (complex, expensive)
- Azure Container Registry
- Log Analytics Workspace
- Complex CI/CD with Docker builds
- **Cost**: ~$50+/month

### After (Static Web Apps + Functions):
- Azure Static Web App (includes frontend + API)
- Azure Storage Account (for SQLite file)
- **Cost**: Free tier or ~$9/month (Standard tier)
- Functions deploy automatically with Static Web App
- No Docker, no container registry, no complex setup

## Architecture

```
┌─────────────────────────────────┐
│  Azure Static Web App           │
│  ┌──────────────┐               │
│  │   Frontend   │  React + Vite │
│  │   (dist/)    │               │
│  └──────────────┘               │
│  ┌──────────────┐               │
│  │   API        │  Azure Funcs  │
│  │   (api/)     │               │
│  └──────────────┘               │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Azure Storage Account          │
│  - SQLite database file         │
│  - Persistent storage           │
└─────────────────────────────────┘
```

## Project Structure

```
verse-memorization/
├── frontend/          # React app (deployed to Static Web App)
├── api/               # Azure Functions (integrated API)
│   ├── health/        # Health check endpoint
│   ├── verses/        # Verses endpoints
│   ├── reviews/       # Reviews endpoints
│   ├── users/         # Users endpoints
│   ├── prisma/        # Prisma schema
│   ├── package.json
│   ├── tsconfig.json
│   └── host.json
├── infra/             # Bicep templates (simplified)
└── staticwebapp.config.json  # Static Web App configuration
```

## Deployment

### Option 1: GitHub Actions (Automatic)

Static Web Apps automatically creates a GitHub Action workflow when you create the resource in Azure Portal.

1. Create Static Web App in Azure Portal
2. Connect to GitHub repository
3. Azure creates `.github/workflows/azure-static-web-apps-*.yml`
4. Every push to main triggers automatic deployment

### Option 2: Azure CLI

```bash
# Create Static Web App with API
az staticwebapp create \
  --name verse-memorization \
  --resource-group rg-verse-memorization \
  --source https://github.com/dsjohns85/verse-memorization \
  --location eastus2 \
  --branch main \
  --app-location "/frontend" \
  --api-location "/api" \
  --output-location "dist" \
  --sku Free
```

### Option 3: Bicep (Infrastructure as Code)

```bash
cd infra
az deployment sub create \
  --location eastus \
  --template-file main.bicep
```

## Local Development

```bash
# Terminal 1: Start API
cd api
npm install
npm run build
func start

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables

### API (.env)
```env
DATABASE_URL=file:./dev.db
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### Azure (Portal or Bicep)
- `DATABASE_URL`: Connection to Azure Storage for SQLite
- `JWT_SECRET`: Secure secret for JWT tokens
- `STORAGE_ACCOUNT_NAME`: Azure Storage account name
- `STORAGE_ACCOUNT_KEY`: Azure Storage account key

## Benefits

1. **Simpler**: No Docker, no container orchestration
2. **Cheaper**: Free tier available, or $9/month for Standard
3. **Integrated**: Functions deploy with Static Web App automatically
4. **Scalable**: Functions auto-scale on demand
5. **Fast**: Global CDN for frontend, serverless backend
6. **Managed**: Azure handles everything (SSL, scaling, monitoring)

## Migration from Container Apps

The backend Express routes are converted to Azure Functions:

- `GET /api/health` → `api/health/index.ts`
- `GET /api/verses` → `api/verses/index.ts`
- `POST /api/verses` → `api/verses/index.ts`
- `GET /api/reviews` → `api/reviews/index.ts`
- etc.

Each function is a standalone HTTP trigger that handles its specific route.

## SQLite in Azure

SQLite file is stored in Azure Storage (Blob or File Share):
- **Mounted as volume** to Functions
- **Persistent** across function executions
- **Shared** between all function instances
- **Backed up** using Azure Storage backup

## Cost Breakdown

### Free Tier
- Static Web App: **Free**
- Functions: 1M requests/month **Free**
- Storage: 5GB **Free**
- **Total: $0/month** (within limits)

### Standard Tier (for production)
- Static Web App: $9/month
- Functions: Pay-per-execution (~$0.20/million)
- Storage: ~$0.02/GB/month
- **Total: ~$10-15/month**

## Next Steps

1. Complete API function migrations (in progress)
2. Update Bicep templates for Static Web App
3. Configure Azure Storage for SQLite
4. Test deployment to Azure
5. Update CI/CD workflow

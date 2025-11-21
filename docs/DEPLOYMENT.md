# Deployment Guide

Complete guide for deploying the Verse Memorization application to Azure using **Azure Static Web Apps with integrated Functions**.

## Architecture

The simplified architecture uses:
- **Azure Static Web App**: Hosts React frontend + Azure Functions backend (integrated)
- **Azure Storage Account**: Stores SQLite database file (optional for now)
- **No containers, no registry, no complex orchestration**

**Cost**: Free tier ($0/month) or Standard ($9/month)

## Prerequisites

- Azure account with active subscription ([Create free account](https://azure.microsoft.com/free/))
- GitHub repository access
- Node.js 20+ for local testing

## Recommended Deployment Method

### Azure Portal (Easiest & Fully Automated) ⭐

**This is the recommended approach** because:
- ✅ Fully automated GitHub integration (OAuth)
- ✅ Auto-generates GitHub Actions workflow
- ✅ Auto-creates GitHub secrets
- ✅ No manual configuration needed
- ✅ Takes 10 minutes total
- ✅ CD (Continuous Deployment) handled automatically by Azure

**CI (Continuous Integration):** The existing `.github/workflows/ci.yml` handles testing and validation.
**CD (Continuous Deployment):** Azure automatically creates and manages the deployment workflow.

**Quick Summary:**

1. **Create Static Web App in Azure Portal**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource" → "Static Web App"
   - Fill in details:
     - **Name**: `verse-memorization`
     - **Region**: East US 2 (or closest to you)
     - **SKU**: Free (or Standard if needed)
     - **Deployment**: GitHub
   - Click "Sign in with GitHub" and authorize

2. **Configure Build Settings**
   - **Organization**: Your GitHub username/org
   - **Repository**: `verse-memorization`
   - **Branch**: `main`
   - **Build Presets**: Custom
   - **App location**: `frontend`
   - **Api location**: `api`
   - **Output location**: `dist`

3. **Click "Review + Create" then "Create"**

4. **Azure automatically**:
   - Creates a GitHub Action workflow in your repo
   - Adds deployment token as a GitHub secret
   - Builds and deploys your app
   - Sets up global CDN
   - Provisions SSL certificate
   - Creates PR preview environments

That's it! Every push to `main` automatically deploys.

### Option 2: Azure CLI

For those who prefer command line:

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name rg-verse-memorization \
  --location eastus2

# Create Static Web App with GitHub integration
az staticwebapp create \
  --name verse-memorization \
  --resource-group rg-verse-memorization \
  --source https://github.com/YOUR-USERNAME/verse-memorization \
  --location eastus2 \
  --branch main \
  --app-location "frontend" \
  --api-location "api" \
  --output-location "dist" \
  --login-with-github
```

This creates the app and connects it to your GitHub repository.

### Option 3: Infrastructure as Code (Bicep) - NOT RECOMMENDED

⚠️ **Important:** Bicep templates are provided but **NOT recommended** for this project.

**Why NOT recommended:**
- Cannot fully automate GitHub integration (still needs manual OAuth or PAT setup)
- Portal is simpler and faster (10 min vs 30+ min)
- Portal handles GitHub workflow generation automatically
- More complex to troubleshoot

**Only use Bicep if:**
- You need multiple environments (dev/staging/prod)
- You have specific IaC compliance requirements
- You're experienced with Bicep and Azure CLI

**If you still want to use it:**
```bash
# Deploy using Bicep template
cd infra
az deployment sub create \
  --location eastus2 \
  --template-file main-staticwebapp.bicep \
  --parameters resourceGroupName=rg-verse-memorization

# Then manually complete GitHub connection in Azure Portal
```

See [infra/README.md](../infra/README.md) for details and limitations.

## Suggested Resource Names

When creating resources in Azure Portal:

**Resource Group:**
- Production: `rg-verse-memorization` or `rg-versemem-prod`
- Development: `rg-versemem-dev`

**Static Web App:**
- Production: `swa-verse-memorization` or `versemem-app`
- Development: `swa-verse-memorization-dev`
- Pattern: `swa-versemem-{env}` (where env = dev, staging, prod)

**Storage Account:** (if needed)
- Must be globally unique, 3-24 chars, lowercase letters/numbers only
- Suggestions: `versememstore`, `versememdb`, `versemem{yourinitials}`

## Configuration

### Environment Variables

Set these in Azure Portal → Your Static Web App → Configuration:

```
DATABASE_PATH=/mnt/database/verses.db
NODE_ENV=production
JWT_SECRET=<generate-secure-random-string>
```

To generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### Storage for SQLite Database

The SQLite file is stored in Azure Storage (mounted to Functions):

1. Go to Azure Portal → Your Storage Account
2. Create a file share named `database`
3. In Static Web App settings, mount the file share to `/mnt/database`

## CI/CD Pipeline

Azure automatically creates `.github/workflows/azure-static-web-apps-*.yml` when you connect to GitHub.

**What it does**:
- Triggers on push to `main`
- Builds frontend (React + Vite)
- Builds API (Azure Functions)
- Deploys both together
- Creates preview environments for PRs

**No custom GitHub Actions needed** - Azure manages everything.

### Preview Environments

Every PR automatically gets a preview URL:
- Format: `https://[unique-id].azurestaticapps.net`
- Full environment with API
- Automatically deleted when PR is closed

## Local Testing

Before deploying, test locally:

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

Access at:
- Frontend: http://localhost:5173
- API: http://localhost:7071

## Monitoring

### View Logs

Azure Portal → Your Static Web App → Application Insights:
- Request traces
- Failed requests
- Performance metrics
- Custom events

### Function Logs

Azure Portal → Your Static Web App → Functions:
- View individual function execution logs
- Monitor performance
- Track errors

## Scaling

### Free Tier Limits
- 100 GB bandwidth/month
- 2 custom domains
- No SLA

### Standard Tier ($9/month)
- Unlimited bandwidth
- Unlimited custom domains
- 99.95% SLA
- Staging environments

Functions auto-scale based on demand (included in both tiers).

## Custom Domain

1. Azure Portal → Your Static Web App → Custom domains
2. Click "Add"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Azure automatically provisions SSL certificate

## Troubleshooting

### Build Failures

Check GitHub Actions tab in your repository:
- View build logs
- Look for npm install errors
- Verify `package.json` in both `frontend/` and `api/` folders

### API Not Working

1. Check API location is set to `api` in portal
2. Verify `host.json` exists in api folder
3. Check function logs in Azure Portal
4. Ensure environment variables are set

### Database Issues

1. Verify storage account is created
2. Check file share `database` exists
3. Ensure file share is mounted to `/mnt/database`
4. Check `DATABASE_PATH` environment variable

### CORS Errors

Static Web Apps handle CORS automatically for integrated APIs. If you see CORS errors:
1. Verify API location is correct (`api`)
2. Check `staticwebapp.config.json` routing configuration

## Rollback

To rollback to a previous version:

1. Go to GitHub → Actions
2. Find the successful deployment you want to restore
3. Re-run that workflow

Or revert the commit:
```bash
git revert <commit-hash>
git push
```

## Cost Optimization

### Free Tier (Recommended for Personal Use)
- **Static Web App**: Free
- **Functions**: 1M requests/month free
- **Storage**: First 5 GB free
- **Total**: $0/month

### Standard Tier (For Production)
- **Static Web App**: $9/month
- **Functions**: ~$0.20 per million requests
- **Storage**: ~$0.02/GB/month
- **Total**: ~$10-15/month

Compare to previous approach:
- **Container Apps**: $30-40/month
- **Container Registry**: $5/month
- **PostgreSQL**: $15-20/month
- **Previous Total**: $50+/month

**Savings: 80-100%**

## Security

- HTTPS enforced automatically
- Managed SSL certificates
- Functions isolated per request
- Azure AD authentication available (if needed)
- Environment variables encrypted at rest

## Next Steps

- Set up custom domain
- Configure authentication (if needed)
- Set up monitoring alerts
- Enable Application Insights
- Configure backup strategy for SQLite file

## Support

- Azure Static Web Apps docs: https://learn.microsoft.com/azure/static-web-apps/
- Azure Functions docs: https://learn.microsoft.com/azure/azure-functions/
- GitHub Issues: https://github.com/dsjohns85/verse-memorization/issues

# Infrastructure - Azure Static Web Apps

⚠️ **IMPORTANT: Azure Portal is the recommended deployment method.**

These Bicep templates are **optional** and provided for advanced scenarios only. They cannot fully automate GitHub integration and still require manual setup steps.

**For most users:** Follow [DEPLOYMENT.md](../docs/DEPLOYMENT.md) to deploy via Azure Portal (takes 10 minutes, fully automated).

**Use Bicep only if:** You need multiple environments (dev/staging/prod) or have specific IaC requirements.

---

This directory contains Bicep templates for deploying the Verse Memorization app to Azure using **Static Web Apps with integrated Functions**.

## What Gets Created

### Main Resources
- **Static Web App**: Hosts frontend + API functions
- **Storage Account**: Stores SQLite database file

### Features Included
- Global CDN for frontend
- Automatic SSL certificates
- Integrated Azure Functions (no separate deployment)
- GitHub Actions workflow (auto-generated)
- PR preview environments

## Deployment

### ⚠️ Limitation: GitHub Integration NOT Fully Automated

Bicep can create Azure resources but **cannot fully automate GitHub integration**. You still need to:
1. Provide a GitHub Personal Access Token (PAT)
2. Manually configure the GitHub connection, OR
3. Let Azure Portal handle it automatically (recommended)

**Recommendation:** Use Azure Portal for initial deployment. It's faster and handles GitHub integration automatically.

### If You Still Want to Use Bicep

```bash
az deployment sub create \
  --location eastus2 \
  --template-file main-staticwebapp.bicep \
  --parameters resourceGroupName=rg-verse-memorization
```

**Then manually:**
1. Go to Azure Portal → Your Static Web App
2. Click "Manage deployment token"
3. Add token to GitHub repository secrets
4. Manually create GitHub Actions workflow OR let Azure connect to GitHub via Portal

### What It Creates
1. Resource Group: `rg-verse-memorization`
2. Static Web App: `verse-memorization-{env}`
3. Storage Account: `versemem{uniqueid}`
4. File Share: `database` (for SQLite file)

## Files

- **main-staticwebapp.bicep**: Main deployment template (new approach)
- **resources-staticwebapp.bicep**: Resources definition
- **main.bicep**: Legacy Container Apps template (deprecated)
- **resources.bicep**: Legacy Container Apps resources (deprecated)

## Cost

### Free Tier (Default)
- Static Web App: **$0**
- Functions: 1M requests/month **$0**
- Storage: 5GB **$0**
- **Total: $0/month**

### Standard Tier (If Needed)
- Static Web App: **$9/month**
- Functions: ~$0.20 per million requests
- Storage: ~$0.02/GB/month
- **Total: ~$10-15/month**

## Why This Is Better

**Previous (Container Apps)**:
- Container Apps: $30-40/month
- Container Registry: $5/month
- PostgreSQL: $15-20/month
- Complex setup with Docker
- **Total: $50+/month**

**Now (Static Web Apps)**:
- Static Web App: Free or $9/month
- Simple setup, no Docker
- **Total: $0-10/month**

**Savings: 80-100%**

## Configuration

After deployment, configure in Azure Portal:

### Environment Variables
```
DATABASE_PATH=/mnt/database/verses.db
NODE_ENV=production
JWT_SECRET=<secure-random-string>
```

### Storage Mount
Mount the file share to Functions:
1. Portal → Static Web App → Configuration
2. Add mount: `/mnt/database` → `database` file share

## GitHub Integration

The Bicep template can optionally configure GitHub integration, but it's easier to do this in the Azure Portal:

1. Create Static Web App in Portal
2. Connect to GitHub
3. Azure creates the deployment workflow automatically

No manual GitHub secrets or workflow configuration needed.

## Monitoring

Use Azure Portal to monitor:
- Application Insights (automatically enabled)
- Function execution logs
- Request traces
- Performance metrics

## Clean Up

To delete all resources:
```bash
az group delete --name rg-verse-memorization --yes
```

## Support

See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for detailed deployment instructions.

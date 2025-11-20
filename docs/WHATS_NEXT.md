# Azure Configuration - What's Next?

This document provides a summary of the Azure configuration setup and what you need to do next.

## What Has Been Done

I've created a comprehensive Azure configuration solution for your Verse Memorization application:

### 📚 Documentation Created

1. **[AZURE_SETUP.md](./AZURE_SETUP.md)** - Comprehensive guide with:
   - Step-by-step setup instructions
   - All Azure CLI commands needed
   - GitHub secrets configuration
   - Azure AD B2C setup (optional)
   - Troubleshooting section
   - Security best practices

2. **[QUICK_START_AZURE.md](./QUICK_START_AZURE.md)** - Quick reference with:
   - 5-step setup process
   - Prerequisites checklist
   - Common commands
   - Validation steps

3. **[scripts/README.md](../scripts/README.md)** - Documentation for helper scripts

### 🔧 Scripts Created

1. **`scripts/setup-azure.sh`** - Automated setup helper:
   - Extracts all Azure configuration values after deployment
   - Creates GitHub Actions service principal
   - Sets up OIDC federated credentials
   - Generates summary file with all values
   - Optionally sets GitHub secrets automatically

2. **`scripts/validate-config.sh`** - Configuration validator:
   - Checks Azure CLI and login status
   - Verifies infrastructure deployment
   - Validates GitHub secrets
   - Checks workflow configuration
   - Reviews environment variables

### 📝 Updates Made

1. **`.github/workflows/deploy.yml`** - Added clear instructions for ACR configuration
2. **`README.md`** - Added prominent links to Azure setup guides
3. **`.gitignore`** - Added entries for generated configuration files

## What You Need to Do Next

### Step 1: Deploy Azure Infrastructure

```bash
# Login to Azure
az login

# Deploy the infrastructure
cd infra
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environment=prod resourceGroupName=rg-verse-memorization \
  --parameters databasePassword="$(openssl rand -base64 32)" \
  --name verse-memorization-deployment
```

### Step 2: Run Setup Script

```bash
cd ..
./scripts/setup-azure.sh
```

This will:
- Extract all configuration values from your deployment
- Create a service principal for GitHub Actions
- Set up federated credentials (OIDC)
- Generate `azure-config.txt` with all values
- Optionally set GitHub secrets (if you have `gh` CLI)

### Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `AZURE_CLIENT_ID` - From setup script output
- `AZURE_TENANT_ID` - From setup script output
- `AZURE_SUBSCRIPTION_ID` - From setup script output
- `ACR_USERNAME` - From setup script output
- `ACR_PASSWORD` - From setup script output
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - From setup script output

The setup script will show you all these values and can set them automatically if you have GitHub CLI installed.

### Step 4: Update Workflow Configuration

Edit `.github/workflows/deploy.yml` and update line 16:

```yaml
CONTAINER_REGISTRY: <your-acr-name-from-setup-script>
```

Replace `<your-acr-name-from-setup-script>` with the actual ACR name (format: `versememorizationacr<unique-suffix>`).

### Step 5: Validate Configuration

```bash
./scripts/validate-config.sh
```

This checks that everything is configured correctly.

### Step 6: Configure Application Settings

```bash
# Get values from setup script output
STATIC_WEB_APP_NAME="<from-setup-script>"
BACKEND_URL="<from-setup-script>"
RESOURCE_GROUP="rg-verse-memorization"

# Configure frontend to use backend
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names VITE_API_URL=https://$BACKEND_URL

# Add ESV API key (get from https://api.esv.org)
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names VITE_ESV_API_KEY=<your-api-key>
```

### Step 7: Deploy!

```bash
git push origin main
```

Monitor deployment in GitHub Actions: Repository → Actions tab

## Key Configuration Points

### 1. Container Registry Name
**Issue**: The Bicep template generates a unique ACR name (e.g., `versememorizationacrabcd1234`), but the workflow uses a hardcoded name.

**Solution**: After deployment, update the `CONTAINER_REGISTRY` environment variable in `.github/workflows/deploy.yml` with the actual ACR name.

### 2. GitHub Secrets
**Issue**: GitHub Actions needs credentials to deploy to Azure.

**Solution**: Use the `setup-azure.sh` script to get all required values and set them as GitHub secrets (or use `gh` CLI for automatic setup).

### 3. OIDC Authentication
**Issue**: Traditional service principal credentials are long-lived and less secure.

**Solution**: The setup script configures federated credentials (OIDC) for secure, short-lived tokens.

### 4. Application Environment Variables
**Issue**: Frontend and backend need to know their URLs and API keys.

**Solution**: Use Azure CLI to set environment variables in Static Web App and Container App.

## Architecture Overview

```
GitHub Repository
    ↓ (push to main)
GitHub Actions Workflow
    ↓ (OIDC authentication)
Azure Resources:
    - Container Registry (stores Docker images)
    - Container Apps (runs backend)
    - Static Web Apps (hosts frontend)
    - PostgreSQL (database)
    - Log Analytics (monitoring)
```

## Important Files

- **`infra/main.bicep`** - Infrastructure definition
- **`.github/workflows/deploy.yml`** - Deployment pipeline
- **`scripts/setup-azure.sh`** - Setup automation
- **`scripts/validate-config.sh`** - Configuration validation
- **`docs/AZURE_SETUP.md`** - Detailed setup guide
- **`docs/QUICK_START_AZURE.md`** - Quick reference

## Troubleshooting

### Common Issues

1. **"Deployment not found"**
   - Run the infrastructure deployment first (Step 1)

2. **"Image not found" during deployment**
   - Verify GitHub secrets are correct
   - Check ACR name in workflow matches deployed ACR

3. **"Authentication failed" in GitHub Actions**
   - Verify OIDC secrets (client ID, tenant ID, subscription ID)
   - Check federated credential was created correctly

4. **Frontend can't connect to backend**
   - Configure `VITE_API_URL` in Static Web App settings
   - Check CORS configuration in backend

### Get Help

- **Quick Start**: [QUICK_START_AZURE.md](./QUICK_START_AZURE.md)
- **Detailed Guide**: [AZURE_SETUP.md](./AZURE_SETUP.md)
- **Scripts Help**: [scripts/README.md](../scripts/README.md)
- **Infrastructure**: [infra/README.md](../infra/README.md)

## Summary

Your Azure configuration is now ready! The main steps are:

1. ✅ Documentation created (AZURE_SETUP.md, QUICK_START_AZURE.md)
2. ✅ Helper scripts created (setup-azure.sh, validate-config.sh)
3. ✅ Workflow updated with clear instructions
4. ✅ README updated with Azure setup links
5. ⏳ **You need to**: Deploy infrastructure and run setup script
6. ⏳ **You need to**: Configure GitHub secrets
7. ⏳ **You need to**: Update workflow with ACR name
8. ⏳ **You need to**: Deploy to Azure

Follow the steps above or use the [Quick Start Guide](./QUICK_START_AZURE.md) to get started!

## Optional: Azure AD B2C Setup

If you want user authentication with Azure AD B2C (for sign-in with Apple ID or email):

See [AZURE_SETUP.md - Section 8](./AZURE_SETUP.md#8-configure-azure-ad-b2c-optional---for-authentication) for detailed instructions.

This is optional and can be done after initial deployment.

## Security Reminders

⚠️ **Important:**
- Never commit `azure-config.txt` or `.env` files
- Use strong, randomly generated passwords
- Rotate credentials regularly
- Use Azure Key Vault for production secrets
- Review and minimize service principal permissions

## Questions?

If you have questions or run into issues:
1. Check the troubleshooting sections in the documentation
2. Review the scripts README for common issues
3. Run `./scripts/validate-config.sh` to identify configuration problems
4. Create a GitHub issue with error details and script output

Good luck with your Azure deployment! 🚀

# Quick Azure Configuration Guide

This is a quick reference for configuring Azure for the Verse Memorization application. For detailed instructions, see [AZURE_SETUP.md](./AZURE_SETUP.md).

## Prerequisites Checklist

- [ ] Azure account with active subscription
- [ ] Azure CLI installed (`az --version`)
- [ ] Logged in to Azure (`az login`)
- [ ] GitHub repository cloned locally
- [ ] (Optional) GitHub CLI for automated secret management

## Quick Setup (5 Steps)

### 1. Deploy Infrastructure

```bash
cd infra

# Generate a secure password
DB_PASSWORD=$(openssl rand -base64 32)

# Deploy to Azure
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environment=prod resourceGroupName=rg-verse-memorization \
  --parameters databasePassword="$DB_PASSWORD" \
  --name verse-memorization-deployment
```

### 2. Extract Configuration

```bash
cd ..
./scripts/setup-azure.sh
```

This script will:
- Extract all Azure resource names and URLs
- Create/find the service principal for GitHub Actions
- Set up federated credentials for OIDC
- Generate a summary file with all values
- (Optional) Automatically set GitHub secrets if you have `gh` CLI

### 3. Configure GitHub Secrets

The `setup-azure.sh` script will output all required secrets. Add them to GitHub:

**Via GitHub CLI (if installed):**
```bash
# The setup script can do this automatically, or manually:
gh secret set AZURE_CLIENT_ID --body "<value>"
gh secret set AZURE_TENANT_ID --body "<value>"
gh secret set AZURE_SUBSCRIPTION_ID --body "<value>"

> **Note:** You do not need to set ACR_USERNAME or ACR_PASSWORD secrets when using OIDC authentication with `az acr login` in your GitHub Actions workflows.
**Via GitHub Web UI:**
Go to: Repository → Settings → Secrets and variables → Actions → New repository secret

### 4. Update Workflow Configuration

Edit `.github/workflows/deploy.yml` and update the `CONTAINER_REGISTRY` value:

```yaml
env:
  CONTAINER_REGISTRY: <your-acr-name-from-setup-script>  # e.g., versememorizationacrabcd1234
```

### 5. Configure Application Settings

```bash
# Get the ACR and app names from the setup script output
STATIC_WEB_APP_NAME="<from-setup-script>"
BACKEND_URL="<from-setup-script>"
RESOURCE_GROUP="rg-verse-memorization"

# Configure frontend to point to backend
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names VITE_API_URL=https://$BACKEND_URL

# Add your ESV API key (get free key from https://api.esv.org)
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names VITE_ESV_API_KEY=<your-esv-api-key>
```

## Validation

Run the validation script to check if everything is configured correctly:

```bash
./scripts/validate-config.sh
```

This will check:
- Azure CLI installation and login
- Infrastructure deployment status
- GitHub secrets configuration
- Workflow file configuration
- Environment files

## Deploy

Once everything is configured, push to main to trigger deployment:

```bash
git push origin main
```

Monitor the deployment in GitHub Actions: Repository → Actions tab

## Get Your App URLs

```bash
# Frontend URL
az deployment sub show \
  --name verse-memorization-deployment \
  --query 'properties.outputs.staticWebAppUrl.value' \
  -o tsv

# Backend URL  
az deployment sub show \
  --name verse-memorization-deployment \
  --query 'properties.outputs.containerAppUrl.value' \
  -o tsv
```

## Troubleshooting

### "Deployment not found"
Run the infrastructure deployment first (Step 1)

### "Container Registry name mismatch"
Update the `CONTAINER_REGISTRY` in `.github/workflows/deploy.yml` with the actual ACR name from the setup script

### "Image not found" during deployment
1. Check GitHub secrets are set correctly
2. Ensure ACR credentials are valid
3. Verify the workflow ran successfully

### GitHub Actions authentication fails
1. Verify OIDC secrets are set correctly
2. Check federated credential was created
3. Ensure service principal has contributor role

## Common Commands

```bash
# View backend logs
az containerapp logs show \
  --name verse-memorization-backend-prod \
  --resource-group rg-verse-memorization \
  --follow

# List all resources
az resource list \
  --resource-group rg-verse-memorization \
  --output table

# Update backend image
az containerapp update \
  --name verse-memorization-backend-prod \
  --resource-group rg-verse-memorization \
  --image <your-acr>.azurecr.io/verse-memorization-backend:latest
```

## Next Steps After Setup

1. **Configure Azure AD B2C** (optional) - For user authentication
   - See [AZURE_SETUP.md](./AZURE_SETUP.md#8-configure-azure-ad-b2c-optional---for-authentication)

2. **Set up monitoring** - Configure alerts and dashboards
   - Application Insights integration
   - Log Analytics queries

3. **Production hardening**
   - Use Azure Key Vault for secrets
   - Configure private endpoints
   - Set up staging environment
   - Configure custom domain

4. **Cost optimization**
   - Review resource sizing
   - Set up auto-scaling
   - Monitor usage

## Get Help

- **Detailed setup guide**: [AZURE_SETUP.md](./AZURE_SETUP.md)
- **Deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Infrastructure details**: [../infra/README.md](../infra/README.md)
- **GitHub Issues**: Create an issue if you encounter problems

## Security Reminder

⚠️ **Never commit these files:**
- `azure-config.txt` (generated by setup script)
- `.env` files with real credentials
- Any files containing passwords or API keys

Add to `.gitignore` if not already present:
```
azure-config.txt
.env
.env.local
*.secret
```

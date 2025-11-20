# Azure Setup Guide

This guide walks you through setting up Azure infrastructure and GitHub secrets for the Verse Memorization application.

## Overview

This application requires:
- Azure subscription with permission to create resources
- GitHub repository with Actions enabled
- Azure CLI installed locally

## Step-by-Step Setup

### 1. Install Prerequisites

```bash
# Install Azure CLI (if not already installed)
# Windows: https://aka.ms/installazurecliwindows
# macOS: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Verify installation
az --version

# Install GitHub CLI (optional, for easier secret management)
# https://cli.github.com/
gh --version
```

### 2. Login to Azure

```bash
# Login to your Azure account
az login

# List available subscriptions
az account list --output table

# Set the subscription you want to use
az account set --subscription "Your Subscription Name or ID"

# Verify the correct subscription is selected
az account show --output table
```

### 3. Deploy Azure Infrastructure

```bash
# Clone the repository (if not already done)
git clone https://github.com/dsjohns85/verse-memorization.git
cd verse-memorization

# Generate a strong database password (save this securely!)
# On Linux/macOS:
DB_PASSWORD=$(openssl rand -base64 32)
echo "Database Password: $DB_PASSWORD"

# On Windows (PowerShell):
# $DB_PASSWORD = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
# Write-Host "Database Password: $DB_PASSWORD"

# Deploy the infrastructure
cd infra
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environment=prod resourceGroupName=rg-verse-memorization \
  --parameters databasePassword="$DB_PASSWORD" \
  --name verse-memorization-deployment

# Save the deployment outputs
az deployment sub show \
  --name verse-memorization-deployment \
  --query properties.outputs \
  --output json > deployment-outputs.json

# Display the outputs
cat deployment-outputs.json
```

**Important:** Save the deployment outputs! You'll need these values for GitHub secrets.

### 4. Get Azure Configuration Values

After deployment, extract the required values:

```bash
# Get the resource group name
RESOURCE_GROUP="rg-verse-memorization"

# Get Container Registry credentials
ACR_NAME=$(az deployment sub show --name verse-memorization-deployment --query 'properties.outputs.containerRegistryName.value' -o tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query 'passwords[0].value' -o tsv)

echo "Container Registry Name: $ACR_NAME"
echo "Container Registry Username: $ACR_USERNAME"
echo "Container Registry Password: $ACR_PASSWORD"

# Get Static Web App deployment token
STATIC_WEB_APP_NAME=$(az deployment sub show --name verse-memorization-deployment --query 'properties.outputs.staticWebAppUrl.value' -o tsv | sed 's/https:\/\///' | cut -d'.' -f1)
STATIC_WEB_APP_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.apiKey -o tsv)

echo "Static Web App Name: $STATIC_WEB_APP_NAME"
echo "Static Web App Token: $STATIC_WEB_APP_TOKEN"
```

### 5. Configure GitHub OIDC Authentication

For secure deployment, set up OIDC (OpenID Connect) authentication:

```bash
# Get your subscription and tenant IDs
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)

echo "Subscription ID: $SUBSCRIPTION_ID"
echo "Tenant ID: $TENANT_ID"

# Create a service principal with federated credentials
APP_NAME="verse-memorization-github-actions"
REPO_OWNER="dsjohns85"
REPO_NAME="verse-memorization"

# Create service principal
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name $APP_NAME \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --json-auth)

APP_ID=$(echo $SP_OUTPUT | jq -r .clientId)
echo "Application (Client) ID: $APP_ID"

# Create federated credential for main branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters "{
    \"name\": \"github-deploy-main\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:$REPO_OWNER/$REPO_NAME:ref:refs/heads/main\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }"

echo "✓ Federated credential created for main branch"
```

### 6. Configure GitHub Secrets

You need to configure the following secrets in your GitHub repository.

**Using GitHub CLI (Recommended):**

```bash
cd /path/to/verse-memorization

# Set GitHub secrets
gh secret set AZURE_CLIENT_ID --body "$APP_ID"
gh secret set AZURE_TENANT_ID --body "$TENANT_ID"
gh secret set AZURE_SUBSCRIPTION_ID --body "$SUBSCRIPTION_ID"
gh secret set ACR_USERNAME --body "$ACR_USERNAME"
gh secret set ACR_PASSWORD --body "$ACR_PASSWORD"
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "$STATIC_WEB_APP_TOKEN"

echo "✓ All GitHub secrets configured!"
```

**Using GitHub Web UI:**

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of the following:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `AZURE_CLIENT_ID` | Application (Client) ID | From service principal creation output |
| `AZURE_TENANT_ID` | Tenant ID | `az account show --query tenantId -o tsv` |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID | `az account show --query id -o tsv` |
| `ACR_USERNAME` | Container Registry username | `az acr credential show --name <acr-name> --query username -o tsv` |
| `ACR_PASSWORD` | Container Registry password | `az acr credential show --name <acr-name> --query 'passwords[0].value' -o tsv` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Static Web App deployment token | `az staticwebapp secrets list --name <name> --resource-group <rg> --query properties.apiKey -o tsv` |

### 7. Update Deployment Workflow

The deployment workflow needs to use the dynamically-named Container Registry. Update the workflow environment variable:

```yaml
env:
  CONTAINER_REGISTRY: <your-acr-name-from-deployment>  # Example: versememorizationacrabcd1234
```

You can get this value from:
```bash
az deployment sub show --name verse-memorization-deployment --query 'properties.outputs.containerRegistryName.value' -o tsv
```

### 8. Configure Azure AD B2C (Optional - for Authentication)

If you want to enable user authentication with Azure AD B2C:

#### Create B2C Tenant

1. Go to Azure Portal
2. Search for "Azure AD B2C" and click "Create"
3. Choose "Create a new Azure AD B2C Tenant"
4. Fill in the details:
   - Organization name: `verse-memorization`
   - Initial domain name: `versememorization` (or your choice)
   - Country/Region: Select your region
5. Click "Review + create"

#### Register Application

1. In your B2C tenant, go to "App registrations"
2. Click "New registration"
3. Fill in:
   - Name: `Verse Memorization`
   - Redirect URI: 
     - Type: Single-page application (SPA)
     - URL: `https://<your-static-web-app-url>/auth/callback`
4. Note the **Application (client) ID**

#### Create User Flow

1. Go to "User flows" in your B2C tenant
2. Click "New user flow"
3. Select "Sign up and sign in"
4. Name it: `B2C_1_signupsignin`
5. Select identity providers:
   - Email signup
   - (Optional) Apple, Google, etc.
6. Select user attributes to collect
7. Click "Create"

#### Configure Application Environment Variables

Add these to your Container App and Static Web App:

**Backend (Container App):**
```bash
az containerapp update \
  --name verse-memorization-backend-prod \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    AZURE_AD_B2C_TENANT_NAME=versememorization \
    AZURE_AD_B2C_CLIENT_ID=<your-client-id> \
    AZURE_AD_B2C_POLICY_NAME=B2C_1_signupsignin \
    AZURE_AD_B2C_ISSUER=https://versememorization.b2clogin.com/<tenant-id>/v2.0/
```

**Frontend (Static Web App):**
```bash
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names \
    VITE_AZURE_AD_CLIENT_ID=<your-client-id> \
    VITE_AZURE_AD_AUTHORITY=https://versememorization.b2clogin.com/versememorization.onmicrosoft.com/B2C_1_signupsignin \
    VITE_AZURE_AD_KNOWN_AUTHORITIES=versememorization.b2clogin.com
```

### 9. Configure ESV API Key (Required for Verse Lookup)

The application uses the ESV Bible API for verse lookup:

1. Go to https://api.esv.org
2. Sign up for a free API key
3. Configure it in your Static Web App:

```bash
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names VITE_ESV_API_KEY=<your-esv-api-key>
```

### 10. Initial Deployment

Now that everything is configured, trigger your first deployment:

```bash
# Make sure you're on the main branch
git checkout main

# Push to trigger the deployment workflow
git push origin main
```

Monitor the deployment in GitHub Actions:
1. Go to your repository on GitHub
2. Click on **Actions** tab
3. Watch the "Deploy to Azure" workflow

### 11. Verify Deployment

After successful deployment:

```bash
# Get your application URLs
FRONTEND_URL=$(az deployment sub show --name verse-memorization-deployment --query 'properties.outputs.staticWebAppUrl.value' -o tsv)
BACKEND_URL=$(az deployment sub show --name verse-memorization-deployment --query 'properties.outputs.containerAppUrl.value' -o tsv)

echo "Frontend URL: https://$FRONTEND_URL"
echo "Backend URL: https://$BACKEND_URL"

# Update frontend API URL configuration
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names VITE_API_URL=https://$BACKEND_URL
```

Visit your frontend URL to see the application!

## Troubleshooting

### Deployment Fails with "Image not found"

**Problem:** The Container App can't find the Docker image in ACR.

**Solution:** 
1. Verify ACR credentials are correct in GitHub secrets
2. Check that the image was successfully built and pushed
3. Ensure the Container App has access to ACR

### Static Web App Deployment Fails

**Problem:** Frontend deployment fails with authentication error.

**Solution:**
1. Verify the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is correct
2. Regenerate the token if needed:
   ```bash
   az staticwebapp secrets list --name <name> --resource-group <rg>
   ```

### Database Connection Fails

**Problem:** Backend can't connect to PostgreSQL.

**Solution:**
1. Check firewall rules in Azure Portal
2. Verify the DATABASE_URL secret in Container App
3. Ensure the database exists and migrations ran successfully

### OIDC Authentication Fails

**Problem:** GitHub Actions can't authenticate to Azure.

**Solution:**
1. Verify the federated credential subject matches your repository
2. Check that the service principal has contributor role
3. Ensure all three values (client ID, tenant ID, subscription ID) are correct

## Security Best Practices

1. **Never commit secrets** - Always use Azure Key Vault or GitHub Secrets
2. **Rotate credentials regularly** - Especially ACR passwords and API tokens
3. **Use OIDC** - Prefer federated credentials over long-lived secrets
4. **Enable private endpoints** - For production database access
5. **Use managed identities** - Where possible for Azure resource access
6. **Enable monitoring** - Set up alerts for suspicious activity

## Next Steps

- [ ] Set up custom domain for Static Web App
- [ ] Configure CDN for better performance
- [ ] Enable Application Insights for monitoring
- [ ] Set up staging environment
- [ ] Configure automated backups
- [ ] Set up log alerts and monitoring dashboards

## Useful Commands Reference

```bash
# View Container App logs
az containerapp logs show \
  --name verse-memorization-backend-prod \
  --resource-group rg-verse-memorization \
  --follow

# List all resources in the resource group
az resource list \
  --resource-group rg-verse-memorization \
  --output table

# Check deployment status
az deployment sub show \
  --name verse-memorization-deployment

# Delete all resources (cleanup)
az group delete \
  --name rg-verse-memorization \
  --yes --no-wait
```

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Azure Container App logs
3. Check GitHub Actions workflow logs
4. Review the [DEPLOYMENT.md](./DEPLOYMENT.md) for additional details
5. Create an issue on GitHub with error details

# Deployment Guide

This guide covers deploying the Verse Memorization application to Azure.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed and configured
- Docker installed (for building images)
- GitHub repository with secrets configured

## Architecture Overview

The application uses the following Azure services:

- **Azure Static Web Apps**: Hosts the React frontend
- **Azure Container Apps**: Hosts the Node.js backend
- **Azure Database for PostgreSQL**: Stores application data
- **Azure Container Registry**: Stores Docker images
- **Azure Log Analytics**: Monitoring and logging

## Manual Deployment

### 1. Deploy Infrastructure

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "Your Subscription Name"

# Deploy Bicep templates
cd infra
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environment=prod
```

This will create all necessary Azure resources.

### 2. Configure Secrets

After deployment, you'll need to update the following:

#### Backend Environment Variables

In Azure Container Apps, configure these environment variables:

- `DATABASE_URL`: PostgreSQL connection string (auto-configured)
- `NODE_ENV`: production
- `JWT_SECRET`: Generate a strong secret
- `AZURE_AD_B2C_TENANT_NAME`: Your Azure AD B2C tenant
- `AZURE_AD_B2C_CLIENT_ID`: Your app registration client ID
- `AZURE_AD_B2C_POLICY_NAME`: Your sign-in policy name

#### Frontend Environment Variables

In Azure Static Web Apps, configure:

- `VITE_API_URL`: Your Container App URL
- `VITE_AZURE_AD_CLIENT_ID`: Your app registration client ID
- `VITE_AZURE_AD_AUTHORITY`: Your B2C authority URL

### 3. Build and Push Backend Image

```bash
# Get ACR credentials
az acr credential show --name <your-acr-name>

# Login to ACR
az acr login --name <your-acr-name>

# Build and push backend image
cd backend
docker build -t <your-acr-name>.azurecr.io/verse-memorization-backend:latest .
docker push <your-acr-name>.azurecr.io/verse-memorization-backend:latest
```

### 4. Update Container App

```bash
az containerapp update \
  --name verse-memorization-backend-prod \
  --resource-group rg-verse-memorization \
  --image <your-acr-name>.azurecr.io/verse-memorization-backend:latest
```

### 5. Run Database Migrations

```bash
# Connect to your Container App
az containerapp exec \
  --name verse-memorization-backend-prod \
  --resource-group rg-verse-memorization \
  --command /bin/sh

# Inside the container
npx prisma migrate deploy
```

### 6. Deploy Frontend

The frontend is deployed via GitHub Actions (see CI/CD section below).

## CI/CD with GitHub Actions

The repository includes GitHub Actions workflows for automated deployment.

### Setup GitHub Secrets

Configure these secrets in your GitHub repository:

#### Recommended: OIDC Authentication (Federated Identity)

For enhanced security, use OIDC authentication instead of long-lived credentials:

1. **Create Federated Identity Credentials**:
   ```bash
   # Create service principal
   az ad sp create-for-rbac \
     --name "verse-memorization-sp" \
     --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/rg-verse-memorization
   
   # Note the appId, then create federated credential
   az ad app federated-credential create \
     --id <app-id> \
     --parameters '{
       "name": "github-deploy",
       "issuer": "https://token.actions.githubusercontent.com",
       "subject": "repo:dsjohns85/verse-memorization:ref:refs/heads/main",
       "audiences": ["api://AzureADTokenExchange"]
     }'
   ```

2. **Configure GitHub Secrets** (Variables, not secrets):
   - `AZURE_CLIENT_ID`: Application (client) ID from the service principal
   - `AZURE_TENANT_ID`: Your Azure tenant ID
   - `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID

3. **ACR_USERNAME**: Container Registry username
   ```bash
   az acr credential show --name <your-acr-name> --query username -o tsv
   ```

4. **ACR_PASSWORD**: Container Registry password
   ```bash
   az acr credential show --name <your-acr-name> --query passwords[0].value -o tsv
   ```

5. **AZURE_STATIC_WEB_APPS_API_TOKEN**: Get from Static Web App
   ```bash
   az staticwebapp secrets list \
     --name verse-memorization-frontend-prod \
     --query properties.apiKey -o tsv
   ```

#### Alternative: Service Principal with Credentials (Not Recommended)

If you prefer traditional authentication (not recommended for security reasons):

1. **AZURE_CREDENTIALS**: Service principal credentials
   ```bash
   az ad sp create-for-rbac \
     --name "verse-memorization-sp" \
     --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/rg-verse-memorization \
     --sdk-auth
   ```
   Copy the JSON output to the secret.

**Note**: The deployment workflow in `.github/workflows/deploy.yml` is already configured to use OIDC authentication with `azure/login@v2`.

### Automated Deployment

Once secrets are configured:

1. **On Pull Request**: CI workflow runs tests and builds
2. **On Push to Main**: Deploy workflow runs and deploys to production

## Azure AD B2C Setup

### 1. Create Azure AD B2C Tenant

1. Go to Azure Portal
2. Create a new Azure AD B2C tenant
3. Note the tenant name

### 2. Register Application

1. In B2C tenant, go to "App registrations"
2. Click "New registration"
3. Set name: "Verse Memorization"
4. Set redirect URI: `https://<your-frontend-url>/auth/callback`
5. Note the Application (client) ID

### 3. Configure User Flows

1. Go to "User flows" in B2C
2. Create a new "Sign up and sign in" flow
3. Name it: `B2C_1_signupsignin`
4. Select identity providers:
   - Email signup
   - Apple (configure Apple ID)
5. Configure user attributes and claims

### 4. Update Application Configuration

Update the environment variables in both frontend and backend with your B2C configuration.

## Monitoring and Logging

### View Logs

```bash
# Backend logs
az containerapp logs show \
  --name verse-memorization-backend-prod \
  --resource-group rg-verse-memorization \
  --follow

# Frontend logs
az staticwebapp show \
  --name verse-memorization-frontend-prod \
  --resource-group rg-verse-memorization
```

### Application Insights

The application uses Log Analytics for monitoring. To view metrics:

1. Go to Azure Portal
2. Navigate to your Container App
3. Click "Logs" or "Metrics"

## Scaling

### Backend Scaling

Container Apps automatically scale based on:
- HTTP traffic
- CPU usage
- Memory usage

Configure scaling in the Bicep template or via Azure Portal.

### Database Scaling

To scale the PostgreSQL database:

```bash
az postgres flexible-server update \
  --resource-group rg-verse-memorization \
  --name <your-db-name> \
  --sku-name Standard_D2ds_v4 \
  --tier GeneralPurpose
```

## Backup and Recovery

### Database Backups

Azure PostgreSQL Flexible Server automatically creates backups:
- Retention: 7 days (configurable)
- Point-in-time restore available

To restore:

```bash
az postgres flexible-server restore \
  --resource-group rg-verse-memorization \
  --name <restored-server-name> \
  --source-server <source-server-name> \
  --restore-time "2025-11-19T14:00:00Z"
```

## Security Considerations

### Production Checklist

- [ ] Use Azure Key Vault for secrets
- [ ] Enable managed identities
- [ ] Configure network security groups
- [ ] Enable private endpoints for database
- [ ] Use strong, randomly generated passwords
- [ ] Enable Azure AD authentication
- [ ] Set up HTTPS only
- [ ] Configure CORS properly
- [ ] Enable application firewall
- [ ] Set up monitoring and alerts

## Cost Optimization

### Development Environment

- Use Free tier for Static Web Apps
- Use Burstable tier for PostgreSQL
- Use Basic tier for Container Registry
- Scale Container Apps to 0-1 replicas

### Production Environment

- Use Standard tier for Static Web Apps (if needed)
- Use General Purpose tier for PostgreSQL
- Use Standard tier for Container Registry
- Configure auto-scaling for Container Apps

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check firewall rules
   - Verify connection string
   - Ensure database is running

2. **Container App Not Starting**
   - Check logs: `az containerapp logs show`
   - Verify environment variables
   - Check image exists in registry

3. **Frontend Not Loading**
   - Verify API URL is correct
   - Check CORS configuration
   - Verify Static Web App deployment

## Rollback

To rollback to a previous version:

```bash
# Rollback Container App
az containerapp revision list \
  --name verse-memorization-backend-prod \
  --resource-group rg-verse-memorization

az containerapp revision activate \
  --revision <revision-name> \
  --resource-group rg-verse-memorization
```

## Next Steps

- Set up monitoring alerts
- Configure custom domain
- Enable CDN for frontend
- Set up staging environment
- Configure automated backups

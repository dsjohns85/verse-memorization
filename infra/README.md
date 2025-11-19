# Verse Memorization - Infrastructure

This directory contains the Azure infrastructure as code (IaC) using Bicep.

## Resources Created

- **Resource Group**: Container for all resources
- **Static Web App**: Hosts the React frontend
- **Container App**: Hosts the Node.js backend API
- **PostgreSQL Flexible Server**: Database for storing verses and reviews
- **Container Registry**: Stores Docker images
- **Log Analytics Workspace**: Monitoring and logging
- **Container Apps Environment**: Managed environment for Container Apps

## Prerequisites

- Azure CLI installed
- Azure subscription
- Appropriate permissions to create resources

## Deployment

### 1. Login to Azure

```bash
az login
```

### 2. Set Subscription (if you have multiple)

```bash
az account set --subscription "Your Subscription Name"
```

### 3. Deploy Infrastructure

```bash
# Deploy to dev environment
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environment=dev

# Deploy to production
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environment=prod resourceGroupName=rg-verse-memorization-prod
```

### 4. Get Deployment Outputs

```bash
az deployment sub show \
  --name resources-deployment \
  --query properties.outputs
```

## Configuration

After deployment, update your application configuration:

1. **Frontend (.env)**:
   - `VITE_API_URL`: Use the Container App URL from outputs
   - Configure Azure AD B2C settings

2. **Backend (.env)**:
   - `DATABASE_URL`: Automatically configured via Container App secrets
   - Configure Azure AD B2C settings

## Cost Estimation (Dev Environment)

- Static Web App: Free tier
- Container App: ~$10-30/month (Basic tier)
- PostgreSQL: ~$15-30/month (Burstable B1ms)
- Container Registry: ~$5/month (Basic)
- Log Analytics: Pay-as-you-go (~$2-5/month for small usage)

**Estimated Total**: $32-70/month for development

## Security Notes

⚠️ **Important**: The Bicep templates use placeholder passwords. In production:

1. Use Azure Key Vault for secrets
2. Enable managed identities
3. Configure proper network security groups
4. Enable private endpoints for database
5. Use strong, randomly generated passwords
6. Enable Azure AD authentication for PostgreSQL

## Clean Up

To delete all resources:

```bash
az group delete --name rg-verse-memorization --yes
```

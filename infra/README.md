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
  --parameters environment=dev databasePassword='YourSecurePassword123!'

# Deploy to production  
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environment=prod \
    resourceGroupName=rg-verse-memorization-prod \
    databasePassword='YourSecurePassword123!'
```

**Important**: Always use a strong, unique password for the database. In production, consider using Azure Key Vault to manage secrets.

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

✅ **Enhanced Security**: The Bicep templates use secure parameters for sensitive data:

1. **Database Password**: Use the `databasePassword` parameter (marked as `@secure()`)
   ```bash
   az deployment sub create ... --parameters databasePassword='YourPassword'
   ```

2. **Azure Key Vault**: For production, integrate Azure Key Vault:
   - Store database password in Key Vault
   - Reference secrets in Bicep using Key Vault references
   - Enable managed identities for secure access

3. **Best Practices**:
   - Use strong, randomly generated passwords
   - Never commit passwords to source control
   - Rotate credentials regularly
   - Enable Azure AD authentication for PostgreSQL
   - Use private endpoints for database connections

**Example with Key Vault** (recommended for production):
```bicep
param keyVaultName string
param secretName string

resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' existing = {
  name: keyVaultName
  
  resource secret 'secrets' existing = {
    name: secretName
  }
}

// Use in PostgreSQL resource
administratorLoginPassword: keyVault::secret.properties.value
```

## Clean Up

To delete all resources:

```bash
az group delete --name rg-verse-memorization --yes
```

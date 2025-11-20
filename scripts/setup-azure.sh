#!/bin/bash

# Azure Setup Helper Script
# This script helps extract configuration values after deploying infrastructure

set -e
set -u
set -o pipefail

echo "==========================================="
echo "Verse Memorization - Azure Setup Helper"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI is not installed.${NC}"
    echo "Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}You are not logged in to Azure. Running 'az login'...${NC}"
    az login
fi

echo -e "${GREEN}✓ Azure CLI is installed and logged in${NC}"
echo ""

# Get configuration
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-verse-memorization-deployment}"
RESOURCE_GROUP="${RESOURCE_GROUP:-rg-verse-memorization}"

echo "Configuration:"
echo "  Deployment Name: $DEPLOYMENT_NAME"
echo "  Resource Group: $RESOURCE_GROUP"
echo ""

# Check if deployment exists
if ! az deployment sub show --name "$DEPLOYMENT_NAME" &> /dev/null; then
    echo -e "${RED}Error: Deployment '$DEPLOYMENT_NAME' not found.${NC}"
    echo ""
    echo "Please deploy the infrastructure first:"
    echo "  cd infra"
    echo "  az deployment sub create \\"
    echo "    --location eastus \\"
    echo "    --template-file main.bicep \\"
    echo "    --parameters environment=prod \\"
    echo "    --parameters databasePassword='YourSecurePassword' \\"
    echo "    --name $DEPLOYMENT_NAME"
    exit 1
fi

echo -e "${GREEN}✓ Deployment found${NC}"
echo ""

# Extract values
echo "Extracting configuration values..."
echo ""

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)
ACR_NAME=$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.containerRegistryName.value' -o tsv 2>/dev/null || echo "")
STATIC_WEB_APP_URL=$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.staticWebAppUrl.value' -o tsv 2>/dev/null || echo "")
BACKEND_URL=$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.containerAppUrl.value' -o tsv 2>/dev/null || echo "")

# OIDC authentication is used; ACR username/password are not needed.

# Get Static Web App name from URL
if [ -n "$STATIC_WEB_APP_URL" ]; then
    STATIC_WEB_APP_NAME=$(echo "$STATIC_WEB_APP_URL" | sed 's/https\?:\/\///' | cut -d'.' -f1)
    STATIC_WEB_APP_TOKEN=$(az staticwebapp secrets list \
        --name "$STATIC_WEB_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query properties.apiKey -o tsv 2>/dev/null || echo "")
else
    STATIC_WEB_APP_NAME=""
    STATIC_WEB_APP_TOKEN=""
fi

# Display results
echo -e "${BLUE}=== Azure Configuration Values ===${NC}"
echo ""
echo -e "${GREEN}Subscription & Tenant:${NC}"
echo "  AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo "  AZURE_TENANT_ID: $TENANT_ID"
echo ""

echo -e "${GREEN}Container Registry:${NC}"
echo "  ACR Name: $ACR_NAME"
echo "  ACR_USERNAME: $ACR_USERNAME"
echo "  ACR_PASSWORD: $ACR_PASSWORD"
echo ""

echo -e "${GREEN}Application URLs:${NC}"
echo "  Frontend URL: https://$STATIC_WEB_APP_URL"
echo "  Backend URL: https://$BACKEND_URL"
echo ""

echo -e "${GREEN}Static Web App:${NC}"
echo "  Name: $STATIC_WEB_APP_NAME"
echo "  AZURE_STATIC_WEB_APPS_API_TOKEN: $STATIC_WEB_APP_TOKEN"
echo ""

# Check if service principal exists
echo -e "${YELLOW}Checking for GitHub Actions service principal...${NC}"
SP_NAME="verse-memorization-github-actions"
SP_APP_ID=$(az ad sp list --display-name "$SP_NAME" --query '[0].appId' -o tsv 2>/dev/null || echo "")

if [ -n "$SP_APP_ID" ]; then
    echo -e "${GREEN}✓ Service principal found${NC}"
    echo "  AZURE_CLIENT_ID: $SP_APP_ID"
    echo ""
else
    echo -e "${YELLOW}Service principal not found. Creating...${NC}"
    
    # Create service principal with federated credentials
    SP_OUTPUT=$(az ad sp create-for-rbac \
        --name "$SP_NAME" \
        --role contributor \
        --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
        --query '{clientId: appId}' -o json)
    
    SP_APP_ID=$(echo "$SP_OUTPUT" | jq -r .clientId)
    
    echo -e "${GREEN}✓ Service principal created${NC}"
    echo "  AZURE_CLIENT_ID: $SP_APP_ID"
    echo ""
    
    # Create federated credential for GitHub Actions
    echo -e "${YELLOW}Creating federated credential for GitHub Actions...${NC}"
    
    # Prompt for repository details
    read -p "Enter GitHub repository owner (default: dsjohns85): " REPO_OWNER
    REPO_OWNER=${REPO_OWNER:-dsjohns85}
    
    read -p "Enter GitHub repository name (default: verse-memorization): " REPO_NAME
    REPO_NAME=${REPO_NAME:-verse-memorization}
    
    az ad app federated-credential create \
        --id "$SP_APP_ID" \
        --parameters "{
            \"name\": \"github-deploy-main\",
            \"issuer\": \"https://token.actions.githubusercontent.com\",
            \"subject\": \"repo:$REPO_OWNER/$REPO_NAME:ref:refs/heads/main\",
            \"audiences\": [\"api://AzureADTokenExchange\"]
        }" > /dev/null
    
    echo -e "${GREEN}✓ Federated credential created for main branch${NC}"
    echo ""
fi

# Generate summary file
SUMMARY_FILE="azure-config.txt"
cat > "$SUMMARY_FILE" << EOF
# Azure Configuration Summary
# Generated: $(date)

# GitHub Secrets - Add these to your GitHub repository settings
AZURE_CLIENT_ID=$SP_APP_ID
AZURE_TENANT_ID=$TENANT_ID
AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID
AZURE_STATIC_WEB_APPS_API_TOKEN=$STATIC_WEB_APP_TOKEN

# Note: ACR authentication uses OIDC via the Azure login action
# No ACR username/password secrets are needed

# GitHub Workflow Environment Variables
# Update these in .github/workflows/deploy.yml
CONTAINER_REGISTRY=$ACR_NAME

# Application URLs
FRONTEND_URL=https://$STATIC_WEB_APP_URL
BACKEND_URL=https://$BACKEND_URL

# Resource Names
RESOURCE_GROUP=$RESOURCE_GROUP
STATIC_WEB_APP_NAME=$STATIC_WEB_APP_NAME
ACR_NAME=$ACR_NAME

# Next Steps:
# 1. Add the GitHub Secrets listed above to your repository
# 2. Update CONTAINER_REGISTRY in .github/workflows/deploy.yml
# 3. Configure VITE_API_URL in Static Web App settings:
#    az staticwebapp appsettings set \\
#      --name $STATIC_WEB_APP_NAME \\
#      --resource-group $RESOURCE_GROUP \\
#      --setting-names VITE_API_URL=https://$BACKEND_URL
EOF

echo -e "${GREEN}✓ Configuration summary saved to: $SUMMARY_FILE${NC}"
echo ""

# Offer to set GitHub secrets using gh CLI
if command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI detected. Would you like to set the secrets automatically? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Setting GitHub secrets..."
        gh secret set AZURE_CLIENT_ID --body "$SP_APP_ID"
        gh secret set AZURE_TENANT_ID --body "$TENANT_ID"
        gh secret set AZURE_SUBSCRIPTION_ID --body "$SUBSCRIPTION_ID"
        gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "$STATIC_WEB_APP_TOKEN"
        echo -e "${GREEN}✓ GitHub secrets configured!${NC}"
    fi
else
    echo -e "${YELLOW}Tip: Install GitHub CLI (gh) to automatically set secrets${NC}"
    echo "Install from: https://cli.github.com/"
fi

echo ""
echo -e "${BLUE}=== Setup Complete! ===${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the configuration in: $SUMMARY_FILE"
echo "  2. Update CONTAINER_REGISTRY in .github/workflows/deploy.yml to: $ACR_NAME"
echo "  3. Add GitHub secrets (if not done automatically)"
echo "  4. Configure environment variables for your applications"
echo "  5. Push to main branch to trigger deployment"
echo ""
echo "For detailed instructions, see: docs/AZURE_SETUP.md"

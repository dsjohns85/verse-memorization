#!/bin/bash

# Configuration Validation Script
# This script checks if all required Azure configurations are in place

set -e

echo "==========================================="
echo "Azure Configuration Validator"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if a value exists
check_value() {
    local name=$1
    local value=$2
    local is_secret=$3
    
    if [ -z "$value" ] || [ "$value" == "your-"* ] || [ "$value" == "YourSecure"* ]; then
        echo -e "${RED}✗ $name is not configured${NC}"
        ((ERRORS++))
    else
        if [ "$is_secret" == "true" ]; then
            echo -e "${GREEN}✓ $name is configured (value hidden)${NC}"
        else
            echo -e "${GREEN}✓ $name: $value${NC}"
        fi
    fi
}

# Function to check GitHub secret
check_github_secret() {
    local name=$1
    
    if command -v gh &> /dev/null; then
        if gh secret list | grep -q "^$name"; then
            echo -e "${GREEN}✓ GitHub Secret: $name is set${NC}"
        else
            echo -e "${RED}✗ GitHub Secret: $name is NOT set${NC}"
            ((ERRORS++))
        fi
    else
        echo -e "${YELLOW}⚠ Cannot verify GitHub secret $name (gh CLI not installed)${NC}"
        ((WARNINGS++))
    fi
}

echo "Checking Azure CLI..."
if ! command -v az &> /dev/null; then
    echo -e "${RED}✗ Azure CLI is not installed${NC}"
    echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi
echo -e "${GREEN}✓ Azure CLI is installed${NC}"
echo ""

echo "Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo -e "${RED}✗ Not logged in to Azure${NC}"
    echo "Run: az login"
    exit 1
fi
echo -e "${GREEN}✓ Logged in to Azure${NC}"
echo ""

# Check deployment
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-verse-memorization-deployment}"
RESOURCE_GROUP="${RESOURCE_GROUP:-rg-verse-memorization}"

echo "Checking Azure deployment..."
if az deployment sub show --name "$DEPLOYMENT_NAME" &> /dev/null; then
    echo -e "${GREEN}✓ Deployment '$DEPLOYMENT_NAME' exists${NC}"
    
    # Get deployment outputs
    ACR_NAME=$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.containerRegistryName.value' -o tsv 2>/dev/null || echo "")
    STATIC_WEB_APP_URL=$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.staticWebAppUrl.value' -o tsv 2>/dev/null || echo "")
    BACKEND_URL=$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.containerAppUrl.value' -o tsv 2>/dev/null || echo "")
    
    echo ""
    echo "Deployment outputs:"
    check_value "Container Registry" "$ACR_NAME" "false"
    check_value "Frontend URL" "$STATIC_WEB_APP_URL" "false"
    check_value "Backend URL" "$BACKEND_URL" "false"
else
    echo -e "${RED}✗ Deployment '$DEPLOYMENT_NAME' not found${NC}"
    echo "Run the infrastructure deployment first. See docs/AZURE_SETUP.md"
    ((ERRORS++))
fi
echo ""

# Check GitHub secrets
echo "Checking GitHub Secrets..."
if command -v gh &> /dev/null; then
    check_github_secret "AZURE_CLIENT_ID"
    check_github_secret "AZURE_TENANT_ID"
    check_github_secret "AZURE_SUBSCRIPTION_ID"
    check_github_secret "ACR_USERNAME"
    check_github_secret "ACR_PASSWORD"
    check_github_secret "AZURE_STATIC_WEB_APPS_API_TOKEN"
else
    echo -e "${YELLOW}⚠ GitHub CLI not installed, cannot check secrets${NC}"
    echo "Install from: https://cli.github.com/"
    ((WARNINGS++))
fi
echo ""

# Check workflow configuration
echo "Checking GitHub Actions workflow configuration..."
WORKFLOW_FILE=".github/workflows/deploy.yml"
if [ -f "$WORKFLOW_FILE" ]; then
    WORKFLOW_ACR=$(grep "CONTAINER_REGISTRY:" "$WORKFLOW_FILE" | grep -v "#" | awk '{print $2}' | head -1)
    
    if [ -n "$ACR_NAME" ] && [ "$WORKFLOW_ACR" != "$ACR_NAME" ]; then
        echo -e "${RED}✗ CONTAINER_REGISTRY in workflow ($WORKFLOW_ACR) doesn't match deployed ACR ($ACR_NAME)${NC}"
        echo "  Update CONTAINER_REGISTRY in $WORKFLOW_FILE to: $ACR_NAME"
        ((ERRORS++))
    elif [ "$WORKFLOW_ACR" == "versememorizationacr" ]; then
        echo -e "${YELLOW}⚠ CONTAINER_REGISTRY in workflow is using default value${NC}"
        echo "  Update CONTAINER_REGISTRY in $WORKFLOW_FILE with your actual ACR name"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ CONTAINER_REGISTRY is configured: $WORKFLOW_ACR${NC}"
    fi
else
    echo -e "${RED}✗ Workflow file not found: $WORKFLOW_FILE${NC}"
    ((ERRORS++))
fi
echo ""

# Check backend environment configuration
echo "Checking backend environment file..."
BACKEND_ENV="backend/.env"
if [ -f "$BACKEND_ENV" ]; then
    echo -e "${GREEN}✓ Backend .env file exists${NC}"
    
    # Read and check values (without exposing them)
    if grep -q "^DATABASE_URL=" "$BACKEND_ENV"; then
        DB_URL=$(grep "^DATABASE_URL=" "$BACKEND_ENV" | cut -d'=' -f2 | tr -d '"')
        if [[ "$DB_URL" == *"localhost"* ]]; then
            echo -e "${YELLOW}⚠ DATABASE_URL is set to localhost (OK for local dev)${NC}"
        else
            echo -e "${GREEN}✓ DATABASE_URL is configured${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ DATABASE_URL not set in $BACKEND_ENV${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "^JWT_SECRET=" "$BACKEND_ENV"; then
        JWT_SECRET=$(grep "^JWT_SECRET=" "$BACKEND_ENV" | cut -d'=' -f2 | tr -d '"')
        if [[ "$JWT_SECRET" == *"change-in-production"* ]]; then
            echo -e "${YELLOW}⚠ JWT_SECRET is using default value (change for production)${NC}"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✓ JWT_SECRET is configured${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ JWT_SECRET not set in $BACKEND_ENV${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠ Backend .env file not found (OK if using Azure environment variables)${NC}"
    ((WARNINGS++))
fi
echo ""

# Check frontend environment configuration
echo "Checking frontend environment file..."
FRONTEND_ENV="frontend/.env"
if [ -f "$FRONTEND_ENV" ]; then
    echo -e "${GREEN}✓ Frontend .env file exists${NC}"
    
    if grep -q "^VITE_API_URL=" "$FRONTEND_ENV"; then
        API_URL=$(grep "^VITE_API_URL=" "$FRONTEND_ENV" | cut -d'=' -f2)
        if [[ "$API_URL" == *"localhost"* ]]; then
            echo -e "${YELLOW}⚠ VITE_API_URL is set to localhost (OK for local dev)${NC}"
        else
            echo -e "${GREEN}✓ VITE_API_URL is configured: $API_URL${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ VITE_API_URL not set in $FRONTEND_ENV${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "^VITE_ESV_API_KEY=" "$FRONTEND_ENV"; then
        ESV_KEY=$(grep "^VITE_ESV_API_KEY=" "$FRONTEND_ENV" | cut -d'=' -f2)
        if [[ "$ESV_KEY" == *"your-esv-api-key"* ]]; then
            echo -e "${YELLOW}⚠ VITE_ESV_API_KEY is using placeholder value${NC}"
            echo "  Get a free API key from: https://api.esv.org"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✓ VITE_ESV_API_KEY is configured${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ VITE_ESV_API_KEY not set in $FRONTEND_ENV${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠ Frontend .env file not found (OK if using Azure environment variables)${NC}"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "==========================================="
echo "Validation Summary"
echo "==========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Configuration looks good.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Configuration complete with $WARNINGS warning(s)${NC}"
    echo "Review warnings above for production deployment recommendations."
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Action required:"
    echo "  1. Fix the errors listed above"
    echo "  2. Run scripts/setup-azure.sh to configure Azure"
    echo "  3. See docs/AZURE_SETUP.md for detailed instructions"
    exit 1
fi

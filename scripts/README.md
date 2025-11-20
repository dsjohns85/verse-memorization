# Helper Scripts

This directory contains helper scripts for Azure configuration and validation.

## Available Scripts

### `setup-azure.sh`

Automated Azure setup helper that extracts configuration values after infrastructure deployment.

**What it does:**
- Checks Azure CLI installation and login status
- Verifies infrastructure deployment
- Extracts all required configuration values (ACR, URLs, etc.)
- Creates/finds GitHub Actions service principal
- Sets up federated credentials for OIDC authentication
- Generates a summary file (`azure-config.txt`) with all values
- Optionally sets GitHub secrets automatically (if `gh` CLI is installed)

**Usage:**
```bash
./scripts/setup-azure.sh
```

**Environment variables (optional):**
- `DEPLOYMENT_NAME`: Name of the Azure deployment (default: `verse-memorization-deployment`)
- `RESOURCE_GROUP`: Name of the resource group (default: `rg-verse-memorization`)

**Example:**
```bash
# Use custom deployment name
DEPLOYMENT_NAME=my-deployment ./scripts/setup-azure.sh
```

**Output:**
- Console output with all configuration values
- `azure-config.txt`: Summary file with all values (added to .gitignore)

### `validate-config.sh`

Configuration validation script that checks if all required Azure configurations are in place.

**What it checks:**
- Azure CLI installation and login
- Infrastructure deployment status
- GitHub secrets (if `gh` CLI is installed)
- Workflow configuration (ACR name)
- Backend environment variables
- Frontend environment variables

**Usage:**
```bash
./scripts/validate-config.sh
```

**Exit codes:**
- `0`: All checks passed or only warnings
- `1`: One or more errors found

**Example output:**
```
✓ Azure CLI is installed
✓ Logged in to Azure
✓ Deployment 'verse-memorization-deployment' exists
✓ Container Registry: versememorizationacrabcd1234
✓ GitHub Secret: AZURE_CLIENT_ID is set
⚠ VITE_API_URL is set to localhost (OK for local dev)
```

## Common Workflows

### Initial Azure Setup

```bash
# 1. Deploy infrastructure (from repo root)
cd infra
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environment=prod databasePassword="$(openssl rand -base64 32)" \
  --name verse-memorization-deployment

# 2. Run setup script
cd ..
./scripts/setup-azure.sh

# 3. Follow prompts and review generated azure-config.txt

# 4. Validate everything is configured
./scripts/validate-config.sh
```

### Checking Configuration Status

```bash
# Quick check if everything is configured correctly
./scripts/validate-config.sh
```

### Updating Configuration

```bash
# Re-run setup script after infrastructure changes
./scripts/setup-azure.sh

# Validate the new configuration
./scripts/validate-config.sh
```

## Requirements

### Required Tools

- **Azure CLI**: For interacting with Azure resources
  - Install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
  - Check: `az --version`

### Optional Tools

- **GitHub CLI**: For automated GitHub secret management
  - Install: https://cli.github.com/
  - Check: `gh --version`
  - Login: `gh auth login`

- **jq**: For JSON parsing (usually pre-installed on Linux/macOS)
  - Install: `sudo apt-get install jq` or `brew install jq`

## Troubleshooting

### "Command not found: az"
Install Azure CLI from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

### "You are not logged in to Azure"
Run `az login` and follow the prompts

### "Deployment not found"
Ensure you've deployed the infrastructure first:
```bash
cd infra
az deployment sub create --location eastus --template-file main.bicep \
  --parameters environment=prod databasePassword="SecurePassword123!" \
  --name verse-memorization-deployment
```

### "Cannot verify GitHub secrets"
Install GitHub CLI (`gh`) and authenticate:
```bash
gh auth login
```

### Permission errors
Ensure you have:
- Contributor role on the Azure subscription/resource group
- Admin access to the GitHub repository (for setting secrets)

## Security Notes

⚠️ **Important:**

1. **Never commit `azure-config.txt`**: This file contains sensitive values and is automatically added to `.gitignore`

2. **Protect script outputs**: The scripts display sensitive information like passwords and tokens. Run in a secure environment.

3. **Use OIDC**: The setup script configures federated credentials (OIDC) by default, which is more secure than long-lived credentials.

4. **Rotate credentials**: Regularly rotate ACR passwords, API tokens, and other credentials.

5. **Review permissions**: Ensure service principals have minimal required permissions.

## Contributing

When adding new scripts:
1. Make them executable: `chmod +x scripts/new-script.sh`
2. Add bash shebang: `#!/bin/bash`
3. Use `set -e` for error handling
4. Add color-coded output for better UX
5. Document in this README

## Support

For issues with scripts:
1. Check the troubleshooting section above
2. Review [AZURE_SETUP.md](../docs/AZURE_SETUP.md) for detailed setup instructions
3. Create an issue on GitHub with script output and error messages

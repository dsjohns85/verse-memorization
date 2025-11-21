// Simplified Bicep template for Azure Static Web Apps + Functions
targetScope = 'subscription'

@description('The name of the resource group')
param resourceGroupName string = 'rg-verse-memorization'

@description('The location for all resources')
param location string = 'eastus2'

@description('The name prefix for all resources')
param appName string = 'verse-memorization'

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

// Create Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
}

// Deploy resources
module resources './resources-staticwebapp.bicep' = {
  name: 'resources-deployment'
  scope: rg
  params: {
    location: location
    appName: appName
    environment: environment
  }
}

output resourceGroupName string = rg.name
output staticWebAppUrl string = resources.outputs.staticWebAppUrl
output staticWebAppName string = resources.outputs.staticWebAppName
output storageAccountName string = resources.outputs.storageAccountName

// Main Bicep template for Verse Memorization App
targetScope = 'subscription'

@description('The name of the resource group')
param resourceGroupName string = 'rg-verse-memorization'

@description('The location for all resources')
param location string = 'eastus'

@description('The name prefix for all resources')
param appName string = 'verse-memorization'

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@secure()
@description('Administrator password for PostgreSQL server')
param databasePassword string

// Create Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
}

// Deploy resources
module resources './resources.bicep' = {
  name: 'resources-deployment'
  scope: rg
  params: {
    location: location
    appName: appName
    environment: environment
    databasePassword: databasePassword
  }
}

output resourceGroupName string = rg.name
output staticWebAppUrl string = resources.outputs.staticWebAppUrl
output containerAppUrl string = resources.outputs.containerAppUrl

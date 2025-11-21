// Resources Bicep template for Static Web App + Functions
param location string
param appName string
param environment string

var uniqueSuffix = uniqueString(resourceGroup().id)

// Storage Account for SQLite database
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${appName}${uniqueSuffix}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// File Share for SQLite database
resource fileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2023-01-01' = {
  name: '${storageAccount.name}/default/database'
  properties: {
    shareQuota: 5120
  }
}

// Static Web App with integrated API (Functions)
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: '${appName}-${environment}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: 'https://github.com/dsjohns85/verse-memorization'
    branch: 'main'
    buildProperties: {
      appLocation: '/frontend'
      apiLocation: '/api'
      outputLocation: 'dist'
    }
  }
}

// App Settings for Static Web App (includes Functions config)
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2022-09-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    DATABASE_URL: 'file:/mnt/database/prod.db'
    NODE_ENV: 'production'
    STORAGE_ACCOUNT_NAME: storageAccount.name
    STORAGE_ACCOUNT_KEY: storageAccount.listKeys().keys[0].value
  }
}

output staticWebAppUrl string = staticWebApp.properties.defaultHostname
output staticWebAppName string = staticWebApp.name
output storageAccountName string = storageAccount.name

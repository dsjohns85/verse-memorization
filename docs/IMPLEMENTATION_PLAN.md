# Azure Static Web Apps Implementation Plan

## Decision: GitHub Integration + Integrated Functions + No Prisma

Based on your requirements for "the simplest way", here's the recommended approach with consistent implementation across all areas.

---

## 🎯 DEPLOYMENT APPROACH: GitHub Integration

### Why This Approach
1. **Zero DevOps complexity** - Azure creates and manages the GitHub Action
2. **Free builds** - No GitHub Actions minutes consumed
3. **Automatic PR previews** - Free staging environments
4. **Simplest setup** - Point Azure at repo, done

### What Azure Does Automatically
- Creates `.github/workflows/azure-static-web-apps-*.yml`
- Builds frontend and API on every push
- Deploys to production
- Creates preview environments for PRs
- Manages SSL certificates
- Provides global CDN

### When to Use Manual Build Instead
❌ **Don't use** for simple apps (like this one)
✅ **Do use** if you need:
- Custom build tools not supported by Azure
- Complex pre/post deployment steps
- Multi-cloud deployment
- Advanced testing pipelines

---

## 📁 REPO STRUCTURE (Consistent)

```
verse-memorization/
├── frontend/                    # React + Vite
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── api/                        # Azure Functions (Integrated)
│   ├── health/
│   │   └── index.ts
│   ├── verses/
│   │   └── index.ts
│   ├── reviews/
│   │   └── index.ts
│   ├── users/
│   │   └── index.ts
│   ├── utils/
│   │   └── db.ts              # SQLite helper
│   ├── schema.sql             # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── host.json
│
├── infra/                      # Bicep templates
│   ├── main.bicep             # Simple: just Static Web App
│   └── resources.bicep
│
├── staticwebapp.config.json   # SWA routing config
├── setup.sh                    # Local dev setup
└── README.md

# NOT NEEDED (removed):
❌ backend/                     # Old Express app
❌ docker-compose.yml          # Not needed for Azure
❌ api/prisma/                 # Prisma removed
❌ .github/workflows/ci.yml    # Azure creates this
```

---

## 🗄️ DATABASE: Remove Prisma, Use better-sqlite3

### Why Remove Prisma

| Aspect | Prisma | better-sqlite3 |
|--------|--------|----------------|
| **Simplicity** | Complex schema DSL | Simple SQL |
| **Build Step** | Needs `prisma generate` | No build step |
| **Cold Start** | ~800ms | ~100ms |
| **Bundle Size** | ~15MB | ~2MB |
| **Code** | ORM abstraction | Direct SQL (clearer) |
| **Maintenance** | More dependencies | One dependency |

### Implementation

#### 1. Database Schema (schema.sql)
```sql
-- api/schema.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS verses (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  translation TEXT DEFAULT 'ESV',
  userId TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  verseId TEXT NOT NULL,
  userId TEXT NOT NULL,
  quality INTEGER NOT NULL,
  easeFactor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  nextReviewAt INTEGER NOT NULL,
  reviewedAt INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (verseId) REFERENCES verses(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_verses_userId ON verses(userId);
CREATE INDEX idx_reviews_userId ON reviews(userId);
CREATE INDEX idx_reviews_verseId ON reviews(verseId);
CREATE INDEX idx_reviews_nextReviewAt ON reviews(nextReviewAt);
```

#### 2. Database Helper (utils/db.ts)
```typescript
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || '/mnt/database/verses.db';
    db = new Database(dbPath);
    
    // Initialize schema if needed
    const schema = readFileSync(join(__dirname, '../schema.sql'), 'utf-8');
    db.exec(schema);
  }
  return db;
}

export function generateId(): string {
  return crypto.randomUUID();
}
```

#### 3. Example Function (verses/index.ts)
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDb, generateId } from '../utils/db';

export async function getVerses(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  const db = getDb();
  const email = req.headers.get('x-user-email') || 'test@example.com';
  
  // Get or create user
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    const id = generateId();
    const now = Date.now();
    db.prepare('INSERT INTO users (id, email, createdAt, updatedAt) VALUES (?, ?, ?, ?)')
      .run(id, email, now, now);
    user = { id, email };
  }
  
  // Get verses
  const verses = db.prepare('SELECT * FROM verses WHERE userId = ? ORDER BY createdAt DESC')
    .all(user.id);
  
  return { status: 200, jsonBody: verses };
}

app.http('verses', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'verses',
  handler: getVerses
});
```

---

## 🏗️ INFRASTRUCTURE (Bicep)

### Simple Bicep Template
```bicep
// infra/main.bicep
targetScope = 'subscription'

param resourceGroupName string = 'rg-verse-memorization'
param location string = 'eastus2'

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
}

module staticWebApp './resources.bicep' = {
  name: 'static-web-app'
  scope: rg
  params: {
    location: location
  }
}

output staticWebAppUrl string = staticWebApp.outputs.url
```

```bicep
// infra/resources.bicep
param location string

// Storage for SQLite database
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'versemem${uniqueString(resourceGroup().id)}'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
}

resource fileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2023-01-01' = {
  name: '${storage.name}/default/database'
  properties: { shareQuota: 5 }
}

// Static Web App with integrated Functions
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'verse-memorization'
  location: location
  sku: { name: 'Free' }
  properties: {
    repositoryUrl: 'https://github.com/dsjohns85/verse-memorization'
    branch: 'main'
    buildProperties: {
      appLocation: 'frontend'
      apiLocation: 'api'
      outputLocation: 'dist'
    }
  }
}

output url string = staticWebApp.properties.defaultHostname
```

---

## ⚙️ CONFIGURATION

### staticwebapp.config.json
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*"]
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "platform": {
    "apiRuntime": "node:18"
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  }
}
```

### api/package.json
```json
{
  "name": "api",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "func start"
  },
  "dependencies": {
    "@azure/functions": "^4.0.0",
    "better-sqlite3": "^9.2.2"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.8",
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3"
  }
}
```

---

## 🚀 CI/CD (Auto-Generated by Azure)

Azure creates this file automatically when you connect the repo:

```yaml
# .github/workflows/azure-static-web-apps-xxx.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "frontend"
          api_location: "api"
          output_location: "dist"
```

**You don't create this file** - Azure does it when you:
1. Create Static Web App in Azure Portal
2. Select "GitHub" as source
3. Authorize GitHub access
4. Select repo and branch

---

## 📋 DEPLOYMENT STEPS

### 1. Create Static Web App in Azure
```bash
az staticwebapp create \
  --name verse-memorization \
  --resource-group rg-verse-memorization \
  --source https://github.com/dsjohns85/verse-memorization \
  --location eastus2 \
  --branch main \
  --app-location "frontend" \
  --api-location "api" \
  --output-location "dist" \
  --sku Free
```

### 2. Azure Does Everything Else
- Creates GitHub Action workflow
- Sets up deployment token
- Configures build pipeline
- Deploys on every push
- Creates PR previews automatically

### 3. Configure Environment Variables (in Azure Portal)
- `DATABASE_PATH=/mnt/database/verses.db`
- `JWT_SECRET=<generate-secure-secret>`

---

## 🎯 SUMMARY: Consistent Approach

| Component | Approach | Reason |
|-----------|----------|--------|
| **Deployment** | GitHub Integration | Simplest, zero DevOps |
| **Functions** | Integrated (in /api) | Single deployment |
| **Database** | better-sqlite3 | No Prisma overhead |
| **CI/CD** | Auto-generated by Azure | Zero maintenance |
| **Infra** | Simple Bicep | Just SWA + Storage |
| **Build** | Azure-managed | Free, automatic |

### Alignment with Your Philosophy
✅ "The simplest way" - GitHub Integration is simplest
✅ "Don't build a million things" - No Prisma, no custom CI/CD
✅ "SQLite is ok for prod" - better-sqlite3 performs great
✅ "Change when needed" - Can switch to manual build later if needed

### What This Removes
- ❌ Complex Container Apps setup
- ❌ Container Registry
- ❌ Custom GitHub Actions
- ❌ Docker complexity
- ❌ Prisma ORM overhead
- ❌ Migration management
- ❌ Code generation steps

### What You Get
- ✅ One command to deploy (connect GitHub to Azure)
- ✅ Automatic deployments on push
- ✅ Free PR preview environments
- ✅ Simple SQL queries
- ✅ Fast cold starts
- ✅ Small deployment bundles
- ✅ Easy to understand and maintain

---

## 💰 COST

- **Free Tier**: $0/month (100GB bandwidth, 2 custom domains)
- **Standard**: $9/month (if you need more)
- **Functions**: Free (1M requests/month included)
- **Storage**: ~$0.02/GB/month for SQLite file

**Total: $0-10/month** (vs $50+ with Container Apps)

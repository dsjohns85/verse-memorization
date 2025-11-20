# Simple Deployment Guide

This guide shows you how to deploy the Verse Memorization app with **minimal cost** and complexity, while keeping it fully functional and cloud-native.

## 🎯 Quick Start (Free Tier Options)

### Option 1: Railway.app (Recommended) 🚂

Railway offers a generous free tier perfect for this app.

1. **Fork the repository** on GitHub

2. **Sign up at [Railway.app](https://railway.app)** with your GitHub account

3. **Create a new project** from your forked repo:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `verse-memorization` fork

4. **Add a PostgreSQL database**:
   - In your Railway project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable

5. **Configure environment variables** for the backend service:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=generate-a-random-secret-here
   ```
   
   Note: Railway automatically sets `DATABASE_URL` when you add PostgreSQL. Make sure to update your build command to use the PostgreSQL schema (see "Database Options" section).

6. **Deploy!** Railway will automatically:
   - Build your app
   - Run database migrations
   - Deploy your backend and frontend
   - Provide you with URLs

**Cost**: Free tier includes:
- $5 monthly credit
- 500 hours of execution time
- More than enough for this app

### Option 2: Render.com 🎨

Render offers a free tier that works great for this app.

1. **Sign up at [Render.com](https://render.com)**

2. **Create a PostgreSQL database**:
   - Click "New +" → "PostgreSQL"
   - Choose the Free plan
   - Note the Internal Database URL

3. **Deploy the backend**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Build Command: `cd backend && npm install && npx prisma generate && npm run build`
     - Start Command: `cd backend && npx prisma migrate deploy && npm start`
     - Environment Variables:
       ```
       DATABASE_URL=<your-postgres-url>
       NODE_ENV=production
       PORT=3001
       JWT_SECRET=generate-a-random-secret
       ```
       
   Note: For PostgreSQL, you need to use the PostgreSQL schema. See deployment notes below.

4. **Deploy the frontend**:
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - Build Command: `cd frontend && npm install && npm run build`
     - Publish Directory: `frontend/dist`
     - Environment Variables:
       ```
       VITE_API_URL=<your-backend-url>
       ```

**Cost**: Free tier includes:
- 750 hours per month for web services
- Free PostgreSQL database (90-day expiration, but data persists)

### Option 3: Fly.io 🪰

Fly.io offers a generous free tier and excellent performance.

1. **Install the Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up and log in**:
   ```bash
   fly auth signup  # or fly auth login
   ```

3. **Deploy the backend**:
   ```bash
   cd backend
   fly launch
   # Follow the prompts, select a region near you
   # Choose "Yes" when asked to set up a Postgres database
   ```

4. **Set environment variables**:
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set JWT_SECRET=$(openssl rand -base64 32)
   ```
   
   Note: Fly.io automatically sets `DATABASE_URL` when you add PostgreSQL

5. **Deploy the frontend**:
   ```bash
   cd ../frontend
   fly launch
   fly secrets set VITE_API_URL=https://your-backend-url.fly.dev
   ```

**Cost**: Free tier includes:
- Up to 3 shared-cpu-1x VMs with 256MB RAM
- 3GB persistent volume storage
- 160GB outbound data transfer

## 🐳 Docker Deployment (Self-Hosted)

For maximum control and cost savings, deploy to your own server (e.g., DigitalOcean Droplet, AWS EC2, VPS).

### Simple Single-Container Setup

1. **Clone the repository** on your server:
   ```bash
   git clone https://github.com/yourusername/verse-memorization.git
   cd verse-memorization
   ```

2. **Create a `.env` file** in the backend directory:
   ```bash
   cat > backend/.env << EOF
   DATABASE_URL=file:./prod.db
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=$(openssl rand -base64 32)
   EOF
   ```
   
   Note: This uses SQLite. For PostgreSQL, see "Database Options" below.

3. **Start with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **Access your app**:
   - Frontend: http://your-server:5173
   - Backend API: http://your-server:3001

### Production Setup with Nginx

For a production setup with SSL:

1. **Install Docker and Docker Compose**

2. **Create a production docker-compose.yml**:
   ```yaml
   version: '3.8'
   
   services:
     backend:
       build: ./backend
       restart: unless-stopped
       environment:
         DATABASE_URL: file:./data/prod.db
         NODE_ENV: production
         PORT: 3001
         JWT_SECRET: ${JWT_SECRET}
       volumes:
         - ./data:/app/data
       expose:
         - 3001
     
     frontend:
       build: ./frontend
       restart: unless-stopped
       environment:
         VITE_API_URL: https://yourdomain.com/api
       expose:
         - 80
     
     nginx:
       image: nginx:alpine
       restart: unless-stopped
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./certbot/conf:/etc/letsencrypt
         - ./certbot/www:/var/www/certbot
       depends_on:
         - backend
         - frontend
   ```

3. **Set up SSL with Let's Encrypt**:
   ```bash
   # Install certbot
   sudo apt install certbot
   
   # Get certificate
   sudo certbot certonly --standalone -d yourdomain.com
   ```

**Cost**: 
- VPS (DigitalOcean): $4-6/month for a basic droplet
- Domain: ~$10-15/year

## 💾 Database Options

### SQLite (Simplest)
- **Use for**: Development, personal use, small deployments
- **Pros**: No setup required, file-based, zero config
- **Cons**: Not suitable for high concurrency
- **Cost**: Free
- **Setup**: Default schema works out of the box

### PostgreSQL (Recommended for Production)
- **Use for**: Production, multiple users
- **Pros**: Full-featured, battle-tested, handles concurrent users
- **Cons**: Requires a database server
- **Cost**: Free tier available on Railway, Render, Fly.io
- **Setup**: Copy `schema.postgresql.prisma` to `schema.prisma` before deploying

## Important Note on Database Schema

The app uses **SQLite by default** (schema.prisma). For PostgreSQL deployments:

```bash
# Before deploying with PostgreSQL
cd backend/prisma
cp schema.postgresql.prisma schema.prisma
```

Or add this to your deployment build command:
```bash
cd backend && cp prisma/schema.postgresql.prisma prisma/schema.prisma && npm install && npx prisma generate && npm run build
```

## 🔑 Authentication

The app uses simple development mode authentication:
- In development: Uses `X-User-Email` header
- No complex Azure AD B2C setup required
- Perfect for personal use or small teams

For production, you can:
1. Keep the simple auth (good for personal use)
2. Add proper JWT-based authentication (see backend auth.ts)
3. Integrate with OAuth providers if needed

## 📊 Cost Comparison

| Platform | Monthly Cost | Setup Complexity | Best For |
|----------|-------------|------------------|----------|
| **Railway** | Free - $5 | ⭐ Very Easy | Quick start |
| **Render** | Free | ⭐⭐ Easy | Free hosting |
| **Fly.io** | Free - $5 | ⭐⭐ Medium | Performance |
| **Self-hosted (VPS)** | $4-6 | ⭐⭐⭐ Advanced | Full control |
| **Azure (Previous)** | $50+ | ⭐⭐⭐⭐⭐ Complex | Enterprise |

## 🚀 Recommended Path

1. **Start with Railway**: Deploy in 5 minutes, test the app
2. **If it works for you**: Stick with Railway's free tier
3. **Need more control?**: Move to self-hosted Docker deployment
4. **Growing team?**: Consider upgrading to Railway/Render paid tiers

## ⚡ Quick Deploy Commands

### Railway (with CLI)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Fly.io (with CLI)
```bash
cd backend && fly launch
cd ../frontend && fly launch
```

### Docker Compose (local/VPS)
```bash
docker-compose up -d
```

## 📝 Notes

- All free tiers are sufficient for personal use and small groups
- SQLite works great for personal use (1-10 users)
- PostgreSQL recommended when you have multiple concurrent users
- The app is lightweight and efficient - no need for expensive infrastructure

## 🆘 Troubleshooting

### Database connection issues
- Check your `DATABASE_URL` is correct
- For SQLite, make sure the directory is writable
- For PostgreSQL, ensure you've copied the PostgreSQL schema: `cp prisma/schema.postgresql.prisma prisma/schema.prisma`

### Build failures
- Ensure Node.js 20+ is being used
- Check that all environment variables are set
- Run `npm install` in both backend and frontend

### Frontend can't connect to backend
- Verify `VITE_API_URL` points to your backend
- Check CORS settings in backend
- Ensure both services are running

Need help? [Open an issue](https://github.com/dsjohns85/verse-memorization/issues)!

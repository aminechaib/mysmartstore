# Medusa DTC Starter - Render.com Deployment Guide

This guide walks you through deploying the SmartStore (Medusa DTC Starter) to Render.com for production.

## ⚠️ CRITICAL: Database Migrations Required

**Your deployment will fail if you skip this step.** The backend cannot start without running database migrations first. Backend startup error will show: "relation ... does not exist"

## Prerequisites

- [Render.com](https://render.com) account
- PostgreSQL database (Render provides a free tier)
- Git repository connected to Render
- Environment variables configured

## Architecture Overview

The application consists of two main services:
1. **Backend** - Medusa Node.js API (apps/backend)
2. **Storefront** - Next.js frontend (apps/storefront)

## Step 1: Set Up PostgreSQL Database

1. In Render Dashboard → Create New → PostgreSQL
2. Configure:
   - Name: `medusa-db`
   - Region: Choose closest to you
   - PostgreSQL Version: 15+
3. Save the connection string (will be used in backend env vars)
4. **Important**: Note the external database URL (format: `postgresql://user:password@host:port/dbname`)

## Step 2: Deploy Backend (CRITICAL MIGRATIONS STEP)

### Create Backend Service

1. Go to Render Dashboard → Create New → Web Service
2. Connect your Git repository
3. Configure:
   - **Name**: `medusa-backend`
   - **Branch**: `main` (or your default)
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `cd apps/backend && pnpm start`
   - **Region**: Same as database
   - **Instance Size**: Standard

### Set Backend Environment Variables

Go to Environment tab and add:

```bash
# Database
DATABASE_URL=<your-postgres-connection-string-from-step-1>

# Security
JWT_SECRET=<generate-a-secure-random-string-min-32-chars>
COOKIE_SECRET=<generate-another-secure-random-string-min-32-chars>

# CORS & Auth Configuration
STORE_CORS=https://your-storefront-domain.onrender.com,https://docs.medusajs.com
ADMIN_CORS=https://your-domain.onrender.com/admin,https://docs.medusajs.com
AUTH_CORS=https://your-domain.onrender.com/admin,https://docs.medusajs.com

# Redis (leave as-is for now, will fail gracefully with mock)
REDIS_URL=redis://localhost:6379

# Optional: Payment & Third-party Services
# STRIPE_API_KEY=your_stripe_secret_key
# MISTRAL_API_KEY=your_mistral_api_key
```

### ⚠️ **CRITICAL STEP**: Run Database Migrations

**The backend will NOT start until you run migrations!** If you see errors like "relation does not exist", it means migrations haven't been run.

**Immediately after backend is deployed:**

1. In Render Dashboard → go to `medusa-backend` service
2. Click the **"Shell"** tab (top right)
3. Run these commands in the shell:

```bash
# Navigate to backend
cd apps/backend

# Run migrations (creates all database tables)
pnpm exec medusa db:migrate

# Create admin user (you'll need this for login)
pnpm exec medusa user -e admin@example.com -p yoursecurepassword123

# Exit shell
exit
```

4. The service will automatically restart
5. Verify it's healthy: https://medusa-backend-xxx.onrender.com/health

### Important Backend Configuration

1. The backend URL will be: `https://medusa-backend-xxx.onrender.com`
2. Save this for the storefront configuration
3. After migrations complete, login to admin: `https://medusa-backend-xxx.onrender.com/app`
4. Use credentials: `admin@example.com` / `yoursecurepassword123`
5. Go to Settings → Publishable API Keys → Copy the key (starts with `pk_`)

## Step 3: Deploy Storefront

### Create Storefront Service

1. Go to Render Dashboard → Create New → Web Service
2. Connect your Git repository
3. Configure:
   - **Name**: `smartstore-frontend`
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `cd apps/storefront && pnpm start`
   - **Region**: Same as backend
   - **Instance Size**: Standard

### Set Storefront Environment Variables

Go to Environment tab and add:

```bash
# Medusa Backend Configuration (from Step 2)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://medusa-backend-xxx.onrender.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx_from_admin_settings

# Optional: Stripe (if using Stripe payments)
# NEXT_PUBLIC_STRIPE_KEY=your_stripe_publishable_key

# Optional: AI Search (Mistral AI)
# MISTRAL_API_KEY=your_mistral_api_key

# Optional: Defaults
# NEXT_PUBLIC_DEFAULT_REGION=us
# NEXT_PUBLIC_BASE_URL=https://your-storefront-domain.onrender.com
```

**Important**: Make sure `NEXT_PUBLIC_MEDUSA_BACKEND_URL` exactly matches your backend service URL.

## Step 4: Verify Deployment

### Check Backend Health
```bash
curl https://medusa-backend-xxx.onrender.com/health
```
Expected: `{"status":"ok"}`

### Check Storefront
Open: `https://smartstore-frontend-xxx.onrender.com`

### Access Admin Dashboard
Open: `https://medusa-backend-xxx.onrender.com/app`
Login with credentials from Step 2

### Verify API Connectivity
Storefront should load without "backend connection" errors

## Step 5: Custom Domain (Optional)

1. In Render Dashboard → Your service → Settings → Custom Domain
2. Add your domain (e.g., `api.mystore.com`, `shop.mystore.com`)
3. Update DNS records as shown in Render
4. Update env vars `STORE_CORS` with custom domains

## 🔧 Troubleshooting

### Backend won't start / Shows "relation ... does not exist"
**Solution**: Run migrations from the Shell tab
```bash
cd apps/backend
pnpm exec medusa db:migrate
```
Then service will restart automatically.

### "Could not resolve module: Tax/Payment" errors
**Solution**: Same as above - run migrations
```bash
cd apps/backend && pnpm exec medusa db:migrate
```

### Database connection error
- Verify `DATABASE_URL` is correct
- Check database is running in Render
- Try connecting locally first: `psql <DATABASE_URL>`
- Ensure credentials are correct

### Admin dashboard login fails
Create a new admin user:
```bash
cd apps/backend
pnpm exec medusa user -e newemail@example.com -p newpassword
```

### Storefront shows backend errors
- Verify `NEXT_PUBLIC_MEDUSA_BACKEND_URL` exactly matches backend service URL
- Check CORS settings on backend match your storefront domain
- Ensure publishable key is valid in admin

### Build fails on storefront
- Check build logs in Render dashboard
- Ensure lockfile is committed (pnpm-lock.yaml)
- Node version must be 20+ (check package.json)

## Monitoring & Maintenance

### View Logs
- Backend: Render Dashboard → medusa-backend → Logs
- Storefront: Render Dashboard → smartstore-frontend → Logs

### Database Backups
- Render provides automated daily backups
- Check database service settings

### Environment Variable Updates
- Change in Render dashboard
- Services restart automatically

## Production Checklist

- [ ] PostgreSQL database created
- [ ] Backend deployed
- [ ] **Database migrations run** (CRITICAL!)
- [ ] **Admin user created** (CRITICAL!)
- [ ] Backend health check passes
- [ ] Publishable key obtained from admin
- [ ] Storefront deployed with backend URL
- [ ] Storefront loads without errors
- [ ] Admin dashboard accessible
- [ ] CORS configured correctly
- [ ] Tested checkout flow end-to-end

## Security Recommendations

1. **Secrets**
   - Store all secrets in Render env vars only
   - Never commit `.env` or `.env.local`
   - Use 32+ character random strings for JWT/COOKIE secrets

2. **CORS**
   - Be specific with domain names
   - Avoid using `*` in production

3. **Database**
   - Use strong passwords (20+ chars)
   - Enable SSL connections
   - Regular backups enabled

4. **Dependencies**
   - Keep packages updated
   - Monitor security advisories

## Support

- [Medusa Docs](https://docs.medusajs.com)
- [Render Docs](https://render.com/docs)
- [GitHub Issues](https://github.com/medusajs/medusa/issues)

- [Render.com](https://render.com) account
- PostgreSQL database (Render provides a free tier)
- Git repository connected to Render
- Environment variables configured

## Architecture Overview

The application consists of two main services:
1. **Backend** - Medusa Node.js API (apps/backend)
2. **Storefront** - Next.js frontend (apps/storefront)

## Step 1: Set Up PostgreSQL Database

1. In Render Dashboard → Create New → PostgreSQL
2. Configure:
   - Name: `medusa-db`
   - Region: Choose closest to you
   - PostgreSQL Version: 15+
3. Save the connection string (will be used in backend env vars)

## Step 2: Deploy Backend

### Create Backend Service

1. Go to Render Dashboard → Create New → Web Service
2. Connect your Git repository
3. Configure:
   - **Name**: `medusa-backend`
   - **Branch**: `main` (or your default)
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `cd apps/backend && pnpm start`
   - **Region**: Same as database

### Set Backend Environment Variables

Go to Environment tab and add:

```bash
# Database
DATABASE_URL=<your-postgres-connection-string-from-step-1>

# Security
JWT_SECRET=<generate-a-secure-random-string>
COOKIE_SECRET=<generate-a-secure-random-string>

# CORS & Auth Configuration
STORE_CORS=https://your-storefront-domain.onrender.com,https://docs.medusajs.com
ADMIN_CORS=https://your-domain.onrender.com/admin,https://docs.medusajs.com
AUTH_CORS=https://your-domain.onrender.com/admin,https://docs.medusajs.com

# Redis
REDIS_URL=redis://localhost:6379

# Optional: Payment & Third-party Services
# STRIPE_API_KEY=your_stripe_secret_key
# MISTRAL_API_KEY=your_mistral_api_key
```

### Important Backend Configuration

1. The backend will be available at: `https://medusa-backend-xxx.onrender.com`
2. Save this URL for the storefront configuration
3. After deployment, create an admin user:
   ```bash
   cd apps/backend && pnpm exec medusa user -e admin@example.com -p securepassword
   ```

## Step 3: Deploy Storefront

### Create Storefront Service

1. Go to Render Dashboard → Create New → Web Service
2. Connect your Git repository
3. Configure:
   - **Name**: `smartstore-frontend`
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `cd apps/storefront && pnpm start`
   - **Region**: Same as backend
   - **Instance Size**: Standard (for production)

### Set Storefront Environment Variables

Go to Environment tab and add:

```bash
# Medusa Backend Configuration
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://medusa-backend-xxx.onrender.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<get-from-backend-admin-settings>

# Optional: Stripe (if using Stripe payments)
# NEXT_PUBLIC_STRIPE_KEY=your_stripe_publishable_key

# Optional: AI Search (Mistral AI)
MISTRAL_API_KEY=your_mistral_api_key

# Optional: Defaults
NEXT_PUBLIC_DEFAULT_REGION=us
NEXT_PUBLIC_BASE_URL=https://your-storefront-domain.onrender.com
```

### Important Storefront Configuration

1. Storefront will be available at: `https://smartstore-frontend-xxx.onrender.com`
2. To get the publishable key:
   - Go to your Medusa backend admin: `https://medusa-backend-xxx.onrender.com/app`
   - Login with the admin user created in Step 2
   - Navigate to Settings → Publishable API Keys
   - Copy the key and add to storefront env vars

## Step 4: Initial Setup

### 1. Run Backend Migrations

```bash
# SSH into backend service or use Render's shell
cd apps/backend
pnpm exec medusa db:migrate
```

### 2. Seed Initial Data (Optional)

```bash
pnpm run backend:seed
```

### 3. Verify Deployment

- Backend health check: `https://medusa-backend-xxx.onrender.com/health`
- Storefront: `https://smartstore-frontend-xxx.onrender.com`
- Admin dashboard: `https://medusa-backend-xxx.onrender.com/app`

## Step 5: Custom Domain (Optional)

1. In Render Dashboard → Your service → Settings → Custom Domain
2. Add your domain (e.g., `api.mystore.com`, `shop.mystore.com`)
3. Update DNS records as shown in Render
4. Update CORS variables with your custom domain

## Monitoring & Maintenance

### View Logs

- Backend: Render Dashboard → medusa-backend → Logs
- Storefront: Render Dashboard → smartstore-frontend → Logs

### Scale Services

- As traffic grows, upgrade instance size in service settings
- Monitor disk usage and memory in Render dashboard

### Database Backups

- Render PostgreSQL provides automated backups
- Check your database service settings for backup frequency

### Environment Variables Update

- Any env var change requires a redeploy
- After updating, services will restart automatically

## Production Checklist

- [x] Database configured and running
- [x] Backend deployed with all env vars
- [x] Storefront deployed with all env vars
- [x] Admin user created on backend
- [x] Publishable key obtained and set in storefront
- [x] CORS settings configured correctly
- [x] Custom domain configured (if needed)
- [x] All secrets stored in Render env vars (not in code)
- [x] Backups enabled for database
- [x] SSL certificate enabled (Render does this automatically)
- [x] Tested checkout flow end-to-end

## Troubleshooting

### Backend won't start
- Check logs: `pnpm run backend:dev` locally to reproduce
- Verify DATABASE_URL is correct
- Ensure Redis is configured or mock is enabled

### Storefront shows backend errors
- Verify `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is correct
- Check CORS settings on backend match your domain
- Ensure publishable key is valid

### Database migrations fail
- SSH into backend and run: `pnpm exec medusa db:migrate`
- Check DATABASE_URL environment variable

### Build fails
- Check build logs in Render dashboard
- Ensure lockfile is committed (pnpm-lock.yaml)
- Node version matches required (20+)

## Security Recommendations

1. **Secrets Management**
   - All secrets stored in Render environment variables only
   - Never commit `.env` or `.env.local`
   - Rotate JWT_SECRET and COOKIE_SECRET regularly

2. **CORS Configuration**
   - Be specific with domain names in CORS settings
   - Avoid using `*` in production

3. **Database**
   - Use strong passwords
   - Enable SSL for database connections
   - Regular backups enabled

4. **Dependencies**
   - Keep packages updated regularly
   - Review security advisories

## Next Steps

- [ ] Configure payment gateway (Stripe, etc.)
- [ ] Set up email service for order notifications
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and alerts
- [ ] Configure analytics
- [ ] Add custom branding and domain names

## Support

- [Medusa Docs](https://docs.medusajs.com)
- [Render Docs](https://render.com/docs)
- [GitHub Issues](https://github.com/medusajs/medusa/issues)

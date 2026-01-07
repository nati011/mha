# Quick Setup Guide: PostgreSQL for Vercel

## The Problem
SQLite doesn't work on Vercel's serverless environment. You need PostgreSQL.

## Quick Solution (5 minutes)

### Step 1: Set up PostgreSQL Database

**Option A: Vercel Postgres (Easiest)**
1. Go to your Vercel project dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Vercel will automatically set `DATABASE_URL`

**Option B: Neon (Free PostgreSQL)**
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)
4. In Vercel: Project Settings → Environment Variables → Add `DATABASE_URL`

### Step 2: Run Migrations

After setting up the database, run migrations in Vercel:

1. **Option A: Via Vercel CLI**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Option B: Via Vercel Dashboard**
   - Go to your project → Settings → Environment Variables
   - Copy the `DATABASE_URL` value
   - Run locally: `DATABASE_URL="your-connection-string" npx prisma migrate deploy`

### Step 3: Deploy

Push your changes and Vercel will build with PostgreSQL.

## What Changed

1. **Prisma Schema**: Changed from `sqlite` to `postgresql`
2. **Database Connection**: Updated to use PostgreSQL (works on Vercel)
3. **Removed SQLite-specific code**: No longer uses `better-sqlite3` adapter

## Local Development

For local development, you can:

1. **Use the same PostgreSQL database** (recommended)
2. **Or set up a local PostgreSQL**:
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   createdb mental_health_addis
   
   # Add to .env.local
   DATABASE_URL="postgresql://localhost:5432/mental_health_addis"
   ```

## Important Notes

- ⚠️ **You must set `DATABASE_URL` in Vercel** before deploying
- ⚠️ **Run migrations** after setting up the database
- ⚠️ **SQLite will no longer work** - you need PostgreSQL

## Need Help?

If you get errors:
1. Check that `DATABASE_URL` is set in Vercel
2. Verify the connection string format: `postgresql://user:password@host:port/database`
3. Make sure migrations have been run: `npx prisma migrate deploy`


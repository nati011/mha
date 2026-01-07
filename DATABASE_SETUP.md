# Database Setup for Vercel Deployment

## Problem
SQLite with `better-sqlite3` does **not work** on Vercel's serverless environment because:
- Serverless functions have a read-only filesystem (except `/tmp`)
- SQLite requires a writable filesystem
- Native modules may not compile correctly

## Solution: PostgreSQL

The application has been updated to use **PostgreSQL** for production (Vercel) and local development.

## Setup Instructions

### Option 1: Vercel Postgres (Recommended for Production)

1. **Add Vercel Postgres to your project:**
   - Go to your Vercel project dashboard
   - Navigate to Storage → Create Database → Postgres
   - Follow the setup wizard

2. **Get the connection string:**
   - Vercel will automatically set the `DATABASE_URL` environment variable
   - Or copy it from the Storage tab

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### Option 2: External PostgreSQL Database

1. **Set up a PostgreSQL database:**
   - Use services like:
     - [Neon](https://neon.tech) (free tier available)
     - [Supabase](https://supabase.com) (free tier available)
     - [Railway](https://railway.app) (free tier available)
     - [Render](https://render.com) (free tier available)
     - [AWS RDS](https://aws.amazon.com/rds/)
     - [Google Cloud SQL](https://cloud.google.com/sql)

2. **Get your connection string:**
   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

3. **Set environment variable in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string

4. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### Local Development Setup

#### Using PostgreSQL Locally

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql
   sudo service postgresql start
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create a database:**
   ```bash
   createdb mental_health_addis
   ```

3. **Set DATABASE_URL in `.env`:**
   ```env
   DATABASE_URL="postgresql://localhost:5432/mental_health_addis"
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

#### Using SQLite for Local Development (Alternative)

If you prefer SQLite for local development, you can:

1. **Create a separate schema file** for local development
2. **Use environment-based schema switching**

However, this is more complex and not recommended. Using PostgreSQL for both local and production is simpler and ensures consistency.

## Migration Steps

1. **Backup your SQLite database** (if you have data):
   ```bash
   cp prisma/dev.db prisma/dev.db.backup
   ```

2. **Set up PostgreSQL** (see options above)

3. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

5. **If you have existing data**, you'll need to migrate it:
   - Export from SQLite
   - Import to PostgreSQL
   - Or use a migration tool

## Schema Changes

The Prisma schema has been updated from:
```prisma
datasource db {
  provider = "sqlite"
}
```

To:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Important Notes

- **Remove SQLite dependencies** if you're fully migrating to PostgreSQL:
  - `better-sqlite3`
  - `@prisma/adapter-better-sqlite3`
  - `@types/better-sqlite3`

- **Update `next.config.js`** - Remove the SQLite externals if not needed

- **Test locally** with PostgreSQL before deploying to Vercel

## Quick Start with Neon (Free PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Set it as `DATABASE_URL` in Vercel
5. Run `npx prisma migrate deploy`

That's it! Your app will now work on Vercel.


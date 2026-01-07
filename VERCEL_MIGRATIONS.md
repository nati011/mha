# Running Database Migrations on Vercel

## Problem

Error: `The table 'public.Admin' does not exist in the current database.`

This means the database tables haven't been created yet. You need to run migrations.

## Solution: Run Migrations on Vercel

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project** (if not already linked):
   ```bash
   vercel link
   ```

4. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

5. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

6. **Create admin user**:
   ```bash
   npm run seed-admin
   ```

### Option 2: Using Vercel Dashboard

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Make sure `DATABASE_URL` is set
4. Go to **Deployments** tab
5. Click on the latest deployment
6. Open the deployment logs
7. You can't run migrations directly from the dashboard, so use Option 1

### Option 3: Add Migration to Build (Not Recommended)

You could add migrations to the build script, but this is not recommended because:
- Migrations should be run once, not on every build
- Builds might fail if migrations have already been run
- It's better to run migrations manually

## After Running Migrations

1. **Verify tables exist**:
   ```bash
   npx prisma studio
   ```
   Or check via your database provider's dashboard

2. **Create admin user**:
   ```bash
   npm run seed-admin
   ```

3. **Test login**:
   - Go to `/admin/login`
   - Username: `admin`
   - Password: `admin123`

## Quick Fix Command

```bash
# Pull env vars, run migrations, create admin
vercel env pull .env.local && npx prisma migrate deploy && npm run seed-admin
```

## Troubleshooting

### "Migration already applied"
- This is fine - it means migrations have already been run
- Just create the admin user: `npm run seed-admin`

### "DATABASE_URL not set"
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Pull it locally: `vercel env pull .env.local`

### "Connection refused"
- Check that `DATABASE_URL` is correct
- Verify your database is accessible
- Check firewall/network settings


# Automatic Database Migrations

## Overview

Database migrations now run **automatically during build** on Vercel. No manual steps required!

## How It Works

### During Build

1. **Prisma generates client** (`prisma generate`)
2. **Migrations run automatically** (`prisma migrate deploy`)
3. **Admin seeding attempted** (if DATABASE_URL is available)
4. **Next.js builds** the application

### Build Script

```json
"build": "prisma generate && npm run migrate:deploy && npm run seed-admin:build; next build"
```

The `;` ensures that even if migrations fail, the build continues.

## When Migrations Run

### ✅ Migrations Will Run If:
- `DATABASE_URL` is set and is a PostgreSQL connection string
- Database is accessible during build
- Migrations haven't been applied yet

### ⚠️ Migrations Will Be Skipped If:
- `DATABASE_URL` is not set
- `DATABASE_URL` is a SQLite file URL (local development)
- Database is not accessible during build
- Migration command fails (non-fatal - build continues)

## Safety Features

1. **Non-blocking**: If migrations fail, the build still succeeds
2. **Idempotent**: Safe to run multiple times (won't re-apply already applied migrations)
3. **PostgreSQL only**: Only runs for PostgreSQL databases (skips SQLite)

## For Vercel Deployment

1. **Set DATABASE_URL** in Vercel environment variables
2. **Deploy** - migrations run automatically during build
3. **Done!** - Tables are created automatically

## Manual Override

If you need to run migrations manually:

```bash
npx prisma migrate deploy
```

## Troubleshooting

### Migrations not running
- Check that `DATABASE_URL` is set in Vercel
- Verify it's a PostgreSQL connection string (starts with `postgres://` or `postgresql://`)
- Check build logs for migration output

### "Migrations already applied"
- This is fine! It means your database is up to date
- The build will continue successfully

### Build fails with migration error
- The build script uses `;` so build continues even if migrations fail
- Check build logs for specific error messages
- Run migrations manually if needed: `npx prisma migrate deploy`

## Benefits

✅ **Zero manual steps** - Migrations run automatically  
✅ **Safe** - Won't break builds if migrations fail  
✅ **Idempotent** - Safe to run multiple times  
✅ **PostgreSQL only** - Skips SQLite (local dev)  


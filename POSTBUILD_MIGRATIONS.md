# Post-Build Migrations on Vercel

## Overview

Migrations now run **after the build completes** on Vercel. This ensures:
- ✅ Build completes successfully first
- ✅ Migrations run immediately after build
- ✅ Database is ready before deployment goes live

## How It Works

### Build Process

1. **Prisma generates client** (`prisma generate`)
2. **Next.js builds** the application (`next build`)
3. **Migrations run automatically** (`prisma migrate deploy`) ← After build
4. **Admin seeding attempted** (`seed-admin:build`) ← After migrations

### Scripts

```json
{
  "build": "prisma generate && next build",
  "vercel-build": "npm run build && npm run migrate:deploy && npm run seed-admin:build"
}
```

The `vercel-build` script:
- Runs the build first
- Then runs migrations (only if build succeeds)
- Then runs seeding (only if migrations succeed)

## Why After Build?

1. **Build doesn't need database** - Next.js build can complete without database access
2. **Migrations need database** - Must run when database is accessible
3. **Sequential execution** - Build completes, then migrations run
4. **Better error handling** - Build errors don't affect migration attempts

## Vercel Configuration

`vercel.json` uses `vercel-build`:
```json
{
  "buildCommand": "npm run vercel-build"
}
```

This ensures the full sequence runs on Vercel.

## Execution Flow

```
1. npm install
   ↓
2. prisma generate (generates Prisma client)
   ↓
3. next build (builds Next.js app)
   ↓
4. prisma migrate deploy (runs migrations) ← After build
   ↓
5. seed-admin:build (creates admin user) ← After migrations
   ↓
6. Deployment ready!
```

## Benefits

✅ **Build completes first** - No database dependency during build  
✅ **Migrations run after** - Database is accessible post-build  
✅ **Sequential execution** - Each step waits for previous to complete  
✅ **Error handling** - If build fails, migrations don't run (saves time)  

## Troubleshooting

### Build succeeds but migrations fail
- Check Vercel build logs for migration errors
- Verify `DATABASE_URL` is set correctly
- Check database connectivity from Vercel

### Migrations run but seeding fails
- Check build logs for seeding errors
- Verify database tables exist (migrations succeeded)
- Check admin user creation logic

### Build fails before migrations
- Fix build errors first
- Migrations won't run if build fails (by design)
- This prevents unnecessary migration attempts

## Manual Override

If you need to run migrations manually after deployment:

```bash
vercel env pull .env.local
npx prisma migrate deploy
npm run seed-admin
```


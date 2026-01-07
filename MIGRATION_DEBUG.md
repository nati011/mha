# Migration Debugging Guide

## Current Issue

Migrations are not running automatically on Vercel, causing the error:
```
The table `public.Admin` does not exist in the current database.
```

## What Was Changed

1. **Updated `scripts/auto-migrate.ts`**:
   - Added better logging to see what's happening
   - Made migrations fail the build on Vercel (so we know if they fail)
   - Improved error detection for "already applied" cases

2. **Build Script**:
   ```json
   "build": "prisma generate && npm run migrate:deploy; npm run seed-admin:build; next build"
   ```
   - Uses `;` so build continues even if migrations fail (for local dev)
   - But migrations will fail the build on Vercel if they actually fail

## How to Debug

### Check Vercel Build Logs

1. Go to your Vercel deployment
2. Check the build logs for:
   - `🔄 Running database migrations automatically...`
   - Any error messages from `prisma migrate deploy`

### Common Issues

#### 1. Migrations Not Running
**Symptoms**: No migration output in build logs

**Possible Causes**:
- `DATABASE_URL` not set in Vercel environment variables
- `DATABASE_URL` is SQLite (file://)
- Script is exiting early

**Fix**:
- Check Vercel environment variables
- Ensure `DATABASE_URL` starts with `postgres://` or `postgresql://`

#### 2. Migrations Failing Silently
**Symptoms**: Build succeeds but tables don't exist

**Possible Causes**:
- Migration script catching errors and exiting with 0
- Database connection issues
- Permission issues

**Fix**:
- Check build logs for migration errors
- Verify database is accessible from Vercel
- Check database user permissions

#### 3. "Migrations Already Applied"
**Symptoms**: Logs show "Migrations are already up to date" but tables don't exist

**Possible Causes**:
- Migration tracking table exists but actual tables don't
- Database was reset but migration history wasn't

**Fix**:
- Reset database: `npx prisma migrate reset`
- Or manually drop and recreate tables

## Manual Migration (If Auto-Migration Fails)

If automatic migrations don't work, run manually:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Or using direct connection
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

## Testing Locally

To test the migration script locally:

```bash
# Set a test PostgreSQL URL
export DATABASE_URL="postgresql://user:pass@localhost/db"

# Run the migration script
npm run migrate:deploy
```

## Next Steps

1. **Deploy to Vercel** and check build logs
2. **Look for migration output** in the logs
3. **If migrations fail**, the build will now fail (on Vercel) so you'll know
4. **Check error messages** to diagnose the issue

## Expected Build Log Output

On Vercel, you should see:
```
🔄 Running database migrations automatically...
   Environment: Vercel
   Database URL: postgres://...
   Working directory: /vercel/path0
[Prisma migration output]
✅ Migrations completed successfully!
```

If you see errors, they will now be clearly displayed and the build will fail.


# Migration Fix: SQLite to PostgreSQL

## Problem

The migrations were created for SQLite, but the schema is now PostgreSQL. This causes the error:
```
The datasource provider `postgresql` specified in your schema does not match the one specified in the migration_lock.toml, `sqlite`.
```

## Solution

The migrations directory has been reset and `migration_lock.toml` has been updated to `postgresql`.

## Next Steps

### Option 1: Create Migration on Vercel (Recommended)

When you deploy to Vercel, the migration script will:
1. Detect that there are no migrations
2. You'll need to create an initial migration

**On Vercel, after first deployment:**
1. The build will fail because there are no migrations
2. You need to create a baseline migration

**To fix this, run locally with PostgreSQL DATABASE_URL:**
```bash
# Set your PostgreSQL connection string
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Create the initial migration
npx prisma migrate dev --name init
```

### Option 2: Use `prisma db push` (Quick Fix)

If you just want to sync the schema without migrations:
```bash
# Set PostgreSQL DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Push schema directly (creates tables)
npx prisma db push
```

Then create a baseline migration:
```bash
npx prisma migrate dev --name init --create-only
```

### Option 3: Manual Migration Creation

Create a migration manually that matches your current schema. This is complex and not recommended.

## Recommended Approach

1. **Set up PostgreSQL locally** (or use your Vercel DATABASE_URL temporarily)
2. **Create the initial migration:**
   ```bash
   export DATABASE_URL="your-postgresql-connection-string"
   npx prisma migrate dev --name init
   ```
3. **Commit the migration** to git
4. **Deploy to Vercel** - migrations will now work

## For Vercel Deployment

Once you have the migration created:
1. Commit it to git
2. Deploy to Vercel
3. The `vercel-build` script will run `prisma migrate deploy`
4. Tables will be created automatically

## Current Status

✅ `migration_lock.toml` updated to `postgresql`  
✅ Old SQLite migrations removed  
⏳ Need to create new PostgreSQL migration  


# Resolve Failed Migration on Vercel

## Problem
The migration `20260111065110_1` failed on Vercel because it tried to create tables that already exist. This is blocking new migrations.

## Solution Options

### Option 1: Use Vercel Postgres Dashboard (Easiest)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Postgres** → **Data** tab
3. Click on **Query** or **SQL Editor**
4. Run this SQL:

```sql
UPDATE "_prisma_migrations"
SET "finished_at" = NOW(),
    "rolled_back_at" = NOW()
WHERE "migration_name" = '20260111065110_1'
  AND "finished_at" IS NULL;
```

5. Verify it worked:
```sql
SELECT "migration_name", "finished_at", "rolled_back_at"
FROM "_prisma_migrations"
WHERE "migration_name" = '20260111065110_1';
```

6. Redeploy on Vercel

### Option 2: Use Vercel CLI (Command Line)

1. Install Vercel CLI if you haven't:
   ```bash
   npm i -g vercel
   ```

2. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

3. Connect to your database and run the SQL:
   ```bash
   # Get your DATABASE_URL from .env.local
   # Then connect using psql or your preferred PostgreSQL client
   psql $DATABASE_URL -f scripts/resolve-failed-migration.sql
   ```

### Option 3: Use Prisma Migrate Resolve (If you have direct DB access)

If you can connect to your Vercel database:

```bash
# Set your Vercel DATABASE_URL
export DATABASE_URL="your-vercel-database-url"

# Mark the failed migration as rolled back
npx prisma migrate resolve --rolled-back 20260111065110_1
```

### Option 4: Delete the Failed Migration Record (Last Resort)

If the above options don't work, you can delete the failed migration record:

```sql
DELETE FROM "_prisma_migrations"
WHERE "migration_name" = '20260111065110_1'
  AND "finished_at" IS NULL;
```

**Warning**: Only use this if other options fail. This removes the migration history.

## After Resolving

1. **Redeploy on Vercel** - The new migration `20260111095904_add_chapters` should now run successfully
2. **Verify** - Check that the Chapter table was created and Event table has the chapterId column

## Verification Queries

After resolving, verify your database:

```sql
-- Check if Chapter table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'Chapter'
);

-- Check if Event table has chapterId column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Event' AND column_name = 'chapterId';

-- Check migration status
SELECT "migration_name", "finished_at", "rolled_back_at"
FROM "_prisma_migrations"
ORDER BY "started_at" DESC
LIMIT 5;
```


-- SQL script to resolve the failed migration in Vercel database
-- Run this in your Vercel database (via Vercel Postgres dashboard or psql)

-- Option 1: Mark the failed migration as rolled back
-- This tells Prisma the migration was rolled back and can be ignored
UPDATE "_prisma_migrations"
SET "finished_at" = NOW(),
    "rolled_back_at" = NOW()
WHERE "migration_name" = '20260111065110_1'
  AND "finished_at" IS NULL;

-- Option 2: If the above doesn't work, delete the failed migration record
-- (Only use if Option 1 doesn't work)
-- DELETE FROM "_prisma_migrations"
-- WHERE "migration_name" = '20260111065110_1'
--   AND "finished_at" IS NULL;

-- Verify the fix
SELECT "migration_name", "finished_at", "rolled_back_at", "started_at"
FROM "_prisma_migrations"
WHERE "migration_name" = '20260111065110_1';



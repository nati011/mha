# Creating PostgreSQL Migration

## Current Status

✅ Old SQLite migrations removed  
✅ `migration_lock.toml` set to `postgresql`  
⏳ Need to create initial PostgreSQL migration  

## Quick Fix: Create Migration

You need to create a migration with your PostgreSQL DATABASE_URL. You have two options:

### Option 1: Use Your Vercel DATABASE_URL (Recommended)

1. **Get your DATABASE_URL from Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Copy the `DATABASE_URL` value

2. **Create the migration locally:**
   ```bash
   # Set the DATABASE_URL temporarily
   export DATABASE_URL="your-postgresql-connection-string-from-vercel"
   
   # Create the initial migration
   npx prisma migrate dev --name init
   ```

3. **Commit the migration:**
   ```bash
   git add prisma/migrations
   git commit -m "Add PostgreSQL migrations"
   git push
   ```

4. **Deploy to Vercel** - migrations will now run automatically!

### Option 2: Use Neon/Other PostgreSQL (If you have one)

```bash
# Set your PostgreSQL connection string
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Create the initial migration
npx prisma migrate dev --name init
```

## What This Does

- Creates a new migration file in `prisma/migrations/` with PostgreSQL-compatible SQL
- Applies the migration to your database
- Creates all tables according to your Prisma schema

## After Creating Migration

1. **Commit to git** - the migration files are now part of your codebase
2. **Deploy to Vercel** - the `vercel-build` script will run `prisma migrate deploy`
3. **Tables will be created automatically** on Vercel

## Important Notes

- The migration will be created based on your current `prisma/schema.prisma`
- All tables (Event, Attendee, Admin, etc.) will be created
- This is a one-time setup - future schema changes will create new migrations

## Troubleshooting

### "DATABASE_URL not set"
- Make sure you export it before running the command
- Or create a `.env.local` file with `DATABASE_URL=...`

### "Connection refused"
- Check that your PostgreSQL database is accessible
- Verify the connection string is correct
- For Neon, make sure you're using the correct connection string

### "Migration already exists"
- If you see this, the migration was already created
- Check `prisma/migrations/` directory
- You can proceed to commit and deploy


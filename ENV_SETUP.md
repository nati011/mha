# Environment Variables Setup Guide

## Setting Secrets in Vercel

### Step 1: Go to Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and log in
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add these variables for **Production**, **Preview**, and **Development**:

#### Required Variables:

1. **DATABASE_URL** (Most Important)
   ```
   postgres://default:olI6aO9RupSA@ep-dark-shape-a4lxh0bu-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require
   ```
   - This is the main connection string
   - Use the **pooled** version (with `-pooler` in the hostname) for better performance

2. **DATABASE_URL_UNPOOLED** (Optional - for migrations)
   ```
   postgresql://default:olI6aO9RupSA@ep-dark-shape-a4lxh0bu.us-east-1.aws.neon.tech/verceldb?sslmode=require
   ```
   - Use this for Prisma migrations (without pooler)
   - Set this if you plan to run migrations from Vercel

#### Optional Variables (if your app uses them):

- `POSTGRES_URL` - Same as DATABASE_URL
- `POSTGRES_PRISMA_URL` - For Prisma with connection pooling
- `NEXT_PUBLIC_STACK_PROJECT_ID` - If using Neon's Next.js integration
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` - If using Neon's Next.js integration
- `STACK_SECRET_SERVER_KEY` - If using Neon's Next.js integration

### Step 3: Select Environments

For each variable, select which environments to apply it to:
- ✅ **Production** - For production deployments
- ✅ **Preview** - For preview deployments (pull requests, etc.)
- ✅ **Development** - For local development (optional)

### Step 4: Save and Redeploy

After adding variables:
1. Click **Save**
2. Go to **Deployments** tab
3. Click **Redeploy** on your latest deployment (or it will auto-redeploy on next push)

## Local Development Setup

### Create `.env.local` file

In your project root, create `.env.local`:

```env
# Database connection (use pooled version for development)
DATABASE_URL="postgres://default:olI6aO9RupSA@ep-dark-shape-a4lxh0bu-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require"

# For Prisma migrations (use unpooled version)
DATABASE_URL_UNPOOLED="postgresql://default:olI6aO9RupSA@ep-dark-shape-a4lxh0bu.us-east-1.aws.neon.tech/verceldb?sslmode=require"
```

**Important**: 
- `.env.local` is in `.gitignore` (your credentials won't be committed)
- Never commit `.env.local` to git
- Use different credentials for production if possible

## Running Migrations

After setting up the database URL:

### Option 1: Run migrations locally
```bash
# Use the unpooled connection for migrations
DATABASE_URL="postgresql://default:olI6aO9RupSA@ep-dark-shape-a4lxh0bu.us-east-1.aws.neon.tech/verceldb?sslmode=require" npx prisma migrate deploy
```

### Option 2: Add to package.json
Add this script to `package.json`:
```json
"migrate:deploy": "prisma migrate deploy"
```

Then run:
```bash
DATABASE_URL="your-unpooled-url" npm run migrate:deploy
```

## Security Best Practices

1. ✅ **Never commit secrets to git**
   - `.env.local` should be in `.gitignore`
   - Check that `.gitignore` includes `.env*`

2. ✅ **Use different databases for dev/prod** (if possible)
   - Create separate Neon databases
   - Use different credentials

3. ✅ **Rotate credentials regularly**
   - Change passwords periodically
   - Revoke old credentials

4. ✅ **Use least privilege**
   - Only grant necessary permissions
   - Use read-only users when possible

## Verifying Setup

After setting environment variables:

1. **Check Vercel deployment logs**:
   - Go to Deployments → Latest deployment → Build Logs
   - Should not show database connection errors

2. **Test locally**:
   ```bash
   npm run dev
   # Try accessing your app
   # Check that database queries work
   ```

3. **Run Prisma Studio** (to verify connection):
   ```bash
   npx prisma studio
   # Should open and show your database tables
   ```

## Troubleshooting

### "Cannot connect to database"
- Check that `DATABASE_URL` is set correctly in Vercel
- Verify the connection string format
- Check Neon dashboard to ensure database is active

### "Migration failed"
- Use `DATABASE_URL_UNPOOLED` for migrations (without pooler)
- Check that database exists in Neon
- Verify credentials are correct

### "Environment variable not found"
- Make sure variable is set for the correct environment (Production/Preview/Development)
- Redeploy after adding variables
- Check variable name spelling (case-sensitive)


# Quick Start: Setting Secrets in Vercel

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
- Visit [vercel.com](https://vercel.com)
- Log in to your account
- Click on your project

### 2. Navigate to Environment Variables
- Click **Settings** (top navigation)
- Click **Environment Variables** (left sidebar)

### 3. Add DATABASE_URL
Click **Add New** and add:

**Key**: `DATABASE_URL`

**Value**: 
```
postgres://default:olI6aO9RupSA@ep-dark-shape-a4lxh0bu-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require
```

**Environments**: Select all three:
- ✅ Production
- ✅ Preview  
- ✅ Development

Click **Save**

### 4. Add DATABASE_URL_UNPOOLED (for migrations)
Click **Add New** again:

**Key**: `DATABASE_URL_UNPOOLED`

**Value**:
```
postgresql://default:olI6aO9RupSA@ep-dark-shape-a4lxh0bu.us-east-1.aws.neon.tech/verceldb?sslmode=require
```

**Environments**: Select all three
Click **Save**

### 5. Redeploy
- Go to **Deployments** tab
- Click **⋯** (three dots) on latest deployment
- Click **Redeploy**

Or just push a new commit - it will auto-deploy with the new variables.

## Visual Guide

```
Vercel Dashboard
  └─ Your Project
      └─ Settings
          └─ Environment Variables
              └─ Add New
                  ├─ Key: DATABASE_URL
                  ├─ Value: [your connection string]
                  └─ Environments: ☑ Production ☑ Preview ☑ Development
```

## That's It!

After adding these variables and redeploying, your app should connect to the Neon database.

## Next Steps

1. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. Test locally:
   ```bash
   npm run dev
   ```

3. Check deployment logs in Vercel to verify connection


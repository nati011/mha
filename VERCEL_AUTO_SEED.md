# Automatic Admin Seeding on Vercel Deployment

## How It Works

The admin user (`admin` / `admin123`) is automatically seeded in multiple ways:

### 1. **Automatic Seeding on Login Page Access** ✅
When someone visits `/admin/login`, the page automatically attempts to seed the admin user if it doesn't exist. This happens silently in the background.

### 2. **Build-Time Seeding** ✅
During build, the script attempts to seed (if DATABASE_URL is available).

### 3. **Manual Seeding Endpoint** ✅
You can manually trigger seeding via API:
```bash
POST /api/admin/seed
```

## Setup for Vercel

### Option 1: Automatic (Recommended)
**No action needed!** The login page will automatically seed the admin user when first accessed.

### Option 2: Vercel Deployment Webhook
Set up a webhook to call the seed endpoint after deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Add a Deployment Hook
3. URL: `https://your-app.vercel.app/api/admin/seed`
4. Method: POST
5. (Optional) Add header: `Authorization: Bearer YOUR_SEED_SECRET_TOKEN`

### Option 3: Manual Trigger After Deployment
After each deployment, visit:
```
https://your-app.vercel.app/api/admin/seed
```

Or use curl:
```bash
curl -X POST https://your-app.vercel.app/api/admin/seed
```

## Security (Optional)

For production, you can add a secret token:

1. **Set in Vercel Environment Variables:**
   - Key: `SEED_SECRET_TOKEN`
   - Value: (any random string)

2. **Call with token:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/admin/seed \
     -H "Authorization: Bearer YOUR_SEED_SECRET_TOKEN"
   ```

**Note**: Auto-seeding from the login page works without a token (same-origin requests are allowed).

## What Gets Seeded

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## Verification

After deployment, you can verify the admin user exists:

1. Visit `/admin/login`
2. Try logging in with `admin` / `admin123`
3. If it works, seeding was successful!

## Troubleshooting

### Admin user not created
1. Check that `DATABASE_URL` is set in Vercel
2. Verify database migrations have run: `npx prisma migrate deploy`
3. Manually trigger: Visit `/api/admin/seed` or run `npm run seed-admin`

### Login still fails
1. Check server logs for specific errors
2. Run `npm run check-admin` to verify user exists
3. Re-seed: `npm run seed-admin`


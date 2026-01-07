# Automatic Admin Seeding on Deployment ✅

## What's Been Set Up

### 1. **Automatic Seeding on Login Page** ✅
When someone visits `/admin/login`, the page automatically attempts to seed the admin user (`admin` / `admin123`) if it doesn't exist. This happens silently in the background.

### 2. **Seeding API Endpoint** ✅
Created `/api/admin/seed` endpoint that can be called to seed the admin user:
- Safe to call multiple times (uses upsert)
- Works automatically from same origin
- Can be secured with `SEED_SECRET_TOKEN` environment variable

### 3. **Build-Time Seeding** ✅
During build, the script attempts to seed (if DATABASE_URL is available).

## How It Works on Vercel

### Automatic (No Action Needed!)
1. **Deploy your app** to Vercel
2. **Visit `/admin/login`** - the page automatically seeds the admin user
3. **Login with** `admin` / `admin123`

That's it! The admin user is automatically created when you first access the login page.

### Manual Trigger (Optional)
If you want to seed manually after deployment:

```bash
# Visit this URL in your browser:
https://your-app.vercel.app/api/admin/seed

# Or use curl:
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

## Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## Verification

After deployment:
1. Visit `/admin/login`
2. Try logging in with `admin` / `admin123`
3. If it works, seeding was successful! ✅

## Troubleshooting

### Admin user not created
1. Check that `DATABASE_URL` is set in Vercel
2. Verify database migrations have run
3. Manually trigger: Visit `/api/admin/seed`

### Login still fails
1. Check server logs for specific errors
2. Run `npm run check-admin` to verify user exists
3. Re-seed: `npm run seed-admin`


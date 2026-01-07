# Troubleshooting Admin Login Issues

## Problem: Login with admin/admin123 fails

### Step 1: Check if Admin User Exists

Run the check script:
```bash
npm run check-admin
```

This will tell you:
- ✅ If admin user exists
- ✅ If password "admin123" is correct
- ❌ If admin user doesn't exist
- ❌ If password doesn't match

### Step 2: Create/Reset Admin User

If admin user doesn't exist or password is wrong:

```bash
npm run seed-admin
```

This will create/update the admin user with:
- Username: `admin`
- Password: `admin123`

### Step 3: Verify Database Connection

Make sure `DATABASE_URL` is set:

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Or in .env.local file
cat .env.local | grep DATABASE_URL
```

### Step 4: Check Database Migrations

Make sure migrations have been run:

```bash
npx prisma migrate deploy
```

### Step 5: Check Server Logs

When you try to login, check the server console for:
- "Admin user 'admin' not found" → User doesn't exist
- "Password verification failed" → Password hash doesn't match
- "DATABASE_URL is not set" → Database not configured
- Other errors → Check database connection

## Common Issues

### Issue 1: Admin User Doesn't Exist
**Solution**: Run `npm run seed-admin`

### Issue 2: Password Doesn't Match
**Solution**: Run `npm run seed-admin` to reset password

### Issue 3: Database Not Connected
**Solution**: 
- Check `DATABASE_URL` is set
- Verify database is accessible
- Run `npx prisma migrate deploy`

### Issue 4: Wrong Database
**Solution**: Make sure you're connecting to the correct database (check DATABASE_URL)

## Quick Fix

If login is failing, try this:

```bash
# 1. Check admin user
npm run check-admin

# 2. If user doesn't exist or password wrong, recreate:
npm run seed-admin

# 3. Try logging in again with:
# Username: admin
# Password: admin123
```

## For Vercel/Production

1. **Check if admin exists**:
   ```bash
   vercel env pull .env.local
   npm run check-admin
   ```

2. **Create admin if missing**:
   ```bash
   npm run seed-admin
   ```

3. **Verify DATABASE_URL is set in Vercel**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Make sure `DATABASE_URL` is set


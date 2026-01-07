# Fix Admin Login Issue

## Quick Fix Steps

### 1. Make sure DATABASE_URL is set

**Local development:**
```bash
# Check if .env.local exists and has DATABASE_URL
cat .env.local | grep DATABASE_URL
```

**Vercel/Production:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Make sure `DATABASE_URL` is set

### 2. Create the Admin User

Run the seed script:
```bash
npm run seed-admin
```

This creates/updates the admin user with:
- Username: `admin`
- Password: `admin123`

### 3. Verify the Admin User Exists

```bash
# Set DATABASE_URL first if not already set
export DATABASE_URL="your-database-url"

# Then check
npm run check-admin
```

### 4. Test Login

Go to `/admin/login` and try:
- Username: `admin`
- Password: `admin123`

## Common Causes

### Cause 1: Admin User Doesn't Exist
**Fix**: Run `npm run seed-admin`

### Cause 2: Wrong Password Hash
**Fix**: Run `npm run seed-admin` to reset password

### Cause 3: Database Not Connected
**Fix**: 
- Check `DATABASE_URL` is correct
- Verify database is accessible
- Run `npx prisma migrate deploy`

### Cause 4: Database Migrations Not Run
**Fix**: Run `npx prisma migrate deploy`

## Debugging

### Check Server Logs

When you try to login, check your server console. You should see:
- ✅ "Successful login for user 'admin'" → Login worked
- ❌ "Admin user 'admin' not found" → User doesn't exist
- ❌ "Password verification failed" → Password wrong
- ❌ "DATABASE_URL is not set" → Database not configured

### Manual Database Check

If you have database access:

```sql
-- Check if admin user exists
SELECT * FROM "Admin" WHERE username = 'admin';

-- If it exists, you can manually reset the password hash
-- (But it's easier to just run: npm run seed-admin)
```

## For Vercel

1. **Set DATABASE_URL** in Vercel environment variables
2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```
3. **Create admin user**:
   ```bash
   vercel env pull .env.local
   npm run seed-admin
   ```
4. **Try login again**

## Still Not Working?

1. Check browser console for errors
2. Check server logs for detailed error messages
3. Verify DATABASE_URL is correct
4. Make sure database migrations are up to date
5. Try creating admin user again: `npm run seed-admin`


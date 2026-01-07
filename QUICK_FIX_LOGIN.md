# Quick Fix: Admin Login

## ⚠️ Important: Correct Password

The default password is: **`admin123`** (not "admon123")

- ✅ Correct: `admin123`
- ❌ Wrong: `admon123`

## Step-by-Step Fix

### 1. Make sure you're using the correct password
- Username: `admin`
- Password: `admin123` (note: admin**123**, not admin**n**123)

### 2. Create/Reset the admin user

Run this command:
```bash
npm run seed-admin
```

This will:
- Create the admin user if it doesn't exist
- Reset the password to `admin123` if it exists

### 3. Verify the admin user

```bash
npm run check-admin
```

This will tell you:
- ✅ If admin user exists
- ✅ If password "admin123" is correct

### 4. Try logging in again

Go to `/admin/login` and use:
- Username: `admin`
- Password: `admin123`

## Common Mistakes

1. **Typo in password**: Make sure it's `admin123` not `admon123`
2. **Admin user doesn't exist**: Run `npm run seed-admin`
3. **Wrong password hash**: Run `npm run seed-admin` to reset
4. **DATABASE_URL not set**: Check environment variables

## Debugging

Check your server console when you try to login. You'll see:
- "Admin user 'admin' not found" → Run `npm run seed-admin`
- "Password verification failed" → Make sure password is exactly `admin123`
- "DATABASE_URL is not set" → Set database connection string

## Still Not Working?

1. **Double-check the password**: It's `admin123` (a-d-m-i-n-1-2-3)
2. **Recreate admin user**: `npm run seed-admin`
3. **Check server logs**: Look for specific error messages
4. **Verify DATABASE_URL**: Make sure it's set and correct


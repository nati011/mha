# Default Admin User

## Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## Creating the Admin User

### Option 1: Using the Seed Script (Recommended)

```bash
npm run seed-admin
```

This will create/update the admin user with:
- Username: `admin`
- Password: `admin123`

You can also specify custom credentials:
```bash
npm run seed-admin myadmin mypassword
```

### Option 2: After Database Migration

If you're setting up a new database, run:

```bash
# Run migrations
npx prisma migrate deploy

# Create admin user
npm run seed-admin
```

Or use the combined setup command:
```bash
npm run setup
```

### Option 3: Manual Creation via API

After the app is running, you can create admin users through the admin panel at `/admin/users/new` (requires existing admin login).

## For Vercel/Production

After deploying to Vercel and setting up your database:

1. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Create admin user**:
   ```bash
   DATABASE_URL="your-postgres-url" npm run seed-admin
   ```

Or use Vercel CLI:
```bash
vercel env pull .env.local
npm run seed-admin
```

## Security Notes

- The default password `admin123` is **not secure** for production
- Always change the default password after first login
- Consider using a strong, unique password
- Enable additional security measures in production

## Login

Once the admin user is created, you can log in at:
- **URL**: `/admin/login`
- **Username**: `admin`
- **Password**: `admin123`


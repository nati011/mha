# Automatic Seeding During Build

## Overview

The application automatically attempts to seed the default admin user (`admin` / `admin123`) during the build process.

## How It Works

1. **During Build**: The `build` script runs `seed-admin:build` before building the Next.js app
2. **Seeding Logic**: 
   - Checks if `DATABASE_URL` is set and valid
   - If available, creates/updates the default admin user
   - If not available, skips seeding gracefully (doesn't fail the build)

## Build Script

```json
"build": "prisma generate && npm run seed-admin:build; next build"
```

The `;` ensures that even if seeding fails, the build continues.

## When Seeding Happens

### ✅ Seeding Will Happen If:
- `DATABASE_URL` is set in environment variables
- Database is accessible during build
- Database migrations have been run

### ⚠️ Seeding Will Be Skipped If:
- `DATABASE_URL` is not set
- Database is not accessible during build (common on Vercel)
- Database connection fails

## Default Admin User

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## Manual Seeding

If automatic seeding doesn't happen during build, you can manually seed:

```bash
# After deployment, when DATABASE_URL is set:
npm run seed-admin
```

Or with custom credentials:
```bash
npm run seed-admin myusername mypassword
```

## For Vercel Deployment

1. **Set DATABASE_URL** in Vercel environment variables
2. **Deploy** - seeding will attempt during build
3. **If seeding fails during build** (common), run manually:
   ```bash
   vercel env pull .env.local
   npm run seed-admin
   ```

## Troubleshooting

### Build fails with seeding error
- The build script uses `;` instead of `&&` to ensure build continues even if seeding fails
- Check that `seed-admin:build` exits with code 0 even on errors

### Admin user not created after deployment
- Check that `DATABASE_URL` is set correctly in Vercel
- Run `npm run seed-admin` manually after deployment
- Verify database migrations have been run: `npx prisma migrate deploy`

### "PrismaClient needs to be constructed" error
- This is normal if `DATABASE_URL` is not set
- The script handles this gracefully and doesn't fail the build


# Prisma 7 PostgreSQL Adapter Fix

## Problem

Prisma 7 requires an adapter for PostgreSQL. The error was:
```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

## Solution

### 1. Installed Required Packages
```bash
npm install @prisma/adapter-pg pg @types/pg
```

### 2. Created Shared Helper Function
Created `lib/create-prisma-client.ts` that creates PrismaClient with the PostgreSQL adapter:
```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

export function createPrismaClientWithAdapter(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}
```

### 3. Updated All PrismaClient Instances

**Updated files:**
- `lib/db.ts` - Main PrismaClient export (uses helper)
- `scripts/seed-admin.ts` - Admin seeding script
- `scripts/seed-admin-build.ts` - Build-time seeding script
- `scripts/check-admin.ts` - Admin verification script

All now use `createPrismaClientWithAdapter()` instead of `new PrismaClient()`.

## Why This Works

- **Prisma 7 Requirement**: Prisma 7 requires an adapter for PostgreSQL connections
- **PostgreSQL Adapter**: `@prisma/adapter-pg` provides the adapter for PostgreSQL
- **Consistent Usage**: All PrismaClient instances now use the same adapter configuration

## For Vercel Deployment

1. **Rebuild Required**: Vercel needs to rebuild to regenerate Prisma client with adapter
2. **Environment Variables**: Ensure `DATABASE_URL` is set in Vercel
3. **Dependencies**: The new packages (`@prisma/adapter-pg`, `pg`) will be installed automatically

## Verification

After deployment, the PrismaClient should initialize correctly without the adapter error. All database operations will use the PostgreSQL adapter.


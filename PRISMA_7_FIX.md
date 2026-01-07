# Prisma 7 Engine Type Fix

## Problem

Prisma 7 was throwing this error:
```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

## Solution

Added `engineType = "library"` to the Prisma schema generator configuration. This tells Prisma to use the library engine instead of the client engine, which doesn't require an adapter or accelerateUrl for PostgreSQL.

## Changes Made

**File: `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
  engineType = "library"  // Added this line
}
```

## Why This Works

- **Library Engine**: Uses the standard Prisma query engine (binary)
- **Client Engine**: Requires either an adapter (for SQLite) or accelerateUrl (for Prisma Accelerate)
- For PostgreSQL, the library engine is the standard and recommended approach

## After Making This Change

1. Regenerate Prisma Client:
   ```bash
   npx prisma generate
   ```

2. Rebuild your application:
   ```bash
   npm run build
   ```

## Verification

The error should no longer occur. PrismaClient will initialize correctly with just the `DATABASE_URL` environment variable.


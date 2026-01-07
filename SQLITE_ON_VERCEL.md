# Why SQLite Doesn't Work on Vercel (And Alternatives)

## The Technical Problem

### 1. **Read-Only Filesystem**
Vercel's serverless functions run in a read-only filesystem environment. The only writable directory is `/tmp`, which is:
- **Ephemeral**: Cleared between function invocations
- **Not shared**: Each serverless function instance has its own `/tmp`
- **Limited**: Not suitable for persistent database storage

### 2. **File System Requirements**
SQLite needs to:
- Create and write database files
- Create journal files (`.db-journal`)
- Lock files for concurrent access
- Maintain persistent storage

None of these work reliably in Vercel's serverless environment.

### 3. **Native Module Issues**
`better-sqlite3` is a native Node.js module that:
- Needs to be compiled for the specific platform
- May not compile correctly in Vercel's build environment
- Requires system libraries that may not be available

## What Happens When You Try

When you deploy SQLite to Vercel, you'll get errors like:
```
Cannot open database because the directory does not exist
```

This happens because:
1. The code tries to create/write to a database file
2. Vercel's filesystem doesn't allow writing outside `/tmp`
3. Even if you use `/tmp`, the data disappears after the function ends

## Alternatives to Keep Using SQLite

### Option 1: Use a Different Hosting Platform

If you want to keep SQLite, consider platforms that support it:

**Platforms that support SQLite:**
- **Railway** - Supports SQLite and persistent volumes
- **Render** - Supports SQLite with persistent disks
- **Fly.io** - Supports SQLite with volumes
- **DigitalOcean App Platform** - Supports persistent storage
- **Traditional VPS** (DigitalOcean, Linode, etc.) - Full filesystem access

### Option 2: Use SQLite-Compatible Cloud Services

**Turso** (formerly libSQL):
- SQLite-compatible database
- Serverless-friendly
- Works with Vercel
- Free tier available

**LiteFS**:
- Distributed SQLite
- More complex setup
- Works with Fly.io

### Option 3: Hybrid Approach

Keep SQLite for local development, use PostgreSQL for production:

```typescript
// lib/db.ts
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  
  if (databaseUrl.startsWith('file:')) {
    // SQLite for local development
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    // ... SQLite setup
  } else {
    // PostgreSQL for production
    return new PrismaClient()
  }
}
```

**But**: Prisma schema can only have one provider, so you'd need separate schemas or schema switching.

### Option 4: Use Vercel with External Storage

You could theoretically:
1. Store SQLite database in cloud storage (S3, etc.)
2. Download it to `/tmp` on each function invocation
3. Upload changes back

**Problems**:
- Very slow (download/upload on every request)
- Concurrency issues (multiple functions writing simultaneously)
- Not practical for production

## Recommendation

### For Vercel: Use PostgreSQL
- ✅ Works perfectly with serverless
- ✅ Managed services available (Vercel Postgres, Neon, Supabase)
- ✅ Free tiers available
- ✅ Better for production (concurrent access, scalability)

### If You Must Use SQLite: Switch Platforms
- Railway, Render, or Fly.io support SQLite better
- Or use Turso (SQLite-compatible cloud service)

## Cost Comparison

**SQLite (Local/File-based)**:
- Free (but doesn't work on Vercel)

**PostgreSQL Options**:
- **Vercel Postgres**: Free tier (256MB), then paid
- **Neon**: Free tier (0.5GB), then paid
- **Supabase**: Free tier (500MB), then paid
- **Railway**: Free tier, then usage-based

**Turso (SQLite-compatible)**:
- Free tier available
- Works with Vercel

## Conclusion

SQLite is great for:
- ✅ Local development
- ✅ Small applications
- ✅ Single-user applications
- ✅ Embedded systems

SQLite is NOT suitable for:
- ❌ Vercel serverless functions
- ❌ Multi-instance deployments
- ❌ High-concurrency applications
- ❌ Serverless environments in general

**Bottom line**: If you want to deploy to Vercel, PostgreSQL is the practical choice. If you must use SQLite, consider a different hosting platform or use Turso.


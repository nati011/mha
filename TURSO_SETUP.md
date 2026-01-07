# Using Turso (SQLite-Compatible) with Vercel

Turso is a SQLite-compatible database that works with Vercel's serverless environment.

## Setup Steps

### 1. Create Turso Account
1. Go to [turso.tech](https://turso.tech)
2. Sign up for free account
3. Create a new database

### 2. Get Connection Details
1. In Turso dashboard, get your database URL
2. Get your auth token

### 3. Set Environment Variables in Vercel
- `DATABASE_URL`: Your Turso database URL
- `TURSO_AUTH_TOKEN`: Your Turso auth token (if needed)

### 4. Update Prisma Schema
Keep SQLite provider but use Turso's connection string format.

### 5. Install Turso CLI (Optional)
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

## Benefits
- ✅ SQLite-compatible (same queries, same schema)
- ✅ Works with Vercel
- ✅ Free tier available
- ✅ Global edge replication
- ✅ No schema changes needed

## Migration from SQLite
Your existing SQLite database can be imported to Turso.


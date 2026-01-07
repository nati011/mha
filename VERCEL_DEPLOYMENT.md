# Vercel Deployment Guide

## Why Local Builds Succeed But Vercel Fails

There are several common reasons why builds succeed locally but fail on Vercel:

### 1. **Prisma Client Generation**
**Issue**: Prisma client must be generated before the build. Vercel doesn't automatically run `prisma generate`.

**Solution**: Added `postinstall` script and updated `build` script to ensure Prisma client is generated.

### 2. **Node.js Version Mismatch**
**Issue**: Your local Node.js version (v24.11.1) may differ from Vercel's default.

**Solution**: 
- Added `.nvmrc` file specifying Node 20
- Added `engines` field in `package.json`
- Created `vercel.json` with explicit Node version

### 3. **TypeScript Strict Mode**
**Issue**: With `strict: true` in `tsconfig.json`, Vercel's build environment may catch errors that local builds miss due to:
- Different TypeScript versions
- Build cache differences
- Different file resolution

**Solution**: All implicit `any` types have been fixed. Ensure all type errors are resolved.

### 4. **Build Cache**
**Issue**: Local builds may use cached `.next` folder, hiding errors.

**Solution**: Always test with a clean build:
```bash
rm -rf .next node_modules/.cache
npm run build
```

### 5. **Environment Variables**
**Issue**: Missing environment variables on Vercel.

**Required Variables**:
- `DATABASE_URL` - Your database connection string
- Any other environment variables your app needs

**Solution**: Set all required environment variables in Vercel dashboard under Project Settings → Environment Variables.

### 6. **Native Dependencies (better-sqlite3)**
**Issue**: `better-sqlite3` is a native module that may have issues on Vercel's serverless environment.

**Note**: SQLite with better-sqlite3 may not work on Vercel's serverless functions because:
- Serverless functions are stateless
- SQLite requires a persistent file system
- Native modules may not compile correctly

**Alternative**: Consider using a cloud database (PostgreSQL, MySQL) for production on Vercel.

## Files Added/Modified

1. **package.json**: 
   - Added `postinstall` script to generate Prisma client
   - Updated `build` script to include Prisma generation
   - Added `engines` field for Node version

2. **.nvmrc**: Specifies Node 20 for local development

3. **vercel.json**: Explicit Vercel configuration with Node version

## Testing Before Deployment

1. **Clean build test**:
   ```bash
   rm -rf .next node_modules/.cache
   npm run build
   ```

2. **Check for TypeScript errors**:
   ```bash
   npx tsc --noEmit
   ```

3. **Verify Prisma client is generated**:
   ```bash
   ls -la node_modules/.prisma/client
   ```

## Common Vercel Build Errors

### "Module not found: Can't resolve '@prisma/client'"
**Fix**: Ensure `postinstall` script runs `prisma generate`

### "Type error: Parameter implicitly has 'any' type"
**Fix**: Add explicit type annotations (already fixed in this codebase)

### "Command failed with exit code 1"
**Fix**: Check build logs in Vercel dashboard for specific error

### "better-sqlite3: Failed to load native module"
**Fix**: Consider using a different database for production (PostgreSQL recommended)

## Next Steps

1. Commit and push these changes
2. Check Vercel build logs if issues persist
3. Ensure all environment variables are set in Vercel
4. Consider migrating from SQLite to PostgreSQL for production


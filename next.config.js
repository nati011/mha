/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude native modules from webpack bundling on server
      // Only needed if using SQLite locally
      config.externals = config.externals || []
      // Uncomment these if you're still using SQLite locally:
      // config.externals.push('better-sqlite3')
      // config.externals.push('@prisma/adapter-better-sqlite3')
    }
    return config
  },
}

module.exports = nextConfig


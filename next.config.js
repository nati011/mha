/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude native modules from webpack bundling on server
      config.externals = config.externals || []
      config.externals.push('better-sqlite3')
      config.externals.push('@prisma/adapter-better-sqlite3')
    }
    return config
  },
}

module.exports = nextConfig


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // SQLite support
    config.externals.push({
      'better-sqlite3': 'commonjs better-sqlite3',
    });
    return config;
  },
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // SSR on Cloudflare Workers via @cloudflare/next-on-pages
  // output: 'export' を削除してSSRを有効化
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

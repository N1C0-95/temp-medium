import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  output: 'standalone',
  experimental: {
    swcPlugins: [
      ['fluentui-next-appdir-directive', { paths: ['@griffel', '@fluentui'] }],
    ],
  },
};

export default nextConfig;

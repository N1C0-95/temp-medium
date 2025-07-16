import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  output: 'standalone',
  experimental: {
    swcPlugins: [
      ['fluentui-next-appdir-directive', { paths: ['@griffel', '@fluentui'] }],
    ],
  }
  /* config options here */
};
export default nextConfig;

// const nextConfig = {
//   reactStrictMode: true,
//   distDir: 'build',
//   output: 'standalone',
//   // config options here
// };

// module.exports = nextConfig;

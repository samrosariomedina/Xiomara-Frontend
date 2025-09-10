import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Disable font optimization when using Turbopack to avoid module resolution issues
  experimental: {
    optimizePackageImports: ['next/font/google'],
  },
  // Alternative: disable font optimization entirely if issues persist
  // optimizeFonts: false,
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);


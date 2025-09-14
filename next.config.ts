import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Configure server actions body size limit to 100MB
  serverActions: {
    bodySizeLimit: '100mb',
  },
  
 
  
  // Additional configuration for large file uploads
  
  
  // Configure webpack for large files
  
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);


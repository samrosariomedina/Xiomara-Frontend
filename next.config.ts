/** @type {import('next').NextConfig} */

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl({
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  
  // Configure API routes body size limit (for Pages Router compatibility)
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
});

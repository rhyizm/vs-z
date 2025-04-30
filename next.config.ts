import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin'; // Import the plugin

const nextConfig: NextConfig = {
  /* config options here */
  // Add any existing Next.js config options here
};

// Wrap the config with the next-intl plugin, pointing to your i18n config file
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

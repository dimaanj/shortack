/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@shortack/monitor-core"],
  experimental: {
    serverComponentsExternalPackages: ["pino", "pino-pretty"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300,
        poll: 1000,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

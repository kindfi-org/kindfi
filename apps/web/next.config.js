/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle native modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'sodium-native': false,
      };
    }

    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/sodium-native/ },
      { module: /node_modules\/require-addon/ },
    ];

    return config;
  },
  // Add any other Next.js config options here
};

module.exports = nextConfig; 
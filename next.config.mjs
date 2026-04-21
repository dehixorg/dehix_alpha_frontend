/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login',
        permanent: true, // Set to false if this is a temporary redirect
      },
    ];
  },
};

export default nextConfig;

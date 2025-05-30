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

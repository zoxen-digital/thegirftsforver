/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose'],
  images: {
    // images uploaded from the admin are stored in MongoDB and served from /api/uploads/**
    localPatterns: [{ pathname: '/api/uploads/**' }, { pathname: '/**' }],
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};
export default nextConfig;

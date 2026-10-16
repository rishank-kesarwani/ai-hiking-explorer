/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 2678400, // 31 days (prevents re-transforming unchanged assets every 60s)
    deviceSizes: [640, 768, 1080, 1280], // Matched to .container max-width 1280px; eliminates wasteful 1920, 2048, 3840 transformations
    imageSizes: [64, 128, 256, 384], // Compact responsive step sizes for thumbnails and card layouts
    qualities: [75], // Standardize allowed transformation quality to prevent permutation bloat
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};

export default nextConfig;

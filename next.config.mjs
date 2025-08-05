/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds for now
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds with TypeScript errors for now
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

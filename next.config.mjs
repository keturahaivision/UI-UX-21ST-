/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Pre-optimized WebP are served statically; keep next/image responsive sizing.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920],
  },
  async redirects() {
    // /sh_projects/{slug} -> /projects/{slug}
    return [
      { source: '/sh_projects/:slug', destination: '/projects/:slug', permanent: true },
      { source: '/our-clients', destination: '/about', permanent: true },
    ];
  },
};
export default nextConfig;

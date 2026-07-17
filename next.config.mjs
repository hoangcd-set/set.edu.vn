/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'media.set.edu.vn' }] },
};
export default nextConfig;

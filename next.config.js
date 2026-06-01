
/** @type {import('next').NextConfig} */

// Extract just the hostname from the R2 public URL env var (e.g. "pub-xxx.r2.dev")
// Set NEXT_PUBLIC_R2_HOSTNAME in Vercel env vars to your specific bucket hostname
const r2Hostname = process.env.NEXT_PUBLIC_R2_HOSTNAME ||
  (process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname
    : null);

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'belife.site' }],
        destination: 'https://www.belife.site/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Scope to specific R2 bucket hostname, not the whole *.r2.dev wildcard
      ...(r2Hostname ? [{ protocol: 'https', hostname: r2Hostname }] : [{ protocol: 'https', hostname: '*.r2.dev' }]),
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

module.exports = nextConfig;

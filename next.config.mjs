import { withPayload } from '@payloadcms/next/withPayload'
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/about', destination: '/bio', permanent: true },
      { source: '/updates', destination: '/posts', permanent: true },
      { source: '/blog', destination: '/posts', permanent: true },
      { source: '/news', destination: '/posts', permanent: true },
      { source: '/join', destination: '/memberships', permanent: true },
      { source: '/subscribe', destination: '/memberships', permanent: true },
      { source: '/membership', destination: '/memberships', permanent: true },
      { source: '/signin', destination: '/login', permanent: true },
      { source: '/sign-up', destination: '/login', permanent: true },
      { source: '/signup', destination: '/login', permanent: true },
      { source: '/register', destination: '/login', permanent: true },
      { source: '/profile', destination: '/account', permanent: true },
      { source: '/dashboard', destination: '/account', permanent: true },
      { source: '/settings', destination: '/account', permanent: true },
      { source: '/billing', destination: '/account', permanent: true },
      { source: '/members', destination: '/crew', permanent: true },
      { source: '/street-team', destination: '/crew', permanent: true },
      { source: '/unreleased', destination: '/music/unreleased', permanent: true },
      { source: '/vault', destination: '/music/unreleased', permanent: true },
      { source: '/wip', destination: '/music/unreleased', permanent: true },
      { source: '/songs', destination: '/music', permanent: true },
      {
        source: '/songs/:slug',
        destination: '/music/:slug',
        permanent: true,
      },
      {
        source: '/song/:slug',
        destination: '/music/:slug',
        permanent: true,
      },
      {
        source: '/tag/:category/:slug',
        destination: '/music/tag/:category/:slug',
        permanent: true,
      },
      {
        source: '/tags/:category/:slug',
        destination: '/music/tag/:category/:slug',
        permanent: true,
      },
    ]
  },
  images: {
    // AVIF first, then WebP. Next.js negotiates per request based on the
    // browser's Accept header. Modern browsers all support both. Falling back
    // to the original format only happens for very old clients.
    formats: ['image/avif', 'image/webp'],
    // Every `quality` passed to <Image> must appear here (Next 16+). Defaults
    // to [75] only if omitted — see next-image-unconfigured-qualities.
    qualities: [40, 75, 80, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
    ],
  },
  allowedDevOrigins: ['127.0.0.1'],
  // taglib-wasm ships a .wasm binary that Turbopack/webpack can't bundle.
  // Keep it out of the client/server bundles so Node's loader resolves it
  // from node_modules at runtime instead.
  serverExternalPackages: ['taglib-wasm'],
}

export default withPayload(nextConfig)

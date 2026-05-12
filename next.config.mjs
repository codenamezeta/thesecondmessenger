import { withPayload } from '@payloadcms/next/withPayload'
/** @type {import('next').NextConfig} */
const nextConfig = {
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

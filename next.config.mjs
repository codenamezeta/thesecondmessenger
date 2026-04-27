import { withPayload } from '@payloadcms/next/withPayload'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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

import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:8080'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@payloadcms/richtext-lexical', '@payloadcms/ui'],
  images: {
    // Explicitly allow quality 100 so the template doesn't crash
    qualities: [60, 75, 85, 100],

    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        // port: '8080',
        // Remove 'pathname' restriction for localhost.
        // It saves you from debugging if the path is /media or /api/media
        pathname: '/**',
      },
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
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  // Optimize resource preloading to reduce console warnings
  experimental: {
    optimizePackageImports: ['@payloadcms/ui', '@payloadcms/richtext-lexical'],
  },
  // Reduce unnecessary preloading
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

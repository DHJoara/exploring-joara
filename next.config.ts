import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: false,
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SERVER_URL
      ? [
          new URL('/api/pictures/file/**', process.env.NEXT_PUBLIC_SERVER_URL),
          new URL('/api/site_images/file/**', process.env.NEXT_PUBLIC_SERVER_URL),
        ]
      : [],
    localPatterns: [
      { pathname: '/images/**' },
      { pathname: '/api/pictures/file/**' },
      { pathname: '/api/site_images/file/**' },
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],

  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

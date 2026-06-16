import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: false, // We'll register manually for push notifications
  skipWaiting: true,
  disable: true, // Disable next-pwa completely to avoid conflicts
  sw: 'sw.js', // Use our custom service worker
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})

const nextConfig = pwaConfig({
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    // Enable HTTPS in development for PWA testing
    https: process.env.NODE_ENV === 'development' && process.env.HTTPS === 'true',
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })
    return config
  },
  async rewrites() {
    const rewrites = [
      {
        source: '/static/:path*',
        destination: '/:path*'
      }
    ]
    if (process.env.NEXT_PRIVATE_API_URL) {
      rewrites.unshift({
        source: '/api/:path*',
        destination: `${process.env.NEXT_PRIVATE_API_URL}/:path*`
      })
    }
    return rewrites
  }
})

export default nextConfig
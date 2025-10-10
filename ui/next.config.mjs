import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Enable PWA in development for testing
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
    return [
      {
        source: '/static/:path*',
        destination: '/:path*'
      }
    ]
  }
})

export default nextConfig
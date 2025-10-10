import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cuddles',
    short_name: 'Cuddles',
    description:
      'Your personal wellness calendar track periods, intimacy, and health data with complete privacy.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#ffffff',
    theme_color: '#ec4899',
    categories: ['health', 'lifestyle', 'wellness', 'medical'],
    lang: 'en-US',
    dir: 'ltr',

    icons: [
      {
        src: '/static/icons/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/static/icons/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/static/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/static/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/static/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],

    screenshots: [
      {
        src: '/static/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/static/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],

    shortcuts: [
      {
        name: 'Add Period Entry',
        short_name: 'Add Period',
        description: 'Record a new period entry',
        url: '/?action=add-period',
        icons: [
          {
            src: '/static/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Add Intimacy Entry',
        short_name: 'Add Intimacy',
        description: 'Record intimacy data',
        url: '/?action=add-intimacy',
        icons: [
          {
            src: '/static/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'View Calendar',
        short_name: 'Calendar',
        description: 'View your wellness calendar',
        url: '/?view=calendar',
        icons: [
          {
            src: '/static/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],

    related_applications: [],
    prefer_related_applications: false,
  }
}

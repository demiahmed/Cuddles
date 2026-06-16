// Custom Service Worker with Push Notification Support

// Cache configuration
const CACHE_NAME = 'cuddles-v2';
const urlsToCache = [
  '/',
  '/static/icons/android-chrome-192x192.png',
  '/static/icons/android-chrome-512x512.png',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png',
  '/offline.html',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('⚠️ Some resources failed to cache:', err);
          // Don't fail entirely if some resources can't be cached
          return Promise.resolve();
        });
      })
      .then(function() {
        console.log('✅ Service Worker installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('⚡ Service Worker activating...');
  
  // Keep-alive mechanism for Android Chrome
  let keepAliveInterval;
  if (!keepAliveInterval) {
    keepAliveInterval = setInterval(() => {
      // Lightweight operation to keep SW alive
      console.log('🔄 Keep-alive ping');
    }, 25000); // Every 25 seconds
  }
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('🎯 Service Worker taking control of all pages');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(function() {
          // If both cache and network fail, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      }
    )
  );
});

// Push event - handle incoming push notifications with high priority
self.addEventListener('push', function(event) {
  console.log('📱 Push notification received:', event);
  
  let notificationData = {
    title: 'Cuddles 🤗',
    body: 'You have a new notification',
    icon: '/static/icons/android-chrome-192x192.png', // Use proper Android icon
    badge: '/static/icons/notification-badge.png', // Android badge (monochrome)
    tag: 'cuddles-notification',
    requireInteraction: true, // High priority - stays visible until dismissed
    priority: 'high', // High priority for Android
    urgent: true, // iOS equivalent of high priority
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/static/icons/android-chrome-192x192.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Parse the push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      if (pushData.title) notificationData.title = pushData.title;
      if (pushData.body) notificationData.body = pushData.body;
      if (pushData.icon) notificationData.icon = pushData.icon;
      if (pushData.tag) notificationData.tag = pushData.tag;
      if (pushData.url) notificationData.data.url = pushData.url;
    } catch (e) {
      console.log('Error parsing push data:', e);
      // Fallback to text data
      const textData = event.data.text();
      if (textData) {
        notificationData.body = textData;
      }
    }
  }

  // Enhanced options for cross-platform compatibility with high priority
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    // Critical settings for Android Chrome reliability
    priority: 'high',
    urgent: true,
    silent: false,
    renotify: true,
    timestamp: notificationData.data.timestamp,
    // Enhanced vibration pattern for Android
    vibrate: [200, 100, 200],
    // Android specific display options
    image: notificationData.icon, // Large image for Android rich notifications
    // Keep notification visible until user interacts (Android Chrome fix)
    persistentNotification: true
  };

  // Only add actions if supported (iOS Safari may not support all action types)
  if ('actions' in Notification.prototype) {
    notificationOptions.actions = notificationData.actions;
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// Notification click event - handle notification interactions
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const clickUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === clickUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if app not open
      if (clients.openWindow) {
        return clients.openWindow(clickUrl);
      }
    })
  );
});

// Background sync for offline notification retry (Android Chrome enhancement)
self.addEventListener('sync', function(event) {
  if (event.tag === 'notification-retry') {
    console.log('🔄 Retrying failed notifications');
    // Could implement offline notification queue here
  }
});

// Message handler for communication with main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    console.log('� Keep-alive message received from main thread');
  }
});

console.log('🚀 Custom Service Worker loaded with push notification support - Version 2.0');

// Background sync for offline notification retry (Android Chrome enhancement)
self.addEventListener('sync', function(event) {
  if (event.tag === 'notification-retry') {
    console.log('🔄 Retrying failed notifications');
    // Could implement offline notification queue here
  }
});

// Message handler for communication with main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    // Reset keep-alive timer when app is active
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = setInterval(() => {
        console.log('🔄 Keep-alive ping');
      }, 25000);
    }
  }
});
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync event (if needed later)
self.addEventListener('sync', function(event) {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync operations
      Promise.resolve()
    );
  }
});

console.log('🚀 Custom Service Worker loaded with push notification support - Version 2.0');
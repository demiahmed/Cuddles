// Custom Service Worker with Push Notification Support & Android Chrome Fixes

// Cache configuration
const CACHE_NAME = 'cuddles-v3';
const urlsToCache = [
  '/',
  '/static/icons/android-chrome-192x192.png',
  '/static/icons/android-chrome-512x512.png',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png',
  '/offline.html',
  '/manifest.json'
];

// Keep-alive mechanism for Android Chrome
let keepAliveInterval;

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('⚠️ Some resources failed to cache:', err);
          return Promise.resolve();
        });
      })
      .then(function() {
        console.log('✅ Service Worker installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches & start keep-alive
self.addEventListener('activate', function(event) {
  console.log('⚡ Service Worker activating...');
  
  // Start keep-alive for Android Chrome reliability
  if (!keepAliveInterval) {
    keepAliveInterval = setInterval(() => {
      console.log('🔄 Keep-alive ping for Android Chrome');
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
        return response || fetch(event.request).catch(function() {
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', function(event) {
  console.log('📨 Push notification received:', event);

  let notificationData = {
    title: 'Cuddles 🤗',
    body: 'You have a new update!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'cuddles-notification',
    requireInteraction: true,
    data: { 
      url: '/',
      timestamp: Date.now()
    }
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      if (pushData.title) notificationData.title = pushData.title;
      if (pushData.body) notificationData.body = pushData.body;
      if (pushData.icon) notificationData.icon = pushData.icon;
      if (pushData.tag) notificationData.tag = pushData.tag;
      if (pushData.url) notificationData.data.url = pushData.url;
      if (pushData.requireInteraction) notificationData.requireInteraction = pushData.requireInteraction;
      if (pushData.renotify) notificationData.renotify = pushData.renotify;
      if (pushData.timestamp) notificationData.data.timestamp = pushData.timestamp;
    } catch (e) {
      console.log('Error parsing push data:', e);
      const textData = event.data.text();
      if (textData) {
        notificationData.body = textData;
      }
    }
  }

  // Enhanced notification options for Android Chrome reliability
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    // Critical settings for Android Chrome
    priority: 'high',
    urgent: true,
    silent: false,
    renotify: true,
    timestamp: notificationData.data.timestamp,
    vibrate: [200, 100, 200],
    image: notificationData.icon,
    // Persistent notification for Android Chrome
    persistentNotification: true
  };

  // Add actions if supported
  if ('actions' in Notification.prototype) {
    notificationOptions.actions = [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192x192.png'
      }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// Notification click event - handle notification interactions
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification clicked:', event);
  
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

// Background sync for Android Chrome
self.addEventListener('sync', function(event) {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'notification-retry') {
    console.log('🔄 Retrying failed notifications');
    // Could implement offline notification queue here
  }
});

// Message handler for main thread communication
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    console.log('📱 Keep-alive message from main thread');
    // Reset keep-alive timer
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = setInterval(() => {
        console.log('🔄 Keep-alive ping for Android Chrome');
      }, 25000);
    }
  }
});

console.log('🚀 Android Chrome-optimized Service Worker loaded - Version 3.0');
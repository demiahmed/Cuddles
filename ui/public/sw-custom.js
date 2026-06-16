// Custom Service Worker with Push Notification Support

// Cache configuration
const CACHE_NAME = 'cuddles-v1';
const urlsToCache = [
  '/',
  '/static/icons/android-chrome-192x192.png',
  '/static/icons/android-chrome-512x512.png',
  '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  self.skipWaiting(); // Force activation
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
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

// Push event - handle incoming push notifications
self.addEventListener('push', function(event) {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Cuddles Notification',
    body: 'You have a new notification',
    icon: '/static/icons/notification-icon.png',
    badge: '/static/icons/notification-badge-24.svg',
    tag: 'cuddles-notification',
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
    renotify: false,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };

  // Parse the push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      if (pushData.title) notificationData.title = pushData.title;
      if (pushData.body) notificationData.body = pushData.body;
      if (pushData.icon) notificationData.icon = pushData.icon;
    } catch (e) {
      console.log('Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: {
        url: '/'
      }
    })
  );
});

// Notification click event - handle notification interactions
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
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

console.log('Custom Service Worker loaded with push notification support');
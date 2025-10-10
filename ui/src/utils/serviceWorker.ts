import { VAPID_PUBLIC_KEY } from "./tokens";

// Cross-browser compatibility utilities
function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad|iPhone|iPod/);
  const webkit = !!ua.match(/WebKit/);
  return iOS && webkit && !ua.match(/CriOS/);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (window.navigator as any).standalone === true || 
         window.matchMedia('(display-mode: standalone)').matches;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  // iOS Safari specific handling
  if (isIOSSafari()) {
    // iOS Safari requires user gesture and has limited notification support
    if ('Notification' in window && 'requestPermission' in Notification) {
      return await (Notification as any).requestPermission();
    }
    return 'denied';
  }

  // Standard browsers
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  
  return Notification.permission;
}

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported in this browser');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      // Register service worker with different strategies for different browsers
      const swUrl = '/sw.js';
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });
      
      console.log('Service Worker registered:', registration.scope);

      // Handle different update scenarios
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
              // You could show a notification to user here
            }
          });
        }
      });

      // Request notification permission with cross-browser support
      const permission = await requestNotificationPermission();
      console.log('Notification permission:', permission);

      // Subscribe to push notifications if supported and permitted
      if (permission === 'granted' && 'pushManager' in registration) {
        await subscribeToPushNotifications(registration);
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });

  // Handle service worker updates with user control
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      if (confirm('New version available! Reload to update?')) {
        window.location.reload();
      }
    }
  });

  // Handle messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Message from service worker:', event.data);
  });
}

async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    // Check if push notifications are supported
    if (!('pushManager' in registration)) {
      console.warn('Push notifications not supported');
      return;
    }

    // iOS Safari doesn't support push notifications
    if (isIOSSafari()) {
      console.warn('Push notifications not supported on iOS Safari');
      return;
    }

    // Check for existing subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return;
    }

    // Only subscribe if we have VAPID key
    if (!VAPID_PUBLIC_KEY) {
      console.warn('VAPID public key not configured');
      return;
    }

    // Subscribe with VAPID key
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY
    });

    console.log('Push notification subscription successful:', subscription);

    // Send subscription to backend
    await sendSubscriptionToBackend(subscription);

  } catch (error) {
    console.warn('Failed to subscribe to push notifications:', error);
  }
}

async function sendSubscriptionToBackend(subscription: PushSubscription) {
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to backend');
    }

    console.log('Subscription sent to backend successfully');
  } catch (error) {
    console.error('Failed to send subscription to backend:', error);
  }
}

export function unregisterServiceWorker() {
  if (typeof window === 'undefined') return;
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error('Service Worker unregistration failed:', error);
      });
  }
}

// Install prompt for PWA
let deferredPrompt: any = null;

export function setupPWAInstallPrompt() {
  if (typeof window === 'undefined') return;

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button/banner
    showInstallBanner();
  });

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    hideInstallBanner();
  });

  // iOS Safari specific install guidance
  if (isIOSSafari() && !isStandalone()) {
    showIOSInstallGuidance();
  }
}

function showInstallBanner() {
  // Create or show install banner for Android/Desktop
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'block';
  }
}

function hideInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

function showIOSInstallGuidance() {
  // Show iOS-specific install instructions
  console.log('iOS Safari detected - showing install guidance');
  // You could show a modal or banner with iOS install instructions
}

export async function installPWA() {
  if (!deferredPrompt) {
    console.log('PWA install prompt not available');
    return false;
  }

  try {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    console.log('PWA install prompt result:', result);
    
    if (result.outcome === 'accepted') {
      deferredPrompt = null;
      return true;
    }
    return false;
  } catch (error) {
    console.error('PWA install failed:', error);
    return false;
  }
}
export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  
  console.log("🚀 Auto-registering service worker...");
  
  navigator.serviceWorker.register("/sw.js", { scope: "/" })
    .then(async (registration) => {
      console.log("✅ Service Worker registered:", registration.scope);
      await navigator.serviceWorker.ready;
      
      if ("Notification" in window && "PushManager" in window) {
        const permission = await Notification.requestPermission();
        console.log("📋 Permission:", permission);
        
        if (permission === "granted") {
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: "BPslBjReqITCyxu9e7YchOxRdRv1rwN9xWWTpKd2KsYAOBIz97JtqaYHUQDUD9vOdZZpeybfhq0khvg5S9vyEp8"
            });
            
            await fetch("/api/save-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(subscription.toJSON())
            });
            
            console.log("✅ Push notifications enabled!");
          } catch (e) {
            console.warn("Push setup failed:", e);
          }
        }
      }
    })
    .catch(e => console.error("SW registration failed:", e));
}

let deferredPrompt: any = null;

export function setupPWAInstallPrompt() {
  if (typeof window === "undefined") return;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 PWA install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });
}

export async function installPWA(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('❌ PWA install prompt not available');
    return false;
  }
  
  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`👤 User choice for PWA install: ${outcome}`);
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('❌ PWA install failed:', error);
    return false;
  }
}

export async function requestNotificationPermission(): Promise<string> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.log('❌ Notifications not supported');
    return "denied";
  }
  
  try {
    console.log('🔔 Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log(`📋 Notification permission result: ${permission}`);
    return permission;
  } catch (error) {
    console.error('❌ Notification permission request failed:', error);
    return "denied";
  }
}

export async function subscribeToPushNotifications(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported");
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (!('pushManager' in registration)) {
      throw new Error("Push notifications not supported");
    }
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "BPslBjReqITCyxu9e7YchOxRdRv1rwN9xWWTpKd2KsYAOBIz97JtqaYHUQDUD9vOdZZpeybfhq0khvg5S9vyEp8"
    });
    
    const response = await fetch("/api/save-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON())
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save subscription: ${response.status}`);
    }
    
    console.log("✅ Successfully subscribed to push notifications");
  } catch (error) {
    console.error('❌ Push subscription failed:', error);
    throw error;
  }
}

export function unregisterServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
  });
}

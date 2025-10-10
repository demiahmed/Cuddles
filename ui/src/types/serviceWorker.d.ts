interface SyncManager {
  register(tag: string): Promise<void>;
}

declare global {
  interface ServiceWorkerRegistration {
    sync?: SyncManager;
  }

  interface Window {
    workbox: any;
  }
}
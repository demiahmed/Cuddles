interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

declare global {
  interface ServiceWorkerRegistration {
    sync?: SyncManager;
  }
  
  interface WindowEventMap {
    'online': Event;
    'offline': Event;
  }
}

export {}
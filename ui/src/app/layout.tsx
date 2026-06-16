import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuddles 🤗",
  description: "Your personal wellness calendar",
  manifest: "/manifest.json",
  themeColor: "#ec4899",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cuddles 🤗",
    startupImage: [
      {
        url: "/static/icons/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/static/icons/apple-splash-1668-2388.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/static/icons/apple-splash-1536-2048.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/static/icons/apple-splash-1125-2436.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/static/icons/apple-splash-1242-2688.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: "/static/icons/favicon.ico",
    shortcut: "/static/icons/favicon-32x32.png",
    apple: "/static/icons/apple-touch-icon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/static/icons/safari-pinned-tab.svg",
        color: "#ec4899",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/x-icon" href="/static/icons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/static/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/static/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/static/icons/apple-touch-icon.png" />
        <link rel="mask-icon" href="/static/icons/safari-pinned-tab.svg" color="#ec4899" />
        <meta name="theme-color" content="#ec4899" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Immediate service worker registration - like old HTML version
            console.log('🚀 Auto-registering service worker from layout...');
            
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(async (registration) => {
                  console.log('✅ SW registered:', registration.scope);
                  await navigator.serviceWorker.ready;
                  
                  // Auto-request notifications
                  if ('Notification' in window && 'PushManager' in window) {
                    const permission = await Notification.requestPermission();
                    console.log('📋 Permission:', permission);
                    
                    if (permission === 'granted' && 'BPslBjReqITCyxu9e7YchOxRdRv1rwN9xWWTpKd2KsYAOBIz97JtqaYHUQDUD9vOdZZpeybfhq0khvg5S9vyEp8') {
                      try {
                        const subscription = await registration.pushManager.subscribe({
                          userVisibleOnly: true,
                          applicationServerKey: 'BPslBjReqITCyxu9e7YchOxRdRv1rwN9xWWTpKd2KsYAOBIz97JtqaYHUQDUD9vOdZZpeybfhq0khvg5S9vyEp8'
                        });
                        
                        // Send to server
                        await fetch('/api/save-subscription', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(subscription.toJSON())
                        });
                        
                        console.log('✅ Push notifications setup complete!');
                      } catch (e) {
                        console.warn('Push setup failed:', e);
                      }
                    }
                  }
                })
                .catch(e => console.error('SW registration failed:', e));
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

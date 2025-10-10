'use client';

import React, { useEffect, useState } from 'react';
import { registerServiceWorker, setupPWAInstallPrompt, installPWA, requestNotificationPermission } from '@/utils/serviceWorker';

export default function ServiceWorkerRegistration() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSGuidance, setShowIOSGuidance] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Initialize service worker and PWA features
    registerServiceWorker();
    setupPWAInstallPrompt();

    // Browser detection
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      const iOS = !!ua.match(/iPad|iPhone|iPod/);
      const webkit = !!ua.match(/WebKit/);
      const iosDetected = iOS && webkit && !ua.match(/CriOS/);
      const standaloneDetected = (window.navigator as any).standalone === true || 
                                window.matchMedia('(display-mode: standalone)').matches;
      
      setIsIOSSafari(iosDetected);
      setIsStandalone(standaloneDetected);

      // Show appropriate install prompts
      if (!standaloneDetected) {
        if (iosDetected) {
          setShowIOSGuidance(true);
        } else {
          // Wait for beforeinstallprompt event for Android/Desktop
          window.addEventListener('beforeinstallprompt', () => {
            setShowInstallPrompt(true);
          });
        }
      }

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', () => {});
      }
    };
  }, []);

  const handleInstallClick = async () => {
    const installed = await installPWA();
    if (installed) {
      setShowInstallPrompt(false);
    }
  };

  const handleNotificationRequest = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };

  const handleIOSGuidanceClose = () => {
    setShowIOSGuidance(false);
    // Remember user closed this so we don't show it again this session
    sessionStorage.setItem('ios-guidance-dismissed', 'true');
  };

  // Don't show iOS guidance if already dismissed this session
  const shouldShowIOSGuidance = showIOSGuidance && 
    isIOSSafari && 
    !isStandalone && 
    !sessionStorage.getItem('ios-guidance-dismissed');

  return (
    <>
      {/* PWA Install Banner - Android/Desktop */}
      {showInstallPrompt && !isStandalone && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-lg mb-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-sm font-medium">Install Cuddles App</p>
                <p className="text-xs text-pink-100">Get the full experience with offline access</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-pink-200 hover:text-white px-2 py-2 text-sm transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Permission Banner */}
      {notificationPermission === 'default' && !isIOSSafari && (
        <div className="bg-gradient-to-r from-blue-500 to-teal-600 text-white p-3 rounded-lg mb-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-sm font-medium">Enable Notifications</p>
                <p className="text-xs text-blue-100">Get reminders for your period and important dates</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNotificationRequest}
                className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Enable
              </button>
              <button
                onClick={() => setNotificationPermission('denied')}
                className="text-blue-200 hover:text-white px-2 py-2 text-sm transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Instructions Modal */}
      {shouldShowIOSGuidance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">📱</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Install Cuddles</h3>
              <p className="text-sm text-gray-600">
                Add Cuddles to your home screen for the best experience
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📤</span>
                <p className="text-sm text-gray-700">
                  Tap the <strong>Share</strong> button at the bottom
                </p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">➕</span>
                <p className="text-sm text-gray-700">
                  Select <strong>"Add to Home Screen"</strong>
                </p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">✅</span>
                <p className="text-sm text-gray-700">
                  Tap <strong>"Add"</strong> to confirm
                </p>
              </div>
            </div>

            <button
              onClick={handleIOSGuidanceClose}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Network Status Indicator */}
      <NetworkStatus />
    </>
  );
}

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        setShowOfflineMessage(false);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setShowOfflineMessage(true);
        setTimeout(() => setShowOfflineMessage(false), 3000);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!showOfflineMessage && isOnline) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 ${
      isOnline ? 'bg-green-500' : 'bg-red-500'
    }`}>
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-white"></span>
        <span>
          {isOnline ? 'Back online' : 'You\'re offline - some features may be limited'}
        </span>
      </div>
    </div>
  );
}
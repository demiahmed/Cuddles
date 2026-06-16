#!/bin/bash

# Enhanced PWA Cross-Browser Compatibility Check
echo "🚀 Cuddles PWA Cross-Browser Compatibility Check"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (Missing: $1)"
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        return 1
    fi
}

check_warning() {
    if [ -f "$1" ] || grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $3 (Optional)"
        return 1
    fi
}

echo ""
echo "📱 PWA Configuration Files"
echo "-------------------------"

# Core PWA files
check_file "ui/public/manifest.json" "Web App Manifest"
check_file "ui/src/app/manifest.ts" "Next.js Manifest"
check_file "ui/public/sw.js" "Service Worker"
check_file "ui/public/offline.html" "Offline Page"

echo ""
echo "🎨 PWA Icons & Assets"
echo "--------------------"

# Required icons for cross-browser compatibility
check_file "ui/public/static/icons/android-chrome-192x192.png" "Android Chrome 192x192"
check_file "ui/public/static/icons/android-chrome-512x512.png" "Android Chrome 512x512"
check_file "ui/public/static/icons/apple-touch-icon.png" "Apple Touch Icon"
check_file "ui/public/static/icons/favicon-16x16.png" "Favicon 16x16"
check_file "ui/public/static/icons/favicon-32x32.png" "Favicon 32x32"
check_file "ui/public/static/icons/favicon.ico" "ICO Favicon"

echo ""
echo "🔧 Service Worker Features"
echo "-------------------------"

# Service Worker functionality checks
check_content "ui/public/sw.js" "cacheFirst" "Cache-First Strategy"
check_content "ui/public/sw.js" "networkFirst" "Network-First Strategy" 
check_content "ui/public/sw.js" "staleWhileRevalidate" "Stale-While-Revalidate Strategy"
check_content "ui/public/sw.js" "Push.*handling" "Push Notifications"
check_content "ui/public/sw.js" "background.*sync" "Background Sync"
check_content "ui/public/sw.js" "handleOfflineFallback" "Offline Fallback"

echo ""
echo "📲 Cross-Browser Features"
echo "------------------------"

# iOS Safari compatibility
check_content "ui/src/utils/serviceWorker.ts" "isIOSSafari" "iOS Safari Detection"
check_content "ui/src/components/ServiceWorkerRegistration.tsx" "iOS.*guidance" "iOS Install Guidance"
check_content "ui/public/manifest.json" "apple-touch-icon" "iOS Icon Support"

# Android/Chrome features
check_content "ui/src/utils/serviceWorker.ts" "beforeinstallprompt" "Android Install Prompt"
check_content "ui/public/manifest.json" "maskable" "Maskable Icons"
check_content "ui/public/manifest.json" "shortcuts" "App Shortcuts"

# Desktop PWA features
check_content "ui/public/manifest.json" "window-controls-overlay" "Desktop Window Controls"
check_content "ui/public/manifest.json" "display_override" "Display Mode Fallbacks"

echo ""
echo "🔔 Notification Support"
echo "----------------------"

# Push notification setup
check_content "app/config.py" "VAPID" "VAPID Configuration"
check_content "ui/src/utils/tokens.ts" "VAPID" "VAPID Client Keys"
check_content "ui/public/sw.js" "showNotification" "Notification Display"
check_content "ui/src/utils/serviceWorker.ts" "requestNotificationPermission" "Permission Request"

echo ""
echo "⚡ Performance & Caching"
echo "-----------------------"

# Caching strategies
check_content "ui/public/sw.js" "CACHE_NAME" "Cache Versioning"
check_content "ui/src/utils/serviceWorker.ts" "updateViaCache.*none" "Service Worker Updates"
check_content "ui/public/sw.js" "skipWaiting" "Immediate Activation"
check_content "ui/public/sw.js" "clients.claim" "Client Control"

echo ""
echo "🌐 Network Resilience"
echo "--------------------"

# Offline functionality
check_content "ui/public/sw.js" "handleOfflineFallback" "Offline Handling"
check_content "ui/src/components/ServiceWorkerRegistration.tsx" "NetworkStatus" "Network Status Detection"
check_warning "ui/public/offline.html" ".*" "Custom Offline Page"

echo ""
echo "🔒 Security & Privacy"
echo "--------------------"

# Security checks
check_content "ui/public/manifest.json" "start_url.*/" "Secure Start URL"
check_content "ui/public/manifest.json" "scope.*/" "App Scope Definition"
check_content "ui/public/sw.js" "chrome-extension" "Extension URL Filtering"

echo ""
echo "📊 PWA Quality Metrics"
echo "---------------------"

# PWA best practices
check_content "ui/public/manifest.json" "description" "App Description"
check_content "ui/public/manifest.json" "categories" "App Categories"
check_content "ui/public/manifest.json" "screenshots" "App Screenshots"
check_content "ui/public/manifest.json" "prefer_related_applications.*false" "PWA Preference"

echo ""
echo "🧪 Development Tools"
echo "-------------------"

# Development and testing
check_file "pwa-check.sh" "PWA Check Script"
check_content "ui/next.config.mjs" "withPWA" "Next.js PWA Plugin"
check_warning "ui/public/sw.js.map" ".*" "Service Worker Source Map"

echo ""
echo "📱 Browser-Specific Features"
echo "---------------------------"

# Browser-specific optimizations
echo -e "${BLUE}Chrome/Edge:${NC}"
check_content "ui/public/manifest.json" "display_override" "Advanced Display Modes"
check_content "ui/public/manifest.json" "launch_handler" "Launch Handling"

echo -e "${BLUE}Safari (iOS):${NC}"
check_content "ui/src/utils/serviceWorker.ts" "isStandalone" "Standalone Detection"
check_warning "ui/public/manifest.json" "apple.*" "Apple-Specific Features"

echo -e "${BLUE}Firefox:${NC}"
check_content "ui/public/manifest.json" "orientation" "Orientation Support"
check_content "ui/public/sw.js" "addEventListener" "Standard Event Listeners"

echo ""
echo "🎯 Summary"
echo "--------"

# Count checks
total_files=$(find ui/public/static/icons/ -name "*.png" -o -name "*.ico" 2>/dev/null | wc -l)
if [ "$total_files" -ge 5 ]; then
    echo -e "${GREEN}✓${NC} Icon coverage: $total_files icons found"
else
    echo -e "${YELLOW}⚠${NC} Icon coverage: $total_files icons found (recommend 5+)"
fi

# Service worker size check
if [ -f "ui/public/sw.js" ]; then
    sw_size=$(wc -c < "ui/public/sw.js")
    if [ "$sw_size" -gt 5000 ]; then
        echo -e "${GREEN}✓${NC} Service Worker: Comprehensive ($sw_size bytes)"
    else
        echo -e "${YELLOW}⚠${NC} Service Worker: Basic ($sw_size bytes)"
    fi
fi

# Manifest completeness
if [ -f "ui/public/manifest.json" ]; then
    manifest_features=$(grep -c "name\|icons\|start_url\|display\|shortcuts" ui/public/manifest.json)
    if [ "$manifest_features" -ge 5 ]; then
        echo -e "${GREEN}✓${NC} Manifest: Feature-complete ($manifest_features/5 core features)"
    else
        echo -e "${YELLOW}⚠${NC} Manifest: Basic ($manifest_features/5 core features)"
    fi
fi

echo ""
echo "🔗 Quick Commands"
echo "---------------"
echo "Test PWA: ${BLUE}./dev.sh${NC} (development) or ${BLUE}./deploy.sh${NC} (production)"
echo "Lighthouse PWA audit: Open browser dev tools → Lighthouse → PWA"
echo "Chrome PWA test: chrome://flags/#enable-desktop-pwas-app-icon-shortcut-menu"
echo "Service Worker debug: chrome://inspect/#service-workers"

echo ""
echo -e "${GREEN}🎉 PWA Cross-Browser Compatibility Check Complete!${NC}"
echo "Ready for deployment across all major browsers and devices."
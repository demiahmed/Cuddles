# Cuddles 🤗 - Open Source Period and Intimacy Tracker

Your open-source, self-hosted, cross-browser compatible PWA for period and intimacy tracking—take complete control of your health data! Cuddles is a privacy-first alternative to apps like Flo, built with modern web technologies and designed to work seamlessly across all devices and browsers.

![App Screenshots](./screenshot.png)

## 🌟 Why Cuddles?

Cuddles was born from a desire to give users freedom and control over their sensitive health data. Unlike corporate apps like Flo, where data is locked away and some features are paywalled, Cuddles is open-source, self-hosted, and endlessly customizable. Whether you're a user seeking a better tracking experience or a developer wanting to tweak features, Cuddles is for you!

## ✨ Features

* **Period & Sex Tracking**: Log your cycles and intimate moments with ease
* **Cycle Analysis**: Understand your patterns with insightful stats
* **Period Prediction**: Get smart predictions to stay ahead of your cycle
* **Web Push Notifications**: Stay updated (note: not supported on iOS due to platform limitations)
* **PWA Support**: Use Cuddles as a Progressive Web App for a seamless mobile experience
* **Daily Database Backups**: Automatically back up your SQLite database daily with configurable retention (production only)
* **🔒 Privacy-First**: All data stored locally, no external tracking
* **📱 Cross-Platform**: Works on iOS, Android, Windows, macOS, Linux
* **🌐 Cross-Browser**: Compatible with Chrome, Firefox, Safari, Edge
* **💻 Self-Hosted**: You own your data and infrastructure
* **🎨 Customizable**: Open-source and endlessly configurable
* **📶 Offline-Ready**: Works without internet connection

## 🛠️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![Flask](https://img.shields.io/badge/Flask-3.0-blue?logo=flask)
![SQLite](https://img.shields.io/badge/SQLite-3.46-lightgrey?logo=sqlite)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

**Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Service Workers  
**Backend**: Flask 3.0, Python 3.11, SQLite, VAPID Push Notifications  
**Infrastructure**: Docker Compose, Health Checks, Automated Backups  
**PWA**: Service Worker, Web App Manifest, Push API, Background Sync

## 📋 Status

Cuddles is in **beta**—it's experimental, and some features may need polishing. We're excited to invite issues and pull requests to make it even better!

## 🚀 Installation

Get Cuddles running on your server or local machine in minutes with Docker Compose.

### Prerequisites

* [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed
* [Node.js](https://nodejs.org/) installed locally (for generating VAPID keys)
* [Python](https://www.python.org/) installed locally (for data ingestion scripts)
* A reverse proxy (optional, for server deployment): [Caddy](https://caddyserver.com/), [Traefik](https://traefik.io/), or [Nginx](https://nginx.org/)

### Setup for Production

1. **Clone the repo**:
   ```bash
   git clone https://github.com/demiahmed/cuddles.git
   cd cuddles
   ```

2. **Generate VAPID keys** for web push notifications:
   Install the `web-push` library temporarily:
   ```bash
   npm install web-push
   ```
   
   Run this script to generate keys:
   ```javascript
   const webpush = require('web-push');
   const vapidKeys = webpush.generateVAPIDKeys();
   console.log('Public Key:', vapidKeys.publicKey);
   console.log('Private Key:', vapidKeys.privateKey);
   ```
   
   Save the output securely. Uninstall `web-push` afterward:
   ```bash
   npm uninstall web-push
   ```

3. **Create and edit the `.env` file**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your preferred settings. Required variables:
   * `VAPID_PUBLIC_KEY`: Your generated VAPID public key (from step 2)
   * `VAPID_PRIVATE_KEY`: Your generated VAPID private key (from step 2)
   * `VAPID_EMAIL`: An email address for push service providers (e.g., `you@example.com`)
   
   Optional variables (defaults shown):
   * `NOTIFICATION_HOUR=11`: Hour for daily notifications (24-hour format)
   * `NOTIFICATION_MINUTE=0`: Minute for daily notifications
   * `TZ=Asia/Singapore`: Timezone for the app and backups
   * `BACKUP_RETENTION_DAYS=7`: Days to retain database backups

4. **Start the server**:
   Use the deployment script for easy setup:
   ```bash
   ./scripts/deploy.sh
   ```
   
   Or manually:
   ```bash
   docker-compose build --no-cache && docker-compose up -d
   ```

5. **Access Cuddles**:
   * **UI**: `http://localhost:3000`
   * **API**: `http://127.0.0.1:8500` (for developer integrations)
   * **Backups**: Daily SQLite database backups are saved to `./instance/backups` with logs in `./instance/backups/backup.log`

6. **Optional: Server Deployment**:
   For public access, configure a reverse proxy (Caddy, Traefik, or Nginx) to route traffic to `http://localhost:3000` (UI) and `http://127.0.0.1:8500` (API). Ensure HTTPS is enabled for security.

### Setup for Development

To develop Cuddles locally with hot reloading and debug modes, use the dedicated `docker-compose.dev.yml` file.

1. **Clone the repo** (if not already done):
   ```bash
   git clone https://github.com/demiahmed/cuddles.git
   cd cuddles
   ```

2. **Generate VAPID keys** (if not already done):
   Follow the production VAPID key generation steps above using `web-push`.

3. **Create and edit the `.env` file**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with the same variables as production.

4. **Start the development server**:
   Use the development script for easy setup:
   ```bash
   ./scripts/dev.sh
   ```
   
   Or manually:
   ```bash
   docker-compose -f docker-compose.dev.yml build --no-cache && docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Access Cuddles**:
   * **UI**: `http://localhost:3000` (hot reloading enabled for Next.js changes)
   * **API**: `http://127.0.0.1:8500` (Flask debug mode with auto-reloading)

## 📱 PWA Installation Guide

### iOS (iPhone/iPad)
1. Open Cuddles in Safari
2. Tap the Share button (📤)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to install

### Android
1. Open Cuddles in Chrome
2. Look for the "Install App" prompt
3. Tap "Install" when prompted
4. Or use Chrome menu → "Add to Home screen"

### Desktop (Chrome/Edge)
1. Open Cuddles in your browser
2. Look for the install icon in the address bar
3. Click the install button
4. Follow the installation prompts

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| PWA Install | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ❌* | ✅ | ✅ |
| Background Sync | ✅ | ⚠️ | ❌* | ✅ | ✅ |
| Offline Caching | ✅ | ✅ | ✅ | ✅ | ✅ |
| App Shortcuts | ✅ | ⚠️ | ❌* | ✅ | ✅ |

*\* Safari limitations due to Apple's PWA restrictions*

## 🐛 Troubleshooting

### Common Issues

#### PWA Not Installing
1. Ensure HTTPS is enabled (production) or use localhost
2. Check Service Worker registration in DevTools
3. Verify manifest.json is accessible
4. Run `./scripts/pwa-cross-browser-check.sh`

#### Push Notifications Not Working
1. Check VAPID keys in .env file
2. Verify notification permissions in browser
3. Test with `curl "http://localhost:8500/test-push?type=period"`
4. iOS Safari doesn't support push notifications

#### Service Worker Issues
1. Clear browser cache and reload
2. Check DevTools → Application → Service Workers
3. Unregister and re-register service worker
4. Check console for error messages

## 📁 Scripts Reference

All scripts are located in the `./scripts/` directory:

| Script | Purpose | Usage |
|--------|---------|-------|
| `dev.sh` | Start development environment | `./scripts/dev.sh` |
| `deploy.sh` | Deploy to production | `./scripts/deploy.sh` |
| `test-pwa-interactive.sh` | Interactive PWA testing | `./scripts/test-pwa-interactive.sh` |
| `pwa-cross-browser-check.sh` | PWA compatibility check | `./scripts/pwa-cross-browser-check.sh` |
| `backup.sh` | Manual database backup | `./scripts/backup.sh` |

## 📚 Documentation

- [PWA Cross-Browser Guide](./PWA-CROSS-BROWSER-GUIDE.md) - Comprehensive PWA implementation details
- [API Documentation](./API.md) - REST API reference
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to Cuddles

## 🤝 Contributing

Cuddles is a community-driven project! We welcome contributions:

### Ways to Contribute
- 🐛 **Bug Reports**: Open issues for bugs or problems
- 💡 **Feature Requests**: Suggest new features or improvements
- 🔧 **Code Contributions**: Submit pull requests with fixes or features
- 📖 **Documentation**: Improve docs, guides, and examples
- 🧪 **Testing**: Test on different browsers and devices

### Development Ideas
- 🎨 **UI/UX Improvements**: Better design and user experience
- 📱 **Mobile Features**: Enhanced mobile PWA experience
- 🔔 **Notification Enhancements**: Advanced reminder systems
- 📊 **Analytics**: More detailed cycle analysis and insights
- 🌍 **Internationalization**: Multi-language support
- 🔗 **Integrations**: Health app integrations, export features

## 📄 License

This project is licensed under the [MIT License](./LICENSE) - see the LICENSE file for details.

## 🙏 Acknowledgments

Cuddles was inspired by the need for a privacy-first, user-controlled alternative to commercial period tracking apps. This project is dedicated to everyone who values data ownership and open-source health technology.

Special thanks to:
- The open-source community for amazing tools and libraries
- Privacy advocates who fight for user data rights
- Everyone who contributes to making healthcare technology more accessible

## 🌟 Support

Love Cuddles? Here's how you can help:

- ⭐ **Star this repository** on GitHub
- 🐛 **Report bugs** and suggest features
- 🔗 **Share with friends** who value privacy
- 💻 **Contribute code** or documentation
- 📝 **Write about Cuddles** in blogs or social media

---

**Get started today**: Clone, configure, and deploy your own private health tracking PWA in minutes! 🚀
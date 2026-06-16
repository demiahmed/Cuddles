# Cuddles 🤗 — Period, Intimacy & Wellness Tracker

Your open-source, self-hosted PWA for period, intimacy, and daily wellness tracking — take complete control of your health data. Cuddles is a privacy-first alternative to apps like Flo, built with modern web technologies and designed to work seamlessly across all devices and browsers.

![App Screenshots](./screenshot.png)

## 🌟 Why Cuddles?

Cuddles was born from a desire to give users freedom and control over their sensitive health data. Unlike corporate apps where data is locked away and features are paywalled, Cuddles is open-source, self-hosted, and endlessly customizable. Whether you're a user seeking a better tracking experience or a developer wanting to tweak things, Cuddles is for you.

## ✨ Features

### 🩸 Period & Cycle Tracking
- Log flow levels (spotting → heavy) per day with clean visual indicators
- Period start/end tracking with full calendar view
- Smart cycle analysis and period prediction
- Ovulation window detection and fertility alerts

### 💕 Intimacy Tracking
- Log intimate moments with protection status, time of day, and satisfaction rating
- Multiple entries per day supported
- Intimacy pattern stats and trends

### 📓 Daily Wellness Log *(new in v1.0)*
- One log per day: mood, energy, stress, sleep, food quality, workout, and pain
- Calendar mood dots — see your emotional history at a glance
- 60-day charts: mood & vitals, sleep trends, correlation insights
- Log wellness for any past date directly from the calendar
- PWA home-screen shortcut straight to wellness logging

### 📅 Smart Calendar
- Unified view: period, intimacy, and wellness all in one grid
- Predicted period days 🍫 and ovulation window 🌻 highlighted
- Tap any day to log or edit everything from one place

### 🔔 Intelligent Push Notifications
- **9:00 AM** — Period/ovulation reminders when relevant
- **1:00 PM** — Context-aware health and nutrition tips
- **6:30 PM** — Intimacy encouragement based on your patterns
- **9:30 PM** — Wellness reminder if today's log is missing; achievement celebration if it's done

### 🔒 Privacy & Infrastructure
- All data stored locally in your own SQLite database — no external tracking
- Daily automated database backups with configurable retention
- Self-hosted: you own your data and infrastructure
- Offline-ready PWA with service worker caching

## 🛠️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![Flask](https://img.shields.io/badge/Flask-3.0-blue?logo=flask)
![SQLite](https://img.shields.io/badge/SQLite-3.46-lightgrey?logo=sqlite)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

**Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Service Workers  
**Backend**: Flask 3.0, Python 3.11, SQLite, APScheduler, VAPID Push Notifications  
**Infrastructure**: Docker Compose, Health Checks, Automated Backups  
**PWA**: Service Worker, Web App Manifest, Push API, App Shortcuts

## 🚀 Installation

### Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) — locally, for generating VAPID keys only
- A reverse proxy (optional, for public server deployment): [Caddy](https://caddyserver.com/), [Traefik](https://traefik.io/), or [Nginx](https://nginx.org/)

---

### Production Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/demiahmed/Cuddles.git
   cd Cuddles
   ```

2. **Generate VAPID keys** for push notifications:
   ```bash
   npx web-push generate-vapid-keys
   ```
   Copy the public and private keys — you'll need them in the next step.

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in:

   | Variable | Required | Description |
   |---|---|---|
   | `VAPID_PUBLIC_KEY` | ✅ | Public key from step 2 |
   | `VAPID_PRIVATE_KEY` | ✅ | Private key from step 2 |
   | `VAPID_EMAIL` | ✅ | Your email (sent to push services) |
   | `SECRET_KEY` | ✅ | A long random string for Flask sessions |
   | `TZ` | — | Your timezone, e.g. `America/New_York` (default: `Asia/Singapore`) |
   | `NOTIFICATION_TIMES` | — | Four `HH:MM` notification slots (default: `09:00,13:00,18:30,21:30`) |
   | `BACKUP_RETENTION_DAYS` | — | Days of daily backups to keep (default: `7`) |

4. **Start the app**:
   ```bash
   docker-compose up -d --build
   ```

5. **Open Cuddles**:
   - UI: `http://localhost:3000`
   - API: `http://localhost:8500`

6. **Server deployment** (optional):
   Point a reverse proxy (Caddy/Nginx/Traefik) at `http://localhost:3000`. HTTPS is required for push notifications and PWA install in production.

---

### Development Setup

1. **Clone and configure** (steps 1–3 above).

2. **Start dev server** with hot reloading:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d --build
   ```

3. **Access**:
   - UI: `http://localhost:3000` (Next.js hot reload)
   - API: `http://localhost:8500` (Flask debug mode)

---

### Testing Push Notifications

Once running, test notifications with:
```bash
curl "http://localhost:8500/api/notifications/test"
```

---

## 📱 PWA Installation

### iOS (Safari)
1. Open Cuddles in Safari → tap **Share** (📤)
2. Tap **Add to Home Screen** → **Add**

### Android (Chrome)
1. Open Cuddles in Chrome
2. Tap the **Install App** banner, or use Chrome menu → **Add to Home screen**

### Desktop (Chrome / Edge)
1. Click the install icon (⊕) in the address bar
2. Follow the prompts

---

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---|---|---|---|---|---|
| PWA Install | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ❌* | ✅ | ✅ |
| Background Sync | ✅ | ⚠️ | ❌* | ✅ | ✅ |
| Offline Caching | ✅ | ✅ | ✅ | ✅ | ✅ |
| App Shortcuts | ✅ | ⚠️ | ❌* | ✅ | ✅ |

*Safari/iOS limitations due to Apple's PWA restrictions.*

---

## 🐛 Troubleshooting

**Push notifications not working**
- Verify VAPID keys in `.env` are correct
- Check browser notification permissions
- iOS Safari does not support push notifications

**PWA not installing**
- HTTPS required on public servers (localhost is fine for dev)
- Check DevTools → Application → Service Workers for errors

**Data not showing after restart**
- The SQLite database persists in `./instance/` — ensure this directory is not deleted between restarts

**Container issues**
```bash
# View logs
docker-compose logs -f

# Clean rebuild
docker-compose down && docker-compose up -d --build
```

---

## 📁 Scripts

| Script | Purpose |
|---|---|
| `scripts/deploy.sh` | Build and start production containers |
| `scripts/dev.sh` | Start development environment |
| `scripts/backup.sh` | Trigger a manual database backup |
| `scripts/pwa-cross-browser-check.sh` | PWA compatibility check |

---

## 🤝 Contributing

Cuddles is community-driven. All contributions welcome:

- 🐛 **Bug reports** — open an issue
- 💡 **Feature requests** — open an issue or discussion
- 🔧 **Pull requests** — fixes, features, improvements
- 📖 **Documentation** — always appreciated
- 🧪 **Testing** — especially across different browsers and devices

### Ideas for contributors
- 🌍 Internationalization / multi-language support
- 📊 Richer analytics and data export (CSV, PDF)
- 🔗 Health app integrations (Apple Health, Google Fit)
- 🎨 Theming and UI customization
- 📱 Enhanced mobile UX

---

## 📄 License

[MIT License](./LICENSE) — see the LICENSE file for details.

---

## 🙏 Acknowledgments

Cuddles is dedicated to everyone who believes health data should belong to the person it's about. Built with love, privacy-first, open forever.

Special thanks to the open-source community for the tools that make this possible, and to privacy advocates who fight for user data rights.

---

**Get started**: clone, configure, deploy — your private health tracker is live in minutes. 🚀

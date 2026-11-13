# Questly 2.0 ⚡

[![CI](https://github.com/sukrut07/Questly/actions/workflows/ci.yml/badge.svg)](https://github.com/sukrut07/Questly/actions/workflows/ci.yml)
[![Flutter](https://img.shields.io/badge/Flutter-3.24+-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.5+-0175C2?logo=dart&logoColor=white)](https://dart.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015+-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Questly 2.0** is a next-generation personal operating system for productivity, habit-tracking, deep learning, and mental duels. It fuses the high-octane dark-mode aesthetic of competitive gaming platforms with the analytical rigor of a modern developer productivity suite.

---

## 🎨 Visual Identity & Design System

Questly 2.0 features a custom **Matiks-inspired** design system tailored for high engagement and tactile feedback:

* **Surface**: Deep charcoal / near-black (`#101010` background, `#1A1A1A` / `#222222` elevated cards).
* **Primary Accent**: Electric lime green (`#B5FF55`) for call-to-actions, level-ups, and active states.
* **Secondary Accent**: Soft lavender (`#B9A3FF`) for badges, puzzle nodes, and secondary highlights.
* **Typography**: Bold condensed display headers (`Oswald`) paired with clean geometric body text (`Inter`).
* **Micro-Interactions**: Tactile spring-scale bounce buttons, high-contrast borders, and subtle geometric dot-grid overlays.

---

## 🏛️ Architectural Strategy

Questly 2.0 maintains a clean, decoupled dual-client architecture backed by a shared Supabase PostgreSQL backend:

```
                          ┌─────────────────────────────┐
                          │   Supabase Shared Backend   │
                          │   PostgreSQL 15+ with RLS   │
                          │   Auth • Realtime • Storage │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │     Mobile Application    │                   │      Web Application      │
   │      (Flutter + Dart)     │                   │ (Next.js 16 + TypeScript) │
   │                           │                   │                           │
   │  • Android & iOS          │                   │  • Desktop / Browser      │
   │  • Riverpod 3.x           │                   │  • React 19 + Tailwind 4  │
   │  • Offline Sync Queue     │                   │  • Server & Client Comps  │
   │  • GoRouter               │                   │  • Markdown Notebook      │
   │  • Reorderable Widgets    │                   │  • Analytics Dashboard    │
   │  • AppWidget & WidgetKit  │                   │  • Shared Data Contracts  │
   └───────────────────────────┘                   └───────────────────────────┘
```

### Key Decisions
1. **Flutter as Sole Mobile Framework**: Flutter + Dart (`mobile/`) powers both Android and iOS from a single clean-architecture codebase. No React Native is used.
2. **Decommissioned Legacy Standalone App**: The obsolete standalone Kotlin app (`android-app/`) and root Gradle wrappers have been decommissioned. Flutter's Android host (`mobile/android/`) provides all native platform glue.
3. **Preserved Next.js Web App**: The existing web application (`src/`, `public/`, `package.json`) is maintained independently for browser planning and knowledge management workflows.
4. **Shared Supabase Cloud Backend**: A single PostgreSQL backend with strict Row Level Security (RLS) handles identity, auditable XP transactions, and cross-platform synchronization.

---

## 🎮 Core Features

| Feature | Description | Mobile (`mobile/`) | Web (`src/`) |
| :--- | :--- | :---: | :---: |
| **Quests & Habits** | Daily recurring tasks, difficulty tiers, XP awards, subtask checklists | ✅ | ✅ |
| **Customizable Widgets** | Reorderable in-app dashboard cards + native Android AppWidget & iOS WidgetKit | ✅ | — |
| **Focus Squad** | Live co-working status bar, friend showdown countdown, and active presence dots | ✅ | — |
| **Mind Snap Duels** | 15-second rapid-fire mental arithmetic & logic speed challenges with multipliers | ✅ | — |
| **RPG Skill Tree** | 6 progression branches (Codecraft, Deep Focus, Algorithmic, System Design, Wellness, Writing) | ✅ | — |
| **Interactive Roadmaps** | Visual milestone progression curves with unlockable stages | ✅ | ✅ |
| **Activity Heatmap** | GitHub-style 52-week productivity matrix with category-specific colors and intensity | ✅ | ✅ |
| **Focus Mode** | Integrated Pomodoro timer with ambient sounds, streak tracking, and stat recording | ✅ | ✅ |
| **Smart Notebook** | Markdown-enabled notes, code blocks, tagging, and bi-directional quest links | ✅ | ✅ |
| **Trophies & Badges** | Tiered achievement system (Bronze, Silver, Gold, Diamond, Legendary) with XP claiming | ✅ | ✅ |
| **Offline-First Sync** | Local-first persistence with persistent `SyncQueue` and UUID v4 idempotency keys | ✅ | ✅ |
| **Contextual Permissions** | Strictly opt-in permission center with transparent pre-permission rationales | ✅ | — |

---

## 📂 Repository Structure

```
Questly/
├── .github/workflows/          # CI/CD pipelines (GitHub Actions)
│   └── ci.yml                  # Unified Flutter & Next.js verification workflow
├── docs/                       # Comprehensive engineering documentation
│   ├── UPGRADE_AUDIT.md        # Complete system audit & upgrade roadmap
│   ├── BACKEND_SETUP.md        # Supabase local and cloud deployment guide
│   ├── DATABASE_SCHEMA.md      # PostgreSQL 15+ schema with 24 entities & RLS
│   ├── API_CONTRACTS.md        # PostgREST endpoints & RPC function specs
│   ├── OFFLINE_SYNC.md         # Persistent sync queue & conflict resolution
│   ├── HEATMAP_AND_STREAKS.md  # Timezone streak engine & 52-week heatmap
│   ├── WIDGETS.md              # In-app reordering + AppWidget & WidgetKit
│   ├── PERMISSIONS.md          # Contextual opt-in permissions & privacy
│   ├── SECURITY.md             # Credential isolation & tamper prevention
│   ├── DEPLOYMENT.md           # Production release manual (Vercel/Play/App Store)
│   ├── SKILLS_INVENTORY.md     # Agent Skills & dependency catalog
│   ├── architecture/           # System boundaries & dependency inventory
│   ├── features/               # Feature catalogs, file mappings, status checklist
│   └── workflows/              # Development, testing, and release manuals
├── mobile/                     # Flutter mobile application (Android & iOS)
│   ├── android/                # Native Android runner (AppWidget Provider)
│   ├── ios/                    # Native iOS runner (WidgetKit Swift provider)
│   ├── lib/
│   │   ├── app/                # Application entrypoint, routing (GoRouter)
│   │   ├── core/               # Design tokens, network (Dio), storage, sync queue
│   │   └── features/           # Feature-first modules (quests, arcade, skill tree, widgets)
│   ├── test/                   # Unit, widget, and architecture tests (100% pass)
│   └── pubspec.yaml            # Flutter dependencies & assets definition
├── src/                        # Next.js web application
│   ├── app/                    # Next.js App Router (pages, layouts)
│   └── components/             # React 19 UI components
├── supabase/                   # Supabase database configuration
│   ├── migrations/             # Version-controlled PostgreSQL migrations
│   ├── seed.sql                # Starter achievements & reference templates
│   └── config.toml             # Local Supabase CLI configuration
├── public/                     # Static assets for the web application
├── test/                       # Node / Vitest tests for the web application
├── package.json                # Web application scripts & npm dependencies
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Flutter SDK**: `>= 3.22.0` (stable channel) — [Install Guide](https://docs.flutter.dev/get-started/install)
- **Node.js**: `>= 20.x` & `npm` — [Install Guide](https://nodejs.org/)
- **Supabase CLI** (optional for local database): `brew install supabase/tap/supabase`
- **Android Studio** (with Android SDK) or **Xcode** (for iOS simulator/device)

---

### Running the Backend (Supabase)

```bash
# Start local PostgreSQL, Auth, and Studio dashboard
supabase start

# Apply all database migrations and seeds
supabase db reset
```

---

### Running the Mobile Application (Flutter)

```bash
# Navigate to the mobile project root
cd mobile

# Fetch all Dart dependencies
flutter pub get

# Launch the app on a connected emulator or device
flutter run
```

To run mobile tests and static analysis:
```bash
# Static analysis
flutter analyze

# Format check
dart format --output=none --set-exit-if-changed lib test

# Unit & widget test suite (32 tests)
flutter test
```

---

### Running the Web Application (Next.js)

```bash
# From repository root, install dependencies
npm install

# Start development server
npm run dev
# App will run at http://localhost:3000
```

To run web verification:
```bash
# Type check
npx tsc --noEmit

# Unit tests
npm test

# Production build
npm run build
```

---

## 📖 Documentation Index

For in-depth architectural specifications and developer guides, refer to the `docs/` directory:

* **System Upgrades & Audit**:
  * [Upgrade Audit](docs/UPGRADE_AUDIT.md) — Comprehensive technical gap analysis and modernization strategy.
  * [Skills Inventory](docs/SKILLS_INVENTORY.md) — Verified Agent Skills, plugins, and dependencies.
* **Backend & Cloud Persistence**:
  * [Backend Setup Guide](docs/BACKEND_SETUP.md) — Local and hosted Supabase deployment procedures.
  * [Database Schema Specification](docs/DATABASE_SCHEMA.md) — Full PostgreSQL 15+ 24-table schema and RLS policies.
  * [API & Data Contracts](docs/API_CONTRACTS.md) — REST endpoints and trusted stored procedures.
  * [Offline-First Sync](docs/OFFLINE_SYNC.md) — Persistent queue, backoff, and conflict resolution rules.
* **Productivity & Gamification Engines**:
  * [Heatmap & Streak Engine](docs/HEATMAP_AND_STREAKS.md) — Timezone calculations and 52-week activity calendar.
  * [Dual Widget Ecosystem](docs/WIDGETS.md) — In-app widget customizer and native AppWidget / WidgetKit integration.
  * [Contextual Permissions](docs/PERMISSIONS.md) — Opt-in permission architecture and rationales.
* **Security & Operations**:
  * [Security & Data Protection](docs/SECURITY.md) — Credential isolation, RLS enforcement, and tamper prevention.
  * [Deployment Manual](docs/DEPLOYMENT.md) — Production release procedures for Web, Android (AAB), and iOS (IPA).
  * [Implementation Status](docs/features/IMPLEMENTATION_STATUS.md) — Comprehensive 36/36 test verification checklist.

---

## 🛡️ License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

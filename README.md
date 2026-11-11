# Questly 2.0 ⚡

[![CI](https://github.com/sukrut07/Questly/actions/workflows/ci.yml/badge.svg)](https://github.com/sukrut07/Questly/actions/workflows/ci.yml)
[![Flutter](https://img.shields.io/badge/Flutter-3.24+-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.5+-0175C2?logo=dart&logoColor=white)](https://dart.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Questly 2.0** is a next-generation gamified productivity, habit-tracking, and mental duel platform. It fuses the high-octane dark-mode aesthetic of competitive gaming platforms with the analytical rigor of a modern developer productivity suite.

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

Questly 2.0 maintains a clean, decoupled dual-client architecture sharing unified data contracts:

```
                          ┌─────────────────────────────┐
                          │   Questly Shared Backend    │
                          │   REST API / Auth / Cloud   │
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
   │  • Riverpod 2.5           │                   │  • React 19 + Tailwind    │
   │  • Drift / SQLite offline │                   │  • Server & Client Comps  │
   │  • GoRouter 14            │                   │  • Markdown Notebook      │
   │  • Matiks Dark / Lime UI  │                   │  • Analytics Dashboard    │
   └───────────────────────────┘                   └───────────────────────────┘
```

### Key Decisions
1. **Flutter as Sole Mobile Framework**: Flutter + Dart (`mobile/`) powers both Android and iOS from a single clean-architecture codebase. No React Native is used.
2. **Decommissioned Legacy Android App**: The obsolete standalone Kotlin app (`android-app/`) and root Gradle wrappers have been decommissioned. Flutter's self-contained Android runner (`mobile/android/`) provides all native platform glue.
3. **Preserved Next.js Web App**: The existing web application (`src/`, `public/`, `package.json`) is maintained independently for browser workflows.

---

## 🎮 Core Features

| Feature | Description | Mobile (`mobile/`) | Web (`src/`) |
| :--- | :--- | :---: | :---: |
| **Quests & Habits** | Daily recurring tasks, difficulty tiers, XP awards, subtask checklists | ✅ | ✅ |
| **Focus Squad** | Live co-working status bar, friend showdown countdown, and active presence dots | ✅ | — |
| **Mind Snap Duels** | 15-second rapid-fire mental arithmetic & logic speed challenges with multipliers | ✅ | — |
| **RPG Skill Tree** | 6 progression branches (Codecraft, Deep Focus, Algorithmic, System Design, Wellness, Writing) | ✅ | — |
| **Interactive Roadmaps** | Visual milestone progression curves with unlockable stages | ✅ | ✅ |
| **Activity Heatmap** | GitHub-style 52-week productivity matrix recording completed quests and focus minutes | ✅ | ✅ |
| **Focus Mode** | Integrated Pomodoro timer with ambient sounds, streak tracking, and stat recording | ✅ | ✅ |
| **Smart Notebook** | Markdown-enabled notes, code blocks, tagging, and bi-directional quest links | ✅ | ✅ |
| **Trophies & Badges** | Tiered achievement system (Bronze, Silver, Gold, Diamond, Legendary) with XP claiming | ✅ | ✅ |
| **Offline-First Storage** | Local persistence via SQLite / Drift and secure storage with seamless background sync | ✅ | ✅ |

---

## 📂 Repository Structure

```
Questly/
├── .github/workflows/          # CI/CD pipelines (GitHub Actions)
│   └── ci.yml                  # Unified Flutter & Next.js verification workflow
├── docs/                       # Comprehensive engineering documentation
│   ├── architecture/           # System boundaries, dependencies, audit report
│   ├── features/               # Feature catalogs, file mappings, status checklist
│   ├── workflows/              # Development, testing, and release manuals
│   └── migration/              # Detailed cleanup & migration audit logs
├── mobile/                     # Flutter mobile application (Android & iOS)
│   ├── android/                # Native Android runner (Gradle 8.9 wrapper)
│   ├── ios/                    # Native iOS runner (Xcode project)
│   ├── lib/
│   │   ├── app/                # Application entrypoint, routing (GoRouter)
│   │   ├── core/               # Design tokens, theme, network (Dio), storage (Drift)
│   │   └── features/           # Feature-first modules (quests, arcade, skill tree, etc.)
│   ├── test/                   # Unit, widget, and architecture tests (100% pass)
│   └── pubspec.yaml            # Flutter dependencies & assets definition
├── src/                        # Next.js web application
│   ├── app/                    # Next.js App Router (pages, layouts)
│   └── components/             # React 19 UI components
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
- **Android Studio** (with Android SDK & Command-line Tools) or **Xcode** (for iOS simulator/device)

---

### Running the Mobile Application (Flutter)

```bash
# Navigate to the mobile project root
cd mobile

# Fetch all Dart dependencies
flutter pub get

# Run code generation (for Drift, Freezed, JSON serialization)
dart run build_runner build --delete-conflicting-outputs

# Launch the app on a connected emulator or device
flutter run
```

To run mobile tests and static analysis:
```bash
# Static analysis
flutter analyze

# Format check
dart format --output=none --set-exit-if-changed lib test

# Unit & widget test suite
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

* **Architecture**:
  * [Architecture Specification](docs/architecture/ARCHITECTURE.md) — System boundaries, Clean Architecture layers, state management.
  * [Dependency Inventory](docs/architecture/DEPENDENCIES.md) — Rationale for all Flutter and Web packages.
  * [Repository Audit](docs/architecture/REPOSITORY_AUDIT.md) — Initial analysis and consolidation strategy.
* **Features**:
  * [Feature Catalog](docs/features/FEATURES.md) — Deep dive into all 10 platform features.
  * [Feature File Mapping](docs/features/FEATURE_FILE_MAPPING.md) — Precise 1-to-1 mapping between features and source files.
  * [Implementation Status](docs/features/IMPLEMENTATION_STATUS.md) — Verification status checklist.
* **Workflows**:
  * [Developer Guide](docs/workflows/DEVELOPMENT.md) — Environment setup, coding conventions, branch policies.
  * [Testing Manual](docs/workflows/TESTING.md) — Test suites, mocking conventions, and coverage.
  * [Release Manual](docs/workflows/RELEASE.md) — Production APK, AAB, IPA, and Web deployment steps.
* **Migration**:
  * [Cleanup Report](docs/migration/CLEANUP_REPORT.md) — Complete record of decommissioned Kotlin artifacts and consolidated tree.

---

## 🛡️ License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

# Questly 2.0 Repository Audit Report

**Audit Date**: November 2026  
**Auditor**: Principal Software Architect & DevOps Engineer  
**Repository**: [https://github.com/sukrut07/Questly](https://github.com/sukrut07/Questly)  
**Status**: Pre-Cleanup Assessment

---

## 1. Executive Summary

Questly is undergoing consolidation into a unified, high-performance cross-platform architecture:
- **Mobile Application**: **Flutter + Dart** (`mobile/`) targeting Android and iOS, replacing the legacy standalone Kotlin Android application.
- **Web Application**: **Next.js 16 + React 19 + TypeScript** (`src/`, `public/`) preserving offline-first local storage and gamification components.
- **Backend Infrastructure**: Unified shared offline-first persistence with clean repository abstractions ready for remote synchronization.

This audit evaluates the codebase before removing legacy standalone Android files and consolidating documentation.

---

## 2. Directory & Component Inventory

### 2.1 Mobile Application (`mobile/`) — Target Active Mobile Framework
- **Framework**: Flutter 3.47.9 / Dart 3.13.7
- **Platform Host Glue**:
  - `mobile/android/`: Minimal required Android host containing `MainActivity.kt`, Gradle configuration (`8.9`), and AndroidManifest.
  - `mobile/ios/`: Minimal required iOS host containing `AppDelegate.swift`, Xcode project, and Podfile/configuration.
- **Source Structure**: Feature-first Clean Architecture under `mobile/lib/`:
  - `core/`: Networking (Dio), Storage (SecureStorage, LocalStorage), Errors, Utilities, Constants.
  - `app/`: Router (go_router), Theme (Matiks tokens, Oswald display, Inter body), Providers (Riverpod 3), Bootstrap.
  - `features/`: Home/Dashboard, Quests, Tasks, Insights, Notebook, Roadmaps, Focus, Gamification, Skill Tree, Arcade, Achievements, Profile, Settings.
  - `shared/`: Reusable high-contrast spring widgets (`QuestlyCard`, `QuestlyButton`, `QuestlyHeatmap`, `QuestlyGridBackground`, `QuestlyXPIndicator`, etc.).
- **Tests**: 25 automated unit and widget tests in `mobile/test/` with 100% pass rate.

### 2.2 Web Application (`src/`, `public/`, `test/`) — Active Web Framework
- **Framework**: Next.js 16.4.3 (Turbopack) with React 19.3.0 and TypeScript 5.
- **Styling**: Tailwind CSS v4.
- **Icons**: Lucide React.
- **State & Storage**: Offline-first via browser `localStorage` and custom reactive hooks.
- **Build & Tests**:
  - `npm test`: Node.js test runner executing `test/progression.test.mjs` (4/4 passing).
  - `npx tsc --noEmit`: 0 TypeScript errors.
  - `npm run build`: Production build completes in ~2.8s.

### 2.3 Legacy Standalone Android Application (`android-app/`) — Obsolete
- **Framework**: Kotlin 1.9.22 + Jetpack Compose (BOM 2024.02.00) + Room Database + Gradle wrapper.
- **Components Identified**:
  - Legacy UI: `HomeScreen.kt`, `QuestsScreen.kt`, `FocusScreen.kt`, `ArcadeScreen.kt`, `AdventureMapScreen.kt`, `SkillTreeScreen.kt`, `AchievementsScreen.kt`, `ProfileScreen.kt`.
  - Room SQLite Entities & DAOs: `QuestlyDatabase.kt`, `QuestDao.kt`, `FocusSessionDao.kt`, `ProfileDao.kt`, `SkillDao.kt`, `AdventureDao.kt`, `GameDao.kt`.
  - Native Widgets: `QuestlyAppWidgetProvider.kt`, `widget_questly_compact.xml`, `widget_questly_expanded.xml`.
  - Native Gradle: Root `build.gradle.kts`, `settings.gradle.kts`, `gradlew`, `gradlew.bat`, `gradle/`.
- **Migration Status**:
  All functional behaviors (Quests, Tasks, Streaks, XP Progression, Focus Sessions, Activity Heatmap, RPG Skill Tree, Mind Snap Arcade, Achievements, Roadmaps) have been ported into Flutter.
- **Action**: Retain only Flutter's Android host in `mobile/android/`; safely delete `android-app/` and root-level Gradle wrapper files that were dedicated to the standalone Kotlin app.

---

## 3. Dependency Inventory & Status

| Layer | Technology | Status | Action |
| :--- | :--- | :--- | :--- |
| **Mobile UI** | Flutter Material 3 | Active | Primary cross-platform mobile framework |
| **Mobile State** | flutter_riverpod 3.5.0 | Active | Application state injection |
| **Mobile Routing** | go_router 18.1.4 | Active | StatefulShellRoute 5-destination navigation |
| **Mobile Network** | dio 5.11.1 | Active | Centralized HTTP client & interceptors |
| **Mobile Storage** | shared_preferences 2.5.6 | Active | Key-value application state |
| **Mobile Security** | flutter_secure_storage 11.2.0 | Active | Keystore / Keychain secret tokens |
| **Mobile Visuals** | fl_chart 1.3.1, google_fonts 9.0.0 | Active | Charts and Matiks typography tokens |
| **Web UI** | Next.js 16.4.3, React 19.3.0 | Active | Web production platform |
| **Web Styling** | Tailwind CSS 4, clsx, tailwind-merge | Active | Utility styling |
| **Legacy Android** | Jetpack Compose, Room SQLite | Deprecated | Removed; replaced by Flutter |

---

## 4. Proposed Cleanup Actions

1. **Remove `android-app/`**: Fully decommission legacy Kotlin Compose application whose features are ported to Flutter.
2. **Remove root Gradle wrapper**: Remove root `build.gradle.kts`, `settings.gradle.kts`, `gradlew`, `gradlew.bat`, and `gradle/` (Flutter has its own self-contained Android build harness inside `mobile/android/`).
3. **Preserve `mobile/android/`**: Retain Flutter's `MainActivity.kt` and host configurations for native Android builds.
4. **Preserve Next.js Web Application**: Keep `src/`, `public/`, `test/`, and `package.json` intact and operational.
5. **Establish Structured Documentation**: Create `docs/architecture/`, `docs/features/`, and `docs/workflows/`.
6. **Add Automated CI Workflow**: Create `.github/workflows/ci.yml` running Flutter analyze/test and Web lint/typecheck/test/build.

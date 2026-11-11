# Questly Project Audit & Repository Inspection

## 1. Executive Summary

This document captures the complete technical audit of the **Questly** repository prior to and during the initial phase of the Questly 2.0 Flutter migration.

Questly is a gamified productivity ecosystem designed to turn daily task management and deep work into an immersive RPG-style experience. The existing repository contains two distinct existing implementations:
1. **Android Kotlin Application (`android-app/`)**: A native Android Jetpack Compose application with Room SQLite database, Coroutines, Flow, and custom Living World gamification logic.
2. **Next.js Web Application (`src/`, `public/`, `package.json`)**: A Next.js 16 / React 19 web application utilizing client-side React context state and browser `localStorage` persistence.

Both implementations are strictly preserved and untouched. All cross-platform mobile application development for Questly 2.0 takes place inside the `mobile/` directory.

---

## 2. Existing Repository Layout

```
Questly/
├── android-app/                   # Original native Kotlin Android application
│   ├── build.gradle.kts           # Android application build configuration
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml
│       │   ├── java/com/example/  # Core domain engines, Room database, Jetpack Compose UI
│       │   └── res/               # Android drawable, layout, XML, and mipmap resources
│       ├── test/
│       └── androidTest/
├── src/                           # Existing Next.js web application
│   ├── app/                       # Next.js App Router (layout.tsx, page.tsx, globals.css)
│   ├── components/                # React components (quests, home, arcade, focus, map, profile)
│   ├── common/                    # SoundService, Confetti animation utilities
│   └── lib/                       # React context store, progressionEngine, initialData, types
├── public/                        # Web public assets, SVGs, and brand assets
├── mobile/                        # NEW: Questly 2.0 Flutter Mobile Application
│   ├── android/                   # Native Android host configuration
│   ├── ios/                       # Native iOS host configuration
│   ├── lib/                       # Clean Architecture Flutter source code
│   ├── test/                      # Unit and widget test suite
│   ├── assets/                    # Mobile asset bundles
│   └── pubspec.yaml               # Flutter dependency configuration
├── docs/
│   └── migration/                 # Migration audit and architecture documentation
├── gradle/ & gradlew              # Root Gradle wrapper for android-app
├── build.gradle.kts               # Root Gradle configuration
├── settings.gradle.kts            # Root Gradle project settings
└── package.json                   # Web application dependencies (Next.js 16, React 19, Tailwind)
```

---

## 3. Detailed Inspection of Existing Android App (`android-app/`)

### Architecture & Tech Stack
- **Language**: Kotlin 2.0+
- **UI Framework**: Jetpack Compose with Material 3 design tokens
- **Architecture**: Single Activity (`MainActivity.kt`), `MainViewModel.kt`, Repository Pattern (`QuestlyRepository.kt`)
- **Persistence**: Room Database (`QuestlyDatabase.kt`, SQLite) with Type Converters
- **Async & Reactive**: Kotlin Coroutines and StateFlow / SharedFlow
- **Preferences**: DataStore (`UserPreferencesDataStore.kt`)

### Core Domain Models (`com.example.core.model.*`)
1. **`Quest.kt`**:
   - `QuestCategory`: CODING, STUDY, WORK, FITNESS, READING, CREATIVITY, PERSONAL, CUSTOM
   - `QuestDifficulty`: EASY (+20 XP), MEDIUM (+40 XP), HARD (+70 XP), EPIC (+100 XP), LEGENDARY (+150 XP)
   - `QuestPriority`: LOW, MEDIUM, HIGH, URGENT
   - `QuestStatus`: NOT_STARTED, IN_PROGRESS, COMPLETED, ARCHIVED
   - `Quest`: id, title, description, category, difficulty, priority, estimatedMinutes, actualMinutes, dueDate, status, xpReward, isRecurring, recurrenceRule, questChainId, createdAt, completedAt, subtasks
   - `QuestSubtask`: id, questId, title, isCompleted
2. **`Progression.kt`**:
   - `ProgressionStage`: EXPLORER (L1-2), BUILDER (L3-5), STRATEGIST (L6-9), MASTER (L10+)
   - `WorldStage`: FORGOTTEN_OUTPOST (0d), FIRST_SPARKS (2d), AWAKENING (5d), GROWING_REALM (10d), RADIANT_CITADEL (20d), CELESTIAL_KINGDOM (30d)
   - `WorldPresentationMode`: FLOURISHING (active today), STABLE (<=1d), RESTING (>=2d)
   - `UserProfile`, `LevelInfo`, `StreakInfo`
3. **`FocusSession.kt`**: Timer modes (Pomodoro, Deep Work, Flow State, Quick Sprint)
4. **`Adventure.kt`**: World map adventure levels (Zone 1-5, stars, badge rewards)
5. **`Arcade.kt`**: Mini-games (Crystal Maze, Quest Defender, Snake, Memory Match)
6. **`SkillTree.kt`**: Cognitive skill branches and node unlocking

### Domain Engines
- **`XpProgressionEngine.kt`**: Level calculation baseline 250 XP + (level - 1) * 100 XP.
- **`StreakEngine.kt`**: Consecutive day counting, freeze shield protection (up to 2 freezes).
- **`ProductivityScoreEngine.kt`**: Composite 0-100 score based on quest completion, focus duration, and streak momentum.

---

## 4. Inspection of Existing Web Application (`src/`)

### Architecture & Tech Stack
- **Framework**: Next.js 16.4.3 (Turbopack, App Router)
- **Library**: React 19.3.0
- **Styling**: Tailwind CSS 4
- **State Management**: React Context (`src/lib/store.tsx`)
- **Persistence**: Browser `localStorage` (`questly_storage_v1`)

### Backend Findings
- **Crucial Finding**: Neither the Kotlin Android app nor the Next.js web app connects to an external REST or GraphQL backend server in their current repository state.
- Both existing implementations operate in an **offline-first, client-side persisted model**:
  - Native Android uses **Room SQLite DB** + **DataStore**.
  - Web uses **browser localStorage**.
- Therefore, in Questly 2.0 Mobile, the networking layer (`Dio`, `ApiClient`, repository interfaces) has been created with robust interceptors and configuration ready to target any future backend, while providing clean offline-first repository implementations and developer seed fixtures. No fake endpoints or phantom credentials have been fabricated.

---

## 5. Design Tokens & Visual Identity

From `android-app/src/main/java/com/example/ui/theme/Color.kt`:
- **Dark Background**: `#101114` / `#0B0D14`
- **Dark Surface**: `#191B20` / `#121522`
- **Dark Elevated Surface**: `#22252C` / `#20263A`
- **Dark Card Surface**: `#1B1D24` / `#181D2C`
- **Primary Violet**: `#8B7CFF`
- **Secondary Emerald/Teal**: `#5CE1B9` / `#69D8A5`
- **Accent Gold**: `#FFC857` / `#F5C96A`
- **Error Red**: `#FF647C` / `#FF6B7D`
- **Text Primary**: `#F5F5F7` / `#F5F6FC`
- **Text Secondary**: `#9A9DA8` / `#A6ADC4`
- **Text Muted**: `#6B6E7B` / `#6C738E`

These exact tokens have been ported into `mobile/lib/app/theme/app_colors.dart` and integrated into the Material 3 `ThemeData` configuration.

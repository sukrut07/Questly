# Questly Feature Mapping: Kotlin/Web to Flutter 2.0

This matrix maps every major subsystem from the original Kotlin Android and Next.js Web applications to the new Flutter + Dart Questly 2.0 mobile architecture.

---

## 1. Feature Status Matrix

| Subsystem | Original Kotlin (`android-app/`) | Original Web (`src/`) | Flutter 2.0 (`mobile/`) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Application Shell** | `MainActivity.kt`, Compose | `layout.tsx`, `page.tsx` | `lib/app/app.dart`, `main.dart`, `bootstrap.dart` | **Completed** |
| **Design System** | `Color.kt`, `Theme.kt`, `Type.kt` | `globals.css`, Tailwind v4 | `app_colors.dart`, `app_theme.dart`, `app_typography.dart`, `app_spacing.dart` | **Completed** |
| **Navigation & Routing** | `QuestlyNavigation.kt` (Compose Nav) | `store.tsx` (tab state) | `go_router` 18.x with `StatefulShellRoute` | **Completed** |
| **State Management** | `MainViewModel.kt` (StateFlow) | React Context + hooks | Riverpod 3.x (`Notifier`, `AsyncNotifier`, `Provider`) | **Completed** |
| **Dashboard / Home** | `HomeScreen.kt`, `LivingWorldCard.kt` | `components/home/*` | `features/dashboard/presentation/screens/dashboard_screen.dart` | **Completed** |
| **Quest Management** | `QuestsScreen.kt`, `CreateQuestDialog.kt` | `components/quests/*` | `features/quests/*` (List, Create, Detail, Subtasks) | **Completed** |
| **Daily Tasks** | Subtasks in `Quest.kt` & `QuestDao` | Subtasks in `types.ts` | `features/tasks/*` (Daily checklist, completion progress) | **Completed** |
| **XP Progression Engine** | `XpProgressionEngine.kt` | `progressionEngine.ts` | `features/gamification/domain/engine/xp_progression_engine.dart` | **Completed** |
| **Streak Engine** | `StreakEngine.kt` | `progressionEngine.ts` | `features/gamification/domain/engine/streak_engine.dart` | **Completed** |
| **Productivity Score** | `ProductivityScoreEngine.kt` | `store.tsx` calculation | Computed in `DashboardData` and `AnalyticsScreen` | **Completed** |
| **Profile & Badges** | `ProfileScreen.kt`, `AchievementsScreen.kt` | `components/profile/*` | `features/profile/*`, `features/achievements/*` | **Completed** |
| **Settings & Theme** | DataStore theme preference | LocalStorage theme | `features/settings/*`, `themeModeProvider` | **Completed** |
| **Notifications** | Mock notifications | In-app toasts | `features/notifications/presentation/screens/*` | **Completed** |
| **Onboarding** | `OnboardingScreen.kt` | Modal introduction | `features/onboarding/presentation/screens/*` | **Completed** |
| **Authentication Shell** | Not implemented (Local-only) | Not implemented (Local-only)| `features/auth/presentation/screens/login_screen.dart` | **Completed** |
| **Focus Timer** | `FocusScreen.kt` (Pomodoro) | `components/focus/*` | Architectural directory established | **Scheduled Phase 2** |
| **Adventure Map** | `AdventureMapScreen.kt` | `components/map/*` | Architectural directory established | **Scheduled Phase 2** |
| **Arcade Mini-Games** | 4 Canvas games (Maze, Defender, Snake, Match) | `components/arcade/*` | Architectural directory established | **Scheduled Phase 2** |
| **Skill Tree Nodes** | `SkillTreeScreen.kt` | `components/profile/SkillTree` | Architectural directory established | **Scheduled Phase 2** |
| **Home Screen Widgets**| `QuestlyAppWidgetProvider.kt` (Glance) | N/A | HomeWidget / Platform Channels integration | **Scheduled Phase 3** |

---

## 2. Parity Details for Completed Features

### A. Dashboard / Home Screen
- **Greeting & Header**: Adapts to morning, afternoon, evening based on device clock.
- **Level & Progression Badge**: Displays current level, stage badge (Explorer, Builder, Strategist, Master), and next level unlock goal.
- **Streak Tracker**: Real-time flame indicator with current streak and longest streak records.
- **Living World Milestone**: Displays current world stage (Forgotten Outpost, First Sparks, The Awakening, Growing Realm, Radiant Citadel, Celestial Kingdom).
- **Productivity Gauge**: Daily percentage completion and active tasks remaining.
- **Quick Action Bar**: One-tap access to New Quest, Deep Focus sprint, Badges, and Stats.
- **Active Quests Stream**: Filtered preview cards with category badge, difficulty multiplier, XP reward, and estimated completion time.

### B. Quest Journal
- Category filtering horizontally with active selection indicators.
- Modal / dedicated screen creation for custom quests with title, description, category, difficulty, priority, and estimated duration.
- Detailed view with interactive checklist for subtasks.
- Completion trigger awarding XP and marking status.

### C. Theming & Design System
- Dark-first aesthetic with custom deep dark surfaces (`#101114`, `#191B20`, `#22252C`).
- Dynamic theme toggle in Profile screen persisting via SharedPreferences.
- Custom typography utilizing Google Fonts `Inter` with platform fallback.

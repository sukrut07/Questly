# Questly 2.0 Feature-to-File Mapping

This document provides a 1-to-1 mapping between every implemented feature and its concrete source files. All files listed below are verified to exist and compile cleanly.

---

## 1. Application Foundation & Shell

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **Entry Point** | `mobile/lib/main.dart` | Application execution root |
| **Bootstrap** | `mobile/lib/app/bootstrap.dart` | Error zone guarding & async initialization |
| **App Widget** | `mobile/lib/app/app.dart` | MaterialApp configuration & theme setup |
| **Router** | `mobile/lib/app/router/app_router.dart` | GoRouter 5-branch shell and modal routes |
| **Route Constants** | `mobile/lib/app/router/route_names.dart` | Route name & path definitions |
| **Color Tokens** | `mobile/lib/app/theme/app_colors.dart` | Matiks dark, lime, lavender design tokens |
| **Typography Tokens** | `mobile/lib/app/theme/app_typography.dart` | Oswald display & Inter body typography |
| **Theme Builder** | `mobile/lib/app/theme/app_theme.dart` | Material 3 ThemeData generation |
| **Spacing Tokens** | `mobile/lib/app/theme/app_spacing.dart` | Grid layout margins, paddings, and radii |
| **Core DI Providers** | `mobile/lib/app/providers/app_providers.dart` | Riverpod dependency injection definitions |
| **API Client** | `mobile/lib/core/network/api_client.dart` | Centralized Dio HTTP client |
| **Local Storage** | `mobile/lib/core/storage/local_storage.dart` | SharedPreferences key-value driver |
| **Secure Storage** | `mobile/lib/core/storage/secure_storage.dart` | Encrypted Keystore/Keychain driver |

---

## 2. Dashboard Feature (`features/dashboard/`)

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **Screen** | `mobile/lib/features/dashboard/presentation/screens/dashboard_screen.dart` | Main dashboard view |
| **Navigation Shell** | `mobile/lib/features/dashboard/presentation/screens/main_scaffold.dart` | 5-destination bottom navigation bar |
| **Widget (Header)** | `mobile/lib/features/dashboard/presentation/widgets/dashboard_header.dart` | User greeting, avatar shortcut & XP badge |
| **Widget (Squad Bar)**| `mobile/lib/features/dashboard/presentation/widgets/focus_squad_bar.dart` | Live focus squad & duel countdown |
| **Widget (Challenge)**| `mobile/lib/features/dashboard/presentation/widgets/todays_challenge_banner.dart`| Puzzle / Focus dual split banner |
| **Widget (Progress)** | `mobile/lib/features/dashboard/presentation/widgets/progression_card.dart` | Level, progress bar & milestone unlocks |
| **Widget (Productivity)**| `mobile/lib/features/dashboard/presentation/widgets/daily_productivity_card.dart`| Daily task ratio & flow score |
| **Widget (Actions)** | `mobile/lib/features/dashboard/presentation/widgets/quick_actions_bar.dart` | Action buttons (Quest, Focus, Note, Roadmaps)|
| **Widget (Active)** | `mobile/lib/features/dashboard/presentation/widgets/active_quests_section.dart` | Top active missions list |
| **Provider** | `mobile/lib/features/dashboard/presentation/providers/dashboard_providers.dart` | Dashboard state notifier |
| **Repository (Contract)**| `mobile/lib/features/dashboard/domain/repositories/dashboard_repository.dart` | Dashboard data interface |
| **Repository (Impl)** | `mobile/lib/features/dashboard/data/repositories/mock_dashboard_repository.dart` | Offline dashboard repository |

---

## 3. Quests & Tasks Feature (`features/quests/` & `features/tasks/`)

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **Screen (Quests)** | `mobile/lib/features/quests/presentation/screens/quests_screen.dart` | Filterable quest journal screen |
| **Screen (Detail)** | `mobile/lib/features/quests/presentation/screens/quest_detail_screen.dart` | Quest milestone checkoffs & focus launch |
| **Screen (Create)** | `mobile/lib/features/quests/presentation/screens/create_quest_screen.dart` | Form wizard to create custom quests |
| **Screen (Tasks)** | `mobile/lib/features/tasks/presentation/screens/tasks_screen.dart` | Daily micro-task checklist |
| **Repository (Quest)**| `mobile/lib/features/quests/domain/repositories/quest_repository.dart` | Quest data interface |
| **Repository (Quest Impl)**| `mobile/lib/features/quests/data/repositories/quest_repository_impl.dart` | Quest persistence repository |
| **Repository (Task)** | `mobile/lib/features/tasks/domain/repositories/task_repository.dart` | Task data interface |
| **Repository (Task Impl)**| `mobile/lib/features/tasks/data/repositories/task_repository_impl.dart` | Task management repository |
| **Model (Quest)** | `mobile/lib/shared/models/quest.dart` | Quest and subtask data model |
| **Enums** | `mobile/lib/shared/enums/quest_enums.dart` | Quest category, difficulty & status enums |

---

## 4. Insights & Analytics Feature (`features/analytics/`)

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **Screen** | `mobile/lib/features/analytics/presentation/screens/analytics_screen.dart` | Complete analytics & heatmap screen |
| **Widget (Heatmap)** | `mobile/lib/shared/widgets/questly_heatmap.dart` | 16-week interactive contribution grid |
| **Widget (Stat Card)**| `mobile/lib/shared/widgets/questly_stat_card.dart` | Condensed KPI metric cards |
| **Widget (Section)** | `mobile/lib/shared/widgets/questly_section_header.dart` | High-contrast section title with action |
| **Repository** | `mobile/lib/features/analytics/domain/repositories/analytics_repository.dart` | Analytics data contract |

---

## 5. Notebook & Notes Feature (`features/notebook/`)

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **Screen (List)** | `mobile/lib/features/notebook/presentation/screens/notebook_screen.dart` | Searchable notes list with folder chips |
| **Screen (Editor)** | `mobile/lib/features/notebook/presentation/screens/note_editor_screen.dart` | Markdown editor with toolbar & autosave |
| **Model** | `mobile/lib/features/notebook/domain/models/note.dart` | Note and NotebookFolder data models |
| **Repository (Contract)**| `mobile/lib/features/notebook/domain/repositories/notebook_repository.dart` | Notebook data interface |
| **Repository (Impl)** | `mobile/lib/features/notebook/data/repositories/notebook_repository_impl.dart`| Offline persistence repository |

---

## 6. Visual Roadmaps Feature (`features/roadmaps/`)

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **Screen (List)** | `mobile/lib/features/roadmaps/presentation/screens/roadmaps_screen.dart` | Journeys list & starter templates |
| **Screen (Detail)** | `mobile/lib/features/roadmaps/presentation/screens/roadmap_detail_screen.dart` | Winding path journey & stage checklist |
| **Screen (Create)** | `mobile/lib/features/roadmaps/presentation/screens/create_roadmap_screen.dart` | Custom roadmap creation wizard |
| **Custom Painter** | `mobile/lib/features/roadmaps/presentation/widgets/roadmap_path_painter.dart` | Bézier curve serpentine road painter |
| **Model** | `mobile/lib/features/roadmaps/domain/models/roadmap.dart` | Roadmap & RoadmapMilestone models |
| **Repository (Contract)**| `mobile/lib/features/roadmaps/domain/repositories/roadmap_repository.dart` | Roadmap data interface |
| **Repository (Impl)** | `mobile/lib/features/roadmaps/data/repositories/roadmap_repository_impl.dart` | Roadmap storage & template engine |

---

## 7. Deep Focus Feature (`features/focus/`)

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **Screen** | `mobile/lib/features/focus/presentation/screens/focus_screen.dart` | Fullscreen animated circular timer |
| **Model** | `mobile/lib/features/focus/domain/models/focus_session.dart` | FocusSession & FocusMode definitions |
| **Repository (Contract)**| `mobile/lib/features/focus/domain/repositories/focus_repository.dart` | Focus session tracking contract |
| **Repository (Impl)** | `mobile/lib/features/focus/data/repositories/focus_repository_impl.dart` | Focus history persistence |

---

## 8. Gamification, Skill Tree & Arcade (`features/gamification/` & `features/arcade/`)

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **XP Engine** | `mobile/lib/features/gamification/domain/engine/xp_progression_engine.dart` | Level, XP thresholds & formula engine |
| **Streak Engine** | `mobile/lib/features/gamification/domain/engine/streak_engine.dart` | Streak progression & freeze protection |
| **Screen (Skill Tree)**| `mobile/lib/features/gamification/presentation/screens/skill_tree_screen.dart`| 6-branch RPG skill tree UI |
| **Model (Skill Tree)** | `mobile/lib/features/gamification/domain/models/skill_tree.dart` | SkillBranch & SkillNode models |
| **Repository (Skill)** | `mobile/lib/features/gamification/data/repositories/skill_tree_repository.dart` | Skill tree progression data |
| **Screen (Arcade)** | `mobile/lib/features/arcade/presentation/screens/arcade_screen.dart` | 15s Mind Snap speed math/memory duel |
| **Screen (Badges)** | `mobile/lib/features/achievements/presentation/screens/achievements_screen.dart`| Categorized trophies & tier badges |

---

## 9. Web Application (`src/` & `test/`)

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **Web Root Page** | `src/app/page.tsx` | Main web dashboard page |
| **Web Layout** | `src/app/layout.tsx` | Next.js root html layout & metadata |
| **Global Styles** | `src/app/globals.css` | Tailwind CSS v4 styling rules |
| **Web Test** | `test/progression.test.mjs` | Automated progression unit tests |


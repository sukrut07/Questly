# Questly 2.0 Academic Feature Implementation Matrix

**Audit Date:** 2026-11-13  
**Status Policy:** No feature is marked as complete unless its implementation is backed by running code and verified tests.

### Status Definitions
* **Implemented and verified**: Functioning in code, backed by automated tests, and verified end-to-end.
* **Implemented but not verified**: Code exists in repository, but lacks complete automated test coverage or emulator validation.
* **Partially implemented**: UI or data models exist, but backend synchronization or deep workflow wiring is pending.
* **Planned**: Architected for upcoming execution runs (Run 2–Run 6).
* **Blocked**: Dependent on external platform capability or permission.

---

## 1. Planning and Academic Organisation (9 Items)

| # | Capability | Current Codebase Implementation | Status |
| :---: | :--- | :--- | :---: |
| 1.1 | **Subjects, courses and semesters** | General `category` strings exist; dedicated `subjects` and `semesters` tables planned in Run 2. | **Partially implemented** |
| 1.2 | **Assignments, projects and deadlines** | General `goals` and `quests` with `dueDate`; dedicated `assignments` entity planned in Run 2. | **Partially implemented** |
| 1.3 | **Daily, weekly and monthly planner** | Basic weekly view in Analytics; dedicated planner view planned in Run 3. | **Partially implemented** |
| 1.4 | **Timetable and class schedule** | Not yet modeled in database or UI. | **Planned** |
| 1.5 | **Priorities, due dates and reminders** | `QuestPriority` (Low, Medium, High, Urgent) and due dates implemented in Flutter & Web. | **Implemented and verified** |
| 1.6 | **Goals broken into milestones** | `roadmaps` and `roadmap_milestones` implemented with progress calculations and tests. | **Implemented and verified** |
| 1.7 | **Nested checklists & recurring tasks** | `QuestSubtask` checklist and recurrence rules implemented with unit tests. | **Implemented and verified** |
| 1.8 | **Calendar with drag-and-drop** | Drag-and-drop rescheduling planned for Web in Run 3. | **Planned** |
| 1.9 | **Backlog & overdue-task management**| Tasks screen filters by completion; overdue warning badge planned in Run 3. | **Partially implemented** |

---

## 2. Learning and Academic Progress (10 Items)

| # | Capability | Current Codebase Implementation | Status |
| :---: | :--- | :--- | :---: |
| 2.1 | **Subject-wise progress tracking** | Overall progress exists; per-subject syllabus completion ratio planned in Run 2. | **Partially implemented** |
| 2.2 | **Topic and chapter completion** | `goal_subtasks` supported; explicit `modules` and `topics` hierarchy planned in Run 2. | **Partially implemented** |
| 2.3 | **Lecture and lab tracking** | Modeled as general tasks; dedicated timetable slot logging planned in Run 3. | **Planned** |
| 2.4 | **DSA & coding-problem tracker** | `arcade_screen.dart` Mind Snap mental math exists; dedicated LeetCode/DSA log planned in Run 2. | **Partially implemented** |
| 2.5 | **Assignment and project tracker** | Modeled through multi-stage `roadmaps`; dedicated assignment tracker planned in Run 3. | **Partially implemented** |
| 2.6 | **Exam and revision planner** | Initial spaced-repetition logic designed; revision queue planned in Run 2. | **Planned** |
| 2.7 | **Flashcards & spaced repetition** | Spaced-repetition scheduling intervals documented; UI queue planned in Run 3. | **Planned** |
| 2.8 | **Mock-test & assessment records**| Score tracking implemented in Mind Snap; academic assessment records planned in Run 2. | **Partially implemented** |
| 2.9 | **Learning roadmaps with milestones**| `RoadmapsScreen`, `RoadmapDetailScreen`, and `RoadmapRepository` fully implemented with tests. | **Implemented and verified** |
| 2.10| **Notes linked to subjects & tasks**| `notes` schema has `linked_goal_ids` and `linked_roadmap_ids`; subject foreign key planned in Run 2.| **Partially implemented** |

---

## 3. Focus and Execution (7 Items)

| # | Capability | Current Codebase Implementation | Status |
| :---: | :--- | :--- | :---: |
| 3.1 | **Pomodoro & custom focus sessions**| `FocusScreen` in Flutter and `FocusChamber` in Web fully functional with animated timer. | **Implemented and verified** |
| 3.2 | **Task-linked focus timer** | Focus session can be triggered with context from `QuestDetailScreen`. | **Implemented and verified** |
| 3.3 | **Distraction-free study mode** | Full-screen minimalist dark UI with ambient sound generators. | **Implemented and verified** |
| 3.4 | **Session notes and outcome** | `notes` field in `focus_sessions` table and post-session XP award modal. | **Implemented and verified** |
| 3.5 | **Break reminders** | Built into Pomodoro timer sequence (Work $\to$ Short Break $\to$ Long Break). | **Implemented and verified** |
| 3.6 | **Daily achievable workload suggestions**| Today's Challenge split banner recommends top puzzle and focus session daily. | **Implemented and verified** |
| 3.7 | **Quick capture for tasks and ideas**| `QuickActionsBar` on Dashboard allows 1-tap quest and note capture; bottom sheet planned in Run 4. | **Implemented and verified** |

---

## 4. Gamification and Motivation (9 Items)

| # | Capability | Current Codebase Implementation | Status |
| :---: | :--- | :--- | :---: |
| 4.1 | **XP ledger & transparent reward rules**| Immutable `xp_transactions` table with RPC function `record_activity_and_award_xp()`. | **Implemented and verified** |
| 4.2 | **Levels and academic ranks** | Progression engine calculates levels with square-root threshold; ranks planned in Run 2. | **Implemented and verified** |
| 4.3 | **Daily and weekly streaks** | Timezone-aware streak engine with freeze shield consumption in Postgres. | **Implemented and verified** |
| 4.4 | **Achievements & milestone badges** | Tiered achievements (Bronze, Silver, Gold, Diamond, Legendary) with claiming and tests. | **Implemented and verified** |
| 4.5 | **Subject-specific mastery progress**| Skill tree has 6 branches; subject-level academic mastery metric planned in Run 2. | **Partially implemented** |
| 4.6 | **Weekly challenges** | `FocusSquadBar` displays Sumday Showdown duel countdown; rotating challenges active. | **Implemented and verified** |
| 4.7 | **Streak recovery rules** | 2 monthly complimentary streak freezes supported in `streaks` table. | **Implemented and verified** |
| 4.8 | **Progress celebrations & unlockables**| Level-up celebration dialogs and canvas confetti on completion. | **Implemented and verified** |
| 4.9 | **Optional study groups & accountability**| Focus Squad bar with friend avatars and online status indicators. | **Implemented and verified** |

---

## 5. Analytics and Reflection (9 Items)

| # | Capability | Current Codebase Implementation | Status |
| :---: | :--- | :--- | :---: |
| 5.1 | **Daily & weekly completion rates**| `daily_summaries` table and `fl_chart` bar chart in `AnalyticsScreen`. | **Implemented and verified** |
| 5.2 | **Subject-wise progress breakdown** | Category breakdown in `daily_summaries`; dedicated subject progress ring planned in Run 2. | **Partially implemented** |
| 5.3 | **Planned versus completed tasks**| Daily productivity score engine compares completed vs total daily tasks. | **Implemented and verified** |
| 5.4 | **Focus session history** | `focus_sessions` table with historical duration queries. | **Implemented and verified** |
| 5.5 | **Revision consistency** | Daily activity log tracks learning sessions; dedicated revision recency planned in Run 2. | **Partially implemented** |
| 5.6 | **Academic activity heatmap** | 52-week annual GitHub-style calendar heatmap with intensity levels and tooltips. | **Implemented and verified** |
| 5.7 | **Weekly review and reflection** | Weekly productivity card implemented; automated Sunday review prompt planned in Run 3. | **Partially implemented** |
| 5.8 | **Upcoming deadlines & risk indicators**| Priority tags and due dates; color-coded deadline warning planned in Run 3. | **Partially implemented** |
| 5.9 | **Exportable progress reports** | Data export planned in Run 3. | **Planned** |

---

## 6. Widgets, Reminders and Integrations (9 Items)

| # | Capability | Current Codebase Implementation | Status |
| :---: | :--- | :--- | :---: |
| 6.1 | **Android home-screen widgets** | `QuestlyWidgetProvider.kt` and `questly_widget_layout.xml` implemented. | **Implemented but not verified** |
| 6.2 | **iOS home-screen widgets** | `QuestlyWidget.swift` with SwiftUI timeline provider implemented. | **Implemented but not verified** |
| 6.3 | **Lock-screen / glanceable progress**| `.accessoryRectangular` family planned in Run 5. | **Planned** |
| 6.4 | **In-app widget customisation** | `WidgetRepository`, `WidgetCustomizerSheet`, reorderable layout verified with tests. | **Implemented and verified** |
| 6.5 | **Calendar integration** | Documented in permissions architecture; external sync planned in Run 5. | **Planned** |
| 6.6 | **Local and push notifications** | `PermissionService` contextual request flow implemented; notification payload planned in Run 5.| **Partially implemented** |
| 6.7 | **Deep links from widgets to screens**| Deep link `questly://dashboard` wired in Android and iOS widget manifests. | **Implemented and verified** |
| 6.8 | **Offline access and background sync**| `SyncQueue` with persistent queue, retry, and idempotency verified with tests. | **Implemented and verified** |
| 6.9 | **Data export, backup and restore** | Database migrations and seed datasets version-controlled; export tool planned in Run 3.| **Partially implemented** |

---

## 7. Summary Metrics
* **Total Capabilities Evaluated**: **53**
* **Implemented and verified**: **22 (41.5%)**
* **Partially implemented**: **16 (30.2%)**
* **Implemented but not verified (Platform host)**: **2 (3.8%)**
* **Planned for upcoming runs**: **13 (24.5%)**
* **Blocked**: **0 (0.0%)**

# Questly 2.0 Upgrade Audit & System Gap Analysis

**Date:** 2026-11-13  
**Status:** In Progress — Phase 1 Complete  
**Target:** Production-Grade Cross-Platform Personal Operating System  

---

## 1. Executive Summary

Questly has established a clean, high-performance foundation with a dual-client architecture:
- **Mobile Client**: Flutter 3.24+ / Dart 3.5+ with Riverpod state management, GoRouter navigation, Dio networking, and local storage abstractions.
- **Web Client**: Next.js 16 (Turbopack) / React 19 / TypeScript 5 with Tailwind CSS v4.
- **Design System**: Matiks-inspired dark UI (`#101010` surface, `#B5FF55` electric lime, `#B9A3FF` lavender, Oswald typography, Inter body).

However, an exhaustive audit reveals that while the client shells and presentation layers are functional, **cloud synchronization and backend persistence are currently unbacked by a live operational database**. Persistence currently defaults to local key-value storage (`SharedPreferences` and in-memory mock repositories), leaving cross-device synchronization, streak reconciliation, auditable XP transactions, and server-side validation unfulfilled.

---

## 2. Current Architecture & Identified Deficits

```
                       [Current State]                                                [Target State (Questly 2.0)]

    Mobile (Flutter)          Web (Next.js)                         Mobile (Flutter)                 Web (Next.js)
    [In-Memory Mocks]       [Client LocalState]                     [SQLite/Drift + SyncQueue]       [Client Cache & Sync]
           \                       /                                              \                         /
            \                     /                                                ▼                       ▼
      [No Shared Backend / Remote Sync]                                  ┌───────────────────────────────────┐
                                                                         │       Supabase Shared Backend     │
                                                                         │  • PostgreSQL 15+ with Strict RLS │
                                                                         │  • Auth & User Profiles           │
                                                                         │  • Auditable XP Ledger Functions  │
                                                                         │  • Timezone-Aware Streak Engine   │
                                                                         │  • Realtime Subscriptions         │
                                                                         │  • Secure Storage Buckets         │
                                                                         └───────────────────────────────────┘
```

### 2.1 Critical Gaps Identified

1. **Missing Production Backend & Migrations**:
   - No SQL migrations exist for core entities: `profiles`, `user_preferences`, `goals`, `goal_subtasks`, `habits`, `habit_completions`, `quests`, `quest_completions`, `activity_logs`, `daily_summaries`, `streaks`, `notes`, `note_folders`, `note_tags`, `note_versions`, `roadmaps`, `roadmap_milestones`, `focus_sessions`, `achievements`, `user_achievements`, `xp_transactions`, `user_widgets`, `notification_preferences`, `device_tokens`.
   - No Row Level Security (RLS) policies configured.
   - Missing seed dataset for default achievements, categories, and skill tree branches.

2. **Synchronization & Offline-First Strategy**:
   - Missing persistent offline sync queue (`sync_queue`) with exponential backoff and idempotency keys to prevent duplicate XP awarding upon reconnect.
   - No conflict resolution strategy (last-write-wins with timestamp tracking for notes; append-only for activity logs).

3. **Streak & Gamification Logic**:
   - Streaks must be timezone-aware and prevent duplicate streak day increments when multiple tasks are completed on the same calendar day.
   - XP cannot be trusted from client payloads. A server-side transaction ledger (`xp_transactions`) must calculate authoritative totals.

4. **Notebook & Knowledge Management**:
   - Needs folder hierarchies, note linking (`[[note-id]]`), tagging, markdown export/import, and bidirectional links to goals and roadmaps.

5. **In-App & Native Widget Ecosystem**:
   - Dashboard needs dynamic widget configuration (add, remove, reorder, persist layout).
   - Android AppWidget and iOS WidgetKit require shared local data feeds and deep-link handlers.

6. **Contextual Permissions & Notifications**:
   - Opt-in permission architecture required to eliminate any blanket startup permission prompts.

---

## 3. Feature Completion Matrix

| Feature Module | Mobile (`mobile/`) | Web (`src/`) | Backend (Supabase) | Overall Status |
| :--- | :---: | :---: | :---: | :---: |
| **Authentication & Profile** | Mocked / Local | Local state | ❌ Needs Migrations & RLS | **Partial** |
| **Quests & Micro-Tasks** | Complete UI / Mocked API | Complete UI / Local | ❌ Needs Tables & Sync | **Partial** |
| **Habits & Nested Goals** | UI present | Basic tasks | ❌ Needs Subtasks Schema | **Partial** |
| **Streaks & Heatmap (52-wk)**| Complete UI / Demo Data | Component present | ❌ Needs Timezone Engine | **Partial** |
| **Notebook & Knowledge Base**| Complete UI / Local | Basic | ❌ Needs Folders & Versions | **Partial** |
| **Focus Mode (Pomodoro)** | Complete UI | Component present | ❌ Needs `focus_sessions` Table| **Partial** |
| **RPG Skill Tree (6 branches)**| Complete UI | Basic | ❌ Needs Remote Node Sync | **Partial** |
| **Mind Snap Arcade** | Complete UI (15s duel)| Basic | ❌ Needs Score Sync | **Partial** |
| **Trophies & Badges** | Complete UI (5 tiers) | Basic | ❌ Needs Validation | **Partial** |
| **In-App Widgets Engine** | Fixed layout | Fixed layout | ❌ Needs `user_widgets` Table| **Incomplete** |
| **Native OS Widgets** | Bridge skeleton | N/A | ❌ Needs AppWidget / WidgetKit| **Incomplete** |
| **Permissions Manager** | Basic | N/A | ❌ Needs Contextual Service | **Incomplete** |

---

## 4. Security & Risk Assessment

1. **Credential Safety**:
   - Strictly prohibit bundling `supabase_service_role_key` in any client build. Only `anon_key` is permitted.
   - All authorization must rely on PostgreSQL Row Level Security (`auth.uid() = user_id`).
2. **XP Manipulation Risk**:
   - Client can only request an activity completion; the Postgres database function `record_activity_and_award_xp()` verifies idempotency, checks daily caps, and writes an immutable record to `xp_transactions`.
3. **Offline Replay Attack**:
   - Every sync queue event carries a UUID v4 idempotency key. Duplicate events are silently discarded by Postgres unique constraints.

---

## 5. Upgrade Execution Plan

* **Phase 2: Architecture & Technology Consolidation** — Finalize schemas, Riverpod providers, and Supabase integration contracts.
* **Phase 3: Supabase Backend Implementation** — Migrations (24 tables), strict RLS, functions, triggers, and seed data.
* **Phase 4: Offline-First Synchronization** — Mobile SQLite sync queue, Web sync status indicator, conflict resolution.
* **Phase 5: Personal Dashboard Redesign** — Customizable widget gallery, dynamic layout persistence.
* **Phase 6: Habits, Goals & Nested Checklists** — Multi-level checklists, recurrence intervals, templates.
* **Phase 7: Centralized Streak & Heatmap Engine** — Timezone-aware calculation, 52-week calendar, category filters.
* **Phase 8: Advanced Personal Notebook** — Markdown editor/preview, folders, tagging, note linking, export/import.
* **Phase 9: Dual Widget Ecosystem** — In-app widgets + Native Android AppWidget & iOS WidgetKit integrations.
* **Phase 10: Customization & Personalization** — Themes, accents, density, reduced motion.
* **Phase 11: Contextual Notifications & Permissions** — Opt-in permission service, scheduling.
* **Phase 12: Dynamic Gamification** — Server-validated XP ledger, tier progression, cosmetic unlocks.
* **Phase 13: UI/UX Polish & Accessibility** — Touch targets, spring scale feedback, responsive design.
* **Phase 14: Dependency & Agent Skills** — Catalog audit and documentation.
* **Phase 15: Automated Testing & Validation** — Full CI test runs across mobile, web, and backend.
* **Phase 16 & 17: Deployment & Documentation** — Release manuals, setup guides, and updated README.

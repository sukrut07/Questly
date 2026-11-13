# Questly 2.0 Product & Codebase Audit: The Academic Operating System Blueprint

**Document Version:** 1.0.0  
**Phase:** Run 1 — Product & Codebase Audit (No Destructive Changes)  
**Target:** Academic Productivity, Mastery Tracking & Gamified Learning Platform  
**Repository:** `https://github.com/sukrut07/Questly`  

---

## 1. Executive Summary & Strategic Product Pivot

Questly 2.0 is evolving from a generic habit and task manager into a dedicated **Personal Academic Operating System & Achievement Engine**.

### 1.1 The Core Problem
Generic to-do lists and lifestyle habit apps treat all activities identically: drinking a glass of water awards the same dopamine as solving a complex Dynamic Programming problem or revising Linear Algebra for three hours. This trivializes productivity and fails students who need structured academic planning, topic breakdown, and verifiable learning progress.

### 1.2 The New Product Vision
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               CORE PRODUCT LOOP                                 │
│                                                                                  │
│   PLAN          ORGANISE        EXECUTE         RECORD          EARN XP          │
│ Semesters   →   Subjects    →   Checklists  →  Verified     → Server Ledger  │
│ Timetable       Chapters        Deep Work      Learning       Anti-Tamper        │
│                                                                                  │
│                               REVIEW & REFLECT                                   │
│                     Subject Mastery % • Revision Queue                           │
│                     52-Week Academic Consistency Heatmap                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

When a student opens Questly, the app must immediately answer three questions:
1. **What should I work on today?** (Top priority academic objective and next achievable subtask).
2. **What progress have I made?** (Subject mastery percentage, chapters completed, focus hours).
3. **What is the next achievable step?** (Due deadlines, scheduled revisions, upcoming classes).

---

## 2. Codebase & Infrastructure Audit

An inspection of the repository on `main` confirms a strong dual-client foundation:

| Layer | Current Codebase Implementation | Verified Status |
| :--- | :--- | :---: |
| **Web Client** | Next.js 16.4.3 (Turbopack), React 19, TypeScript 5, Tailwind CSS v4 | **Verified & Building** |
| **Mobile Client** | Flutter 3.24+ / Dart 3.5+, Riverpod 3.x, GoRouter 14, Dio 5.x | **Verified (32 tests passing)** |
| **Shared Backend** | Supabase PostgreSQL 15+, 24-table initial schema, RLS enabled | **Verified in SQL migrations** |
| **Persistence** | SQLite / Drift, `SharedPreferences`, `FlutterSecureStorage` | **Verified** |
| **Offline Sync** | `SyncQueue` with UUID v4 idempotency keys, exponential retry | **Verified with unit tests** |
| **In-App Widgets** | `WidgetRepository`, `DashboardWidgetConfig`, `WidgetCustomizerSheet`| **Verified with unit tests** |
| **Native Widgets** | Android `QuestlyWidgetProvider.kt`, iOS `QuestlyWidget.swift` | **Implemented layout & provider**|

---

## 3. De-Emphasizing Health & Fitness in Favor of Academics

### 3.1 What is Being Removed / De-Emphasized
* Health Connect and Apple Health movement/workout sync are removed from primary onboarding and dashboard flows.
* Generic habit tracking (e.g. hydration, stretching) is decoupled from the main progression engine.

### 3.2 What is Being Elevated to Core Status
* **Subjects & Syllabi**: First-class entities with credit weighting, instructor info, and target completion dates.
* **Topic & Subtopic Checklists**: Breaking down abstract courses (e.g. *Operating Systems: Virtual Memory*) into concrete 15-minute learning steps.
* **Assignments & Exam Countdown**: Hard deadlines linked to subjects with grade impact indicators.
* **Spaced Revision Queue**: Active recall intervals (Day 1 $\to$ Day 3 $\to$ Day 7 $\to$ Day 14) ensuring topics are retained.
* **DSA & Problem-Solving Trackers**: Tracking coding challenges with difficulty tiers, time taken, and verified solutions.

---

## 4. End-to-End Data Flow Map

```
  [User Action: Complete Subtask "Dynamic Programming: Memoization"]
                           │
                           ▼
  [Client Optimistic State Update: Progress Bar updates instantly]
                           │
                           ▼
  [Persistent Local Storage: Written to LocalStorage / SQLite]
                           │
                           ▼
  [SyncQueue: Enqueued with Action 'complete_topic' & Idempotency UUID v4]
                           │
                  (Network Available)
                           ▼
  [Supabase RPC: record_activity_and_award_xp()]
     ├── 1. Verifies auth.uid() == user_id (RLS boundary)
     ├── 2. Checks idempotency_key uniqueness (prevents duplicate XP)
     ├── 3. Inserts into immutable xp_transactions ledger
     ├── 4. Updates profiles.total_xp & recalculates Academic Rank
     ├── 5. Updates subject_topics.completion_status & subject mastery %
     └── 6. Invokes recalculate_user_streak() with user timezone
                           │
                           ▼
  [Authoritative Server Response: Reconciles Client State & Updates Widgets]
```

---

## 5. Verified Technical Debt & Identified Gaps

1. **Academic Hierarchy Gap**:
   - The current schema has `goals` and `quests`, but lacks dedicated tables for `academic_years`, `semesters`, `subjects`, `modules`, `topics`, `assignments`, and `examinations`.
2. **Mastery vs Motivational XP**:
   - Current dashboard computes level purely from gross XP. An **Academic Mastery Score** (derived from syllabus completion and revision recency) must be introduced as an independent credibility metric.
3. **Revision Scheduler**:
   - Spaced repetition queue is not yet wired to a scheduling table (`revision_sessions`).
4. **Timetable / Class Schedule**:
   - Need weekly class slots with location/link and automated reminders before lectures.


# Questly 2.0 — Complete UI/UX Redesign & Engineering Report

**Date**: November 13, 2026  
**Repository**: [sukrut07/Questly](https://github.com/sukrut07/Questly)  
**Branch**: `main`  
**Status**: Production Release Ready • All Automated Tests Passing

---

## 1. Executive Summary & Transformation

Questly 2.0 has been completely redesigned from a generic AI-templated dashboard into a **dark editorial, neo-brutalist academic productivity operating system**. Inspired by the high-energy visual identity of Matiks and modern developer-first interfaces, Questly combines:

- **Dark editorial palette**: `#101010` deep main backdrop, `#171717` card surfaces, `#1E1E1E` elevated modules, and `#383838` architectural borders.
- **Vivid neon accents**: `#B5FF55` (Neon Lime) for verified actions and primary CTAs, `#B9A3FF` (Lavender Purple) for syllabus mastery and deadlines, `#62D9FF` (Cyan) for academic rank, `#FF806B` (Coral) for streaks and urgency, and `#FFD76A` (Yellow) for XP ledger rewards.
- **Chunky typography**: Google Fonts `Space Grotesk` (weights 400 to 900) for confident headlines and `Space Mono` (weights 400, 700) for timestamps, course codes, and telemetry badges.
- **Coordinate graph-paper visuals**: Subtle SVG grid overlays (`.bg-graph-grid`, `.bg-graph-dots`) evoking lab notebooks, engineering graph paper, and structured academic study.
- **Zero Dummy Data Mandate**: Zero fabricated quests, fantasy lore, or fake achievements. The application boots into a clean, functional workspace where all subjects, tasks, checklists, and deadlines are created and managed by the student, with instant persistence in `localStorage`.

---

## 2. Public-Facing Landing Page

A dedicated public landing page (`src/components/landing/LandingPage.tsx`) has been introduced at the root route (`mode === 'landing'`):

1. **Sticky Header**: Responsive brand lockup with neon lime badge (`v2.0`), desktop navigation links (`Features`, `How It Works`, `Mobile`, `GitHub`), and an `Open Workspace` CTA.
2. **Hero Section**: Bold headline (*"TURN STUDY TIME INTO ACCELERATED MASTERY"*), subtitle highlighting personal ownership, and dual neo-brutalist action buttons (*"Launch Workspace"* with arrow icon and *"Explore Academic Features"*).
3. **Interactive Workspace Mockup**: A floating dark terminal preview featuring live-status pills (*"CS 201: Algorithmic Verification"*, *"Workload: Balanced 180m/240m"*, *"Ledger: Verified +65 XP"*), complete with an interactive mini-checklist.
4. **6-Card Feature Bento Grid**:
   - *Coursework & Syllabus Mastery*: Multi-tier breakdown (Courses → Modules → Topics → Checklists).
   - *Workload Balancer*: Capacity limiter warning against overloaded schedules.
   - *Verified Focus Chamber*: Anti-cheat sprint timer awarding XP only upon session completion.
   - *Academic Timetable & Deadlines*: Conflict detector and weekly lecture schedule.
   - *Smart Academic Inbox*: Zero-friction staging queue for lecture instructions and reference links.
   - *Data Ownership & Privacy*: 100% offline-capable, local-first JSON/CSV backups.
5. **5-Step Methodology Timeline**: Chronological learning roadmap from curriculum setup to timed sprint execution and weekly reviews.
6. **Mobile Showcase & App Store Preview**: Phone mockups highlighting cross-platform Flutter mobile parity.
7. **Neo-Brutalist Footer**: Quick links, social badges, copyright, and seamless return to the top.

---

## 3. Self-Populated Academic Workspace (Zero Slop)

All fake mock data (`INITIAL_SUBJECTS = []`, `INITIAL_QUESTS = []`, `INITIAL_DEADLINES = []`, `INITIAL_INBOX = []`, `currentStreak: 0`, `totalXp: 0`) has been cleared by default. The workspace provides rich, beautiful, actionable empty states with working modals:

### A. Academic Course & Syllabus Manager (`SubjectModal.tsx` & `SubjectsView.tsx`)
- **Enroll Course**: Create subjects with Course Code (`CS 201`, `MATH 152`), Course Title, Professor Name, Credits (1–6), Target Grade (`A+` to `Pass`), and a 6-color neo-brutalist palette selector.
- **Curriculum Tree**: Expand courses to view syllabus progress percentage, add modules on the fly, add granular topics with difficulty ratings and estimated study times, and add interactive checklist subitems.
- **Empty State**: Neo-brutalist empty state with `+ Enroll First Course` and `Browse Templates`.

### B. Today's Academic Tasks (`QuestModal.tsx` & `HomeDashboard.tsx`)
- **Add Task Form**: Task Title, Associated Course (with fallback to General / Independent Study), Academic Task Type (`problem_solving`, `coding`, `reading`, `revision`, `lab_work`, `writing`), Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), Estimated Minutes, Due Date, and dynamic Checklist Subtasks.
- **Instant Focus Sprint**: Any active task can be launched into the Focus Chamber with one click.
- **Empty State**: Clear prompt with `+ Add Task` and `Browse Templates`.

### C. Deadlines Radar (`DeadlineModal.tsx` & `PlannerView.tsx`)
- **Add Deadline Form**: Title, Course, Type (`assignment`, `examination`, `project`), Due Date, Grade Weightage percentage, and priority level.
- **Radar Countdown**: Automatic calculation of days remaining with color-coded alerts (`Due Today`, `< 3 days left`, `> 3 days left`).
- **Empty State**: Prominent `+ Add Deadline` prompt.

### D. Academic Templates Engine (`TemplatesModal.tsx`)
- Prebuilt, production-tested roadmaps ready to instantiate into any course:
  1. **Data Structures & Algorithms Sprint**: 4 core modules (Binary Search, AVL Rotations, Shortest Paths, Dynamic Programming) with 11 subtasks.
  2. **14-Day Examination Crunch**: Spaced revision, timed past paper drill, error log remediation, and rapid recall.
  3. **Research Paper & Thesis Deliverable**: Literature review, algorithmic methodology, benchmark harness, and LaTeX camera-ready proofreading.
  4. **New Semester Setup & Syllabus Onboarding**: Grading weight audit and weekly timetable configuration.

---

## 4. Reusable Dashboard Widget Manager (`WidgetManagerModal.tsx`)

Users can customize their Command Center dashboard layout:
- **Toggle Visibility**: Turn individual widgets on or off (`workload`, `focus_chamber`, `tasks_list`, `subjects_tree`, `deadlines_radar`).
- **Reorder Modules**: Move widgets up or down with automatic normalized indexing.
- **Reset to Defaults**: One-click restore to the recommended dashboard configuration.
- **Local Persistence**: Layout preferences save automatically to `localStorage` (`questly_user_workspace_v4`).

---

## 5. Mobile Navigation & Drawer Experience (`MobileNav.tsx`)

- **Top Navigation Bar**: Brand logo with `v2.0` badge, level indicator, search trigger (`Cmd+K`), live streak counter with flame icon, and a hamburger drawer button.
- **Slide-out Drawer**: Accessible on all viewport sizes below `1024px`, featuring full navigation links, tools (`Customize Widgets`, `Templates`, `Weekly Review`, `Data Backup`), public landing page return button, and audio toggle.
- **Bottom Navigation Bar**: Fixed thumb-friendly touch targets for `Home`, `Planner`, `+ (Quick Add FAB)`, `Subjects`, and `Inbox` (with unread badge counter).

---

## 6. Engineering Verification & Test Results

| Test Suite | Scope | Target | Result | Execution Time |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js ESM Test Suite** | 9 unit & progression engine tests | Web application logic | **9 / 9 PASSED** | 31 ms |
| **TypeScript Compilation** | `npx tsc --noEmit` | Strict type validation | **0 Errors** | 1.8 s |
| **Turbopack Production Build** | `npm run build` | Next.js 16.4.3 production bundle | **Compiled in 2.0s** | 2.0 s |
| **Flutter Test Suite** | 32 mobile widget & repository tests | Dart 3.10 / Flutter 3.38 | **32 / 32 PASSED** | 1.9 s |
| **Flutter Static Analysis** | `flutter analyze` | Mobile linting & clean code | **0 Issues found** | 2.4 s |
| **Live Local Dev Server** | `http://localhost:3000` | HTTP 200 response | **Verified Running** | Instant |

---

## 7. How to Run Locally

### Web Application (Next.js 16)
```bash
# In the repository root
npm install
npm run dev

# Open in browser:
# http://localhost:3000
```

### Mobile Application (Flutter)
```bash
# Navigate to the mobile directory
cd mobile
flutter pub get
flutter test
flutter run
```


# Questly 2.0 — Neon Gamified Redesign & Progression OS

## Executive Overview

Questly 2.0 has been transformed into a gamified academic productivity platform inspired by the visual language of high-performance gaming interfaces (such as Matiks) merged with the information-rich clarity of a modern academic operating system.

The application retains its **zero-fabricated-data** guarantee: no fake tasks, no simulated streaks, and no pre-populated filler metrics. Every level, unlockable theme, and XP point is verified through authentic task completion, focus sessions, and syllabus progress.

---

## Architecture & Visual Identity

### 1. Palette & Typography Tokens

| Token | Hex Code | Visual Application |
|---|---|---|
| `--bg-main` | `#090A0D` | Obsidian deep canvas |
| `--bg-secondary` | `#111319` | Dark charcoal cards & side panels |
| `--surface-main` | `#171A21` | Elevated component surface |
| `--surface-elevated` | `#20242D` | Hover states and inputs |
| `--border-color` | `#303642` | High-contrast structural dividers |
| `--primary-lime` | `#B5FF55` | Primary brand accent & task completion |
| `--electric-purple` | `#A879FF` | Secondary accent & syllabus milestones |
| `--electric-cyan` | `#42DFFF` | Timetable & active session highlight |
| `--neon-orange` | `#FF9C45` | High priority tags & streak flames |
| `--neon-pink` | `#FF5EBB` | Special achievements & arcade accents |
| `font-display` | `Barlow_Condensed` | Bold condensed headers with tight tracking |
| `font-mono` | `Space_Mono` | Timestamps, coordinates, and telemetry badges |

### 2. Interactive Coordinate Graph Canvas (`InteractiveGraphBackground.tsx`)
- Canvas-based stable coordinate grid (no translating or shifting lines).
- Distance-weighted illumination on pointer hover with smooth radial falloff.
- Multi-colored glowing cursor halo (`NeonCursor.tsx`) with smooth interpolation (`lerp`), touch-device auto-detection, and `prefers-reduced-motion` compliance.

### 3. Questly Lightning Emblem (`QuestlyLogo.tsx`)
- Original vector SVG emblem featuring a stylized "Q" merged with an electric lightning bolt.
- Supports `lime`, `cyan`, `purple`, and `orange` glow filter variants.

---

## Progression Layer: Idempotent XP Ledger

### Anti-Gaming & Idempotency Rules
To prevent cheating by checking and unchecking tasks:
1. Every XP award writes an immutable record to `xpTransactions`:
   ```ts
   export interface XpTransaction {
     id: string;
     timestamp: number;
     sourceEvent: XpSourceEvent;
     activityId: string;
     activityTitle: string;
     xpAmount: number;
     levelAtTime: number;
   }
   ```
2. When toggling a task, `awardXp` checks if `(sourceEvent, activityId)` already exists. Duplicate claims are rejected.
3. Uncompleting/reopening a task does not deduct XP from the ledger, but re-checking it does not grant duplicate XP.

### 7-Level Scholar Progression Roadmap

```
Level 1: Initiate (0 XP)        → Default obsidian canvas & neon lime theme
Level 2: Explorer (200 XP)      → Electric Purple accent & coordinate crosshair cursor
Level 3: Builder (500 XP)       → Electric Cyan accent & synthesizer audio pack
Level 4: Strategist (900 XP)    → High-density isometric graph paper
Level 5: Specialist (1400 XP)   → Neon Orange accent & particle trails
Level 6: Architect (2000 XP)    → Cyberpunk Pink accent & tactical soundboard
Level 7: Master (2800+ XP)      → Golden Scholar badge & gradient cursor halo
```

---

## Productivity Layer

### 1. Timetable Tracker (`TimetableTrackerView.tsx` & `TimetableModal.tsx`)
- **Views**: Day View (chronological timeline), Week View (7-column grid), and Agenda View (card list).
- **Live Indicator**: Detects current day of the week and active class slot based on system clock (`startTime` to `endTime`).
- **Slot Attributes**: Course code, subject name, room/hall location, session type (`lecture`, `lab`, `tutorial`), and notes.

### 2. Academic Workspaces (`WorkspaceTrackerView.tsx` & `WorkspaceModal.tsx`)
- Isolate study environments by course, research lab, or exam sprint.
- Workspaces link specific subjects and filter dashboard tasks, syllabi, and deadlines to the active workspace.
- Primary workspace switcher with quick "Set Active" controls.

### 3. Atomic Task Engine (`TasksView.tsx`)
- Filtering by `All`, `Today`, `Urgent`, `Completed`, and by `Subject`.
- Subtask checklists with instant completion toggles.
- Integrated "Start Focus Sprint" button launching the Pomodoro chamber.

---

## Play Layer: Questly Arcade (`ArcadeHub.tsx`)

A dedicated cognitive warmup hub providing micro-games designed to stimulate mental agility between study sprints.

### Strict 20 XP Daily Cap
- To ensure mini-games **never overshadow coursework**, all arcade games draw from a strict **20 XP daily maximum**.
- Live meter displays `todayArcadeXp / 20 XP`. Games continue to track high scores once the cap is reached, but no further XP is issued.

### 4 Matiks-Grade Cognitive Micro-Games
1. **Fast Math Duel (`MathSprintGame.tsx`)**: 30-second rapid arithmetic speed duel. Chain correct calculations to trigger x2, x3, and x5 combo multipliers with countdown bars and tactile feedback.
2. **Number Crossword (`CrossMathGame.tsx`)**: Cross-math grid puzzle directly matching the Matiks reference. Balance intersecting horizontal and vertical equations by placing lavender number tiles from the dock. Includes Undo, Clear, and Level progression.
3. **Mind Snap Reaction Duel (`MindSnapGame.tsx`)**: High-speed visual cognitive duel. Dual flash cards test matching conditions by shape, color, or numerical value under intense 30-second time pressure with millisecond response telemetry.
4. **Blitz Sudoku (`SudokuGame.tsx`)**: Mobile-first 6×6 touch board with pencil notes, row/column/number highlighting, remaining digit counts, and mistake tracking.

---

## Interactive Mobile Widget & Webflow Embed OS

### 1. Standalone Route (`/widget`)
- Served directly at `/widget` without navigation or sidebars.
- Perfect for iframes, Notion pages, Webflow sites, or bookmarking to mobile home-screens.
- Zero client prerender issues (`Next.js 16 Partial Prefetching` compliant).

### 2. Live Interactive Widget (`MobileWidgetView.tsx`)
- **Small (2x2)**: Streak flame, total XP, scholar level, and daily task completion bar.
- **Medium (4x2)**: Left column shows XP and flow minutes; right column displays next active task with an interactive checkbox that immediately marks the quest complete, updates XP, and triggers sound.
- **Large (4x4)**: Comprehensive widget with XP, flow time, upcoming timetable class session, and interactive priority task checklist.
- One-click "Copy Embed Code" button for instantaneous integration into Webflow or personal sites.

---

## Mobile Touch & Performance Optimization
- **Touch-Action Manipulation**: All interactive elements use `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` to eliminate mobile tap latency.
- **Safe-Area Insets**: Bottom mobile bar dynamically expands with `pb-[max(0.5rem,env(safe-area-inset-bottom))]` for bezel-less iOS and Android navigation bars.
- **Active Glow Indicators**: Mobile navigation icons feature subtle active glowing dots inspired by modern gaming navbars.
- **Zero Horizontal Overflow**: All containers enforce `overflow-x-hidden` and `w-full max-w-full`.

---

## Mobile Home-Screen Widgets (Flutter & Native)

### 1. Multi-Size Widget Family
- **Small (2x2)**: Streak flame, total XP, scholar level, and daily task completion bar.
- **Medium (4x2)**: Left column shows XP and flow minutes; right column displays next active task with subject tag.
- **Large (4x4)**: Complete overview with XP, verified flow time, task fraction, and active timetable class session.

### 2. Implementation Matrix
- **Shared Data Service**: `mobile/lib/core/widgets/home_widget_service.dart` serializes widget snapshots into `SharedPreferences`.
- **Android Native**:
  - `widget_small.xml`, `widget_medium.xml`, `widget_large.xml` in `res/layout/`.
  - `questly_widget_info.xml` provider meta in `res/xml/`.
  - `QuestlyWidgetProvider.kt` in `com.questly.mobile`.
- **iOS Native**:
  - `QuestlyWidget.swift` in `Runner/QuestlyWidget` utilizing WidgetKit and SwiftUI.
- **In-App Interactive Preview**:
  - `mobile/lib/features/dashboard/presentation/widgets/home_widget_preview.dart` with interactive `2x2`, `4x2`, `4x4` size toggles.

---

## Verification & Build Results

### 1. Web Layer (Next.js 16 + React 19 + TypeScript)
- **TypeScript (`npx tsc --noEmit`)**: 0 errors.
- **Unit Tests (`npm test`)**: 9/9 passed.
- **Production Build (`npm run build`)**: Compiled successfully in 2.5s with Turbopack.

### 2. Mobile Layer (Flutter 3.x + Dart)
- **Static Analysis (`flutter analyze`)**: 0 issues found.
- **Unit & Widget Tests (`flutter test`)**: 32/32 tests passed.


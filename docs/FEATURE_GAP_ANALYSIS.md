# Questly 2.0 — Feature Gap Analysis & Prioritization Matrix

**Date:** November 13, 2026  
**Auditor:** Principal Product Manager & Senior Architect  
**Objective:** Delineate missing high-value capabilities from low-value distractors

---

## 1. Feature Priority Assessment

| Capability | Category | Priority | User Value | Architectural Complexity | Verdict |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Smart Academic Inbox** | Core Workflow | **High** | Critical for zero-friction capture during lectures and study | Moderate | **BUILD** |
| **Workload Balancer** | Productivity / Planning | **High** | Prevents academic burnout; warns of impossible schedules | Moderate | **BUILD** |
| **Academic Templates** | Knowledge / Onboarding | **High** | Accelerates semester setup and exam preparation | Low | **BUILD** |
| **Global Command Palette** | Navigation / UX | **High** | Immediate keyboard-driven power user experience (`Cmd+K`) | Moderate | **BUILD** |
| **Data Export & Backup** | Data Integrity | **High** | Protects student records via JSON and CSV export/import | Low | **BUILD** |
| **Guided Weekly Review** | Meta-Habit | **Medium** | Promotes reflective learning and weekly alignment | Moderate | **BUILD** |
| **Resource Attachments** | Academic Tasks | **Medium** | Links PDFs and URLs to individual tasks | Low | **BUILD** |
| **Living World RPG Canvas** | Gamification | **Low** | Decorative distraction; slows down navigation | High | **DEPRECATE** |
| **Arcade Mini-Games** | Entertainment | **Low** | Procrastination trigger inside a productivity tool | High | **REMOVE** |
| **Public Leaderboards** | Social | **Low** | Encourages toxic comparison rather than academic focus | High | **OMIT** |
| **Unanchored AI Chatbot** | AI Hype | **Low** | Hallucinates study advice; high token cost, low utility | High | **OMIT** |

---

## 2. Detailed Specification for High-Priority Features

### 2.1. Feature A: Smart Academic Inbox
- **Purpose:** A frictionless staging queue for thoughts, unassigned tasks, lecture notes, textbook references, and sudden deadlines.
- **Data Model:** `InboxItem { id, title, notes?, sourceUrl?, type: 'task' | 'note' | 'deadline' | 'reference', subjectId?, createdAt }`.
- **Workflow:**
  1. Capture with 1 keystroke or click from anywhere.
  2. Triage later: Convert into an actionable `AcademicTask`, file into a `Subject`, or link to an `Assignment`.

### 2.2. Feature B: Workload Balancer
- **Purpose:** Compares the total estimated duration of planned tasks against the student's daily focus capacity.
- **Formula:**
  $$\text{Planned Load} = \sum_{t \in \text{Today's Tasks}} \text{Estimated Minutes}(t)$$
  $$\text{Capacity} = \text{Settings.dailyFocusTargetMinutes} \quad (\text{default: } 180\text{m / 3 hrs})$$
  $$\text{Ratio} = \frac{\text{Planned Load}}{\text{Capacity}}$$
- **Visual Feedback:**
  - $\le 85\%$: **Balanced** (Green badge)
  - $86\% - 110\%$: **Demanding** (Amber badge)
  - $> 110\%$: **Overloaded Warning** (Red alert with suggestion to reschedule lowest priority task)

### 2.3. Feature C: Academic Templates
- **Purpose:** One-click generation of battle-tested learning structures:
  1. *DSA Mastery Track:* Arrays, Linked Lists, Trees, Graphs, DP, 75 LeetCode problems breakdown.
  2. *Semester Exam Crunch:* 14-day countdown revision split, past paper review, cheat-sheet synthesis.
  3. *Research Paper Workflow:* Literature survey, methodology formulation, implementation, paper drafting, citation audit.
  4. *Math Problem Set:* Theory review, standard exercises, challenge proofs, doubts discussion.

### 2.4. Feature D: Global Command Palette (`Cmd/Ctrl + K`)
- **Keybindings:** `Cmd+K` (Mac), `Ctrl+K` (Windows/Linux), or clicking the search bar in the header.
- **Capabilities:**
  - Instant search across all tasks, subjects, notes, and deadlines.
  - Action commands: Create Task, Create Subject, Start Focus Session, Toggle Theme, Open Weekly Review, Export Data.
  - Arrow key navigation, highlighted active item, Escape to dismiss.

### 2.5. Feature E: Data Export and Validated Backup
- **Exports:**
  - `questly_academic_backup_{date}.json`: Complete snapshot of user profile, subjects, tasks, focus logs, and XP ledger.
  - `questly_tasks_{date}.csv`: Clean tabular spreadsheet export of all academic tasks and completion statuses.
- **Import Validation:**
  - Rigorous JSON schema validation before mutating local state or backend.
  - Prevents data corruption or accidental overwrites.

### 2.6. Feature F: Guided Weekly Review
- **Trigger:** Sunday evening prompt or accessible anytime from the sidebar / command palette.
- **Steps:**
  1. *Celebrate:* Review total focus hours logged, tasks completed, and XP earned.
  2. *Reflect:* Inspect incomplete or carried-over tasks with options to defer, drop, or reprioritize.
  3. *Align:* Review upcoming deadlines for the following 7 days.
  4. *Commit:* Set top 3 academic priorities for the new week.

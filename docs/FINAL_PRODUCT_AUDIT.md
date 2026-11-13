# Questly 2.0 — Final Product & Anti-AI-Slop Audit

**Date:** November 13, 2026  
**Auditor:** Principal Product Designer, Senior Frontend Architect, UX Auditor  
**Scope:** Complete Next.js 16 Web Application, Flutter Mobile App, Supabase Integration, Design Tokens, and Content Audit

---

## 1. Executive Summary

This audit evaluates Questly's current implementation against our target standard: a **rigorous, distraction-free Personal Academic Operating System** with a Matiks-inspired neo-brutalist dark aesthetic.

The codebase currently contains strong architectural bones (Next.js 16, Flutter 3.38, Riverpod, Supabase migrations), but suffers from **severe AI-generated fantasy RPG tropes and "AI slop"** that undermine its utility as an academic tool:
- Arbitrary fantasy lore ("Kaelen Swiftwind", "Novice Wayfarer", "Summoning Kingdom...", "Inscribe Next Quest", "Your realm is flourishing").
- Non-academic gamification features ("LivingWorldCard", "ArcadeHub", "QuestDefender", "CrystalMaze") that distract from academic execution.
- Disconnected academic features: lacks a unified Academic Inbox, Workload Balancer, Academic Templates, Global Command Palette (`Cmd+K`), Data Export/Import, and Weekly Review.
- Misaligned visual tokens: neon gradients and fantasy glows instead of crisp 1.5px neo-brutalist borders and high-contrast editorial hierarchy.

---

## 2. Content & Copy Audit: Identifying "AI Slop"

The following generic AI-generated marketing phrases and fantasy copy are identified across the codebase and marked for immediate removal:

| Existing Copy (Flagged as AI Slop) | Affected Files | Replacement Academic Copy |
| :--- | :--- | :--- |
| `"Summoning Kingdom..."` | `src/app/page.tsx` | `"Loading your academic workspace..."` |
| `"Kaelen Swiftwind"` | `src/lib/initialData.ts` | `"Sukrut Dusane"` |
| `"Novice Wayfarer"` | `src/lib/initialData.ts` | `"Computer Science • Semester 3"` |
| `"Your realm is flourishing and waiting for today's achievements."` | `src/components/home/HomeDashboard.tsx` | `"3 of 6 tasks completed today · 1 upcoming deadline"` |
| `"Inscribe Next Quest"` | `src/components/home/HomeDashboard.tsx` | `"Add Academic Task"` |
| `"Energy Earned"` / `"+150 Energy"` | `src/components/home/HomeDashboard.tsx` | `"XP Earned Today"` |
| `"Realm Nourished"` | `src/components/home/HomeDashboard.tsx` | `"Daily Study Goal Met"` |
| `"pending missions awaiting execution"` | `src/components/home/HomeDashboard.tsx` | `"Tasks planned for today"` |
| `"Architect Living World Canvas & Dynamic Stage Shaders"` | `src/lib/initialData.ts` | `"Implement Red-Black Tree Balancing (CS-204)"` |
| `"Morning Cardio & Kettlebell Circuit"` | `src/lib/initialData.ts` | `"Review Linear Algebra Eigenvalues Worksheet (MATH-201)"` |

---

## 3. Visual & Component Audit: AI Slop & Inconsistencies

1. **The Living World Procedural Card (`LivingWorldCard.tsx`)**:
   - *Issue:* A large 300px fantasy mountain/crystal canvas representing "Realm stages". It takes up prime real estate on the home screen without conveying actionable academic information.
   - *Fix:* Replace with the **Academic Command Center**: a prominent "Next Action" hero card, syllabus mastery meters, and the Workload Balancer.
2. **The Arcade Minigames (`ArcadeHub.tsx`, `QuestDefender.tsx`, `CrystalMaze.tsx`)**:
   - *Issue:* Retro arcade games embedded in a productivity app create cognitive distraction and bloat.
   - *Fix:* Deprecate and remove the Arcade tab in favor of the **Academic Inbox**, **Coursework Syllabus Tree**, and **Weekly Review**.
3. **Card Border Radii & Gradients**:
   - *Issue:* Inconsistent `rounded-3xl` and `rounded-2xl` with heavy purple-to-indigo gradient overlays (`bg-gradient-to-br from-purple-950/60 via-surface-main to-indigo-950/40`).
   - *Fix:* Standardize on crisp neo-brutalist styling: `rounded-2xl`, solid 1.5px borders (`border-zinc-800`), deep dark background (`#09090B`), solid cards (`#121216`), with selective Neon Lime (`#A3E635`) and Academic Lavender (`#C084FC`) functional accents.

---

## 4. Missing High-Value Academic Capabilities

The audit confirms the following 6 core academic workflows are missing or incomplete:
1. **Academic Inbox:** No staging area for unstructured assignment requirements, lecture links, or quick notes.
2. **Workload Balancer:** No automated time estimation comparing planned tasks against daily available focus hours; no overload alerts.
3. **Academic Templates:** No prebuilt syllabus checklists for DSA, Semester Planning, Exam Revision, Research Papers, or Math Problem Sets.
4. **Global Command Palette (`Cmd+K`):** Navigation requires manual clicking; no keyboard-driven fast launcher.
5. **Data Backup & Export/Import:** No mechanism to export user data to JSON or tasks to CSV, and no backup validation.
6. **Guided Weekly Review:** No structured flow to review the past 7 days of study, close open loops, and plan the upcoming week.

---

## 5. Remediation Plan

1. Overhaul Web State Store (`src/lib/store.tsx` & `src/lib/types.ts`) to support academic subjects, modules, topics, syllabus checklists, inbox items, and workload calculations.
2. Populate realistic Semester 3 academic seed data: Data Structures & Algorithms, Linear Algebra, Probability & Statistics, Python Programming, Database Management Systems.
3. Build the 6 high-value features:
   - `AcademicInbox`
   - `WorkloadBalancer`
   - `AcademicTemplates`
   - `CommandPalette` (`Cmd/Ctrl + K`)
   - `DataBackupModal`
   - `WeeklyReviewModal`
4. Redesign `HomeDashboard.tsx` with clean editorial hierarchy and zero AI slop.
5. Provide dedicated tabs for **Subjects & Syllabus**, **Planner & Timetable**, **Inbox**, **Focus**, and **Analytics**.
6. Verify locally in browser, execute end-to-end tests, and capture live demo results.


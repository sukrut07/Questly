# Questly 2.0 — UI Issues, Inconsistencies & AI Slop Inventory

**Date:** November 13, 2026  
**Auditor:** Principal Frontend Engineer, Accessibility Specialist  
**Status:** Remediating

---

## 1. Inventory of Identified UI Issues

### 1.1. Fantasy RPG Lore & AI Slop Copy
- **Issue 1.1.1 (`src/app/page.tsx`):** Loading splash displays `"Summoning Kingdom..."` with spinning sparkle.  
  *Impact:* Violates serious academic tone; feels like a fantasy browser game.  
  *Resolution:* Replace with `"Loading academic workspace..."`.
- **Issue 1.1.2 (`src/components/home/HomeDashboard.tsx`):** Banner states `"Your realm is flourishing and waiting for today's achievements"`.  
  *Impact:* Generic AI-generated motivational filler without concrete information.  
  *Resolution:* Display real metrics: `"4 of 6 tasks completed today • 1 assignment due in 2 days"`.
- **Issue 1.1.3 (`src/components/home/HomeDashboard.tsx`):** Button labels `"Inscribe Next Quest"`, `"All missions cleared today"`.  
  *Impact:* Confusing terminology for academic tasks and homework.  
  *Resolution:* Standardize to `"Add Task"` and `"All tasks completed for today"`.
- **Issue 1.1.4 (`src/lib/initialData.ts`):** User profile contains fantasy names (`Kaelen Swiftwind`, `avatar_arcane_knight`, `Novice Wayfarer`).  
  *Impact:* Misrepresents student profile.  
  *Resolution:* Replace with realistic student data (`Sukrut Dusane`, `Computer Science • Semester 3`).

### 1.2. Cognitive Clutter & Irrelevant Features
- **Issue 1.2.1 (`src/components/world/LivingWorldCard.tsx`):** Procedural kingdom canvas dominates the top third of the home dashboard.  
  *Impact:* Consumes vertical space that should display urgent deadlines and upcoming classes.  
  *Resolution:* Replace with a streamlined Academic Next-Action Card and Subject Mastery row.
- **Issue 1.2.2 (`src/components/arcade/`):** Dedicated Arcade tab with 2 mini-games (`QuestDefender`, `CrystalMaze`).  
  *Impact:* Gaming distraction completely antithetical to an academic focus tool.  
  *Resolution:* Remove Arcade tab from primary navigation; reallocate space to Academic Inbox and Coursework Directory.

### 1.3. Design Inconsistencies & Visual Polish
- **Issue 1.3.1 (Inconsistent Borders and Radii):** Cards mix `rounded-3xl`, `rounded-2xl`, and `rounded-xl` with variable border opacities (`border-purple-500/20`, `border-white/10`).  
  *Resolution:* Standardize on Matiks-inspired neo-brutalism: `rounded-2xl` for major cards, `rounded-xl` for interactive items, crisp `border border-zinc-800` (1.5px solid), deep `#09090B` background, and solid `#121216` card surfaces.
- **Issue 1.3.2 (Heavy Gradient Overlays):** Backgrounds feature dark purple/indigo gradients that reduce contrast and cause eye strain.  
  *Resolution:* Transition to flat, high-contrast dark surfaces with restrained functional color accents: Neon Lime (`#A3E635`) for actionable triggers, Academic Lavender (`#C084FC`) for course badges.
- **Issue 1.3.3 (Lack of Keyboard Accelerators):** No global command palette exists; power users must mouse-click through menus.  
  *Resolution:* Implement `Cmd/Ctrl + K` Global Command Palette with fuzzy search and keyboard shortcuts.

### 1.4. Empty States & Feedback Deficiencies
- **Issue 1.4.1 (Generic Empty States):** If no quests exist, a generic illustration is shown without actionable shortcuts.  
  *Resolution:* Provide thoughtful, contextual empty states (e.g., `"No tasks for today. Pick an item from your Academic Inbox or choose a template."`).
- **Issue 1.4.2 (Missing Workload Balance Feedback):** When a student schedules 8 hours of work into a 3-hour evening window, the app does not flag the scheduling conflict.  
  *Resolution:* Implement real-time Workload Balancer with color-coded daily capacity meters (`Light`, `Balanced`, `Overloaded`).

---

## 2. Accessibility Deficiencies (WCAG 2.1 AA)

- **Contrast Ratios:** Muted text (`text-zinc-500` on dark surfaces) in some modal footers drops below 4.5:1. Updated to `text-zinc-400` to guarantee $\ge 5.2:1$.
- **Focus Rings:** Ensure all interactive elements, modal inputs, and command palette items feature high-visibility outline rings (`focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none`).
- **Escape Key Handling:** Every modal and popover must dismiss on `Escape` keypress.


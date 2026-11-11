# Questly 2.0 Features Specification

## 1. Core Feature Catalog

### 1.1 Home Dashboard (`features/dashboard/`)
- **Purpose**: Central command center providing a high-impact daily overview of gamified productivity.
- **User-Facing Capabilities**:
  - Greeting header with uppercase greeting, user display name, and level badge ring.
  - Avatar shortcut directly launching Adventurer Profile and settings.
  - Matiks-style XP Pill indicator displaying total accumulated XP.
  - **Focus Squad Status Row** (`FocusSquadBar`): Live horizontal row featuring countdown to showdown duel and focus partner avatars with green online status dots.
  - **Today's Challenge Dual Banner** (`TodaysChallengeBanner`): Quick-start tiles for mental puzzles and deep focus blocks.
  - **Progression Card**: Current level, stage title, level progress bar, and next unlock preview.
  - **Daily Productivity Card**: Tasks completed ratio and flow state rating.
  - **Quick Actions Bar**: Fast shortcuts for New Quest, Deep Focus, Write Note, and Roadmaps.
  - **Compact Cadence Preview**: 14-week mini-heatmap leading into Insights.
  - **Active Missions List**: Immediate visibility into pending daily quests.

### 1.2 Quests & Missions (`features/quests/`)
- **Purpose**: Structured goal management broken down into gamified missions with rewards.
- **User-Facing Capabilities**:
  - Filter by category: Work, Health, Learning, Life.
  - Difficulty ratings: Easy (+50 XP), Medium (+100 XP), Hard (+200 XP), Epic (+350 XP).
  - Subtask milestone checklists with instant progress tracking.
  - One-tap "Start Focus" launcher linking the mission directly into a focus session.
  - Quest detail view with milestone checkoffs and XP claim button.
  - Full quest creation modal with validation and category selector.

### 1.3 Daily Tasks (`features/tasks/`)
- **Purpose**: Rapid micro-task execution and daily checklist management.
- **User-Facing Capabilities**:
  - Interactive checkbox toggles.
  - Real-time productivity score calculation.
  - Synchronized with Dashboard metrics.

### 1.4 Productivity Insights & Heatmap (`features/analytics/`)
- **Purpose**: Visual feedback loop tracking productivity intensity and consistency.
- **User-Facing Capabilities**:
  - **16-Week Activity Heatmap** (`QuestlyHeatmap`): GitHub-style contribution grid using 5 shades of electric lime.
  - Tap-to-inspect daily breakdown displaying date, completed tasks count, deep work minutes, and XP earned.
  - **Daily Completion Pattern Bar Chart** (`fl_chart`): Visual distribution of completed quests by day of the week.
  - High-impact KPI stat cards: Completion Rate, Focus Time, Daily Streak, XP Velocity.

### 1.5 Notebook & Knowledge Base (`features/notebook/`)
- **Purpose**: Lightweight personal knowledge management and rapid insight capture.
- **User-Facing Capabilities**:
  - Fast search filtering by title, markdown content, or tags.
  - Folder categorization: All Notes, Engineering, Learning & DSA, Ideas & Focus.
  - Pinning system ensuring important notes stay pinned at the top.
  - Rich Note Editor with real-time autosave.
  - Formatting toolbar: Markdown checklists (`- [ ] `), bullet points (`• `), tags (`#`), and code snippets.

### 1.6 Visual Roadmaps (`features/roadmaps/`)
- **Purpose**: Serpentine visual journeys turning long-term learning goals into milestone paths.
- **User-Facing Capabilities**:
  - **Serpentine Road Painter** (`RoadmapSerpentinePainter`): Custom Bézier curves connecting milestone nodes. Completed nodes glow with lime checkmarks; active nodes pulse in lavender.
  - Milestone detail cards with subtasks, XP rewards, and direct links to focus sessions and notes.
  - One-click starter templates: Full-Stack Modern Architect, DSA Mastery, Generative AI & Agent Architect, Intensive Academic Sprint.
  - Custom roadmap creator with dynamic stage builder.

### 1.7 Deep Focus Mode (`features/focus/`)
- **Purpose**: Distraction-free Pomodoro and deep work countdown timer.
- **User-Facing Capabilities**:
  - Modes: Pomodoro (25m), Deep Work (50m), Flow State (90m), Short Break (5m), Long Break (15m).
  - Minimalist circular timer with animated glowing lime progress arc.
  - Play, Pause, and Reset controls.
  - Completion dialog awarding XP directly to the adventurer profile.

### 1.8 RPG Skill Tree & Mastery (`features/gamification/`)
- **Purpose**: Skill progression system turning productivity habits into RPG character perks.
- **User-Facing Capabilities**:
  - 6 Mastery Branches: Focus Mastery, Consistency, Strategic Planning, Learning & Knowledge, Creative Spark, Swift Execution.
  - Perk progression bars and required level locks.
  - Exclusive cosmetic titles and badge rewards.

### 1.9 Mind Snap Arcade (`features/arcade/`)
- **Purpose**: Cognitive mini-games to break focus fatigue and sharpen mental agility.
- **User-Facing Capabilities**:
  - 4 categories: Math, Memory, Puzzle, Classical.
  - 15-second rapid multiplication/logic speed duel.
  - Score multipliers and bonus XP rewards.

### 1.10 Achievements & Trophies (`features/achievements/`)
- **Purpose**: Milestone trophy showcases celebrating longevity, focus sprints, and quest velocity.
- **User-Facing Capabilities**:
  - Categorized tabs: All, Focus, Streaks, Quests.
  - Tier badges: Bronze, Silver, Gold, Diamond, Legendary.
  - Detailed unlocking criteria and XP values.


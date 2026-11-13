# Questly 2.0 Streaks & 52-Week Activity Heatmap Engine

This document details the mechanics of Questly's activity tracking, timezone-aware streak calculations, and 52-week calendar heatmaps.

---

## 1. Streak Calculation Rules & Logic

1. **Timezone Sensitivity**:
   - All streaks are computed with respect to the user's localized timezone (`user_preferences.timezone`, defaulting to `UTC` or device local).
   - An activity occurring at `23:30` in `America/New_York` counts towards `America/New_York`'s calendar date, not UTC's next day.

2. **Daily Consistency Principle (One Day = One Increment)**:
   - Completing 1 quest or 20 quests on the same calendar day increments the streak **exactly once**.
   - Multiple completions increase daily intensity and total XP, but never artificially accelerate streak day count.

3. **Qualifying Activity Thresholds**:
   - A user's day qualifies for streak maintenance when any of the following occur:
     - At least 1 Quest or Habit completed.
     - At least 15 minutes logged in Focus Mode (Pomodoro).
     - At least 1 Milestone marked completed in Roadmaps.
     - At least 1 Mind Snap duel completed.

4. **Streak Freezes & Recovery**:
   - Users are allocated 2 complimentary **Streak Freezes** per month.
   - If a user misses exactly 1 day and has freezes remaining, the freeze is automatically consumed, preserving momentum without resetting to 0.
   - If a gap of $\ge 2$ unshielded days occurs, the streak resets to 1 upon the next qualifying activity.

---

## 2. Activity Heatmap Specification

The activity heatmap reflects a GitHub-style 52-week annual matrix (7 days $\times$ 52 weeks = 364 cells).

### 2.1 Category Intensity & Color Palette

| Category | Primary Color | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Academics & Study** | Cyber Blue | `#67B8FF` | Coursework, mathematics, lectures |
| **Programming** | Emerald Green | `#69D8A5` | DSA, system design, coding challenges |
| **Fitness & Health** | Neon Orange | `#FFB86B` | Workouts, running, gym sessions |
| **Reading & Literature** | Soft Lavender | `#B9A3FF` | Book chapters, articles, papers |
| **Personal Development** | Bubblegum Pink | `#FF8EAB` | Journaling, reflection, meditation |
| **General Productivity** | Electric Lime | `#B5FF55` | Daily tasks, housekeeping, errands |

### 2.2 Activity Intensity Levels

$$\text{Daily Intensity} = \min\left(4, \left\lfloor \frac{\text{Completed Actions} + \frac{\text{Focus Minutes}}{25}}{2} \right\rfloor\right)$$

* **Level 0**: Empty cell (`#1A1A1A` / deep charcoal).
* **Level 1**: Low activity (1 task or 15 mins focus).
* **Level 2**: Moderate activity (2-3 tasks or 30-50 mins focus).
* **Level 3**: High activity (4-5 tasks or 60-90 mins focus).
* **Level 4**: Peak mastery ($\ge 6$ tasks or $> 90$ mins focus).

# Matiks Visual & UI/UX Audit Specification

**Document Version:** 1.0.0  
**Phase:** Run 1 — Reference Analysis & Design System Extraction  
**Target:** Questly 2.0 Neo-Brutalist & Gamified Productivity UI/UX Overhaul  
**Primary References:** `https://matiks.com/`, iOS & Android App Store Listings, In-App Screenshot Analysis  

---

## 1. Executive Summary & Verification Methodology

Matiks positions itself as a competitive cognitive esports arena where mathematics, logic, and memory challenges are transformed into rapid-fire 1v1 duels and daily cognitive workouts.

To ensure total architectural rigor and intellectual honesty, this audit categorizes all observations into three distinct levels:
1. **Verified**: Directly supported by accessible store listings, public feature changelogs, and technical architecture analyses (e.g. 1v1 WebSocket matchmaking, daily puzzle challenges, streak shields, ELO rating graphs).
2. **Observed**: Confirmed through high-resolution screenshots of the mobile application and marketing landing page (e.g. electric lime `#B5FF55`, lavender `#B9A3FF`, deep charcoal `#101010`, split-banner layout, circular co-working status rings).
3. **Design Inference**: Engineering and design adaptations formulated specifically for Questly 2.0 to translate gaming-oriented interaction models into personal productivity and knowledge workflows.

---

## 2. Marketing Website Visual Inspection

### 2.1 Hero Section ("Turn Screen Time into Smart Time")
* **Layout**: Deep charcoal background (`#101010`) featuring a subtle geometric dot-grid matrix.
* **Typographic Hierarchy**:
  * Headline: Condensed, bold, high-impact sans-serif display font (similar to *Oswald* / *Barlow Condensed*) in pure white (`#FFFFFF`) with key keywords ("SMART TIME") emphasized in electric lime (`#B5FF55`).
  * Sub-headline: Geometric sans-serif (`Inter`) in neutral off-white (`#A0A0A0`).
* **Main CTA**:
  * High-contrast pill-shaped button with a crisp 1.5px solid electric lime border, deep background, and bold uppercase text: `DOWNLOAD NOW`.
  * Secondary CTA: Ghost button with muted border.
* **Product Showcase**: 3D device mockup floating centrally, showcasing a live 1v1 duel interface with a numeric keypad and goal target.

### 2.2 Feature Showcase ("Let's See What Your Brain Can Do")
* **Asymmetrical Bento Grid**:
  * Large electric lime container card (`#B5FF55`) with high-contrast black typography (`#000000`).
  * Dual pill CTAs: Black solid `DOWNLOAD APP` and transparent bordered `PLAY ON BROWSER`.
  * White square icon cards for Discord, X, Instagram, and YouTube.
  * Soft lavender bottom footer band (`#B9A3FF`) anchoring the screen.

---

## 3. Mobile Application UI/UX Analysis

### 3.1 Status & Presence Header
* **Top Bar Currency & Level**:
  * Coin balance pill with bright red `NEW` notification badge.
  * Flame icon with numeric streak day counter.
  * Hexagonal XP badge (`95 XP`).
  * Right-aligned circular speech bubble icon for challenges and inbox.

### 3.2 Showdown & Focus Squad Carousel
* **Showdown Ring**: Prominent golden circular badge displaying countdown timer: `SUMDAY SHOWDOWN STARTS IN 04:21 HRS`.
* **Co-Working / Duel Partners**: Horizontal sequence of circular user avatars with vibrant green active online presence dots (`#68D391`) and truncated gamer tags.

### 3.3 Today's Challenge Split Banner
* Dual high-contrast split cards with right chevrons (`‣`):
  * **PUZZLE**: Lavender display typography (`#B9A3FF`).
  * **MATH**: Bright tangerine orange display typography (`#FFA24C`).

### 3.4 Category Selection Grid ("Duels")
* 4 square selector tiles with 1px crisp borders and subtle rounded corners (14px):
  * **MATH**: Fast-forward icon `⏩`.
  * **MEMORY**: Brain icon `🧠` with active cyan/lime highlight border.
  * **PUZZLE**: Grid icon `⊞`.
  * **CLASSICAL**: Crown icon `👑`.

### 3.5 Game Duel Card ("Mind Snap Duels")
* **Pill Category**: Blue badge `MEMORY`.
* **Headline**: Bold condensed uppercase `MIND SNAP DUELS`.
* **Subtitle**: `WHO CAN SNAP FASTER?` with right navigation chevron `‣`.

### 3.6 Cross Math / Puzzle Grid
* Deep charcoal background.
* High-contrast square puzzle cells in lavender (`#B9A3FF`) with black numbers.
* Interactive bottom keypad with tactile tap feedback.

### 3.7 Persistent Bottom Navigation
* 5 primary destinations:
  1. **Arena**: Gamepad icon (active in electric lime `#B5FF55`).
  2. **Compete**: Trophy icon.
  3. **Quests**: Crown icon with counter badge (`0/3`).
  4. **Feed**: Bell notification icon.
  5. **More**: 4-square grid icon.

---

## 4. Reference-to-Questly Implementation Map

| Matiks Visual / UX Pattern | Questly 2.0 Productivity Adaptation | Implementation Location |
| :--- | :--- | :--- |
| **Sumday Showdown Ring** | **Showdown & Focus Squad Bar** (live co-working status with duel countdown) | `mobile/lib/features/dashboard/presentation/widgets/focus_squad_bar.dart` |
| **Today's Challenge Split Banner** | **Today's Challenge Dual Banner** (Puzzle Challenge ‣ / Deep Focus ‣) | `mobile/lib/features/dashboard/presentation/widgets/todays_challenge_banner.dart` |
| **Mind Snap Rapid Math Duel** | **Mind Snap Speed Challenge** (15s arithmetic & logic countdown for XP) | `mobile/lib/features/arcade/presentation/screens/arcade_screen.dart` |
| **Category Selector Tiles** | **Task & Habit Category Filters** (Academics, Coding, Fitness, Reading) | `mobile/lib/features/tasks/presentation/screens/tasks_screen.dart` |
| **ELO Rating Progression Graph** | **Productivity Cadence Line Chart** (Weekly/Monthly XP & Focus Minutes) | `mobile/lib/features/analytics/presentation/screens/analytics_screen.dart` |
| **Quests & Trophy Badges** | **Tiered Achievements & XP Claims** (Bronze, Silver, Gold, Diamond, Legendary) | `mobile/lib/features/achievements/presentation/screens/achievements_screen.dart` |
| **Pill & Bento Cards** | **Tactile Neo-Brutalist Reorderable Widgets** | `mobile/lib/features/dashboard/presentation/widgets/` |
| **Buddy Streak & Shields** | **Timezone-Aware Streak Engine** (with Freeze shields) | `mobile/lib/core/storage/` & Supabase RPC |
| **Distraction-Free Duel View** | **Focus Pomodoro Mode** (Clean circular timer, ambient audio, zero clutter) | `mobile/lib/features/focus/presentation/screens/focus_screen.dart` |


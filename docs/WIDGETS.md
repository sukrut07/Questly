# Questly 2.0 Dual Widget Ecosystem Specification

Questly 2.0 features two complementary widget layers:
1. **In-App Dashboard Widgets**: Highly interactive, reorderable, toggleable cards within the mobile app shell.
2. **Native Home-Screen Widgets**: Native OS widgets for Android (AppWidget) and iOS (WidgetKit).

---

## 1. In-App Dashboard Widgets

### 1.1 Architecture
* Managed via `DashboardWidgetConfig` and `WidgetRepository`.
* Stored in `LocalStorage` and synchronized to Supabase `user_widgets`.
* Configurable via the **Customize Dashboard** bottom sheet.

### 1.2 Available In-App Widgets

| Widget | Key | Default Visibility | Description |
| :--- | :--- | :---: | :--- |
| **Focus Squad Bar** | `focusSquad` | Visible | Co-working avatars with live presence dots & Showdown timer. |
| **Today's Challenge** | `todaysChallenge` | Visible | Split-card dual challenges (Puzzle & Focus) with navigation. |
| **Progression Card** | `progression` | Visible | Current level, next level XP progress bar, and streak counter. |
| **Quick Actions Bar** | `quickActions` | Visible | One-tap launchers for Quests, Focus Mode, Notes, and Roadmaps. |
| **Productivity Score** | `dailyProductivity` | Visible | Daily completion breakdown and productivity efficiency metric. |
| **Activity Heatmap** | `activityHeatmap` | Visible | 14-week preview cadence leading directly to 52-week Insights. |
| **Active Quests** | `activeQuests` | Visible | List of today's pending daily quests with subtask checklists. |

---

## 2. Native Android AppWidget

### 2.1 Implementation Details
* **Provider**: `com.questly.mobile.QuestlyWidgetProvider` (subclass of `AppWidgetProvider`).
* **Layout**: `mobile/android/app/src/main/res/layout/questly_widget_layout.xml`.
* **Metadata**: `mobile/android/app/src/main/res/xml/questly_widget_info.xml`.
* **Update Interval**: `updatePeriodMillis="1800000"` (30 minutes, respecting Android battery optimization).
* **Data Bridge**: Reads cached keys (`flutter.cached_widget_streak`, `flutter.cached_widget_completed`) written by Flutter `SharedPreferences`.
* **Deep Linking**: Tapping launches `MainActivity` with deep link `questly://dashboard`.

---

## 3. Native iOS WidgetKit

### 3.1 Implementation Details
* **Source**: `mobile/ios/Runner/QuestlyWidget/QuestlyWidget.swift`.
* **Frameworks**: SwiftUI + WidgetKit.
* **Supported Families**: `.systemSmall`, `.systemMedium`.
* **Timeline Policy**: Updates `.after(nextUpdate)` scheduled every 30 minutes, adhering to iOS battery and reload budgets.
* **Data Sharing**: Shared via Apple App Groups (`group.com.questly.app`) via `UserDefaults(suiteName:)`.
* **URL Scheme**: Emits `questly://dashboard` to restore the active dashboard view.

---

## 4. Operating System Constraints & Best Practices

> [!NOTE]
> Both Android and iOS impose system-enforced limits on background widget reload frequencies to preserve device battery life:
> - **Android**: Enforces a minimum update period of 30 minutes for standard remote updates.
> - **iOS**: Allocates a daily budget (typically 40-70 timeline reloads per 24-hour cycle).
> Real-time streaming is neither expected nor permitted by the operating system for home-screen widgets. Updates are pushed whenever the parent Flutter application completes a qualifying quest or focus session.

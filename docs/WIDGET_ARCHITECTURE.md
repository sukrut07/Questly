# Questly 2.0 — Native Home-Screen Widget Architecture

**Document Version:** 2.0.0  
**Status:** Approved Architectural Specification  
**Target Platforms:** Android 12+ (AppWidgetProvider / RemoteViews) & iOS 16+ (WidgetKit / SwiftUI)  
**Flutter Bridge:** `home_widget` plugin with shared sandbox storage

---

## 1. Architectural Strategy: Push-Based Local Snapshots

Both Apple (iOS WidgetKit) and Google (Android AppWidget) impose strict power-saving limits on background execution and direct networking for home-screen widgets:
- **iOS:** Enforces a timeline reload budget (~40 to 70 reloads per 24 hours, or roughly once every 15–30 minutes). Network calls inside widget extensions are strictly throttled.
- **Android:** Limits `updatePeriodMillis` to a minimum of 1,800,000 ms (30 minutes) and aggressively freezes background processes.

### 1.1. The Zero-Network Sandbox Architecture
Questly solves this by treating widgets purely as **reactive presentation viewports** displaying an offline, pre-rendered snapshot:

```mermaid
flowchart TD
    subgraph FlutterApp ["Flutter Mobile Application (Host)"]
        Event["Academic Action (Task complete, XP earn, Session start)"]
        Store["Local State / Offline Sync Queue"]
        Serializer["WidgetDataSerializer"]
        
        Event --> Store
        Store --> Serializer
    end
    
    subgraph SharedStorage ["OS App Group Sandbox"]
        SharedPrefs["Android: EncryptedSharedPreferences"]
        UserDefaults["iOS: UserDefaults (group.com.questly.app)"]
    end
    
    subgraph NativeWidgets ["Native Platform Widgets"]
        AndroidRemoteViews["Android AppWidgetProvider (RemoteViews)"]
        SwiftUITimeline["iOS WidgetKit (TimelineProvider)"]
    end
    
    Serializer -->|Writes JSON| SharedPrefs
    Serializer -->|Writes JSON| UserDefaults
    Serializer -->|HomeWidget.updateWidget()| AndroidRemoteViews
    Serializer -->|HomeWidget.updateWidget()| SwiftUITimeline
```

1. **Zero Direct Network Requests in Widget Extensions:** The native widget code never contacts Supabase directly. It reads instantaneous snapshots from local shared storage.
2. **Event-Driven Instant Updates:** Whenever a user completes a task, records study time, or logs an exam in Flutter, the app immediately writes the updated JSON snapshot and triggers an OS widget reload.
3. **Midnight Rollover:** A scheduled OS timeline event advances the date and recalculates streak/timetable states at `00:00:00` without requiring an app launch.

---

## 2. Widget Suite Specifications

Questly 2.0 provides six distinct home-screen widgets supporting Small, Medium, and Large form factors.

### 2.1. Widget 1: Today's Academic Tasks (`Medium` & `Large`)
*Primary everyday driver for students.*
- **Header:** Date, completed tasks count (e.g. `4/6 Done`), and daily completion progress bar in Neon Lime (`#A3E635`).
- **Body:** Displays the top 3 (Medium) or 5 (Large) priority academic tasks for today.
- **Item Row:**
  - Subject pill with custom color dot (e.g., `CS204` in Cyan, `MATH101` in Lavender).
  - Task title with strikethrough if completed.
  - Due time indicator or urgency tag (`Urgent`, `Today`).
- **Interactive Tap:** Tapping an item opens the task details directly via deep-link `questly://tasks/{task_id}`.

### 2.2. Widget 2: XP, Academic Rank & Streak (`Small`)
*Matiks-inspired motivational trophy card.*
- **Centerpiece:** Hexagonal Rank Badge featuring the user's Academic Rank (e.g., `Scholar Tier III`, `Specialist`).
- **Metrics:**
  - Level number in bold neo-brutalist typography (`LVL 14`).
  - Total XP and progress ring to next level (`850 / 1200 XP`).
  - Flame icon with active streak count (`🔥 18 Days`).
  - Snowflake icons denoting available streak freeze tokens (`❄️ 2`).

### 2.3. Widget 3: Timetable & Next Class (`Small` & `Medium`)
*Reduces late arrivals and schedule friction.*
- **Current / Next Indicator:** "Next Class in 25 min".
- **Details:**
  - Subject Name & Code: `Operating Systems (CS-301)`.
  - Room / Location: `Lecture Hall B, Room 204`.
  - Time Slot: `10:30 AM - 12:00 PM`.
  - Instructor: `Prof. Dusane`.
- **Empty State:** "No more classes today! Time for deep revision."

### 2.4. Widget 4: Academic Deadline Countdown (`Medium`)
*Urgency widget for major evaluations.*
- **Target:** Closest upcoming `assignment` or `examination`.
- **Countdown Display:** Large prominent digital readout (e.g., `03d : 14h : 20m`).
- **Context:**
  - Evaluation type badge: `MIDTERM EXAM` or `PROJECT SUBMISSION`.
  - Weightage indicator: `Weight: 35% of Final GPA`.
  - Syllabus coverage meter for the tested topics.

### 2.5. Widget 5: Deep Focus Quick-Start (`Small`)
*One-tap focus launcher.*
- **Design:** Dark neo-brutalist card with glowing circular start trigger.
- **Action:** 1-tap deep-link `questly://focus/start?subject_id={current_subject}`.
- **Information:** Shows today's completed focus minutes (e.g. `75m Focused today`) and current active streak.

### 2.6. Widget 6: Academic Activity Heatmap (`Medium`)
*Weekly GitHub/Matiks-style visual consistency grid.*
- **Display:** 7-column grid representing Monday through Sunday.
- **Cells:** Color-intensity cells shaded from dark slate (`#18181B`) to intense neon lime (`#A3E635`) based on verified study minutes.
- **Footer:** Total study hours this week (e.g. `24.5 hrs this week · Top 5%`).

---

## 3. Data Schema: Snapshot JSON Contracts

All widgets consume data serialized into structured JSON keys stored in shared preferences / user defaults.

### 3.1. Master Snapshot Key: `questly_academic_snapshot`

```json
{
  "updated_at": "2026-11-13T17:15:00Z",
  "user": {
    "display_name": "Sukrut",
    "level": 14,
    "academic_rank": "Practitioner",
    "rank_color_hex": "#38BDF8",
    "total_xp": 3450,
    "current_level_xp": 450,
    "next_level_xp": 800,
    "level_progress_percentage": 56.2,
    "streak_days": 18,
    "freeze_tokens": 2
  },
  "today_summary": {
    "tasks_completed": 4,
    "tasks_total": 6,
    "study_minutes_today": 125,
    "focus_sessions_today": 5
  },
  "next_class": {
    "subject_name": "Operating Systems",
    "subject_code": "CS-301",
    "subject_color_hex": "#A3E635",
    "room_location": "Lecture Hall B",
    "start_time": "10:30:00",
    "end_time": "12:00:00",
    "minutes_until_start": 25
  },
  "nearest_deadline": {
    "id": "e4c5b367-1234-4567-89ab-cdef01234567",
    "title": "Algorithms Problem Set 4",
    "type": "assignment",
    "subject_code": "CS-204",
    "subject_color_hex": "#C084FC",
    "deadline_iso": "2026-11-15T23:59:00Z",
    "days_remaining": 2,
    "weightage_percentage": 10.0
  },
  "tasks": [
    {
      "id": "task-001",
      "title": "Implement Red-Black Tree Rotation",
      "subject_code": "CS-204",
      "subject_color_hex": "#C084FC",
      "is_completed": false,
      "priority": "high",
      "due_time": "18:00"
    },
    {
      "id": "task-002",
      "title": "Read Chapter 4: Memory Virtualization",
      "subject_code": "CS-301",
      "subject_color_hex": "#A3E635",
      "is_completed": true,
      "priority": "medium",
      "due_time": "14:00"
    }
  ],
  "weekly_heatmap": [
    {"day": "Mon", "intensity": 3, "minutes": 150},
    {"day": "Tue", "intensity": 4, "minutes": 210},
    {"day": "Wed", "intensity": 2, "minutes": 90},
    {"day": "Thu", "intensity": 4, "minutes": 180},
    {"day": "Fri", "intensity": 3, "minutes": 140},
    {"day": "Sat", "intensity": 1, "minutes": 45},
    {"day": "Sun", "intensity": 0, "minutes": 0}
  ]
}
```

---

## 4. Platform Implementation Details

### 4.1. Android (`mobile/android/app/src/main/kotlin/com/questly/mobile/`)
- **Widget Provider:** `QuestlyWidgetProvider.kt` extending `AppWidgetProvider`.
- **Layouts:**
  - `res/layout/widget_academic_tasks_medium.xml`
  - `res/layout/widget_xp_rank_small.xml`
  - `res/layout/widget_timetable_small.xml`
- **Data Retrieval:**
  ```kotlin
  val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
  val snapshotJson = prefs.getString("flutter.questly_academic_snapshot", null)
  ```
- **Click Handling:** `PendingIntent.getActivity()` with custom URI schemes (`questly://...`).

### 4.2. iOS (`mobile/ios/Runner/QuestlyWidget/`)
- **Widget Bundle:** `QuestlyWidgetBundle.swift` containing `TodayTasksWidget`, `RankStreakWidget`, `TimetableWidget`.
- **TimelineProvider:** Reads from App Group container:
  ```swift
  let sharedDefaults = UserDefaults(suiteName: "group.com.questly.app")
  let rawJson = sharedDefaults?.string(forKey: "questly_academic_snapshot")
  ```
- **Timeline Policy:**
  ```swift
  let nextMidnight = Calendar.current.startOfDay(for: Date()).addingTimeInterval(86400)
  let timeline = Timeline(entries: [entry], policy: .after(nextMidnight))
  ```

---

## 5. Failure & Edge Case Handling

1. **User Signed Out:** Widget displays clean empty state: *"Sign in to Questly to view your academic dashboard"*. No sensitive academic data is retained in shared storage upon sign-out.
2. **First Run / Fresh Install:** Widget displays *"Tap to set up your semester and courses in Questly"*.
3. **App in Background During Midnight:** Android `WorkManager` and iOS `BGAppRefreshTask` execute once daily to update timetable offsets and streak indicators without demanding user interaction.

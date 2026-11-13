# Questly 2.0 Contextual Permissions & Privacy Manual

Questly adheres to a **contextual, strictly opt-in** permissions philosophy.

---

## 1. Principles of Permission Design

1. **Zero Blanket Onboarding Requests**:
   - The application **never** requests system permissions upon initial launch or during onboarding.
   - Users can explore quests, write markdown notes, run Pomodoro sessions, and track roadmaps without granting any system permissions.

2. **Just-in-Time Contextual Rationale**:
   - When a user taps a feature requiring system access (e.g., toggling a daily reminder or attaching a photo to a note), a pre-permission explanatory dialog is presented first.
   - The dialog transparently communicates:
     - **Why access is needed**.
     - **What specific data or hardware is accessed**.
     - **Why access is optional**.
     - **The exact consequence if denied**.

3. **Graceful Denial Handling**:
   - If the user selects "Not Now", the app respects the decision without blocking usage.
   - If permanently denied, the settings screen provides instructions to re-enable access directly in Android App Settings or iOS Settings if desired.

---

## 2. Permission Catalog

| Permission | Category | Trigger Event | Optionality | Fallback Behaviour |
| :--- | :--- | :--- | :---: | :--- |
| **Notifications** | Alerts | User enables daily quest reminder or streak warning in Settings. | **Optional** | Reminders will not fire; in-app indicators remain functional. |
| **Exact Alarms** | System | User starts a timed deep-work Pomodoro session. | **Optional** | Timer continues; chime may be delayed by device low-power sleep. |
| **Camera** | Media | User taps "Scan Document / Whiteboard" in Notebook. | **Optional** | User manually types markdown note or selects existing file. |
| **Photo Library** | Media | User taps "Attach Image" in Notebook. | **Optional** | Notes remain formatted text and code blocks. |
| **Health & Fitness** | Health Connect / HealthKit | User opts into automatic workout activity synchronization. | **Optional** | User manually logs fitness quests by tapping the checkmark. |

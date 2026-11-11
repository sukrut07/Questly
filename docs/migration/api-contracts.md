# Questly 2.0 API Contracts & Backend Specification

## 1. Backend Integration Context

### Audit Finding
In the original repository:
- **Android Kotlin App**: Stored all user profiles, quests, focus sessions, and achievements locally using Android **Room SQLite Database** and **Preferences DataStore**.
- **Next.js Web App**: Stored application state inside browser `localStorage` via client-side React Context (`src/lib/store.tsx`).

Neither existing system relied on an active remote backend server. 

To prepare Questly 2.0 for future multi-device cloud synchronization, the mobile client establishes a formal, production-grade **REST API Contract** implemented through `Dio`, `ApiClient`, and `ApiInterceptor`.

---

## 2. Global Request & Response Standards

### Base URLs
- **Development**: `http://10.0.2.2:3000/api` (Android emulator localhost bridge) or `http://localhost:3000/api` (iOS simulator)
- **Staging**: `https://staging-api.questly.app/api`
- **Production**: `https://api.questly.app/api`

### Headers
```http
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
Accept: application/json
```

### Standard Error Response Format
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed: Quest title cannot be blank.",
  "timestamp": "2026-11-11T08:30:00.000Z"
}
```

---

## 3. Endpoint Specifications

### A. Authentication
- `POST /auth/login`
  - **Body**: `{ "email": "explorer@questly.app", "password": "password123" }`
  - **Response**: `{ "accessToken": "jwt...", "refreshToken": "jwt...", "user": { ... } }`
- `POST /auth/register`
  - **Body**: `{ "email": "...", "password": "...", "displayName": "..." }`
- `POST /auth/refresh`
  - **Body**: `{ "refreshToken": "..." }`

### B. User Profile & Progression
- `GET /user/profile`
  - **Response**:
    ```json
    {
      "id": "usr_99182",
      "displayName": "Quest Explorer",
      "avatarId": "avatar_mage",
      "level": 3,
      "totalXp": 620,
      "currentStage": "BUILDER",
      "title": "The Consistent Builder",
      "createdAt": "2026-10-28T12:00:00.000Z"
    }
    ```
- `GET /progression/streak`
  - **Response**:
    ```json
    {
      "currentStreak": 5,
      "longestStreak": 8,
      "lastActiveDate": "2026-11-10",
      "activeDaysCount": 12,
      "isProtectedToday": false,
      "freezesRemaining": 1,
      "worldStage": 3,
      "presentationMode": "flourishing"
    }
    ```

### C. Quests
- `GET /quests`
  - **Query Params**: `?status=inProgress&category=coding`
  - **Response**: Array of `Quest` objects.
- `POST /quests`
  - **Body**:
    ```json
    {
      "title": "Master Clean Architecture",
      "description": "Port repository layer and clean entities to Dart.",
      "category": "CODING",
      "difficulty": "EPIC",
      "priority": "HIGH",
      "estimatedMinutes": 60,
      "subtasks": [
        { "title": "Define interfaces", "isCompleted": true },
        { "title": "Implement mock adapter", "isCompleted": false }
      ]
    }
    ```
  - **Response**: Created `Quest` with assigned `id` and `xpReward`.
- `POST /quests/{id}/complete`
  - **Response**: `{ "quest": { ... }, "xpAwarded": 100, "levelUp": false }`
- `PATCH /quests/{id}/subtasks/{subtaskId}`
  - **Body**: `{ "isCompleted": true }`

### D. Analytics & Focus Sessions
- `GET /analytics/summary`
  - **Response**:
    ```json
    {
      "productivityScore": 84,
      "totalQuestsCompleted": 18,
      "totalXpEarned": 1420,
      "focusMinutesTotal": 340,
      "weeklyActivityDays": [true, true, true, true, true, false, false]
    }
    ```
- `POST /focus/sessions`
  - **Body**: `{ "questId": "quest_1", "durationMinutes": 45, "notes": "Deep work sprint" }`
  - **Response**: `{ "sessionId": "foc_123", "xpEarned": 40 }`

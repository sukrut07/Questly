# Questly 2.0 API & Data Contracts Specification

All HTTP / REST interactions conform to standard PostgREST conventions provided by Supabase.

---

## 1. Authentication Endpoints

* **POST `/auth/v1/signup`**: Email / Password registration or OAuth provider.
* **POST `/auth/v1/token?grant_type=password`**: User login, returning JWT access and refresh tokens.
* **POST `/auth/v1/logout`**: Invalidate session.

---

## 2. Activity & XP RPC

### POST `/rest/v1/rpc/record_activity_and_award_xp`
Executes server-validated activity creation, atomic XP ledger insertion, level calculation, and streak recalculation in a single PostgreSQL transaction.

#### Request Headers
```http
Authorization: Bearer <user-jwt>
apikey: <supabase-anon-key>
Content-Type: application/json
```

#### Request Body
```json
{
  "p_user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "p_activity_type": "quest",
  "p_category": "programming",
  "p_title": "Solve 3 Dynamic Programming problems",
  "p_activity_date": "2026-11-13",
  "p_xp_earned": 50,
  "p_duration_minutes": 45,
  "p_metadata": {
    "difficulty": "hard",
    "quest_id": "quest-123"
  },
  "p_idempotency_key": "evt_9b1deb4d_20261113_001"
}
```

#### Response (`200 OK`)
```json
{
  "status": "success",
  "activity_id": "c3e981df-7b89-4b62-9571-0819a7e0892b",
  "total_xp": 1450,
  "level": 4
}
```

---

## 3. Goals & Nested Checklists

* **GET `/rest/v1/goals?select=*,goal_subtasks(*)`**: Retrieve goals with nested subtasks.
* **POST `/rest/v1/goals`**: Create new goal.
* **PATCH `/rest/v1/goals?id=eq.<goal-id>`**: Update goal attributes.
* **POST `/rest/v1/goal_subtasks`**: Add subtask to checklist.
* **PATCH `/rest/v1/goal_subtasks?id=eq.<subtask-id>`**: Toggle checklist item.

---

## 4. Notes & Knowledge Base

* **GET `/rest/v1/notes?select=*,note_folders(*)`**: Retrieve user notes with folder metadata.
* **POST `/rest/v1/notes`**: Create markdown note.
* **PATCH `/rest/v1/notes?id=eq.<note-id>`**: Update note title, content, or tags.
* **POST `/rest/v1/note_versions`**: Store snapshot version.

---

## 5. Streaks & Heatmap

* **GET `/rest/v1/streaks?select=*`**: Get current and longest streak with freezes.
* **GET `/rest/v1/daily_summaries?summary_date=gte.<start_date>&summary_date=lte.<end_date>`**: Retrieve 52-week activity calendar breakdown.


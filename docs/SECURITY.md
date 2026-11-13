# Questly 2.0 Security & Data Protection Architecture

This document outlines the security controls, credential hygiene, and authorization boundaries enforced across Questly 2.0.

---

## 1. Credential Segregation & Hygiene

### 1.1 Strict Service-Role Isolation
* **Publishable Anonymous Key (`anon_key`)**:
  * Safe to include in web and mobile client code.
  * Grants zero administrative access to database tables.
  * Every request made via the anonymous key is strictly filtered through PostgreSQL **Row Level Security (RLS)**.
* **Service Role Key (`service_role_key`)**:
  * **Strictly forbidden** in mobile application packages (`.apk`, `.aab`, `.ipa`) and client-side JavaScript bundles.
  * Accessible only within secure server environments (e.g. Supabase Edge Functions or backend CI secrets).

---

## 2. PostgreSQL Row Level Security (RLS) Policies

All 24 database tables have RLS explicitly enabled:
```sql
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
```

Policies verify user identity against the cryptographically signed JWT:
```sql
CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);
```

### Unauthorized Cross-User Access Mitigation
If an attacker attempts to read or mutate another user's goal by tampering with the ID (`/rest/v1/goals?user_id=eq.<other_uuid>`), PostgreSQL evaluates `auth.uid() = user_id` to `FALSE` and returns an empty dataset (`200 OK []`) or permission denied (`403 Forbidden`).

---

## 3. Auditable XP Ledger & Tamper Prevention

1. **Client-Side XP Disregard**:
   - The client never directly overwrites `profiles.total_xp` or `profiles.level`.
   - XP is calculated exclusively by the server-side trusted function `public.record_activity_and_award_xp()`.

2. **Idempotency Keys**:
   - Every completed activity requires a UUID v4 idempotency key.
   - Retrying network requests under bad connectivity will never generate duplicate XP records.


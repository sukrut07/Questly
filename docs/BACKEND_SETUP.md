# Questly 2.0 Supabase Backend Setup & Configuration Guide

This guide details the procedure for deploying and running the shared Supabase backend that powers both the Flutter mobile client and the Next.js web application.

---

## 1. Prerequisites

- **Supabase Account** ([supabase.com](https://supabase.com)) or **Supabase CLI** for local development.
- **Docker** (only if running Supabase locally via the CLI).

---

## 2. Local Development with Supabase CLI

1. **Install Supabase CLI**:
   ```bash
   # macOS via Homebrew
   brew install supabase/tap/supabase

   # npm alternative
   npm install -g supabase
   ```

2. **Initialize & Start Local Stack**:
   ```bash
   # From repository root
   supabase start
   ```
   This command starts the local PostgreSQL database, PostgREST API, Auth service, and Supabase Studio dashboard (default: `http://localhost:54323`).

3. **Apply Database Migrations & Seed Data**:
   ```bash
   # Runs all migrations in supabase/migrations/
   supabase db reset
   ```
   This automatically applies `supabase/migrations/20261113000000_questly_initial_schema.sql` and loads `supabase/seed.sql`.

---

## 3. Cloud Deployment (Supabase Hosted)

1. **Create a New Supabase Project**:
   - Log in to the [Supabase Dashboard](https://app.supabase.com).
   - Click **New project**, choose an organization, set a project name (`Questly Production`), and generate a strong database password.

2. **Link Local Repository to Cloud Project**:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Push Schema Migrations**:
   ```bash
   supabase db push
   ```

4. **Retrieve API Credentials**:
   - In Supabase Studio, navigate to **Project Settings > API**.
   - Copy **Project URL** and **anon / public key**.
   - Add these to `.env.local` for the web app and pass them via `--dart-define` for the mobile app.

---

## 4. Client Environment Variables

### Web App (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Mobile App (Flutter)
Pass via `--dart-define` or build configuration:
```bash
flutter run \
  --dart-define=SUPABASE_URL=https://your-project-id.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGciOi...
```

> [!CAUTION]
> **Never commit or expose `SUPABASE_SERVICE_ROLE_KEY` to client apps.** Only the publishable `anon` key is permitted in browser or mobile bundles. All database operations are secured via Row Level Security (RLS).

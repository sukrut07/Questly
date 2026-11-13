-- Questly 2.0 Initial Database Schema & Security Policies
-- Designed for PostgreSQL 15+ / Supabase

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Utility functions for automated timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Adventurer',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
  total_xp BIGINT NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile trigger on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', 'Adventurer'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. USER_PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  accent_color TEXT NOT NULL DEFAULT 'lime' CHECK (accent_color IN ('lime', 'lavender', 'blue', 'orange', 'custom')),
  density TEXT NOT NULL DEFAULT 'comfortable' CHECK (density IN ('compact', 'comfortable')),
  typography TEXT NOT NULL DEFAULT 'default' CHECK (typography IN ('default', 'modern', 'condensed')),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  week_start TEXT NOT NULL DEFAULT 'monday' CHECK (week_start IN ('monday', 'sunday')),
  date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
  reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. GOALS & NESTED CHECKLISTS
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT 'target',
  color TEXT DEFAULT '#B5FF55',
  start_date DATE,
  deadline DATE,
  priority INT NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic')),
  recurrence TEXT NOT NULL DEFAULT 'once' CHECK (recurrence IN ('once', 'daily', 'weekly', 'monthly', 'custom')),
  target_count INT NOT NULL DEFAULT 1,
  current_count INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  xp_reward INT NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  linked_roadmap_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_category ON public.goals(category);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed ON public.goals(is_completed);

CREATE TRIGGER set_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.goal_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goal_subtasks_goal_id ON public.goal_subtasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_subtasks_user_id ON public.goal_subtasks(user_id);

-- 6. HABITS & COMPLETIONS
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  recurrence TEXT NOT NULL DEFAULT 'daily' CHECK (recurrence IN ('daily', 'weekly', 'weekdays', 'custom')),
  target_days TEXT[] DEFAULT ARRAY['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  reminder_time TEXT,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  xp_per_completion INT NOT NULL DEFAULT 15 CHECK (xp_per_completion >= 0),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);

CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  notes TEXT,
  xp_awarded INT NOT NULL DEFAULT 15,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON public.habit_completions(user_id, completion_date);

-- 7. QUESTS & COMPLETIONS
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic')),
  xp_reward INT NOT NULL DEFAULT 25 CHECK (xp_reward >= 0),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  recurrence TEXT NOT NULL DEFAULT 'daily' CHECK (recurrence IN ('once', 'daily', 'weekly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_user_id ON public.quests(user_id);

CREATE TABLE IF NOT EXISTS public.quest_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  xp_awarded INT NOT NULL DEFAULT 25,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(quest_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_quest_completions_user_date ON public.quest_completions(user_id, completed_date);

-- 8. ACTIVITY_LOGS & DAILY_SUMMARIES
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'quest', 'habit', 'goal', 'focus', 'arcade', 'study'
  category TEXT NOT NULL,       -- 'academics', 'programming', 'fitness', 'reading', 'personal', 'wellness'
  title TEXT NOT NULL,
  activity_date DATE NOT NULL,
  xp_earned INT NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  duration_minutes INT NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON public.activity_logs(category);

CREATE TABLE IF NOT EXISTS public.daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_xp INT NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  activities_count INT NOT NULL DEFAULT 0 CHECK (activities_count >= 0),
  focus_minutes INT NOT NULL DEFAULT 0 CHECK (focus_minutes >= 0),
  categories_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON public.daily_summaries(user_id, summary_date);

-- 9. STREAKS
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  freezes_remaining INT NOT NULL DEFAULT 2 CHECK (freezes_remaining >= 0),
  recovery_days_used INT NOT NULL DEFAULT 0 CHECK (recovery_days_used >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PERSONAL NOTEBOOK & KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS public.note_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.note_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#B5FF55',
  icon TEXT DEFAULT 'folder',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_folders_user_id ON public.note_folders(user_id);

CREATE TABLE IF NOT EXISTS public.note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#B9A3FF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.note_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT NOT NULL DEFAULT '',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  linked_goal_ids UUID[] NOT NULL DEFAULT '{}',
  linked_roadmap_ids UUID[] NOT NULL DEFAULT '{}',
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON public.notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON public.notes(is_pinned);

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.note_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version INT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_versions_note_id ON public.note_versions(note_id);

-- 11. ROADMAPS & MILESTONES
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'learning',
  total_stages INT NOT NULL DEFAULT 0,
  completed_stages INT NOT NULL DEFAULT 0,
  is_template BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);

CREATE TABLE IF NOT EXISTS public.roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  stage_order INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  xp_reward INT NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_roadmap_id ON public.roadmap_milestones(roadmap_id);

-- 12. FOCUS SESSIONS
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  session_type TEXT NOT NULL DEFAULT 'pomodoro' CHECK (session_type IN ('pomodoro', 'deep_work', 'custom')),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp_awarded INT NOT NULL DEFAULT 20 CHECK (xp_awarded >= 0),
  notes TEXT,
  idempotency_key TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);

-- 13. ACHIEVEMENTS & UNLOCKS
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond', 'legendary')),
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INT NOT NULL DEFAULT 100 CHECK (xp_reward >= 0),
  requirement_type TEXT NOT NULL, -- 'streak_days', 'quests_completed', 'focus_hours', etc.
  requirement_threshold INT NOT NULL CHECK (requirement_threshold > 0),
  is_secret BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp_claimed BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- 14. AUDITABLE XP TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL CHECK (amount > 0),
  source_type TEXT NOT NULL, -- 'quest', 'habit', 'goal', 'focus', 'achievement', 'streak'
  source_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);

-- 15. USER WIDGETS CONFIGURATION
CREATE TABLE IF NOT EXISTS public.user_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  widget_size TEXT NOT NULL DEFAULT 'medium' CHECK (widget_size IN ('small', 'medium', 'large')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, widget_type)
);

CREATE INDEX IF NOT EXISTS idx_user_widgets_user_id ON public.user_widgets(user_id);

-- 16. NOTIFICATIONS & DEVICE TOKENS
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_time TEXT NOT NULL DEFAULT '09:00',
  streak_warning BOOLEAN NOT NULL DEFAULT TRUE,
  achievement_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  email_digest BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  token TEXT NOT NULL,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON public.device_tokens(user_id);

-- ============================================================================
-- 17. SERVER-SIDE TRUSTED FUNCTIONS
-- ============================================================================

-- A. Idempotent Activity Recording and XP Ledger Function
CREATE OR REPLACE FUNCTION public.record_activity_and_award_xp(
  p_user_id UUID,
  p_activity_type TEXT,
  p_category TEXT,
  p_title TEXT,
  p_activity_date DATE,
  p_xp_earned INT,
  p_duration_minutes INT,
  p_metadata JSONB,
  p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_inserted_id UUID;
  v_new_total_xp BIGINT;
  v_new_level INT;
BEGIN
  -- Validate authenticated user ownership
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Access denied: Cannot record activity for another user';
  END IF;

  -- Insert activity log (idempotent via unique constraint)
  INSERT INTO public.activity_logs (
    user_id, activity_type, category, title, activity_date,
    xp_earned, duration_minutes, metadata, idempotency_key
  )
  VALUES (
    p_user_id, p_activity_type, p_category, p_title, p_activity_date,
    p_xp_earned, p_duration_minutes, p_metadata, p_idempotency_key
  )
  ON CONFLICT (user_id, idempotency_key) DO NOTHING
  RETURNING id INTO v_inserted_id;

  -- If activity was already recorded, return existing status without re-awarding XP
  IF v_inserted_id IS NULL THEN
    SELECT total_xp, level INTO v_new_total_xp, v_new_level FROM public.profiles WHERE id = p_user_id;
    RETURN jsonb_build_object(
      'status', 'duplicate_ignored',
      'user_id', p_user_id,
      'total_xp', v_new_total_xp,
      'level', v_new_level
    );
  END IF;

  -- Record atomic XP transaction if XP was earned
  IF p_xp_earned > 0 THEN
    INSERT INTO public.xp_transactions (
      user_id, amount, source_type, source_id, idempotency_key
    )
    VALUES (
      p_user_id, p_xp_earned, p_activity_type, v_inserted_id::TEXT, 'xp_' || p_idempotency_key
    )
    ON CONFLICT (idempotency_key) DO NOTHING;

    -- Update total XP and calculate level: Level = FLOOR(SQRT(total_xp / 100)) + 1
    UPDATE public.profiles
    SET
      total_xp = total_xp + p_xp_earned,
      level = GREATEST(1, FLOOR(SQRT((total_xp + p_xp_earned) / 100))::INT + 1)
    WHERE id = p_user_id
    RETURNING total_xp, level INTO v_new_total_xp, v_new_level;
  ELSE
    SELECT total_xp, level INTO v_new_total_xp, v_new_level FROM public.profiles WHERE id = p_user_id;
  END IF;

  -- Update or insert daily summary
  INSERT INTO public.daily_summaries (
    user_id, summary_date, total_xp, activities_count, focus_minutes, categories_breakdown
  )
  VALUES (
    p_user_id, p_activity_date, p_xp_earned, 1, p_duration_minutes,
    jsonb_build_object(p_category, p_xp_earned)
  )
  ON CONFLICT (user_id, summary_date) DO UPDATE
  SET
    total_xp = public.daily_summaries.total_xp + EXCLUDED.total_xp,
    activities_count = public.daily_summaries.activities_count + 1,
    focus_minutes = public.daily_summaries.focus_minutes + EXCLUDED.focus_minutes,
    categories_breakdown = public.daily_summaries.categories_breakdown ||
      jsonb_build_object(
        p_category,
        COALESCE((public.daily_summaries.categories_breakdown->>p_category)::INT, 0) + p_xp_earned
      ),
    updated_at = NOW();

  -- Recalculate streak safely
  PERFORM public.recalculate_user_streak(p_user_id, p_activity_date);

  RETURN jsonb_build_object(
    'status', 'success',
    'activity_id', v_inserted_id,
    'total_xp', v_new_total_xp,
    'level', v_new_level
  );
END;
$$;

-- B. Timezone-Aware Streak Recalculation Function
CREATE OR REPLACE FUNCTION public.recalculate_user_streak(
  p_user_id UUID,
  p_current_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_date DATE;
  v_curr_streak INT;
  v_longest INT;
BEGIN
  SELECT current_streak, longest_streak, last_activity_date
  INTO v_curr_streak, v_longest, v_last_date
  FROM public.streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, p_current_date);
    RETURN;
  END IF;

  -- If already logged activity today, do not increase streak count
  IF v_last_date = p_current_date THEN
    RETURN;
  END IF;

  -- If activity was yesterday, increment streak
  IF v_last_date = (p_current_date - INTERVAL '1 day')::DATE THEN
    v_curr_streak := v_curr_streak + 1;
    v_longest := GREATEST(v_longest, v_curr_streak);
  -- If gap of 1 day with freeze remaining
  ELSIF v_last_date = (p_current_date - INTERVAL '2 days')::DATE THEN
    IF EXISTS (SELECT 1 FROM public.streaks WHERE user_id = p_user_id AND freezes_remaining > 0) THEN
      UPDATE public.streaks SET freezes_remaining = freezes_remaining - 1 WHERE user_id = p_user_id;
      v_curr_streak := v_curr_streak + 1;
      v_longest := GREATEST(v_longest, v_curr_streak);
    ELSE
      v_curr_streak := 1;
    END IF;
  ELSE
    -- Streak reset
    v_curr_streak := 1;
  END IF;

  UPDATE public.streaks
  SET
    current_streak = v_curr_streak,
    longest_streak = v_longest,
    last_activity_date = p_current_date,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- ============================================================================
-- 18. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all user-owned tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- PROFILES Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- USER_PREFERENCES Policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- GOALS Policies
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- GOAL_SUBTASKS Policies
CREATE POLICY "Users can manage own goal subtasks" ON public.goal_subtasks
  FOR ALL USING (auth.uid() = user_id);

-- HABITS Policies
CREATE POLICY "Users can manage own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

-- HABIT_COMPLETIONS Policies
CREATE POLICY "Users can manage own habit completions" ON public.habit_completions
  FOR ALL USING (auth.uid() = user_id);

-- QUESTS Policies
CREATE POLICY "Users can manage own quests" ON public.quests
  FOR ALL USING (auth.uid() = user_id);

-- QUEST_COMPLETIONS Policies
CREATE POLICY "Users can manage own quest completions" ON public.quest_completions
  FOR ALL USING (auth.uid() = user_id);

-- ACTIVITY_LOGS Policies
CREATE POLICY "Users can view and create own activity logs" ON public.activity_logs
  FOR ALL USING (auth.uid() = user_id);

-- DAILY_SUMMARIES Policies
CREATE POLICY "Users can view own daily summaries" ON public.daily_summaries
  FOR ALL USING (auth.uid() = user_id);

-- STREAKS Policies
CREATE POLICY "Users can view and manage own streaks" ON public.streaks
  FOR ALL USING (auth.uid() = user_id);

-- NOTES & FOLDERS Policies
CREATE POLICY "Users can manage own note folders" ON public.note_folders
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own note tags" ON public.note_tags
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own note versions" ON public.note_versions
  FOR ALL USING (auth.uid() = user_id);

-- ROADMAPS Policies
CREATE POLICY "Users can view templates or own roadmaps" ON public.roadmaps
  FOR SELECT USING (is_template = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own roadmaps" ON public.roadmaps
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own roadmap milestones" ON public.roadmap_milestones
  FOR ALL USING (auth.uid() = user_id);

-- FOCUS_SESSIONS Policies
CREATE POLICY "Users can manage own focus sessions" ON public.focus_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ACHIEVEMENTS Policies (Catalog readable by all authenticated users, modifications restricted)
CREATE POLICY "Achievements catalog viewable by all authenticated users" ON public.achievements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own unlocked achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- XP_TRANSACTIONS Policies (View only by owner, insertions via trusted function)
CREATE POLICY "Users can view own xp transactions" ON public.xp_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- USER_WIDGETS Policies
CREATE POLICY "Users can manage own widgets" ON public.user_widgets
  FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS & TOKENS Policies
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own device tokens" ON public.device_tokens
  FOR ALL USING (auth.uid() = user_id);


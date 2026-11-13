-- Questly 2.0 Seed Dataset
-- Populates default achievements, roadmaps templates, and reference catalogs

-- 1. ACHIEVEMENTS CATALOG
INSERT INTO public.achievements (id, title, description, tier, icon, category, xp_reward, requirement_type, requirement_threshold, is_secret)
VALUES
  -- Bronze Tier
  ('ach_first_step', 'First Step', 'Complete your very first quest on Questly.', 'bronze', 'flag', 'general', 50, 'quests_completed', 1, false),
  ('ach_focus_novice', 'Focus Novice', 'Log your first 25-minute Pomodoro focus session.', 'bronze', 'timer', 'focus', 50, 'focus_sessions_completed', 1, false),
  ('ach_note_scribe', 'Scribe', 'Create your first markdown knowledge note.', 'bronze', 'book-open', 'notebook', 50, 'notes_created', 1, false),

  -- Silver Tier
  ('ach_three_day_streak', 'Momentum', 'Maintain a 3-day consistency streak.', 'silver', 'flame', 'streak', 100, 'streak_days', 3, false),
  ('ach_habit_builder', 'Habit Builder', 'Complete 10 recurring habits.', 'silver', 'repeat', 'habits', 100, 'habits_completed', 10, false),
  ('ach_code_warrior', 'Code Warrior', 'Log 5 programming or algorithmic challenges.', 'silver', 'code', 'academics', 150, 'programming_tasks', 5, false),

  -- Gold Tier
  ('ach_seven_day_streak', 'Iron Will', 'Maintain a 7-day consistency streak without freezing.', 'gold', 'zap', 'streak', 250, 'streak_days', 7, false),
  ('ach_deep_diver', 'Deep Diver', 'Log a cumulative 10 hours of deep focus time.', 'gold', 'brain', 'focus', 300, 'focus_minutes', 600, false),
  ('ach_roadmap_finisher', 'Pathfinder', 'Complete all milestones in a guided roadmap.', 'gold', 'map', 'roadmap', 350, 'roadmaps_completed', 1, false),

  -- Diamond Tier
  ('ach_monthly_mastery', 'Consistent Champion', 'Achieve a 30-day streak.', 'diamond', 'gem', 'streak', 500, 'streak_days', 30, false),
  ('ach_polymath', 'True Polymath', 'Earn XP across all 6 skill branches in a single week.', 'diamond', 'sparkles', 'gamification', 600, 'skills_balanced', 6, false),
  ('ach_century_club', 'Century Club', 'Complete 100 total quests and tasks.', 'diamond', 'award', 'general', 750, 'quests_completed', 100, false),

  -- Legendary Tier
  ('ach_centurion_streak', 'Centurion', 'Achieve a legendary 100-day consistency streak.', 'legendary', 'crown', 'streak', 2000, 'streak_days', 100, false),
  ('ach_grandmaster', 'Grandmaster of Focus', 'Accumulate over 100 hours of deep work.', 'legendary', 'shield-check', 'focus', 2500, 'focus_minutes', 6000, false)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  tier = EXCLUDED.tier,
  xp_reward = EXCLUDED.xp_reward;

-- 2. STARTER ROADMAP TEMPLATES (System templates accessible to all users)
-- System user placeholder id for public templates: 00000000-0000-0000-0000-000000000000
-- Templates will be cloned into user account upon enrollment.

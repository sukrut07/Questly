'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { LivingWorldCard } from '@/components/world/LivingWorldCard';
import { QuestCard } from '@/components/quests/QuestCard';
import { WORLD_STAGES } from '@/lib/progressionEngine';
import {
  Sparkles,
  Flame,
  Plus,
  Play,
  Hourglass,
  CheckCircle2,
  Trophy,
  Map,
  Gamepad2,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
  Zap,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function HomeDashboard() {
  const {
    user,
    streak,
    quests,
    focusSessions,
    activityHistory,
    achievements,
    settings,
    setCurrentTab,
    setActiveModal,
    setSelectedQuest,
  } = useQuestly();

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Calculate today's progress
  const completedTodayQuests = quests.filter((q) => q.status === 'COMPLETED').length;
  const activeQuests = quests.filter((q) => q.status !== 'COMPLETED');

  // Highest priority active quest recommended for focus
  const recommendedQuest =
    activeQuests.find((q) => q.priority === 'URGENT') ||
    activeQuests.find((q) => q.priority === 'HIGH') ||
    activeQuests[0] ||
    null;

  // Today's focus minutes from today's activity or focus sessions
  const todaySessions = focusSessions.filter((fs) => {
    const sDate = new Date(fs.startedAt).toDateString();
    return sDate === new Date().toDateString();
  });
  const todayFocusMinutes = todaySessions.reduce(
    (acc, fs) => acc + Math.floor(fs.elapsedSeconds / 60),
    0
  );

  const questProgressPct = Math.min(
    100,
    Math.round((completedTodayQuests / Math.max(1, settings.dailyQuestTargetCount)) * 100)
  );

  const focusProgressPct = Math.min(
    100,
    Math.round((todayFocusMinutes / Math.max(1, settings.dailyFocusTargetMinutes)) * 100)
  );

  const todayXpEarned = todaySessions.reduce((acc, s) => acc + s.xpEarned, 0) +
    quests.filter((q) => q.status === 'COMPLETED').reduce((acc, q) => acc + q.xpReward, 0);

  const currentWorldStage = WORLD_STAGES[streak.worldStage] || WORLD_STAGES[1];

  const handleStartFocus = () => {
    sound.playButtonClick();
    if (recommendedQuest) {
      setSelectedQuest(recommendedQuest);
    }
    setCurrentTab('focus');
  };

  const handleCreateQuest = () => {
    sound.playButtonClick();
    setSelectedQuest(null);
    setActiveModal('new_quest');
  };

  return (
    <div className="space-y-6">
      {/* A. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface-main border border-theme shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-theme-main tracking-tight">
              Welcome back, {user.displayName}
            </h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
              L{user.level} {user.currentStage}
            </span>
          </div>
          <p className="text-xs text-theme-muted">
            {todayStr} • Your realm is {streak.presentationMode} and waiting for today&apos;s achievements.
          </p>
        </div>

        {/* Quick Habit Streak Pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-elevated border border-theme shrink-0">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          <div>
            <div className="text-sm font-black text-theme-main">{streak.currentStreak} Day Streak</div>
            <div className="text-[10px] text-theme-muted">Longest: {streak.longestStreak} days</div>
          </div>
        </div>
      </div>

      {/* B. The Signature Living World Card */}
      <LivingWorldCard />

      {/* D. Daily Progress Grid Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-surface-main border border-theme shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-theme-muted mb-1">
            <span>Focus Target</span>
            <Clock className="w-4 h-4 text-primary-violet" />
          </div>
          <div className="text-xl font-black text-theme-main font-mono">
            {todayFocusMinutes} <span className="text-xs text-theme-muted">/ {settings.dailyFocusTargetMinutes}m</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden mt-2">
            <div
              className="h-full bg-primary-violet rounded-full transition-all duration-500"
              style={{ width: `${focusProgressPct}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-surface-main border border-theme shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-theme-muted mb-1">
            <span>Daily Quests</span>
            <CheckCircle2 className="w-4 h-4 text-mint-green" />
          </div>
          <div className="text-xl font-black text-theme-main font-mono">
            {completedTodayQuests} <span className="text-xs text-theme-muted">/ {settings.dailyQuestTargetCount}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden mt-2">
            <div
              className="h-full bg-mint-green rounded-full transition-all duration-500"
              style={{ width: `${questProgressPct}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-surface-main border border-theme shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-theme-muted mb-1">
            <span>Energy Earned</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-xl font-black text-yellow-400 font-mono">
            +{todayXpEarned} <span className="text-xs text-theme-muted">XP</span>
          </div>
          <div className="text-[10px] text-theme-muted mt-1 font-semibold">Today&apos;s total gain</div>
        </div>

        <div className="p-4 rounded-3xl bg-surface-main border border-theme shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-theme-muted mb-1">
            <span>Daily Objective</span>
            <Zap className="w-4 h-4 text-electric-blue" />
          </div>
          <div className="text-xl font-black text-theme-main font-mono">
            {streak.todayGoalMet ? 'Fulfilled' : 'In Progress'}
          </div>
          <div className="text-[10px] text-theme-muted mt-1 font-semibold">
            {streak.todayGoalMet ? 'Realm Nourished' : 'Complete 1 target'}
          </div>
        </div>
      </div>

      {/* 2-Column: Today's Quests & Quick Focus Chamber Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* C. Today's Highest-Priority Quests (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-theme-main tracking-tight">
                Today&apos;s Objectives
              </h3>
              <p className="text-xs text-theme-muted">
                {activeQuests.length} pending missions awaiting execution
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateQuest}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary-violet/15 hover:bg-primary-violet text-primary-violet hover:text-white border border-primary-violet/30 text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>New Quest</span>
              </button>
              <button
                onClick={() => setCurrentTab('quests')}
                className="flex items-center gap-1 text-xs font-bold text-theme-muted hover:text-theme-main transition-colors px-2 py-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Top 3 Quests */}
          {activeQuests.length > 0 ? (
            <div className="space-y-3">
              {activeQuests.slice(0, 3).map((quest) => (
                <QuestCard key={quest.id} quest={quest} compact />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-surface-main border border-theme text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-mint-green mx-auto" />
              <h4 className="font-bold text-sm text-theme-main">All missions cleared today!</h4>
              <p className="text-xs text-theme-muted">
                Your realm shines brightly. Ready to challenge yourself further?
              </p>
              <button
                onClick={handleCreateQuest}
                className="px-4 py-2 rounded-xl bg-primary-violet text-white text-xs font-bold shadow-md hover:bg-purple-600 inline-flex items-center gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inscribe Next Quest</span>
              </button>
            </div>
          )}
        </div>

        {/* E & F. Focus Session Launch Card & Next Milestone */}
        <div className="space-y-4">
          {/* Focus Sprint Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/60 via-surface-main to-indigo-950/40 border border-primary-violet/40 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-primary-violet/20 text-primary-violet uppercase tracking-wider">
                  Deep Flow
                </span>
                <span className="text-xs font-mono font-bold text-theme-muted">25m Sprint</span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-theme-main tracking-tight">
                  {recommendedQuest ? recommendedQuest.title : 'Deep Focus Meditation'}
                </h4>
                <p className="text-xs text-theme-muted mt-1 line-clamp-2">
                  {recommendedQuest
                    ? `Focus on [${recommendedQuest.category}] mission to gain +${recommendedQuest.xpReward} XP upon completion.`
                    : 'Clear mind and strengthen discipline with a 25-minute deep focus session.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleStartFocus}
              className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Focus Chamber</span>
            </button>
          </div>

          {/* F. Next Milestone Card */}
          <div className="p-5 rounded-3xl bg-surface-main border border-theme space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Next Milestone</span>
            </div>
            <p className="text-xs text-theme-main font-semibold leading-snug">
              {currentWorldStage.nextMilestoneDesc}
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px] text-theme-muted">
              <span>{streak.currentStreak} active days logged</span>
              <button
                onClick={() => setCurrentTab('map')}
                className="text-primary-violet font-bold hover:underline flex items-center gap-0.5"
              >
                <span>View Map</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="p-4 rounded-3xl bg-surface-main border border-theme grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <button
          onClick={handleCreateQuest}
          className="p-3 rounded-2xl bg-surface-elevated/60 hover:bg-surface-elevated border border-theme transition-all flex flex-col items-center gap-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-primary-violet/15 text-primary-violet flex items-center justify-center">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-bold text-theme-main">Add Quest</span>
        </button>

        <button
          onClick={handleStartFocus}
          className="p-3 rounded-2xl bg-surface-elevated/60 hover:bg-surface-elevated border border-theme transition-all flex flex-col items-center gap-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-electric-blue/15 text-electric-blue flex items-center justify-center">
            <Hourglass className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-theme-main">Focus Sprint</span>
        </button>

        <button
          onClick={() => setCurrentTab('map')}
          className="p-3 rounded-2xl bg-surface-elevated/60 hover:bg-surface-elevated border border-theme transition-all flex flex-col items-center gap-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center">
            <Map className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-theme-main">Adventure Map</span>
        </button>

        <button
          onClick={() => setCurrentTab('arcade')}
          className="p-3 rounded-2xl bg-surface-elevated/60 hover:bg-surface-elevated border border-theme transition-all flex flex-col items-center gap-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-coral/15 text-coral flex items-center justify-center">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-theme-main">Arcade Break</span>
        </button>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
    </svg>
  );
}

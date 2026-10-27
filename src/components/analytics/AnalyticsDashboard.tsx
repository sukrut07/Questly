'use client';

import React, { useMemo } from 'react';
import { useQuestly } from '@/lib/store';
import { calculateProductivityScore, formatMinutes } from '@/lib/progressionEngine';
import { QuestCategory } from '@/lib/types';
import {
  BarChart3,
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export function AnalyticsDashboard() {
  const { quests, focusSessions, activityHistory, streak, settings } = useQuestly();

  // 1. Core Summary Metrics
  const totalCompletedQuests = quests.filter((q) => q.status === 'COMPLETED').length;
  const totalQuests = quests.length;
  const completionRatePercent = totalQuests > 0 ? Math.round((totalCompletedQuests / totalQuests) * 100) : 0;

  const totalFocusMinutes = focusSessions.reduce((acc, fs) => acc + Math.floor(fs.elapsedSeconds / 60), 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // 2. Weekly Focus Minutes (last 7 days from activityHistory)
  const last7Days = useMemo(() => {
    return activityHistory.slice(-7);
  }, [activityHistory]);

  const weeklyFocusMinutes = last7Days.reduce((acc, d) => acc + d.focusMinutes, 0);

  // 3. Daily Goal Consistency in last 7 days
  const daysMetGoal = last7Days.filter((d) => d.goalMet).length;
  const dailyGoalConsistencyPercent = last7Days.length > 0 ? Math.round((daysMetGoal / last7Days.length) * 100) : 0;

  // 4. Strava-inspired Productivity Score
  const scoreResult = useMemo(() => {
    return calculateProductivityScore({
      completionRatePercent,
      weeklyFocusMinutes,
      focusTargetMinutes: settings.dailyFocusTargetMinutes,
      dailyGoalConsistencyPercent,
      streakDays: streak.currentStreak,
    });
  }, [completionRatePercent, weeklyFocusMinutes, settings.dailyFocusTargetMinutes, dailyGoalConsistencyPercent, streak.currentStreak]);

  // 5. Category Breakdown
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<QuestCategory, number>> = {};
    quests.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, [quests]);

  // 6. Max Focus Minutes for 7-day chart scale
  const maxFocusMin = Math.max(60, ...last7Days.map((d) => d.focusMinutes));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-surface-main border border-theme shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-theme-main tracking-tight">Productivity Analytics</h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-mint-green/15 border border-mint-green/30 text-mint-green uppercase tracking-wider">
              Strava-Style Telemetry
            </span>
          </div>
          <p className="text-xs text-theme-muted">
            Transparent metrics derived exclusively from verified focus sessions, completed quests, and habit consistency.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-elevated border border-theme shrink-0">
          <Activity className="w-4 h-4 text-primary-violet" />
          <div className="text-xs">
            <span className="text-theme-muted">Lifetime Work: </span>
            <span className="font-bold text-theme-main">{totalFocusHours} Hours</span>
          </div>
        </div>
      </div>

      {/* Signature Productivity Score Card (Strava-Inspired) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-main border border-theme shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">
                Productivity Resilience Index
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-elevated text-primary-violet border border-theme">
                0.35·C + 0.30·F + 0.20·G + 0.15·S
              </span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-theme-main font-mono tracking-tight">
                {scoreResult.totalScore}
              </span>
              <span className="text-xs text-theme-muted font-bold">/ 100 Index</span>

              <div
                className={`px-3 py-1 rounded-xl text-sm font-black flex items-center gap-1 border shadow-sm ${
                  scoreResult.grade === 'S'
                    ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50 glow-gold'
                    : scoreResult.grade === 'A'
                    ? 'bg-mint-green/20 text-mint-green border-mint-green/50'
                    : 'bg-primary-violet/20 text-primary-violet border-primary-violet/50'
                }`}
              >
                <span>Grade {scoreResult.grade}</span>
              </div>
            </div>

            <p className="text-xs text-theme-muted max-w-lg leading-relaxed">
              Synthesized from quest completion rate, verified focus volume, daily goal fulfillment, and active streak resilience.
            </p>
          </div>

          {/* Sub-score component breakdown bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-3 rounded-2xl bg-surface-elevated/70 border border-theme">
              <div className="text-[10px] text-theme-muted font-bold">Quests (C: 35%)</div>
              <div className="text-lg font-black text-theme-main mt-0.5">
                {scoreResult.completionScore} <span className="text-[10px] text-theme-muted">/ 35</span>
              </div>
              <div className="text-[10px] text-theme-muted mt-1">{completionRatePercent}% Done</div>
            </div>

            <div className="p-3 rounded-2xl bg-surface-elevated/70 border border-theme">
              <div className="text-[10px] text-theme-muted font-bold">Focus (F: 30%)</div>
              <div className="text-lg font-black text-theme-main mt-0.5">
                {scoreResult.focusScore} <span className="text-[10px] text-theme-muted">/ 30</span>
              </div>
              <div className="text-[10px] text-theme-muted mt-1">{weeklyFocusMinutes}m / wk</div>
            </div>

            <div className="p-3 rounded-2xl bg-surface-elevated/70 border border-theme">
              <div className="text-[10px] text-theme-muted font-bold">Goals (G: 20%)</div>
              <div className="text-lg font-black text-theme-main mt-0.5">
                {scoreResult.goalScore} <span className="text-[10px] text-theme-muted">/ 20</span>
              </div>
              <div className="text-[10px] text-theme-muted mt-1">{dailyGoalConsistencyPercent}% Met</div>
            </div>

            <div className="p-3 rounded-2xl bg-surface-elevated/70 border border-theme">
              <div className="text-[10px] text-theme-muted font-bold">Streak (S: 15%)</div>
              <div className="text-lg font-black text-theme-main mt-0.5">
                {scoreResult.streakScore} <span className="text-[10px] text-theme-muted">/ 15</span>
              </div>
              <div className="text-[10px] text-theme-muted mt-1">{streak.currentStreak} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Analytics: 7-Day Focus Volume Chart & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Focus Volume Bar Chart */}
        <div className="p-6 rounded-3xl bg-surface-main border border-theme shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-theme-main tracking-tight">
                7-Day Focus Volume
              </h3>
              <p className="text-xs text-theme-muted">Actual qualifying focus minutes logged</p>
            </div>
            <span className="text-xs font-bold text-primary-violet">
              {weeklyFocusMinutes} mins total
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {last7Days.map((day) => {
              const heightPct = Math.max(8, Math.round((day.focusMinutes / maxFocusMin) * 100));
              const isTargetMet = day.focusMinutes >= settings.dailyFocusTargetMinutes;
              const dateLabel = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' });

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip value */}
                  <span className="text-[10px] font-bold text-theme-muted group-hover:text-theme-main transition-colors opacity-80 group-hover:opacity-100">
                    {day.focusMinutes}m
                  </span>

                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-surface-elevated rounded-xl h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-lg transition-all duration-700 ${
                        isTargetMet
                          ? 'bg-gradient-to-t from-purple-600 to-indigo-500 shadow-sm'
                          : 'bg-primary-violet/40'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-theme-muted font-semibold mt-1">
                    {dateLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-theme/60 flex items-center justify-between text-[11px] text-theme-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-violet" />
              <span>Target: {settings.dailyFocusTargetMinutes}m / day</span>
            </span>
            <span>{daysMetGoal} of 7 days fulfilled</span>
          </div>
        </div>

        {/* 30-Day Activity Heatmap */}
        <div className="p-6 rounded-3xl bg-surface-main border border-theme shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-theme-main tracking-tight">
              Habit Consistency Heatmap
            </h3>
            <p className="text-xs text-theme-muted">
              Visualizing consistency cadence without punitive streak resets
            </p>
          </div>

          {/* Grid of 28-35 days */}
          <div className="grid grid-cols-7 gap-2.5 my-4">
            {Array.from({ length: 28 }).map((_, idx) => {
              // Simulated previous activity mapping
              const act = activityHistory[idx] || null;
              const hasActivity = act && act.focusMinutes > 0;
              const isGoalMet = act && act.goalMet;

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all border ${
                    isGoalMet
                      ? 'bg-mint-green/25 border-mint-green/60 text-mint-green shadow-sm'
                      : hasActivity
                      ? 'bg-primary-violet/20 border-primary-violet/40 text-primary-violet'
                      : 'bg-surface-elevated/40 border-theme/40 text-theme-muted/40'
                  }`}
                  title={act ? `${act.date}: ${act.focusMinutes}m focus, ${act.questsCompleted} quests` : 'Rest day'}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-theme/60 flex items-center justify-between text-[11px] text-theme-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-surface-elevated border border-theme" />
                <span>Rest</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary-violet/40 border border-primary-violet" />
                <span>Active</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-mint-green border border-mint-green" />
                <span>Goal Fulfilled</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="p-6 rounded-3xl bg-surface-main border border-theme shadow-md">
        <h3 className="font-extrabold text-base text-theme-main tracking-tight mb-4">
          Quest Category Allocation
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const pct = Math.round(((count || 0) / Math.max(1, totalQuests)) * 100);
            return (
              <div key={cat} className="p-3.5 rounded-2xl bg-surface-elevated/60 border border-theme">
                <div className="text-xs font-bold text-theme-main">{cat}</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-black text-primary-violet">{count} quests</span>
                  <span className="text-xs font-bold text-theme-muted">{pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden mt-2">
                  <div
                    className="h-full bg-primary-violet rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

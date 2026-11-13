'use client';

import React, { useMemo } from 'react';
import { useQuestly } from '@/lib/store';
import { calculateProductivityScore, formatMinutes } from '@/lib/progressionEngine';
import {
  BarChart3,
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Activity,
  BookOpen,
} from 'lucide-react';

export function AnalyticsDashboard() {
  const { quests, focusSessions, activityHistory, streak, settings, subjects } = useQuestly();

  // 1. Core Summary Metrics
  const totalCompletedQuests = quests.filter((q) => q.status === 'COMPLETED').length;
  const totalQuests = quests.length;
  const completionRatePercent = totalQuests > 0 ? Math.round((totalCompletedQuests / totalQuests) * 100) : 0;

  const totalFocusMinutes = focusSessions.reduce((acc, fs) => acc + Math.floor(fs.elapsedSeconds / 60), 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // 2. Weekly Focus Minutes (last 7 days)
  const last7Days = useMemo(() => {
    return activityHistory.slice(-7);
  }, [activityHistory]);

  const weeklyFocusMinutes = last7Days.reduce((acc, d) => acc + d.focusMinutes, 0);

  // 3. Daily Goal Consistency in last 7 days
  const daysMetGoal = last7Days.filter((d) => d.goalMet).length;
  const dailyGoalConsistencyPercent = last7Days.length > 0 ? Math.round((daysMetGoal / last7Days.length) * 100) : 0;

  // 4. Academic Resilience Index
  const scoreResult = useMemo(() => {
    return calculateProductivityScore({
      completionRatePercent,
      weeklyFocusMinutes,
      focusTargetMinutes: settings.dailyFocusTargetMinutes,
      dailyGoalConsistencyPercent,
      streakDays: streak.currentStreak,
    });
  }, [completionRatePercent, weeklyFocusMinutes, settings.dailyFocusTargetMinutes, dailyGoalConsistencyPercent, streak.currentStreak]);

  // 5. Subject Workload Breakdown
  const subjectTaskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    quests.forEach((q) => {
      const code = q.subjectCode || 'General';
      counts[code] = (counts[code] || 0) + 1;
    });
    return counts;
  }, [quests]);

  const maxFocusMin = Math.max(60, ...last7Days.map((d) => d.focusMinutes));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-lime-400" />
            <h2 className="text-xl font-black text-zinc-100 tracking-tight">Academic Analytics</h2>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400">
              Verified Telemetry
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real metrics derived from verified focus sessions, completed problem sets, and syllabus checklists.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
          <Activity className="w-4 h-4 text-purple-400" />
          <div className="text-xs">
            <span className="text-zinc-500">Verified Study: </span>
            <span className="font-bold font-mono text-zinc-200">{totalFocusHours}h Total</span>
          </div>
        </div>
      </div>

      {/* Academic Resilience Index Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Academic Resilience Index
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-lime-400 border border-zinc-800">
                0.35·C + 0.30·F + 0.20·G + 0.15·S
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono font-black text-5xl sm:text-6xl text-zinc-100 tracking-tight">
                {scoreResult.totalScore}
              </span>
              <span className="text-sm font-bold text-zinc-500 font-mono">/ 100</span>
              <span className="text-xl font-black px-3 py-1 rounded-xl bg-lime-400/15 text-lime-400 border border-lime-400/30 font-mono ml-2">
                Tier {scoreResult.grade}
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              Weighted composite evaluating task completion rate (35%), verified focus hours (30%), daily goal compliance (20%), and consistency streak (15%).
            </p>
          </div>

          {/* Sub-factor Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-850 text-center">
              <div className="text-lg font-mono font-bold text-zinc-100">{completionRatePercent}%</div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5">Task Rate</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-850 text-center">
              <div className="text-lg font-mono font-bold text-purple-400">{weeklyFocusMinutes}m</div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5">7d Focus</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-850 text-center">
              <div className="text-lg font-mono font-bold text-cyan-400">{dailyGoalConsistencyPercent}%</div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5">Goal Hit</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-850 text-center">
              <div className="text-lg font-mono font-bold text-amber-400">{streak.currentStreak}d</div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5">Active Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: 7-Day Focus Volume & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Focus Volume Bar Chart */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
              7-Day Focus Volume (Minutes)
            </h3>
            <span className="text-xs font-mono text-zinc-400">{weeklyFocusMinutes}m Total</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
            {last7Days.map((day) => {
              const heightPct = Math.min(100, Math.round((day.focusMinutes / maxFocusMin) * 100));
              const dayLabel = new Date(day.date).toLocaleDateString(undefined, { weekday: 'narrow' });

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.focusMinutes}m
                  </div>
                  <div className="w-full bg-zinc-900 rounded-t-lg h-32 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-lime-400 rounded-t-lg transition-all duration-500 group-hover:bg-lime-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Volume by Course */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
              Workload Distribution by Course
            </h3>
            <span className="text-xs font-mono text-zinc-400">{quests.length} Total Tasks</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(subjectTaskCounts).map(([code, count]) => {
              const subject = subjects.find((s) => s.code === code);
              const pct = Math.round((count / Math.max(1, quests.length)) * 100);

              return (
                <div key={code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">{code}</span>
                    <span className="font-mono text-zinc-400">
                      {count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: subject?.colorHex || '#A3E635',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

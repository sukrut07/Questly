'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Target,
  Sparkles,
  Zap,
  Play,
  Check,
  ChevronRight,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

interface DailyCheckpointsProps {
  onStartFocus?: () => void;
  onOpenTasks?: () => void;
}

export function DailyCheckpoints({ onStartFocus, onOpenTasks }: DailyCheckpointsProps) {
  const { quests, focusSessions, settings, streak } = useQuestly();

  // Completed tasks count
  const completedCount = quests.filter((q) => q.status === 'COMPLETED').length;
  const targetTasks = Math.max(4, quests.length);
  const taskProgressPct = Math.min(100, Math.round((completedCount / targetTasks) * 100));

  // Focus time today
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayFocusSecs = focusSessions
    .filter((s) => s.startedAt >= todayStart)
    .reduce((acc, s) => acc + s.elapsedSeconds, 0);
  const todayFocusMins = Math.floor(todayFocusSecs / 60);
  const targetFocusMins = settings.dailyFocusTargetMinutes || 90;
  const focusProgressPct = Math.min(100, Math.round((todayFocusMins / targetFocusMins) * 100));

  // Real-time daily checkpoints schedule
  const checkpoints = [
    {
      id: 'cp-1',
      time: '08:30 AM',
      title: 'Morning Roadmap & Prioritization',
      subtitle: 'Review atomic quests & syllabus schedule',
      xp: 25,
      isDone: true,
      isActive: false,
    },
    {
      id: 'cp-2',
      time: '11:00 AM',
      title: 'Deep Focus Chamber Sprint',
      subtitle: 'Unbroken study block (Target: 45m)',
      xp: 50,
      isDone: todayFocusMins >= 45,
      isActive: todayFocusMins < 45,
    },
    {
      id: 'cp-3',
      time: '02:30 PM',
      title: 'Problem Set & Coursework Lab',
      subtitle: 'Solve core algorithmic proofs & labs',
      xp: 75,
      isDone: completedCount >= 2,
      isActive: completedCount < 2 && todayFocusMins >= 45,
    },
    {
      id: 'cp-4',
      time: '05:30 PM',
      title: 'Cognitive Arcade Warmup',
      subtitle: 'Math Sprint or Sudoku speed duel',
      xp: 20,
      isDone: false,
      isActive: false,
    },
    {
      id: 'cp-5',
      time: '08:30 PM',
      title: 'Evening Log & Ledger Sync',
      subtitle: 'Verify earned XP & lock streak',
      xp: 30,
      isDone: false,
      isActive: false,
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* 1. Goals Summary Ring Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Goal 1: Daily Focus Target */}
        <div className="p-4 rounded-2xl bg-[#0D0F14] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Daily Focus</span>
            <span className="text-xs font-mono font-bold text-[#86EFAC]">
              {todayFocusMins}/{targetFocusMins}m
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#86EFAC] to-[#4ADE80] transition-all duration-500"
              style={{ width: `${focusProgressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>{focusProgressPct}% completed</span>
            <button
              onClick={onStartFocus}
              className="text-[#86EFAC] hover:underline font-medium inline-flex items-center gap-0.5"
            >
              Start Focus <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Goal 2: Task Checkpoint Target */}
        <div className="p-4 rounded-2xl bg-[#0D0F14] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Quests Cleared</span>
            <span className="text-xs font-mono font-bold text-purple-300">
              {completedCount}/{targetTasks}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-[#C084FC] transition-all duration-500"
              style={{ width: `${taskProgressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>{taskProgressPct}% completed</span>
            <button
              onClick={onOpenTasks}
              className="text-purple-300 hover:underline font-medium inline-flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Daily Checkpoint Schedule */}
      <div className="rounded-2xl bg-[#0D0F14] border border-white/[0.08] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">
              Real-Time Daily Checkpoints
            </h4>
            <p className="text-[11px] text-zinc-400">
              Scheduled milestones to maintain flow and secure your daily streak
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded-md">
            Today
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {checkpoints.map((cp) => (
            <div
              key={cp.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                cp.isDone
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-zinc-300'
                  : cp.isActive
                  ? 'bg-white/[0.04] border-[#86EFAC]/40 shadow-[0_0_15px_rgba(134,239,172,0.1)]'
                  : 'bg-white/[0.02] border-white/[0.05] text-zinc-400'
              }`}
            >
              {/* Status Indicator */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    cp.isDone
                      ? 'bg-emerald-500 text-black'
                      : cp.isActive
                      ? 'border-2 border-[#86EFAC] text-[#86EFAC] animate-pulse'
                      : 'border border-zinc-700 text-zinc-600'
                  }`}
                >
                  {cp.isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Circle className="w-2.5 h-2.5" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">{cp.title}</span>
                    {cp.isActive && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#86EFAC]/20 text-[#86EFAC] border border-[#86EFAC]/30">
                        ACTIVE NOW
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">{cp.subtitle}</p>
                </div>
              </div>

              {/* Time & XP */}
              <div className="text-right shrink-0 font-mono text-[11px]">
                <span className="text-zinc-400 block">{cp.time}</span>
                <span className="text-[#86EFAC] font-semibold">+{cp.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

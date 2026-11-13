'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import {
  User,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  Settings,
  BookOpen,
  Award,
  Snowflake,
  Download,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function ProfileView() {
  const { user, streak, quests, focusSessions, achievements, setActiveModal, subjects } = useQuestly();

  const totalFocusHours = (
    focusSessions.reduce((acc, fs) => acc + Math.floor(fs.elapsedSeconds / 60), 0) / 60
  ).toFixed(1);

  const completedQuestsCount = quests.filter((q) => q.status === 'COMPLETED').length;
  const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl bg-lime-400 text-zinc-950 font-black text-2xl flex items-center justify-center shadow-md">
            {user.displayName.substring(0, 1)}
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-zinc-950 text-lime-400 text-[10px] font-mono font-bold border border-lime-400/40">
              L{user.level}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-zinc-100 tracking-tight">{user.displayName}</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30">
                {user.academicRank}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{user.academicRole}</p>
            <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1 font-mono">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{streak.currentStreak} Day Streak</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Snowflake className="w-3.5 h-3.5" />
                <span>{user.freezeTokens} Freezes</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal('data_backup')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveModal('settings');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-xs font-bold transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Level XP Progress Card */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-zinc-200">Level {user.level} Progression</span>
            <span className="text-zinc-500 text-[11px] ml-2 font-mono">
              ({user.currentXp} / {user.nextLevelXp} XP to next level)
            </span>
          </div>
          <span className="font-mono text-amber-400 font-bold">{user.totalXp} Total XP</span>
        </div>

        <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-lime-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((user.currentXp / user.nextLevelXp) * 100))}%` }}
          />
        </div>
      </div>

      {/* Academic Career Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 mb-1 flex items-center justify-between">
            <span>Enrolled Credits</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-black text-zinc-100">{totalCredits}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">5 active courses</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 mb-1 flex items-center justify-between">
            <span>Verified Focus</span>
            <Clock className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-2xl font-mono font-black text-zinc-100">{totalFocusHours}h</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Deep study time</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 mb-1 flex items-center justify-between">
            <span>Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-black text-zinc-100">{completedQuestsCount}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Problem sets & readings</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 mb-1 flex items-center justify-between">
            <span>Longest Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-amber-400">{streak.longestStreak}d</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Consecutive days</div>
        </div>
      </div>

      {/* Academic Achievements / Milestones */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-zinc-100">Academic Achievements</h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {achievements.filter((a) => a.isUnlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                ach.isUnlocked
                  ? 'bg-zinc-900/60 border-zinc-800'
                  : 'bg-zinc-950/40 border-zinc-850 opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  ach.isUnlocked ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 'bg-zinc-900 text-zinc-600'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-200">{ach.title}</h4>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">+{ach.xpReward} XP</span>
                </div>
                <p className="text-[11px] text-zinc-400">{ach.description}</p>
                <div className="w-full h-1 rounded-full bg-zinc-900 overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

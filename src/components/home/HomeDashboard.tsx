'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import {
  Flame,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowRight,
  Sparkles,
  Command,
  Circle,
  AlertTriangle,
  Snowflake,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function HomeDashboard() {
  const {
    user,
    streak,
    quests,
    deadlines,
    subjects,
    focusSessions,
    settings,
    workload,
    setCurrentTab,
    setActiveModal,
    setSelectedQuest,
    completeQuest,
    setCommandPaletteOpen,
  } = useQuestly();

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const activeQuests = quests.filter((q) => q.status !== 'COMPLETED');
  const completedTodayQuests = quests.filter((q) => q.status === 'COMPLETED').length;

  // Prominent Recommended Next Task (Priority: Urgent > High > In Progress)
  const recommendedQuest =
    activeQuests.find((q) => q.priority === 'URGENT') ||
    activeQuests.find((q) => q.priority === 'HIGH') ||
    activeQuests[0] ||
    null;

  // Today's focus minutes
  const todaySessions = focusSessions.filter((fs) => {
    return new Date(fs.startedAt).toDateString() === new Date().toDateString();
  });
  const todayFocusMinutes = todaySessions.reduce(
    (acc, fs) => acc + Math.floor(fs.elapsedSeconds / 60),
    0
  );

  const todayXpEarned =
    todaySessions.reduce((acc, s) => acc + s.xpEarned, 0) +
    quests.filter((q) => q.status === 'COMPLETED').reduce((acc, q) => acc + q.xpReward, 0);

  const handleStartFocus = (quest = recommendedQuest) => {
    sound.playButtonClick();
    if (quest) {
      setSelectedQuest(quest);
    }
    setCurrentTab('focus');
  };

  const handleCreateTask = () => {
    sound.playButtonClick();
    setSelectedQuest(null);
    setActiveModal('new_task');
  };

  return (
    <div className="space-y-6">
      {/* 1. Academic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-zinc-100 tracking-tight">
              Welcome back, {user.displayName}
            </h2>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30">
              LVL {user.level} {user.academicRank}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {todayStr} • {user.academicRole}
          </p>
        </div>

        {/* Action Controls & Streak */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all"
            title="Press Cmd+K"
          >
            <Command className="w-3.5 h-3.5 text-zinc-400" />
            <span>Search</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">⌘K</kbd>
          </button>

          <button
            onClick={handleCreateTask}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 text-xs font-extrabold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Task</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <div className="text-xs font-bold text-zinc-200">
              {streak.currentStreak} <span className="text-[10px] text-zinc-500">Days</span>
            </div>
            <div className="flex items-center gap-0.5 pl-1.5 border-l border-zinc-800 text-cyan-400" title="Streak Freeze Tokens Available">
              <Snowflake className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono font-bold">{user.freezeTokens}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Workload Balancer Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-zinc-200">Workload Balancer</span>
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                workload.status === 'overloaded'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : workload.status === 'demanding'
                  ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                  : 'bg-lime-400/10 text-lime-400 border-lime-400/30'
              }`}
            >
              {workload.status}
            </span>
          </div>
          <p className="text-xs text-zinc-400">{workload.statusMessage}</p>
        </div>

        <div className="w-full sm:w-64 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
            <span>Planned: {workload.totalPlannedMinutes}m</span>
            <span>Capacity: {workload.dailyCapacityMinutes}m</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                workload.status === 'overloaded'
                  ? 'bg-rose-500'
                  : workload.status === 'demanding'
                  ? 'bg-amber-400'
                  : 'bg-lime-400'
              }`}
              style={{ width: `${Math.min(100, workload.loadPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Main Focus Area (Prominent Next Action Card) */}
      {recommendedQuest && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-lime-400 border border-lime-400/30">
                Recommended Next Action
              </span>
              {recommendedQuest.subjectCode && (
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${recommendedQuest.subjectColorHex}15`,
                    borderColor: `${recommendedQuest.subjectColorHex}40`,
                    color: recommendedQuest.subjectColorHex,
                  }}
                >
                  {recommendedQuest.subjectCode}
                </span>
              )}
              <span className="text-[11px] font-mono text-zinc-500">
                {recommendedQuest.estimatedMinutes}m estimated
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-zinc-100">{recommendedQuest.title}</h3>
            {recommendedQuest.description && (
              <p className="text-xs text-zinc-400 leading-relaxed">{recommendedQuest.description}</p>
            )}

            {recommendedQuest.subtasks.length > 0 && (
              <div className="text-xs text-zinc-400 font-mono flex items-center gap-2 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                <span>
                  {recommendedQuest.subtasks.filter((s) => s.isCompleted).length} of{' '}
                  {recommendedQuest.subtasks.length} subtasks completed
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleStartFocus(recommendedQuest)}
              className="px-5 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 text-xs font-extrabold shadow-md transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Start Focus Sprint</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Progress Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 mb-1 flex items-center justify-between">
            <span>Tasks Done</span>
            <CheckCircle2 className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-xl font-mono font-black text-zinc-100">
            {completedTodayQuests} <span className="text-xs text-zinc-500">/ {settings.dailyTaskTargetCount}</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Today&apos;s goal progress</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 mb-1 flex items-center justify-between">
            <span>Focus Time</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-mono font-black text-zinc-100">
            {todayFocusMinutes}m <span className="text-xs text-zinc-500">/ {settings.dailyFocusTargetMinutes}m</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Verified deep flow</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 mb-1 flex items-center justify-between">
            <span>XP Earned</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-black text-amber-400">+{todayXpEarned}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Ledger verified</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 mb-1 flex items-center justify-between">
            <span>Current Rank</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-extrabold text-zinc-200 mt-1">{user.academicRank}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Level {user.level}</div>
        </div>
      </div>

      {/* 5. 2-Column Workspace: Left Active Tasks, Right Deadlines & Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100">Today&apos;s Academic Tasks</h3>
              <p className="text-xs text-zinc-400">{activeQuests.length} tasks planned</p>
            </div>

            <button
              onClick={() => setCurrentTab('planner')}
              className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span>View Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeQuests.length > 0 ? (
              activeQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => completeQuest(quest.id)}
                      className="mt-0.5 text-zinc-500 hover:text-lime-400 transition-colors shrink-0"
                    >
                      <Circle className="w-5 h-5" />
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {quest.subjectCode && (
                          <span
                            className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                            style={{
                              backgroundColor: `${quest.subjectColorHex}20`,
                              color: quest.subjectColorHex,
                            }}
                          >
                            {quest.subjectCode}
                          </span>
                        )}
                        <span className="text-[10px] font-mono uppercase text-zinc-500">
                          {quest.taskType}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400">
                          {quest.estimatedMinutes}m
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-zinc-100 leading-snug">{quest.title}</h4>
                      {quest.description && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{quest.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStartFocus(quest)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-colors"
                      title="Focus on this task"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-lime-400 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-200">All planned tasks completed!</h4>
                <p className="text-xs text-zinc-500">Pick an item from your Academic Inbox or add a new task.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Rail: Upcoming Deadlines & Subjects Summary */}
        <div className="space-y-4">
          {/* Deadlines Radar */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                Upcoming Deadlines
              </h4>
              <button
                onClick={() => setCurrentTab('planner')}
                className="text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                All
              </button>
            </div>

            <div className="space-y-2.5">
              {deadlines.filter((d) => !d.isCompleted).slice(0, 3).map((d) => (
                <div key={d.id} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-200 truncate">{d.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span style={{ color: d.subjectColorHex }}>{d.subjectCode}</span>
                    <span>{new Date(d.deadlineIso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Syllabus Meters */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                Course Syllabus
              </h4>
              <button
                onClick={() => setCurrentTab('subjects')}
                className="text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                View
              </button>
            </div>

            <div className="space-y-3">
              {subjects.slice(0, 3).map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">{s.code}</span>
                    <span className="font-mono text-zinc-400">{s.syllabusProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.syllabusProgress}%`, backgroundColor: s.colorHex }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

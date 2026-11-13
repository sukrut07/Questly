'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { DashboardWidgetId, Quest } from '@/lib/types';
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
  LayoutGrid,
  CheckSquare,
  GraduationCap,
  Zap,
  Gamepad2,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import { sound } from '@/common/SoundService';
import { InteractiveGraphBackground } from '@/components/common/InteractiveGraphBackground';
import { AcademicRoadmap } from '@/components/roadmap/AcademicRoadmap';

export function HomeDashboard() {
  const {
    user,
    streak,
    quests,
    deadlines,
    subjects,
    timetable,
    workspaces,
    activeWorkspaceId,
    focusSessions,
    settings,
    workload,
    widgets,
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

  // Prominent Recommended Next Task
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

  // Active or upcoming timetable slot
  const currentDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const todaySlots = timetable
    .filter((slot) => slot.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const handleStartFocus = (quest: Quest | null = recommendedQuest) => {
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

  const handleAddSubject = () => {
    sound.playButtonClick();
    setActiveModal('new_subject');
  };

  const handleAddDeadline = () => {
    sound.playButtonClick();
    setActiveModal('new_deadline');
  };

  const isWidgetEnabled = (id: DashboardWidgetId) => {
    const w = widgets.find((item) => item.id === id);
    return w ? w.isEnabled : true;
  };

  return (
    <div className="space-y-6">
      {/* 1. Academic Header with Interactive Grid */}
      <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutal-shadow relative overflow-hidden bg-graph-grid">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-[#F5F5F0] tracking-tight font-display uppercase">
              Welcome back, {user.displayName}
            </h2>
            <button
              onClick={() => setActiveModal('xp_tracker')}
              className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#B5FF55]/10 text-[#B5FF55] border border-[#B5FF55]/30 hover:bg-[#B5FF55]/20 transition-colors"
            >
              LVL {user.level} {user.academicRank}
            </button>
          </div>
          <p className="text-xs text-[#A1A1A1] font-mono">
            {todayStr} • {activeWorkspace ? activeWorkspace.name : user.academicRole}
          </p>
        </div>

        {/* Action Controls & Top Stats Bar */}
        <div className="flex items-center gap-2.5 shrink-0 relative z-10 flex-wrap">
          {/* XP Pill Trigger */}
          <button
            onClick={() => setActiveModal('xp_tracker')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111319] hover:bg-[#1C2029] text-[#B5FF55] border border-[#303642] text-xs font-mono font-bold transition-all"
            title="Open XP Ledger & Progression"
          >
            <Zap className="w-3.5 h-3.5 fill-[#B5FF55]" />
            <span>{user.totalXp} XP</span>
          </button>

          <button
            onClick={() => setActiveModal('widgets')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111319] hover:bg-[#1C2029] text-[#A1A1A1] hover:text-[#F5F5F0] border border-[#303642] text-xs font-mono transition-all"
            title="Configure Dashboard Widgets"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#42DFFF]" />
            <span className="hidden sm:inline">Widgets</span>
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111319] hover:bg-[#1C2029] text-[#A1A1A1] hover:text-[#F5F5F0] border border-[#303642] text-xs font-mono transition-all"
            title="Press Cmd+K"
          >
            <Command className="w-3.5 h-3.5 text-[#A1A1A1]" />
            <span>Search</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#252525] text-[#A1A1A1]">⌘K</kbd>
          </button>

          <button
            onClick={handleCreateTask}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-black transition-all brutal-shadow font-display uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Task</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111319] border border-[#303642] shrink-0">
            <Flame className="w-4 h-4 text-[#FF806B] fill-[#FF806B]" />
            <div className="text-xs font-mono font-bold text-[#F5F5F0]">
              {streak.currentStreak} <span className="text-[10px] text-[#A1A1A1]">d</span>
            </div>
            <div className="flex items-center gap-0.5 pl-1.5 border-l border-[#303642] text-[#42DFFF]" title="Streak Freeze Tokens Available">
              <Snowflake className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono font-bold">{user.freezeTokens}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Timetable Live Strip (if scheduled) */}
      {todaySlots.length > 0 && (
        <div className="p-4 rounded-xl bg-[#171A21] border border-[#303642] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#42DFFF]/10 border border-[#42DFFF]/30 flex items-center justify-center text-[#42DFFF]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#F5F5F0]">
                  Today&apos;s Class Schedule
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#42DFFF]/15 text-[#42DFFF]">
                  {todaySlots.length} sessions
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1A1] font-mono">
                Next: {todaySlots[0].startTime} - {todaySlots[0].endTime} • {todaySlots[0].locationRoom || 'Room TBA'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('timetable')}
            className="text-xs font-mono text-[#42DFFF] hover:underline flex items-center gap-1"
          >
            <span>View Timetable</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Workload Balancer Widget */}
      {isWidgetEnabled('workload') && (
        <div className="p-5 rounded-2xl bg-[#171A21] border border-[#303642] flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutal-shadow">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#F5F5F0] font-display uppercase tracking-wider">
                Workload Balancer
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  workload.status === 'overloaded'
                    ? 'bg-[#FF806B]/15 text-[#FF806B] border-[#FF806B]/30'
                    : workload.status === 'demanding'
                    ? 'bg-[#FF9C45]/15 text-[#FF9C45] border-[#FF9C45]/30'
                    : 'bg-[#B5FF55]/15 text-[#B5FF55] border-[#B5FF55]/30'
                }`}
              >
                {workload.status}
              </span>
            </div>
            <p className="text-xs text-[#A1A1A1] font-mono">{workload.statusMessage}</p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono text-[#A1A1A1]">
              <span>Planned: <strong className="text-[#F5F5F0]">{workload.totalPlannedMinutes}m</strong></span>
              <span>Capacity: {workload.dailyCapacityMinutes}m</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#111319] border border-[#303642] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  workload.status === 'overloaded'
                    ? 'bg-[#FF806B]'
                    : workload.status === 'demanding'
                    ? 'bg-[#FF9C45]'
                    : 'bg-[#B5FF55]'
                }`}
                style={{ width: `${Math.min(100, workload.loadPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Recommended Focus Sprint Hero Widget */}
      {isWidgetEnabled('focus_chamber') && (
        <>
          {recommendedQuest ? (
            <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] brutal-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#111319] text-[#B5FF55] border border-[#B5FF55]/30">
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
                  <span className="text-[11px] font-mono text-[#A1A1A1]">
                    {recommendedQuest.estimatedMinutes}m estimated
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#F5F5F0] font-display">{recommendedQuest.title}</h3>
                {recommendedQuest.description && (
                  <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">{recommendedQuest.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleStartFocus(recommendedQuest)}
                  className="px-5 py-3 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-black transition-all brutal-shadow flex items-center gap-2 font-display uppercase tracking-wider"
                >
                  <Play className="w-4 h-4 fill-[#090A0D]" />
                  <span>Start Focus Sprint</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] brutal-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#B5FF55]" />
                  <h3 className="text-sm font-black text-[#F5F5F0] font-display uppercase">
                    Ready for a Focus Session?
                  </h3>
                </div>
                <p className="text-xs text-[#A1A1A1] font-mono">
                  Add your first task to start a verified focus sprint, or jump into an open study timer.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-black transition-all brutal-shadow font-display uppercase tracking-wider"
                >
                  + Add Task
                </button>
                <button
                  onClick={() => handleStartFocus(null)}
                  className="px-4 py-2 rounded-xl bg-[#111319] hover:bg-[#1C2029] text-[#F5F5F0] border border-[#303642] text-xs font-mono transition-colors"
                >
                  Open Chamber
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. Progress Metric Badges (Matiks inspired with clickable XP Ledger) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setCurrentTab('tasks')}
          className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] hover:border-[#B5FF55]/50 cursor-pointer transition-all brutal-shadow"
        >
          <div className="text-xs font-bold text-[#A1A1A1] mb-1 flex items-center justify-between">
            <span className="font-display uppercase tracking-wider">Tasks Done</span>
            <CheckCircle2 className="w-4 h-4 text-[#B5FF55]" />
          </div>
          <div className="text-xl font-mono font-black text-[#F5F5F0]">
            {completedTodayQuests} <span className="text-xs text-[#737373]">/ {settings.dailyTaskTargetCount}</span>
          </div>
          <div className="text-[11px] text-[#737373] mt-1 font-mono">Today&apos;s goal progress</div>
        </div>

        <div
          onClick={() => setCurrentTab('focus')}
          className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] hover:border-[#A879FF]/50 cursor-pointer transition-all brutal-shadow"
        >
          <div className="text-xs font-bold text-[#A1A1A1] mb-1 flex items-center justify-between">
            <span className="font-display uppercase tracking-wider">Focus Time</span>
            <Clock className="w-4 h-4 text-[#A879FF]" />
          </div>
          <div className="text-xl font-mono font-black text-[#F5F5F0]">
            {todayFocusMinutes}m <span className="text-xs text-[#737373]">/ {settings.dailyFocusTargetMinutes}m</span>
          </div>
          <div className="text-[11px] text-[#737373] mt-1 font-mono">Verified deep flow</div>
        </div>

        <div
          onClick={() => setActiveModal('xp_tracker')}
          className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] hover:border-[#B5FF55] cursor-pointer transition-all brutal-shadow group"
        >
          <div className="text-xs font-bold text-[#A1A1A1] mb-1 flex items-center justify-between">
            <span className="font-display uppercase tracking-wider group-hover:text-[#B5FF55] transition-colors">
              XP Earned
            </span>
            <Zap className="w-4 h-4 text-[#B5FF55]" />
          </div>
          <div className="text-xl font-mono font-black text-[#B5FF55]">+{todayXpEarned}</div>
          <div className="text-[11px] text-[#B5FF55] mt-1 font-mono group-hover:underline">
            View XP Ledger →
          </div>
        </div>

        <div
          onClick={() => setActiveModal('xp_tracker')}
          className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] hover:border-[#42DFFF]/50 cursor-pointer transition-all brutal-shadow"
        >
          <div className="text-xs font-bold text-[#A1A1A1] mb-1 flex items-center justify-between">
            <span className="font-display uppercase tracking-wider">Current Rank</span>
            <GraduationCap className="w-4 h-4 text-[#42DFFF]" />
          </div>
          <div className="text-sm font-black text-[#F5F5F0] mt-1 truncate font-display uppercase">
            {user.academicRank}
          </div>
          <div className="text-[11px] text-[#737373] mt-0.5 font-mono">Level {user.level} Roadmap</div>
        </div>
      </div>

      {/* 6. Matiks Quick Arcade Banner */}
      <div
        onClick={() => setCurrentTab('arcade')}
        className="p-4 rounded-2xl bg-gradient-to-r from-[#171A21] to-[#1F192C] border border-[#A879FF]/40 hover:border-[#A879FF] transition-all cursor-pointer brutal-shadow flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A879FF]/20 border border-[#A879FF]/50 flex items-center justify-center text-[#A879FF]">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#F5F5F0] font-display uppercase tracking-wider">
                Arcade Focus Duel
              </span>
              <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-[#B5FF55]/20 text-[#B5FF55] border border-[#B5FF55]/40 font-bold">
                +10 XP
              </span>
            </div>
            <p className="text-xs font-mono text-[#A1A1A1]">
              Sharpen your mind with Sudoku, Space Defender, or Pattern Memory between study sprints.
            </p>
          </div>
        </div>

        <button className="px-3.5 py-1.5 rounded-xl bg-[#A879FF] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider brutal-shadow shrink-0">
          Play Arcade →
        </button>
      </div>

      {/* 7. 2-Column Workspace: Left Active Tasks, Right Deadlines & Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks (2 Cols) */}
        {isWidgetEnabled('tasks_list') && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#F5F5F0] font-display uppercase tracking-wider">
                  Today&apos;s Academic Tasks
                </h3>
                <p className="text-xs text-[#A1A1A1] font-mono">{activeQuests.length} tasks planned</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateTask}
                  className="flex items-center gap-1 text-xs font-mono font-bold text-[#B5FF55] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Task</span>
                </button>
                <span className="text-[#303642]">•</span>
                <button
                  onClick={() => setCurrentTab('tasks')}
                  className="flex items-center gap-1 text-xs font-mono text-[#A1A1A1] hover:text-[#F5F5F0] transition-colors"
                >
                  <span>All Tasks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {activeQuests.length > 0 ? (
                activeQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] hover:border-[#B5FF55]/50 transition-all flex items-start justify-between gap-4 brutal-shadow"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() => {
                          sound.playQuestComplete();
                          completeQuest(quest.id);
                        }}
                        className="mt-0.5 text-[#737373] hover:text-[#B5FF55] transition-colors shrink-0"
                        title="Mark Complete"
                      >
                        <Circle className="w-5 h-5" />
                      </button>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
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
                          <span className="text-[10px] font-mono uppercase text-[#737373]">
                            {quest.taskType}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#111319] text-[#B5FF55]">
                            +{quest.xpReward} XP
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-[#F5F5F0] leading-snug">{quest.title}</h4>
                        {quest.description && (
                          <p className="text-[11px] text-[#A1A1A1] font-mono line-clamp-1">{quest.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStartFocus(quest)}
                        className="p-2 rounded-xl bg-[#111319] hover:bg-[#1C2029] text-[#F5F5F0] border border-[#303642] transition-colors"
                        title="Focus sprint on this task"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#F5F5F0]" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-[#171A21] rounded-2xl border border-[#303642] space-y-3 brutal-shadow bg-graph-grid">
                  <div className="w-12 h-12 rounded-xl bg-[#B5FF55]/10 border border-[#B5FF55]/30 text-[#B5FF55] flex items-center justify-center mx-auto">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F5F0] font-display uppercase">
                      No tasks planned yet
                    </h4>
                    <p className="text-xs text-[#A1A1A1] font-mono mt-1 max-w-sm mx-auto">
                      Create your first academic task or explore prebuilt templates for DSA, semester study, or research.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={handleCreateTask}
                      className="px-4 py-2 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-black transition-all brutal-shadow font-display uppercase tracking-wider"
                    >
                      + Add Task
                    </button>
                    <button
                      onClick={() => setActiveModal('templates')}
                      className="px-4 py-2 rounded-xl bg-[#111319] hover:bg-[#1C2029] text-[#F5F5F0] border border-[#303642] text-xs font-mono transition-colors"
                    >
                      Browse Templates
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Rail: Upcoming Deadlines & Course Syllabus */}
        <div className="space-y-4">
          {/* Deadlines Radar Widget */}
          {isWidgetEnabled('deadlines_radar') && (
            <div className="p-5 rounded-2xl bg-[#171A21] border border-[#303642] space-y-3.5 brutal-shadow">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider">
                  Upcoming Deadlines
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddDeadline}
                    className="text-[11px] font-mono text-[#A879FF] hover:underline"
                  >
                    + Add
                  </button>
                  <span className="text-[#303642]">•</span>
                  <button
                    onClick={() => setCurrentTab('planner')}
                    className="text-[11px] font-mono text-[#A1A1A1] hover:text-[#F5F5F0]"
                  >
                    View All
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {deadlines.filter((d) => !d.isCompleted).length > 0 ? (
                  deadlines
                    .filter((d) => !d.isCompleted)
                    .slice(0, 3)
                    .map((d) => (
                      <div key={d.id} className="p-3 rounded-xl bg-[#111319] border border-[#303642] text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#F5F5F0] truncate font-display">{d.title}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#A1A1A1] font-mono">
                          <span style={{ color: d.subjectColorHex }}>{d.subjectCode}</span>
                          <span>
                            {new Date(d.deadlineIso).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 text-center bg-[#111319]/50 rounded-xl border border-[#303642] space-y-2">
                    <p className="text-xs text-[#A1A1A1] font-mono">No upcoming deadlines recorded</p>
                    <button
                      onClick={handleAddDeadline}
                      className="px-3 py-1.5 rounded-lg bg-[#A879FF] text-[#090A0D] text-[11px] font-black transition-all font-display uppercase tracking-wider"
                    >
                      + Add Deadline
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Course Syllabus Widget */}
          {isWidgetEnabled('subjects_tree') && (
            <div className="p-5 rounded-2xl bg-[#171A21] border border-[#303642] space-y-3.5 brutal-shadow">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider">
                  Course Syllabus
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddSubject}
                    className="text-[11px] font-mono text-[#B5FF55] hover:underline"
                  >
                    + Enroll
                  </button>
                  <span className="text-[#303642]">•</span>
                  <button
                    onClick={() => setCurrentTab('subjects')}
                    className="text-[11px] font-mono text-[#A1A1A1] hover:text-[#F5F5F0]"
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {subjects.length > 0 ? (
                  subjects.slice(0, 3).map((s) => (
                    <div key={s.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#F5F5F0] font-mono">{s.code}</span>
                        <span className="font-mono text-[#A1A1A1]">{s.syllabusProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#111319] border border-[#303642] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${s.syllabusProgress}%`, backgroundColor: s.colorHex }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center bg-[#111319]/50 rounded-xl border border-[#303642] space-y-2">
                    <p className="text-xs text-[#A1A1A1] font-mono">No courses enrolled yet</p>
                    <button
                      onClick={handleAddSubject}
                      className="px-3 py-1.5 rounded-lg bg-[#B5FF55] text-[#090A0D] text-[11px] font-black transition-all font-display uppercase tracking-wider"
                    >
                      + Enroll Subject
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 8. Progression Roadmap Visualizer */}
      <AcademicRoadmap />
    </div>
  );
}

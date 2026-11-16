'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { LEVEL_CONFIG } from '@/lib/progressionEngine';
import { AnimatedMobileRoadmap } from '@/components/roadmap/AnimatedMobileRoadmap';
import { InteractiveWalkHeatmap } from '@/components/analytics/InteractiveWalkHeatmap';
import { DailyCheckpoints } from '@/components/goals/DailyCheckpoints';
import { StreakFlameAnimation } from '@/components/animations/StreakFlameAnimation';
import { MobileTaskCreatorModal } from '@/components/quests/MobileTaskCreatorModal';
import { ArcadeHub } from '@/components/arcade/ArcadeHub';
import { QuestlyLogo } from '@/components/common/QuestlyLogo';
import { sound } from '@/common/SoundService';
import { fireCelebrationConfetti } from '@/common/Confetti';
import {
  Compass,
  CheckSquare,
  Gamepad2,
  Zap,
  BarChart3,
  Plus,
  Play,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Circle,
  Trophy,
  Target,
  Volume2,
  VolumeX,
  Wifi,
  Battery,
  Calendar,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Check,
  Trash2,
} from 'lucide-react';

export type MobileAppSection = 'roadmap' | 'checkpoints' | 'tasks' | 'arcade' | 'heatmap';

export function LandingPage() {
  const {
    setMode,
    user,
    streak,
    quests,
    completeQuest,
    reopenQuest,
    createQuest,
    updateQuest,
    toggleSubtask,
    settings,
    updateSettings,
    setCurrentTab,
  } = useQuestly();

  // Active section state - Zero page scrolling, immediate tab transitions
  const [activeSection, setActiveSection] = useState<MobileAppSection>('roadmap');

  // Streak celebration modal state (triggered upon completing a task)
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [lastCompletedTaskTitle, setLastCompletedTaskTitle] = useState('');

  // Task Creator Modal state
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);

  // Expanded task card details state
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [inlineSubtaskInputs, setInlineSubtaskInputs] = useState<Record<string, string>>({});

  // Quick inline task creation state
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Current Level info
  const currentLvlConfig = LEVEL_CONFIG.find((l) => l.level === user.level) || LEVEL_CONFIG[0];

  const handleTabSwitch = (sec: MobileAppSection) => {
    sound.playButtonClick();
    setActiveSection(sec);
  };

  const handleQuickAddQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim()) return;
    sound.playButtonClick();
    createQuest({
      title: newQuestTitle.trim(),
      description: 'Quick task added via Questly Mobile',
      priority: 'MEDIUM',
      difficulty: 'MEDIUM',
      taskType: 'problem_solving',
      subjectCode: 'General',
      subjectId: 'gen',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'NOT_STARTED',
      isRecurring: false,
      subtasks: [],
      estimatedMinutes: 25,
      xpReward: 50,
    });
    setNewQuestTitle('');
  };

  const handleToggleQuest = (questId: string, currentStatus: string, title: string) => {
    if (currentStatus === 'COMPLETED') {
      sound.playButtonClick();
      reopenQuest(questId);
    } else {
      sound.playQuestComplete();
      fireCelebrationConfetti();
      setLastCompletedTaskTitle(title);
      setStreakModalOpen(true);
      completeQuest(questId);
    }
  };

  const handleToggleSubtaskItem = (questId: string, subtaskId: string) => {
    sound.playButtonClick();
    toggleSubtask(questId, subtaskId);
  };

  const handleAddInlineSubtask = (questId: string) => {
    const text = inlineSubtaskInputs[questId]?.trim();
    if (!text) return;
    sound.playButtonClick();

    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    const updatedSubtasks = [
      ...quest.subtasks,
      {
        id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: text,
        isCompleted: false,
      },
    ];

    updateQuest({
      ...quest,
      subtasks: updatedSubtasks,
    });

    setInlineSubtaskInputs((prev) => ({ ...prev, [questId]: '' }));
  };

  const getDeadlineBadge = (dueDate: string | null) => {
    if (!dueDate) return null;
    const today = new Date().toISOString().split('T')[0];

    if (dueDate === today) {
      return {
        label: 'Due Today',
        className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      };
    }
    const diffDays = Math.ceil(
      (new Date(dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) {
      return {
        label: `Overdue by ${Math.abs(diffDays)}d`,
        className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      };
    }
    if (diffDays === 1) {
      return {
        label: 'Due Tomorrow',
        className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      };
    }
    return {
      label: `Due ${dueDate}`,
      className: 'bg-white/5 text-zinc-400 border-white/10',
    };
  };

  const filteredQuests = quests.filter((q) => {
    if (taskFilter === 'pending') return q.status !== 'COMPLETED';
    if (taskFilter === 'completed') return q.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#090A0D] text-[#F5F5F0] overflow-hidden flex flex-col justify-between selection:bg-[#B5FF55] selection:text-[#090A0D]">
      {/* =========================================================================
          1. TOP APP BAR & CLEAN STATUS BAR
         ========================================================================= */}
      <header className="shrink-0 bg-[#0C0E14] border-b border-white/[0.08] z-30">
        {/* Native mobile device simulated top bar */}
        <div className="px-4 py-1 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none">
          <span className="font-semibold text-zinc-300">09:41</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-zinc-400" />
            </span>
            <span className="flex items-center gap-1 font-semibold text-zinc-300">
              <Battery className="w-4 h-4 text-emerald-400" /> 100%
            </span>
          </div>
        </div>

        {/* Brand Bar */}
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          {/* Logo & Scholar Rank */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A1E27] to-[#12151D] border border-white/10 flex items-center justify-center shadow-md">
              <QuestlyLogo size={20} variant="lime" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display font-extrabold text-sm tracking-tight text-white uppercase">
                  Questly
                </span>
                <span className="text-[10px] font-mono font-semibold text-[#B5FF55] px-1.5 py-0.2 rounded-md bg-[#B5FF55]/10 border border-[#B5FF55]/20">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                Level {user.level} • {currentLvlConfig.title}
              </span>
            </div>
          </div>

          {/* Right Header Controls: Streak Pill, XP Pill, Sound & Workspace Switch */}
          <div className="flex items-center gap-2">
            {/* Streak Trigger Pill */}
            <button
              onClick={() => {
                sound.playButtonClick();
                setStreakModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-all text-xs font-mono font-bold text-amber-400 shadow-sm"
              title="View Daily Streak"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak.currentStreak}d</span>
            </button>

            {/* Total XP Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-[#B5FF55]" />
              <span className="font-bold text-white">{user.totalXp}</span>
              <span className="text-[10px] text-zinc-500">XP</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                sound.playButtonClick();
                updateSettings({ soundEnabled: !settings.soundEnabled });
              }}
              className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              title="Toggle audio feedback"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#B5FF55]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Switch to Desktop OS */}
            <button
              onClick={() => {
                sound.playButtonClick();
                setMode('app');
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-black font-extrabold text-xs uppercase tracking-wide transition-all shadow-md"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Quick Access Action Bar */}
        <div className="px-3 py-1.5 bg-[#08090D] border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setCreatorModalOpen(true)}
            className="px-3 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 bg-[#B5FF55] text-black border-[#B5FF55] font-bold text-xs shadow-sm hover:bg-[#A3F040] transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ New Quest & Checkpoints</span>
          </button>

          <button
            onClick={() => handleTabSwitch('checkpoints')}
            className={`px-3 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 transition-all text-xs font-medium ${
              activeSection === 'checkpoints'
                ? 'bg-purple-500 text-white border-purple-500 font-bold'
                : 'bg-white/[0.03] text-zinc-300 border-white/[0.08] hover:border-purple-400'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>Daily Checkpoints</span>
          </button>

          <button
            onClick={() => handleTabSwitch('heatmap')}
            className={`px-3 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 transition-all text-xs font-medium ${
              activeSection === 'heatmap'
                ? 'bg-[#86EFAC] text-black border-[#86EFAC] font-bold'
                : 'bg-white/[0.03] text-zinc-300 border-white/[0.08] hover:border-[#86EFAC]'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Random Walk Heatmap</span>
          </button>

          <button
            onClick={() => handleTabSwitch('arcade')}
            className={`px-3 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 transition-all text-xs font-medium ${
              activeSection === 'arcade'
                ? 'bg-amber-400 text-black border-amber-400 font-bold'
                : 'bg-white/[0.03] text-zinc-300 border-white/[0.08] hover:border-amber-400'
            }`}
          >
            <Gamepad2 className="w-3 h-3" />
            <span>Arcade Duels</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              setMode('app');
            }}
            className="sm:hidden px-2.5 py-1 rounded-lg bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/30 shrink-0 font-bold text-xs"
          >
            Full OS →
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT VIEWPORT (ZERO PAGE SCROLLING - VIEWPORT LOCKED TABS)
         ========================================================================= */}
      <main className="flex-1 min-h-0 relative overflow-hidden bg-[#090A0D]">
        {/* SECTION 1: MAP ANIMATED ROADMAP */}
        {activeSection === 'roadmap' && (
          <div className="h-full w-full animate-in fade-in duration-150">
            <AnimatedMobileRoadmap
              onSelectAction={(action) => {
                if (action === 'tasks') setActiveSection('tasks');
                if (action === 'arcade') setActiveSection('arcade');
                if (action === 'focus') {
                  setMode('app');
                  setCurrentTab('focus');
                }
              }}
            />
          </div>
        )}

        {/* SECTION 2: DAILY GOALS & REAL-TIME CHECKPOINTS */}
        {activeSection === 'checkpoints' && (
          <div className="h-full w-full overflow-y-auto p-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-150">
            <DailyCheckpoints
              onStartFocus={() => {
                setMode('app');
                setCurrentTab('focus');
              }}
              onOpenTasks={() => setActiveSection('tasks')}
            />
          </div>
        )}

        {/* SECTION 3: INTERACTIVE ATOMIC QUEST TO-DO LIST (WITH SUBTASKS & DEADLINES) */}
        {activeSection === 'tasks' && (
          <div className="h-full w-full flex flex-col overflow-hidden p-3 sm:p-5 space-y-3 max-w-xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] shrink-0">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Atomic Quests
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Tap any quest to view descriptions, deadlines, and milestone checkpoints
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.08] text-xs">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    taskFilter === 'all'
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All ({quests.length})
                </button>
                <button
                  onClick={() => setTaskFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    taskFilter === 'pending'
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    taskFilter === 'completed'
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Quick Add Quest Input Form + Creator Trigger */}
            <div className="flex gap-2 shrink-0">
              <form onSubmit={handleQuickAddQuest} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newQuestTitle}
                  onChange={(e) => setNewQuestTitle(e.target.value)}
                  placeholder="Quick add quest title..."
                  className="flex-1 bg-[#12151D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#B5FF55] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newQuestTitle.trim()}
                  className="px-3.5 py-2 bg-[#B5FF55] hover:bg-[#A3F040] disabled:opacity-40 text-black font-extrabold text-xs uppercase tracking-wide rounded-xl shadow-md flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add</span>
                </button>
              </form>

              <button
                type="button"
                onClick={() => setCreatorModalOpen(true)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Full Quest & Checkpoint Creator"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Details</span>
              </button>
            </div>

            {/* Quest Feed */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
              {filteredQuests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#B5FF55]/60" />
                  <span>No quests found. Tap Add or Full Creator above.</span>
                </div>
              ) : (
                filteredQuests.map((quest) => {
                  const isDone = quest.status === 'COMPLETED';
                  const isExpanded = expandedQuestId === quest.id;
                  const deadline = getDeadlineBadge(quest.dueDate);

                  const completedSubtasksCount = quest.subtasks.filter(
                    (s) => s.isCompleted
                  ).length;
                  const totalSubtasksCount = quest.subtasks.length;
                  const subtaskProgressPct =
                    totalSubtasksCount > 0
                      ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100)
                      : 0;

                  return (
                    <div
                      key={quest.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isDone
                          ? 'bg-white/[0.02] border-white/[0.05] opacity-60'
                          : isExpanded
                          ? 'bg-[#11141D] border-[#B5FF55]/40 shadow-lg'
                          : 'bg-[#0E1118] border-white/[0.08] hover:border-white/20 shadow-sm'
                      }`}
                    >
                      {/* Quest Primary Header */}
                      <div className="p-3.5 flex items-start gap-3">
                        {/* Checkbox Button */}
                        <button
                          onClick={() =>
                            handleToggleQuest(quest.id, quest.status, quest.title)
                          }
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            isDone
                              ? 'bg-[#B5FF55] border-[#B5FF55] text-black shadow-sm'
                              : 'border-zinc-700 hover:border-[#B5FF55]'
                          }`}
                          aria-label={`Toggle quest completion: ${quest.title}`}
                        >
                          {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </button>

                        {/* Title and Badges */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() =>
                            setExpandedQuestId(isExpanded ? null : quest.id)
                          }
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-semibold leading-snug truncate ${
                                isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                              }`}
                            >
                              {quest.title}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {deadline && (
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${deadline.className}`}
                                >
                                  {deadline.label}
                                </span>
                              )}
                              <button
                                className="p-0.5 text-zinc-500 hover:text-zinc-300"
                                aria-label="Toggle details"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Secondary Meta Row */}
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
                            <span className="px-1.5 py-0.2 rounded bg-white/[0.04] text-[#B5FF55] font-bold">
                              +{quest.xpReward} XP
                            </span>
                            <span className="text-zinc-500">
                              {quest.subjectCode || 'General'}
                            </span>
                            {totalSubtasksCount > 0 && (
                              <span className="text-purple-300">
                                {completedSubtasksCount}/{totalSubtasksCount} Checkpoints
                              </span>
                            )}
                            {quest.priority === 'URGENT' && (
                              <span className="text-rose-400 font-bold">Urgent</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Section: Description, Subtasks, and Checkpoints */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 pt-1 border-t border-white/[0.06] space-y-3 bg-black/20 text-xs">
                          {/* Task Description */}
                          {quest.description && (
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-mono text-zinc-500 font-semibold tracking-wider">
                                Description & Objective
                              </span>
                              <p className="text-zinc-300 text-xs leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                                {quest.description}
                              </p>
                            </div>
                          )}

                          {/* Subtasks / Milestone Checkpoints */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF55]" />
                                <span>Milestone Checkpoints ({totalSubtasksCount})</span>
                              </span>
                              {totalSubtasksCount > 0 && (
                                <span className="text-[#B5FF55]">
                                  {subtaskProgressPct}% cleared
                                </span>
                              )}
                            </div>

                            {/* Progress bar */}
                            {totalSubtasksCount > 0 && (
                              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-400 to-[#B5FF55] transition-all"
                                  style={{ width: `${subtaskProgressPct}%` }}
                                />
                              </div>
                            )}

                            {/* Subtask items list */}
                            <div className="space-y-1.5">
                              {quest.subtasks.map((st) => (
                                <div
                                  key={st.id}
                                  onClick={() =>
                                    handleToggleSubtaskItem(quest.id, st.id)
                                  }
                                  className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                    st.isCompleted
                                      ? 'bg-emerald-950/20 border-emerald-500/20 text-zinc-400'
                                      : 'bg-white/[0.03] border-white/[0.06] text-zinc-200 hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                        st.isCompleted
                                          ? 'bg-[#B5FF55] border-[#B5FF55] text-black'
                                          : 'border-zinc-600'
                                      }`}
                                    >
                                      {st.isCompleted && (
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      )}
                                    </div>
                                    <span
                                      className={`truncate text-xs ${
                                        st.isCompleted
                                          ? 'line-through text-zinc-500'
                                          : 'text-zinc-200'
                                      }`}
                                    >
                                      {st.title}
                                    </span>
                                  </div>

                                  {st.checkpointTime && (
                                    <span className="text-[10px] font-mono text-amber-400 shrink-0 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                                      {st.checkpointTime}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Inline Add Subtask Input */}
                            <div className="flex gap-1.5 pt-1">
                              <input
                                type="text"
                                value={inlineSubtaskInputs[quest.id] || ''}
                                onChange={(e) =>
                                  setInlineSubtaskInputs((prev) => ({
                                    ...prev,
                                    [quest.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add checkpoint or subtask..."
                                className="flex-1 bg-[#141720] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#B5FF55]"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddInlineSubtask(quest.id);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddInlineSubtask(quest.id)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-[#B5FF55] hover:text-black text-white text-xs font-semibold rounded-xl transition-all"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: QUESTLY ARCADE MINI-GAMES */}
        {activeSection === 'arcade' && (
          <div className="h-full w-full overflow-hidden flex flex-col p-2 sm:p-4 animate-in fade-in duration-150">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ArcadeHub />
            </div>
          </div>
        )}

        {/* SECTION 5: INTERACTIVE 2D RANDOM WALK HEATMAP */}
        {activeSection === 'heatmap' && (
          <div className="h-full w-full overflow-y-auto p-4 max-w-2xl mx-auto space-y-4 animate-in fade-in duration-150">
            <InteractiveWalkHeatmap />
          </div>
        )}
      </main>

      {/* =========================================================================
          3. FIXED BOTTOM MOBILE NAVIGATION DOCK (5 SECTIONS)
         ========================================================================= */}
      <nav className="shrink-0 bg-[#0C0E14]/95 border-t border-white/[0.08] px-2 py-1.5 backdrop-blur-xl z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {/* TAB 1: ROADMAP */}
          <button
            onClick={() => handleTabSwitch('roadmap')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'roadmap'
                ? 'bg-white/[0.06] text-[#B5FF55] font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-mono tracking-tight">Roadmap</span>
            {activeSection === 'roadmap' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-[#B5FF55] rounded-full" />
            )}
          </button>

          {/* TAB 2: CHECKPOINTS */}
          <button
            onClick={() => handleTabSwitch('checkpoints')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'checkpoints'
                ? 'bg-white/[0.06] text-purple-400 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-mono tracking-tight">Goals</span>
            {activeSection === 'checkpoints' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-purple-400 rounded-full" />
            )}
          </button>

          {/* TAB 3: TO-DO */}
          <button
            onClick={() => handleTabSwitch('tasks')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'tasks'
                ? 'bg-white/[0.06] text-[#B5FF55] font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-mono tracking-tight">Quests</span>
            {activeSection === 'tasks' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-[#B5FF55] rounded-full" />
            )}
          </button>

          {/* TAB 4: ARCADE */}
          <button
            onClick={() => handleTabSwitch('arcade')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'arcade'
                ? 'bg-white/[0.06] text-amber-400 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-mono tracking-tight">Arcade</span>
            {activeSection === 'arcade' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          {/* TAB 5: RANDOM WALK HEATMAP */}
          <button
            onClick={() => handleTabSwitch('heatmap')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'heatmap'
                ? 'bg-white/[0.06] text-[#86EFAC] font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-mono tracking-tight">Heatmap</span>
            {activeSection === 'heatmap' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-[#86EFAC] rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* =========================================================================
          4. FULL QUEST & CHECKPOINT CREATOR MODAL
         ========================================================================= */}
      <MobileTaskCreatorModal
        isOpen={creatorModalOpen}
        onClose={() => setCreatorModalOpen(false)}
      />

      {/* =========================================================================
          5. STREAK FLAME CELEBRATION MODAL (LOTTIE FLAME MASTER)
         ========================================================================= */}
      <StreakFlameAnimation
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
        streakCount={streak.currentStreak}
        taskTitle={lastCompletedTaskTitle}
      />
    </div>
  );
}

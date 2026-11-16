'use client';

import React, { useState, useMemo } from 'react';
import { useQuestly } from '@/lib/store';
import { LEVEL_CONFIG } from '@/lib/progressionEngine';
import { AnimatedMobileRoadmap } from '@/components/roadmap/AnimatedMobileRoadmap';
import { InteractiveWalkHeatmap } from '@/components/analytics/InteractiveWalkHeatmap';
import { DailyCheckpoints } from '@/components/goals/DailyCheckpoints';
import { StreakFlameAnimation } from '@/components/animations/StreakFlameAnimation';
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
  Shield,
  Layers,
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
    focusSessions,
    settings,
    updateSettings,
    setCurrentTab,
  } = useQuestly();

  // Active section state - Zero page scrolling, immediate tab transitions
  const [activeSection, setActiveSection] = useState<MobileAppSection>('roadmap');

  // Streak celebration modal state (triggered upon completing a task)
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [lastCompletedTaskTitle, setLastCompletedTaskTitle] = useState('');

  // Task creation and filter state
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Current Level info
  const currentLvlConfig = LEVEL_CONFIG.find((l) => l.level === user.level) || LEVEL_CONFIG[0];
  const levelProgressPercent = Math.min(
    100,
    Math.round((user.currentXp / Math.max(1, user.nextLevelXp)) * 100)
  );

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

  const filteredQuests = quests.filter((q) => {
    if (taskFilter === 'pending') return q.status !== 'COMPLETED';
    if (taskFilter === 'completed') return q.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#090A0D] text-[#F5F5F0] overflow-hidden flex flex-col justify-between selection:bg-[#B5FF55] selection:text-[#090A0D]">
      {/* =========================================================================
          1. TOP APP BAR & CLEAN STATUS BAR (TASTE-SKILL POLISHED, NO ROBOT SLOP)
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
            {/* Streak Trigger Pill (Click to preview streak flame) */}
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
            onClick={() => handleTabSwitch('tasks')}
            className={`px-3 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 transition-all text-xs font-medium ${
              activeSection === 'tasks'
                ? 'bg-[#B5FF55] text-black border-[#B5FF55] font-bold'
                : 'bg-white/[0.03] text-zinc-300 border-white/[0.08] hover:border-[#B5FF55]'
            }`}
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>New Quest</span>
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

        {/* SECTION 3: INTERACTIVE ATOMIC QUEST TO-DO LIST */}
        {activeSection === 'tasks' && (
          <div className="h-full w-full flex flex-col overflow-hidden p-3 sm:p-5 space-y-3 max-w-xl mx-auto animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] shrink-0">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Atomic Quests
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Complete tasks to trigger streak fire and verified XP
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

            {/* Quick Add Quest Input Form */}
            <form onSubmit={handleQuickAddQuest} className="flex gap-2 shrink-0">
              <input
                type="text"
                value={newQuestTitle}
                onChange={(e) => setNewQuestTitle(e.target.value)}
                placeholder="Add a new academic quest..."
                className="flex-1 bg-[#12151D] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#B5FF55] transition-colors"
              />
              <button
                type="submit"
                disabled={!newQuestTitle.trim()}
                className="px-4 py-2.5 bg-[#B5FF55] hover:bg-[#A3F040] disabled:opacity-40 text-black font-extrabold text-xs uppercase tracking-wide rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add</span>
              </button>
            </form>

            {/* Quest Feed */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {filteredQuests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#B5FF55]/60" />
                  <span>Queue clear. Tap Add above to create your next quest.</span>
                </div>
              ) : (
                filteredQuests.map((quest) => {
                  const isDone = quest.status === 'COMPLETED';

                  return (
                    <div
                      key={quest.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isDone
                          ? 'bg-white/[0.02] border-white/[0.05] opacity-60'
                          : 'bg-[#0E1118] border-white/[0.08] hover:border-[#B5FF55]/40 shadow-sm'
                      }`}
                    >
                      {/* Checkbox Button */}
                      <button
                        onClick={() => handleToggleQuest(quest.id, quest.status, quest.title)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#B5FF55] border-[#B5FF55] text-black shadow-sm'
                            : 'border-zinc-700 hover:border-[#B5FF55]'
                        }`}
                        aria-label={`Toggle quest completion: ${quest.title}`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </button>

                      {/* Quest Title & Meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-xs font-semibold leading-snug ${
                              isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                            }`}
                          >
                            {quest.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                          <span className="px-1.5 py-0.2 rounded bg-white/[0.04] text-[#B5FF55] font-bold">
                            +{quest.xpReward} XP
                          </span>
                          <span className="text-zinc-500">{quest.subjectCode || 'General'}</span>
                          {quest.priority === 'URGENT' && (
                            <span className="text-rose-400 font-bold">Urgent</span>
                          )}
                        </div>
                      </div>
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
          4. STREAK FLAME CELEBRATION MODAL (LOTTIE FLAME MASTER)
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

'use client';

import React, { useState, useMemo } from 'react';
import { useQuestly } from '@/lib/store';
import { LEVEL_CONFIG } from '@/lib/progressionEngine';
import { AnimatedMobileRoadmap } from '@/components/roadmap/AnimatedMobileRoadmap';
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
  Activity,
  Layers,
  Smartphone,
  ExternalLink,
  Volume2,
  VolumeX,
  Calendar,
  AlertCircle,
  Tag,
  Wifi,
  BatteryCharging,
} from 'lucide-react';

export type MobileAppSection = 'roadmap' | 'tasks' | 'arcade' | 'xp' | 'heatmap';

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
    activityHistory,
    settings,
    updateSettings,
    xpTransactions,
    setActiveModal,
    setSelectedQuest,
    setCurrentTab,
  } = useQuestly();

  // Active section state - NO SCROLLING, purely clickable tab/section switching
  const [activeSection, setActiveSection] = useState<MobileAppSection>('roadmap');

  // Quick inline task creation state
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Heatmap and analytics computations
  const totalCompletedQuests = quests.filter((q) => q.status === 'COMPLETED').length;
  const totalQuests = quests.length;
  const completionRatePercent = totalQuests > 0 ? Math.round((totalCompletedQuests / totalQuests) * 100) : 0;
  const totalFocusMinutes = focusSessions.reduce((acc, fs) => acc + Math.floor(fs.elapsedSeconds / 60), 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  const last7Days = useMemo(() => activityHistory.slice(-7), [activityHistory]);
  const weeklyFocusMinutes = last7Days.reduce((acc, d) => acc + d.focusMinutes, 0);
  const maxFocusMin = Math.max(60, ...last7Days.map((d) => d.focusMinutes));

  // Current Level info
  const currentLvlConfig = LEVEL_CONFIG.find((l) => l.level === user.level) || LEVEL_CONFIG[0];
  const nextLvlConfig = LEVEL_CONFIG.find((l) => l.level === user.level + 1) || null;
  const xpNeeded = user.nextLevelXp - user.currentXp;
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
      description: 'Created via Questly Mobile Quick Add',
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

  const handleToggleQuest = (questId: string, currentStatus: string) => {
    if (currentStatus === 'COMPLETED') {
      sound.playButtonClick();
      reopenQuest(questId);
    } else {
      sound.playQuestComplete();
      fireCelebrationConfetti();
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
          1. TOP APP BAR & TACTICAL STATUS BAR (MOBILE NOTCH / STATUS SIMULATION)
         ========================================================================= */}
      <header className="shrink-0 bg-[#0E1015] border-b border-[#303642] z-30">
        {/* Native Mobile Status Bar simulation */}
        <div className="px-4 py-1 bg-[#090A0D] border-b border-[#202530] flex items-center justify-between text-[10px] font-mono text-[#777]">
          <div className="flex items-center gap-2">
            <span className="text-[#B5FF55] font-bold">[SYS: ONLINE]</span>
            <span className="hidden sm:inline">[PKG: com.questly.mobile]</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#42DFFF]">
              <Wifi className="w-3 h-3" /> 5G
            </span>
            <span className="flex items-center gap-1 text-[#B5FF55]">
              <BatteryCharging className="w-3 h-3" /> 100%
            </span>
          </div>
        </div>

        {/* Brand & Action Header */}
        <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Brand Logo & APK Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#171A21] border border-[#303642] flex items-center justify-center brutal-shadow">
              <QuestlyLogo size={20} variant="lime" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display font-black text-sm tracking-tight uppercase">
                  QUESTLY
                </span>
                <span className="text-[9px] font-mono font-bold text-[#B5FF55] px-1 py-0.2 rounded bg-[#B5FF55]/15 border border-[#B5FF55]/30">
                  APK v2.0
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#A1A1A1] block">
                [DIV: MOBILE_OS_SHELL]
              </span>
            </div>
          </div>

          {/* Right Header Controls: XP Pill, Streak, and Full Mode Launcher */}
          <div className="flex items-center gap-2">
            {/* Clickable XP Gauge Pill */}
            <button
              onClick={() => handleTabSwitch('xp')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#171A21] border border-[#303642] hover:border-[#B5FF55] transition-all text-xs font-mono"
              title="View XP Progression"
            >
              <Zap className="w-3.5 h-3.5 text-[#B5FF55]" />
              <span className="font-bold text-[#F5F5F0]">{user.totalXp}</span>
              <span className="text-[9px] text-[#A1A1A1]">XP</span>
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FF9C45]/15 border border-[#FF9C45]/30 text-xs font-mono font-bold text-[#FF9C45]">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak.currentStreak}d</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                sound.playButtonClick();
                updateSettings({ soundEnabled: !settings.soundEnabled });
              }}
              className="p-1.5 rounded-lg bg-[#171A21] border border-[#303642] text-[#A1A1A1] hover:text-[#F5F5F0]"
              title="Toggle Audio Feedback"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#B5FF55]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            {/* CTA Button: Launch Full Workspace */}
            <button
              onClick={() => {
                sound.playButtonClick();
                setMode('app');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] font-black text-xs uppercase tracking-wider font-display brutal-shadow transition-all"
            >
              <span>[OPEN WORKSPACE]</span>
              <ArrowRight className="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Quick Action CTA Pill Bar */}
        <div className="px-3 py-1.5 bg-[#14171F] border-t border-[#252A34] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-mono">
          <span className="text-[10px] text-[#A1A1A1] font-bold uppercase shrink-0">
            [ACTIONS]:
          </span>

          <button
            onClick={() => handleTabSwitch('tasks')}
            className={`px-2.5 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 transition-all ${
              activeSection === 'tasks'
                ? 'bg-[#B5FF55] text-[#090A0D] border-[#B5FF55] font-bold'
                : 'bg-[#1C2029] text-[#F5F5F0] border-[#303642] hover:border-[#B5FF55]'
            }`}
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>[+ NEW QUEST]</span>
          </button>

          <button
            onClick={() => handleTabSwitch('arcade')}
            className={`px-2.5 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 transition-all ${
              activeSection === 'arcade'
                ? 'bg-[#A879FF] text-[#090A0D] border-[#A879FF] font-bold'
                : 'bg-[#1C2029] text-[#F5F5F0] border-[#303642] hover:border-[#A879FF]'
            }`}
          >
            <Gamepad2 className="w-3 h-3" />
            <span>[PLAY DUEL]</span>
          </button>

          <button
            onClick={() => handleTabSwitch('roadmap')}
            className={`px-2.5 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 transition-all ${
              activeSection === 'roadmap'
                ? 'bg-[#42DFFF] text-[#090A0D] border-[#42DFFF] font-bold'
                : 'bg-[#1C2029] text-[#F5F5F0] border-[#303642] hover:border-[#42DFFF]'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>[MAP VIEW]</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              setMode('app');
            }}
            className="sm:hidden px-2.5 py-1 rounded-lg bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/30 shrink-0 flex items-center gap-1 font-bold"
          >
            <span>[FULL OS →]</span>
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
                if (action === 'xp') setActiveSection('xp');
                if (action === 'focus') {
                  setMode('app');
                  setCurrentTab('focus');
                }
              }}
            />
          </div>
        )}

        {/* SECTION 2: INTERACTIVE TO-DO LIST (ATOMIC QUESTS) */}
        {activeSection === 'tasks' && (
          <div className="h-full w-full flex flex-col overflow-hidden p-3 sm:p-4 space-y-3 animate-in fade-in duration-150">
            {/* Header & Markings */}
            <div className="flex items-center justify-between pb-2 border-b border-[#303642] shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/30">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#B5FF55] font-bold">
                    [SEC: 02_TASK_LEDGER]
                  </div>
                  <h3 className="text-base font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                    Atomic Quest List
                  </h3>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-[#171A21] p-1 rounded-lg border border-[#303642] text-[10px] font-mono">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2 py-0.5 rounded ${
                    taskFilter === 'all'
                      ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                      : 'text-[#A1A1A1]'
                  }`}
                >
                  ALL ({quests.length})
                </button>
                <button
                  onClick={() => setTaskFilter('pending')}
                  className={`px-2 py-0.5 rounded ${
                    taskFilter === 'pending'
                      ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                      : 'text-[#A1A1A1]'
                  }`}
                >
                  ACTIVE
                </button>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-2 py-0.5 rounded ${
                    taskFilter === 'completed'
                      ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                      : 'text-[#A1A1A1]'
                  }`}
                >
                  DONE
                </button>
              </div>
            </div>

            {/* Quick Add Quest Input Form */}
            <form onSubmit={handleQuickAddQuest} className="flex gap-2 shrink-0">
              <input
                type="text"
                value={newQuestTitle}
                onChange={(e) => setNewQuestTitle(e.target.value)}
                placeholder="[+ ADD NEW QUEST] Enter title..."
                className="flex-1 bg-[#171A21] border border-[#303642] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5F0] placeholder:text-[#666] focus:outline-none focus:border-[#B5FF55]"
              />
              <button
                type="submit"
                disabled={!newQuestTitle.trim()}
                className="px-4 py-2 bg-[#B5FF55] hover:bg-[#A3F040] disabled:opacity-40 text-[#090A0D] font-black text-xs font-display uppercase tracking-wider rounded-xl brutal-shadow flex items-center gap-1"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>ADD</span>
              </button>
            </form>

            {/* Scrollable Quest Feed */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {filteredQuests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 font-mono text-xs text-[#A1A1A1]">
                  <CheckCircle2 className="w-8 h-8 text-[#B5FF55]" />
                  <span>[QUEUE_EMPTY] All clear! Add a new quest above.</span>
                </div>
              ) : (
                filteredQuests.map((quest) => {
                  const isDone = quest.status === 'COMPLETED';

                  return (
                    <div
                      key={quest.id}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isDone
                          ? 'bg-[#111319]/60 border-[#252A34] opacity-60'
                          : 'bg-[#171A21] border-[#303642] hover:border-[#B5FF55]'
                      }`}
                    >
                      {/* Checkbox Button */}
                      <button
                        onClick={() => handleToggleQuest(quest.id, quest.status)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#B5FF55] border-[#B5FF55] text-[#090A0D]'
                            : 'border-[#454D5D] hover:border-[#B5FF55]'
                        }`}
                        aria-label={`Toggle quest completion: ${quest.title}`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </button>

                      {/* Quest Title & Meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-xs font-bold leading-snug ${
                              isDone ? 'line-through text-[#888]' : 'text-[#F5F5F0]'
                            }`}
                          >
                            {quest.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1A1]">
                          <span className="px-1.5 py-0.2 rounded bg-[#0E1015] border border-[#252A34] text-[#B5FF55] font-bold">
                            +{quest.xpReward} XP
                          </span>
                          <span className="text-[#888]">{quest.subjectCode || 'General'}</span>
                          {quest.priority === 'URGENT' && (
                            <span className="text-[#FF806B] font-bold">[URGENT]</span>
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

        {/* SECTION 3: QUESTLY ARCADE (MATH DUELS, SUDOKU, SPACE DEFENDER) */}
        {activeSection === 'arcade' && (
          <div className="h-full w-full overflow-hidden flex flex-col p-2 sm:p-3 animate-in fade-in duration-150">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ArcadeHub />
            </div>
          </div>
        )}

        {/* SECTION 4: XP METER & IDEMPOTENT TRANSACTION LEDGER */}
        {activeSection === 'xp' && (
          <div className="h-full w-full flex flex-col overflow-y-auto p-4 space-y-4 animate-in fade-in duration-150 font-mono">
            {/* Header */}
            <div className="pb-3 border-b border-[#303642] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/30">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-[#B5FF55] font-bold">[SEC: 04_XP_METRICS]</div>
                  <h3 className="text-base font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                    Verified XP Ledger
                  </h3>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#171A21] border border-[#303642] text-[#B5FF55]">
                LEDGER ACTIVE
              </span>
            </div>

            {/* Big Interactive XP Card */}
            <div className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] brutal-shadow space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#A1A1A1] uppercase">[CURRENT_RANK]</span>
                  <div className="text-lg font-black font-display text-[#F5F5F0] uppercase">
                    {currentLvlConfig.title}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-[#B5FF55] text-[#090A0D] font-black text-sm">
                  LVL {user.level}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#B5FF55] font-bold">{user.currentXp} XP</span>
                  <span className="text-[#A1A1A1]">Target: {user.nextLevelXp} XP</span>
                </div>
                <div className="w-full h-3 bg-[#0E1015] rounded-full border border-[#303642] overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#B5FF55] to-[#42DFFF] rounded-full transition-all duration-500"
                    style={{ width: `${levelProgressPercent}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-[#A1A1A1]">
                  {xpNeeded > 0 ? `${xpNeeded} XP to Level ${user.level + 1}` : 'Max Level Cleared!'}
                </div>
              </div>

              {/* Unlocked Perk */}
              <div className="p-2.5 rounded-xl bg-[#0E1015] border border-[#252A34] text-[11px] text-[#C5C5C0] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B5FF55] shrink-0" />
                <span>Unlock: {currentLvlConfig.unlockDescription}</span>
              </div>
            </div>

            {/* Immutable Transaction History Preview */}
            <div className="space-y-2 flex-1">
              <div className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-wider">
                [IDEMPOTENT_TRANSACTION_HISTORY]
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {xpTransactions.slice(0, 8).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2 rounded-lg bg-[#111319] border border-[#252A34] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF55]" />
                      <span className="text-[#E0E0E0] truncate max-w-[180px]">
                        {tx.sourceEvent.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[#B5FF55] font-bold shrink-0">+{tx.xpAmount} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: PROGRESS TRACKER & STUDY HEATMAPS */}
        {activeSection === 'heatmap' && (
          <div className="h-full w-full flex flex-col overflow-y-auto p-4 space-y-4 animate-in fade-in duration-150 font-mono">
            {/* Header */}
            <div className="pb-3 border-b border-[#303642] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#42DFFF]/15 text-[#42DFFF] border border-[#42DFFF]/30">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-[#42DFFF] font-bold">[SEC: 05_ANALYTICS]</div>
                  <h3 className="text-base font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                    Progress & Study Heatmap
                  </h3>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#171A21] border border-[#303642] text-[#42DFFF]">
                {completionRatePercent}% COMPLETION
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#171A21] border border-[#303642]">
                <div className="text-sm font-black text-[#B5FF55]">{totalCompletedQuests}</div>
                <div className="text-[9px] text-[#A1A1A1] uppercase">[QUESTS DONE]</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#171A21] border border-[#303642]">
                <div className="text-sm font-black text-[#42DFFF]">{totalFocusHours}h</div>
                <div className="text-[9px] text-[#A1A1A1] uppercase">[TOTAL FLOW]</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#171A21] border border-[#303642]">
                <div className="text-sm font-black text-[#FF9C45]">{streak.currentStreak}d</div>
                <div className="text-[9px] text-[#A1A1A1] uppercase">[STREAK]</div>
              </div>
            </div>

            {/* 30-Day Activity Heatmap Grid */}
            <div className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#F5F5F0] uppercase">
                  [ACADEMIC_ACTIVITY_HEATMAP]
                </span>
                <span className="text-[10px] text-[#A1A1A1]">30-Day Velocity</span>
              </div>

              {/* 5-Week Heatmap Matrix */}
              <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#0E1015] rounded-xl border border-[#252A34]">
                {activityHistory.slice(-28).map((day, idx) => {
                  const mins = day.focusMinutes;
                  const intensityClass =
                    mins >= 90
                      ? 'bg-[#B5FF55] shadow-[0_0_8px_rgba(181,255,85,0.4)]'
                      : mins >= 45
                      ? 'bg-[#7BC926]'
                      : mins >= 15
                      ? 'bg-[#437213]'
                      : mins > 0
                      ? 'bg-[#25420A]'
                      : 'bg-[#181D26]';

                  return (
                    <div
                      key={day.date + idx}
                      className={`h-7 rounded flex items-center justify-center text-[9px] font-bold transition-all ${intensityClass} ${
                        mins > 45 ? 'text-[#090A0D]' : 'text-[#888]'
                      }`}
                      title={`${day.date}: ${mins} min focus`}
                    >
                      {mins > 0 ? `${mins}m` : ''}
                    </div>
                  );
                })}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-end gap-1.5 text-[9px] text-[#A1A1A1]">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded bg-[#181D26]" />
                <span className="w-2.5 h-2.5 rounded bg-[#25420A]" />
                <span className="w-2.5 h-2.5 rounded bg-[#437213]" />
                <span className="w-2.5 h-2.5 rounded bg-[#7BC926]" />
                <span className="w-2.5 h-2.5 rounded bg-[#B5FF55]" />
                <span>More</span>
              </div>
            </div>

            {/* 7-Day Volume Bar Chart */}
            <div className="p-3.5 rounded-xl bg-[#171A21] border border-[#303642] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#F5F5F0]">[7-DAY VOLUME]</span>
                <span className="text-[#A1A1A1]">{weeklyFocusMinutes}m Total</span>
              </div>
              <div className="h-24 flex items-end justify-between gap-1.5 pt-2">
                {last7Days.map((d) => {
                  const pct = Math.max(8, Math.min(100, Math.round((d.focusMinutes / maxFocusMin) * 100)));
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-[#0E1015] rounded-t h-16 flex items-end">
                        <div
                          className="w-full bg-[#42DFFF] rounded-t transition-all"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-[#777]">
                        {new Date(d.date).toLocaleDateString(undefined, { weekday: 'narrow' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          3. FIXED BOTTOM MOBILE NAVIGATION DOCK (5 CLEARLY MARKED APP SECTIONS)
         ========================================================================= */}
      <nav className="shrink-0 bg-[#0E1015]/95 border-t border-[#303642] px-2 py-1.5 backdrop-blur-xl z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
          {/* TAB 1: ROADMAP */}
          <button
            onClick={() => handleTabSwitch('roadmap')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'roadmap'
                ? 'bg-[#171A21] text-[#B5FF55] border border-[#B5FF55]/40 shadow-[0_0_12px_rgba(181,255,85,0.15)]'
                : 'text-[#A1A1A1] hover:text-[#F5F5F0]'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono font-black uppercase tracking-tight">
              ROADMAP
            </span>
            {activeSection === 'roadmap' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-[#B5FF55] rounded-full" />
            )}
          </button>

          {/* TAB 2: TO-DO */}
          <button
            onClick={() => handleTabSwitch('tasks')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'tasks'
                ? 'bg-[#171A21] text-[#B5FF55] border border-[#B5FF55]/40 shadow-[0_0_12px_rgba(181,255,85,0.15)]'
                : 'text-[#A1A1A1] hover:text-[#F5F5F0]'
            }`}
          >
            <CheckSquare className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono font-black uppercase tracking-tight">
              TO-DO
            </span>
            {activeSection === 'tasks' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-[#B5FF55] rounded-full" />
            )}
          </button>

          {/* TAB 3: ARCADE */}
          <button
            onClick={() => handleTabSwitch('arcade')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'arcade'
                ? 'bg-[#171A21] text-[#A879FF] border border-[#A879FF]/40 shadow-[0_0_12px_rgba(168,121,255,0.15)]'
                : 'text-[#A1A1A1] hover:text-[#F5F5F0]'
            }`}
          >
            <Gamepad2 className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono font-black uppercase tracking-tight">
              ARCADE
            </span>
            {activeSection === 'arcade' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-[#A879FF] rounded-full" />
            )}
          </button>

          {/* TAB 4: XP METER */}
          <button
            onClick={() => handleTabSwitch('xp')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'xp'
                ? 'bg-[#171A21] text-[#FF9C45] border border-[#FF9C45]/40 shadow-[0_0_12px_rgba(255,156,69,0.15)]'
                : 'text-[#A1A1A1] hover:text-[#F5F5F0]'
            }`}
          >
            <Zap className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono font-black uppercase tracking-tight">
              XP METER
            </span>
            {activeSection === 'xp' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-[#FF9C45] rounded-full" />
            )}
          </button>

          {/* TAB 5: HEATMAP */}
          <button
            onClick={() => handleTabSwitch('heatmap')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeSection === 'heatmap'
                ? 'bg-[#171A21] text-[#42DFFF] border border-[#42DFFF]/40 shadow-[0_0_12px_rgba(66,223,255,0.15)]'
                : 'text-[#A1A1A1] hover:text-[#F5F5F0]'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono font-black uppercase tracking-tight">
              HEATMAP
            </span>
            {activeSection === 'heatmap' && (
              <span className="absolute -bottom-1 w-2 h-0.5 bg-[#42DFFF] rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

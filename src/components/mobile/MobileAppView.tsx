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
  ExternalLink,
} from 'lucide-react';

export type MobileAppSection = 'roadmap' | 'checkpoints' | 'tasks' | 'arcade' | 'heatmap';

export function MobileAppView() {
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

  const [activeSection, setActiveSection] = useState<MobileAppSection>('roadmap');
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [celebratingTask, setCelebratingTask] = useState<{ title: string; xp: number } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'active' | 'completed'>('active');
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);

  // Toggle quest completion with sound, XP, and streak flame celebration
  const handleToggleQuest = (questId: string, currentStatus: string) => {
    const isCompleted = currentStatus === 'COMPLETED';
    if (isCompleted) {
      sound.playButtonClick();
      reopenQuest(questId);
    } else {
      sound.playQuestComplete();
      fireCelebrationConfetti();
      const q = quests.find((item) => item.id === questId);
      completeQuest(questId);
      if (q) {
        setCelebratingTask({
          title: q.title,
          xp: q.xpReward || 50,
        });
      }
    }
  };

  const activeQuests = quests.filter((q) => q.status !== 'COMPLETED');
  const completedQuests = quests.filter((q) => q.status === 'COMPLETED');
  const displayedQuests =
    filterType === 'all' ? quests : filterType === 'active' ? activeQuests : completedQuests;

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full max-w-md mx-auto bg-[#090A0D] text-[#F5F5F0] flex flex-col justify-between overflow-hidden relative select-none font-sans border-x border-[#303642]/40 shadow-2xl">
      {/* 1. Mobile Status Bar (Simulated Native App Header) */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between text-[11px] font-mono text-[#A1A1A1] border-b border-[#303642]/40 bg-[#090A0D]/95 shrink-0 z-30">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#F5F5F0]">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B5FF55] animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#FF806B]">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold text-[#F5F5F0]">{streak.currentStreak}d</span>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              updateSettings({ soundEnabled: !settings.soundEnabled });
            }}
            className="hover:text-white transition-colors"
            title="Toggle Sound"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#B5FF55]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </button>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-zinc-400" />
            <Battery className="w-3.5 h-3.5 text-[#B5FF55]" />
          </div>
        </div>
      </div>

      {/* 2. Brand Bar with Logo & Level Pill */}
      <div className="px-4 py-2.5 bg-[#111319] border-b border-[#303642] flex items-center justify-between shrink-0 z-20">
        <button
          onClick={() => {
            sound.playButtonClick();
            setMode('landing');
          }}
          className="flex items-center gap-2 text-left group"
          title="Return to Landing Page"
        >
          <div className="w-7 h-7 rounded-lg bg-[#171A21] border border-[#303642] flex items-center justify-center group-hover:border-[#B5FF55] transition-colors">
            <QuestlyLogo size={18} variant="lime" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-sm tracking-tight text-[#F5F5F0] font-display uppercase">
                Questly
              </span>
              <span className="text-[9px] font-mono font-bold text-[#B5FF55] px-1 py-0.2 rounded bg-[#B5FF55]/10 border border-[#B5FF55]/30">
                APP
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              L{user.level} {user.academicRank}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Add Quest Button */}
          <button
            onClick={() => {
              sound.playButtonClick();
              setShowTaskModal(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Task</span>
          </button>

          {/* Return to Landing button */}
          <button
            onClick={() => {
              sound.playButtonClick();
              setMode('landing');
            }}
            className="p-1.5 rounded-lg bg-[#171A21] border border-[#303642] text-zinc-400 hover:text-white text-xs transition-colors"
            title="Landing Page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main Section Viewport */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#090A0D] p-3">
        {/* SECTION 1: ANIMATED ROADMAP */}
        {activeSection === 'roadmap' && (
          <div className="h-full flex flex-col justify-between">
            <AnimatedMobileRoadmap
              onOpenTaskModal={() => setShowTaskModal(true)}
              onSelectAction={(action) => {
                if (action === 'tasks') setActiveSection('tasks');
                if (action === 'arcade') setActiveSection('arcade');
                if (action === 'focus') {
                  setCurrentTab('focus');
                }
              }}
            />
          </div>
        )}

        {/* SECTION 2: DAILY CHECKPOINTS */}
        {activeSection === 'checkpoints' && (
          <div className="space-y-4">
            <DailyCheckpoints
              onStartFocus={() => setCurrentTab('focus')}
              onOpenTasks={() => setActiveSection('tasks')}
            />
          </div>
        )}

        {/* SECTION 3: ATOMIC TASKS & CHECKLISTS */}
        {activeSection === 'tasks' && (
          <div className="space-y-3 pb-6">
            {/* Filter pills */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-[#111319] p-1 rounded-xl border border-[#303642]">
                {(['active', 'all', 'completed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      sound.playButtonClick();
                      setFilterType(filter);
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                      filterType === filter
                        ? 'bg-[#B5FF55] text-[#090A0D]'
                        : 'text-[#A1A1A1] hover:text-[#F5F5F0]'
                    }`}
                  >
                    {filter}
                    <span className="ml-1 opacity-70">
                      (
                      {filter === 'active'
                        ? activeQuests.length
                        : filter === 'completed'
                        ? completedQuests.length
                        : quests.length}
                      )
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  sound.playButtonClick();
                  setShowTaskModal(true);
                }}
                className="p-2 rounded-xl bg-[#B5FF55] text-[#090A0D] hover:bg-[#A3F040] transition-colors"
                title="Create Task"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Quests List or Empty Zero-State */}
            {displayedQuests.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#111319] border border-dashed border-[#303642] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#171A21] border border-[#303642] mx-auto flex items-center justify-center text-zinc-400">
                  <CheckSquare className="w-6 h-6 text-[#B5FF55]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">No tasks in this view</h4>
                  <p className="text-xs text-zinc-500 font-mono mt-1 max-w-xs mx-auto">
                    {filterType === 'completed'
                      ? 'No completed tasks yet. Finish a quest to earn XP and light the flame!'
                      : 'Take control of your coursework. Add atomic tasks with subtasks and deadlines.'}
                  </p>
                </div>
                {filterType !== 'completed' && (
                  <button
                    onClick={() => {
                      sound.playButtonClick();
                      setShowTaskModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#B5FF55] text-[#090A0D] font-black text-xs uppercase font-display tracking-wider hover:bg-[#A3F040] transition-colors"
                  >
                    + Create First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {displayedQuests.map((quest) => {
                  const isExpanded = expandedQuestId === quest.id;
                  const isCompleted = quest.status === 'COMPLETED';
                  const subtasks = quest.subtasks || [];
                  const completedSubtasks = subtasks.filter((s) => s.isCompleted).length;

                  return (
                    <div
                      key={quest.id}
                      className={`rounded-2xl border transition-all ${
                        isCompleted
                          ? 'bg-[#111319]/60 border-[#303642]/60 opacity-75'
                          : 'bg-[#111319] border-[#303642] hover:border-zinc-500'
                      }`}
                    >
                      {/* Main Task Row */}
                      <div className="p-3.5 flex items-start justify-between gap-3">
                        <button
                          onClick={() => handleToggleQuest(quest.id, quest.status)}
                          className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                            isCompleted
                              ? 'bg-[#B5FF55] border-[#B5FF55] text-[#090A0D]'
                              : 'border-white/20 hover:border-[#B5FF55] text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold truncate ${
                                isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                              }`}
                            >
                              {quest.title}
                            </span>
                          </div>

                          {/* Badges: Due Date, Priority, Subtasks count */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] font-mono">
                            {quest.dueDate && (
                              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5 text-[#B5FF55]" />
                                <span>{quest.dueDate}</span>
                              </span>
                            )}

                            <span
                              className={`px-1.5 py-0.5 rounded uppercase font-bold ${
                                quest.priority === 'HIGH'
                                  ? 'bg-red-950/60 text-red-300 border border-red-800'
                                  : quest.priority === 'MEDIUM'
                                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              {quest.priority}
                            </span>

                            {subtasks.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                                {completedSubtasks}/{subtasks.length} Subtasks
                              </span>
                            )}
                          </div>
                        </div>

                        {/* XP Reward & Expand Toggle */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] font-mono font-bold text-[#B5FF55] px-1.5 py-0.5 rounded bg-[#B5FF55]/10 border border-[#B5FF55]/20">
                            +{quest.xpReward} XP
                          </span>
                          {(quest.description || subtasks.length > 0) && (
                            <button
                              onClick={() => setExpandedQuestId(isExpanded ? null : quest.id)}
                              className="p-1 rounded text-zinc-500 hover:text-white"
                              aria-label="Expand task details"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Subtasks & Description */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 pt-1 border-t border-[#303642]/60 space-y-2 text-xs">
                          {quest.description && (
                            <p className="text-zinc-400 text-[11px] leading-relaxed">
                              {quest.description}
                            </p>
                          )}

                          {subtasks.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                                Subtask Checkpoints:
                              </span>
                              {subtasks.map((st) => (
                                <div
                                  key={st.id}
                                  onClick={() => toggleSubtask(quest.id, st.id)}
                                  className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/[0.05] hover:border-white/[0.1] cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                        st.isCompleted
                                          ? 'bg-[#B5FF55] border-[#B5FF55] text-[#090A0D]'
                                          : 'border-white/30 text-transparent'
                                      }`}
                                    >
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                    <span
                                      className={`truncate text-[11px] ${
                                        st.isCompleted
                                          ? 'line-through text-zinc-500'
                                          : 'text-zinc-300'
                                      }`}
                                    >
                                      {st.title}
                                    </span>
                                  </div>
                                  {st.checkpointTime && (
                                    <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                                      {st.checkpointTime}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: INTERACTIVE RANDOM WALK HEATMAP */}
        {activeSection === 'heatmap' && (
          <div className="space-y-4">
            <InteractiveWalkHeatmap />
          </div>
        )}

        {/* SECTION 5: ARCADE HUB */}
        {activeSection === 'arcade' && (
          <div className="space-y-4">
            <ArcadeHub />
          </div>
        )}
      </div>

      {/* 4. Bottom Tab Bar Navigation */}
      <div className="p-2 bg-[#111319]/95 border-t border-[#303642] backdrop-blur-lg shrink-0 z-20">
        <div className="grid grid-cols-5 gap-1 text-center">
          {/* Roadmap */}
          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveSection('roadmap');
            }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeSection === 'roadmap'
                ? 'bg-[#B5FF55] text-[#090A0D] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-tight">Roadmap</span>
          </button>

          {/* Checkpoints */}
          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveSection('checkpoints');
            }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeSection === 'checkpoints'
                ? 'bg-[#B5FF55] text-[#090A0D] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-tight">Goals</span>
          </button>

          {/* Tasks */}
          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveSection('tasks');
            }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative ${
              activeSection === 'tasks'
                ? 'bg-[#B5FF55] text-[#090A0D] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-tight">Tasks</span>
            {activeQuests.length > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-[#FF806B] text-[#090A0D] font-mono text-[9px] font-black flex items-center justify-center">
                {activeQuests.length}
              </span>
            )}
          </button>

          {/* Heatmap */}
          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveSection('heatmap');
            }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeSection === 'heatmap'
                ? 'bg-[#B5FF55] text-[#090A0D] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-tight">Momentum</span>
          </button>

          {/* Arcade */}
          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveSection('arcade');
            }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeSection === 'arcade'
                ? 'bg-[#B5FF55] text-[#090A0D] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-tight">Arcade</span>
          </button>
        </div>
      </div>

      {/* 5. Mobile Task Creator Modal */}
      {showTaskModal && (
        <MobileTaskCreatorModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {/* 6. Streak Flame Celebration Lottie Modal */}
      {celebratingTask && (
        <StreakFlameAnimation
          isOpen={true}
          streakCount={streak.currentStreak || 1}
          xpEarned={celebratingTask.xp}
          taskTitle={celebratingTask.title}
          onClose={() => setCelebratingTask(null)}
        />
      )}
    </div>
  );
}

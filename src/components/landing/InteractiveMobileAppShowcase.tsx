'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { LEVEL_CONFIG } from '@/lib/progressionEngine';
import { LevelSelectionMap } from '@/components/roadmap/LevelSelectionMap';
import { XoxoBotGame } from '@/components/arcade/XoxoBotGame';
import { KenKenGame } from '@/components/arcade/KenKenGame';
import {
  Trophy,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Zap,
  ArrowRight,
  Sparkles,
  CheckSquare,
  Target,
  BarChart3,
  Settings,
  Gamepad2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Volume2,
  RotateCcw,
  Smartphone,
  X,
} from 'lucide-react';
import { sound } from '@/common/SoundService';
import { fireCelebrationConfetti } from '@/common/Confetti';

export function InteractiveMobileAppShowcase() {
  const {
    user,
    streak,
    quests,
    completeQuest,
    reopenQuest,
    createQuest,
    awardXp,
    setMode,
    setCurrentTab,
  } = useQuestly();

  // Screen selection inside the phone frame
  // 1: Dashboard, 2: Tasks, 3: LevelMap, 4: Habits, 5: Games, 6: Progress, 7: Settings
  const [activeScreen, setActiveScreen] = useState<
    'dashboard' | 'tasks' | 'map' | 'habits' | 'games' | 'progress' | 'settings'
  >('dashboard');

  // Reward Celebration Modal state
  const [celebrationData, setCelebrationData] = useState<{
    title: string;
    xp: number;
    badge?: string;
  } | null>(null);

  // New task quick input
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Interactive Habits state
  const [habits, setHabits] = useState([
    { id: 'h1', title: 'Exercise 20 min', completed: true, streak: 6 },
    { id: 'h2', title: 'Review lecture flashcards', completed: true, streak: 4 },
    { id: 'h3', title: 'Read academic paper', completed: false, streak: 3 },
    { id: 'h4', title: 'Hydrate (2L water)', completed: true, streak: 5 },
  ]);

  // Tasks statistics
  const totalTasks = quests.length || 6;
  const completedTasks = quests.filter((q) => q.status === 'COMPLETED').length;
  const taskProgressPercent = Math.round((completedTasks / Math.max(1, totalTasks)) * 100);

  // Handle checking/unchecking a task with full XP & level reactivity
  const handleToggleTask = (questId: string, currentStatus: string, title: string, xpReward: number) => {
    const isCompleted = currentStatus === 'COMPLETED';
    if (isCompleted) {
      sound.playButtonClick();
      reopenQuest(questId);
    } else {
      sound.playQuestComplete();
      fireCelebrationConfetti();
      completeQuest(questId);
      // Trigger the LevelUp celebration screen
      setCelebrationData({
        title,
        xp: xpReward || 20,
        badge: completedTasks + 1 >= 5 ? 'High Achiever' : undefined,
      });
    }
  };

  const handleToggleHabit = (id: string) => {
    sound.playButtonClick();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const next = !h.completed;
          if (next) {
            sound.playQuestComplete();
            awardXp('task_completed', `habit_${id}_${Date.now()}`, h.title, 15);
          }
          return {
            ...h,
            completed: next,
            streak: next ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    sound.playButtonClick();
    createQuest({
      title: newTaskTitle.trim(),
      description: 'Created via mobile app dashboard',
      difficulty: 'MEDIUM',
      category: 'COURSEWORK',
      xpReward: 20,
    });
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
      {/* Outer Titanium Phone Shell */}
      <div className="relative rounded-[44px] bg-[#171A21] p-3 sm:p-4 border-4 border-[#303642] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(181,255,85,0.15)] overflow-hidden">
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-5 sm:top-6 left-1/2 -translate-x-1/2 w-28 sm:w-32 h-4 sm:h-4.5 bg-[#090A0D] rounded-full z-40 border border-[#303642]/60 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111319] border border-[#303642]" />
        </div>

        {/* Inner Phone Screen Content */}
        <div className="relative rounded-[32px] bg-[#090A0D] text-[#F5F5F0] h-[640px] sm:h-[680px] flex flex-col justify-between overflow-hidden border border-[#303642]/50 font-sans select-none">
          {/* Top Status Bar */}
          <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-mono text-[#A1A1A1] z-30 bg-[#090A0D]/90">
            <span className="font-bold text-[#F5F5F0]">9:41</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[#FF806B]">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold">{streak.currentStreak}d</span>
              </div>
              <div className="w-5 h-2.5 rounded-sm border border-zinc-500 p-0.5 flex items-center">
                <div className="w-full h-full bg-[#B5FF55] rounded-xs" />
              </div>
            </div>
          </div>

          {/* Screen Navigation Tabs (Top Micro Bar) */}
          <div className="px-3 py-1.5 bg-[#111319] border-b border-[#303642] flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-1">
              <span className="font-display font-black text-xs text-[#B5FF55] uppercase tracking-wider">
                LevelUp
              </span>
              <span className="text-[9px] font-mono text-zinc-400">by Questly</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono">
              <button
                onClick={() => setActiveScreen('map')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  activeScreen === 'map'
                    ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🗺️ Map
              </button>
              <button
                onClick={() => setActiveScreen('dashboard')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  activeScreen === 'dashboard'
                    ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveScreen('tasks')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  activeScreen === 'tasks'
                    ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tasks
              </button>
            </div>
          </div>

          {/* Interactive Screen Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {/* SCREEN 1: DASHBOARD */}
            {activeScreen === 'dashboard' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Greeting & Level Badge */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-black text-base uppercase tracking-tight text-[#F5F5F0]">
                      Hello, {user.name || 'Student'}! 👋
                    </h3>
                    <p className="text-[11px] font-mono text-[#A1A1A1]">
                      Small steps, Big Progress.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/30">
                      LVL {user.level} {user.academicRank}
                    </span>
                  </div>
                </div>

                {/* Today's Progress Card (Daily Goal Progress Bar) */}
                <div className="p-3.5 rounded-2xl bg-[#171A21] border border-[#303642] space-y-2 brutal-shadow">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#F5F5F0]">Today&apos;s Daily Goal</span>
                    <strong className="text-[#B5FF55]">{taskProgressPercent}% Completed</strong>
                  </div>
                  {/* Animated Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-[#090A0D] border border-[#303642] overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#B5FF55] to-[#42DFFF] rounded-full transition-all duration-500"
                      style={{ width: `${taskProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
                    <span>{completedTasks} of {totalTasks} tasks finished</span>
                    <span>+{completedTasks * 20} XP earned</span>
                  </div>
                </div>

                {/* 2 Live Updating Stat Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setActiveScreen('tasks')}
                    className="p-3 rounded-2xl bg-[#171A21] border border-[#303642] cursor-pointer hover:border-[#B5FF55] transition-all"
                  >
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span className="text-[10px] font-mono uppercase">Tasks</span>
                      <CheckSquare className="w-3.5 h-3.5 text-[#B5FF55]" />
                    </div>
                    <div className="font-display font-black text-xl text-[#F5F5F0]">
                      {completedTasks} / {totalTasks}
                    </div>
                    <span className="text-[10px] font-mono text-[#B5FF55]">
                      {totalTasks - completedTasks} remaining
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveScreen('map')}
                    className="p-3 rounded-2xl bg-[#171A21] border border-[#303642] cursor-pointer hover:border-[#42DFFF] transition-all"
                  >
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span className="text-[10px] font-mono uppercase">XP Points</span>
                      <Zap className="w-3.5 h-3.5 text-[#42DFFF] fill-current" />
                    </div>
                    <div className="font-display font-black text-xl text-[#42DFFF]">
                      {user.totalXp} XP
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Next: {user.nextLevelXp - user.currentXp} XP
                    </span>
                  </div>
                </div>

                {/* Level Map Sneak Peek Card */}
                <div
                  onClick={() => setActiveScreen('map')}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-[#171A21] to-[#202530] border border-[#303642] hover:border-[#B5FF55] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#B5FF55]/15 border border-[#B5FF55]/40 flex items-center justify-center text-[#B5FF55]">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-display font-black uppercase text-[#F5F5F0] block">
                        Level Selection Map
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Winding 3D Level Road • Level {user.level}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#B5FF55] group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Quick Task Checklist with immediate XP award */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#A1A1A1] font-bold uppercase tracking-wider">
                      Academic Checklist
                    </span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-[10px] text-[#B5FF55] font-bold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add Task
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {quests.slice(0, 3).map((quest) => {
                      const isDone = quest.status === 'COMPLETED';
                      return (
                        <div
                          key={quest.id}
                          onClick={() =>
                            handleToggleTask(quest.id, quest.status, quest.title, quest.xpReward)
                          }
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isDone
                              ? 'bg-[#171A21]/40 border-[#303642]/40 opacity-70'
                              : 'bg-[#171A21] border-[#303642] hover:border-[#B5FF55]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-[#B5FF55]" />
                            ) : (
                              <Circle className="w-4 h-4 text-zinc-500" />
                            )}
                            <span
                              className={`text-xs font-mono ${
                                isDone ? 'line-through text-zinc-500' : 'text-[#F5F5F0]'
                              }`}
                            >
                              {quest.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#B5FF55] font-bold">
                            +{quest.xpReward || 20} XP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: 3D LEVEL SELECTION MAP */}
            {activeScreen === 'map' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <LevelSelectionMap
                  compact={true}
                  onOpenTasks={() => setActiveScreen('tasks')}
                  onOpenArcade={() => setActiveScreen('games')}
                />
              </div>
            )}

            {/* SCREEN 3: TASKS LIST */}
            {activeScreen === 'tasks' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black font-display uppercase tracking-tight text-[#F5F5F0]">
                      My Tasks
                    </h3>
                    <p className="text-[10px] font-mono text-[#B5FF55]">
                      Mark a task complete to earn +20 XP!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#B5FF55] text-[#090A0D] text-[10px] font-black uppercase font-display flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {quests.map((quest) => {
                    const isDone = quest.status === 'COMPLETED';
                    return (
                      <div
                        key={quest.id}
                        onClick={() =>
                          handleToggleTask(quest.id, quest.status, quest.title, quest.xpReward)
                        }
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isDone
                            ? 'bg-[#171A21]/40 border-[#303642]/40 opacity-70'
                            : 'bg-[#171A21] border-[#303642] hover:border-[#B5FF55]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[#B5FF55]" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-500" />
                          )}
                          <div>
                            <span
                              className={`text-xs font-mono block ${
                                isDone ? 'line-through text-zinc-500' : 'text-[#F5F5F0]'
                              }`}
                            >
                              {quest.title}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400">
                              Priority: {quest.difficulty}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#B5FF55] font-bold">
                          +{quest.xpReward || 20} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 4: HABITS / GOALS */}
            {activeScreen === 'habits' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black font-display uppercase tracking-tight text-[#F5F5F0]">
                      Daily Habits
                    </h3>
                    <p className="text-[10px] font-mono text-[#A1A1A1]">
                      Consistency builds academic mastery
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#FF806B] font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" /> 5/7 Completed
                  </span>
                </div>

                <div className="space-y-2">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        habit.completed
                          ? 'bg-[#171A21]/60 border-[#B5FF55]/40'
                          : 'bg-[#171A21] border-[#303642] hover:border-[#B5FF55]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {habit.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#B5FF55]" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500" />
                        )}
                        <div>
                          <span
                            className={`text-xs font-mono block ${
                              habit.completed ? 'text-[#B5FF55] font-bold' : 'text-[#F5F5F0]'
                            }`}
                          >
                            {habit.title}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400">
                            Streak: {habit.streak} days
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#B5FF55] font-bold">
                        {habit.completed ? 'DONE ✓' : '+15 XP'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN 5: ARCADE GAMES (KenKen & XOXO vs Bot) */}
            {activeScreen === 'games' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black font-display uppercase tracking-tight text-[#F5F5F0]">
                    Arcade Games (+XP)
                  </h3>
                  <span className="text-[10px] font-mono text-[#A879FF] font-bold">
                    Daily Cap: 20 XP
                  </span>
                </div>

                {/* XOXO Bot Mini Embed */}
                <XoxoBotGame />
              </div>
            )}

            {/* SCREEN 6: PROGRESS REPORT */}
            {activeScreen === 'progress' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <h3 className="text-sm font-black font-display uppercase tracking-tight text-[#F5F5F0]">
                  My Progress Report
                </h3>

                <div className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-zinc-300">Tasks Completed</span>
                      <strong className="text-[#B5FF55]">{completedTasks}/{totalTasks}</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#090A0D] overflow-hidden">
                      <div
                        className="h-full bg-[#B5FF55] rounded-full transition-all"
                        style={{ width: `${taskProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-zinc-300">Habits Completed</span>
                      <strong className="text-[#42DFFF]">
                        {habits.filter((h) => h.completed).length}/{habits.length}
                      </strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#090A0D] overflow-hidden">
                      <div
                        className="h-full bg-[#42DFFF] rounded-full transition-all"
                        style={{
                          width: `${(habits.filter((h) => h.completed).length / habits.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#303642] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 block">Current Status</span>
                      <span className="text-sm font-display font-black text-[#F5F5F0]">
                        Level {user.level} {user.academicRank}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#B5FF55]">
                      Keep improving every day!
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 7: SETTINGS */}
            {activeScreen === 'settings' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-sm font-black font-display uppercase tracking-tight text-[#F5F5F0]">
                  App Settings
                </h3>

                <div className="p-3 rounded-2xl bg-[#171A21] border border-[#303642] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#303642]/60">
                    <span className="text-zinc-400">Profile Name</span>
                    <span className="text-zinc-100 font-bold">{user.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#303642]/60">
                    <span className="text-zinc-400">Theme</span>
                    <span className="text-[#B5FF55] font-bold">Matiks Dark Neon</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-zinc-400">XP Engine</span>
                    <span className="text-[#42DFFF] font-bold">Idempotent v2.0</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playButtonClick();
                    setMode('app');
                    setCurrentTab('profile');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#171A21] hover:bg-[#202530] border border-[#303642] text-xs font-mono font-bold text-center block text-zinc-200"
                >
                  Manage Full Workspace Profile →
                </button>
              </div>
            )}
          </div>

          {/* Bottom App Navigation Bar (Home | Tasks | Map | Habits | Games) */}
          <div className="px-2 py-2 bg-[#111319] border-t border-[#303642] grid grid-cols-5 gap-1 shrink-0 z-20">
            <button
              onClick={() => {
                sound.playButtonClick();
                setActiveScreen('dashboard');
              }}
              className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] font-mono transition-all ${
                activeScreen === 'dashboard'
                  ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                sound.playButtonClick();
                setActiveScreen('tasks');
              }}
              className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] font-mono transition-all ${
                activeScreen === 'tasks'
                  ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => {
                sound.playButtonClick();
                setActiveScreen('map');
              }}
              className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] font-mono transition-all ${
                activeScreen === 'map'
                  ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>

            <button
              onClick={() => {
                sound.playButtonClick();
                setActiveScreen('habits');
              }}
              className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] font-mono transition-all ${
                activeScreen === 'habits'
                  ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Habits</span>
            </button>

            <button
              onClick={() => {
                sound.playButtonClick();
                setActiveScreen('games');
              }}
              className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] font-mono transition-all ${
                activeScreen === 'games'
                  ? 'bg-[#B5FF55] text-[#090A0D] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Games</span>
            </button>
          </div>

          {/* Quick Add Task Modal */}
          {showAddModal && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full rounded-2xl bg-[#171A21] border border-[#303642] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase font-display text-[#F5F5F0]">
                    Add New Task
                  </h4>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleCreateTask} className="space-y-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Study for physics midterm"
                    className="w-full px-3 py-2 rounded-xl bg-[#090A0D] border border-[#303642] text-xs font-mono text-[#F5F5F0] focus:border-[#B5FF55] outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-[#B5FF55] text-[#090A0D] text-xs font-mono font-bold uppercase"
                    >
                      Save Task (+20 XP)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Rewards & Achievements Celebration Screen */}
          {celebrationData && (
            <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-[#B5FF55]/20 border-2 border-[#B5FF55] flex items-center justify-center text-[#B5FF55] mb-3 shadow-[0_0_30px_rgba(181,255,85,0.4)]">
                <Trophy className="w-8 h-8 stroke-[2.5]" />
              </div>

              <span className="text-xs font-mono font-black uppercase text-[#B5FF55] tracking-widest block mb-1">
                TASK COMPLETED!
              </span>

              <h4 className="text-xl font-black uppercase font-display text-white tracking-tight mb-1">
                GREAT JOB, KEEP GOING.
              </h4>

              <p className="text-xs text-zinc-400 font-mono max-w-[200px] mb-4">
                {celebrationData.title}
              </p>

              {/* Animated +20 XP Pill */}
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#B5FF55] text-[#090A0D] font-display font-black text-lg tracking-wider brutal-shadow mb-3">
                <Zap className="w-5 h-5 fill-current" />
                <span>+{celebrationData.xp} XP</span>
              </div>

              {/* Achievement Badge */}
              <div className="text-[10px] font-mono text-[#42DFFF] bg-[#42DFFF]/15 border border-[#42DFFF]/30 px-3 py-1 rounded-full mb-6">
                ★ Achievement Unlocked: Scholar Consistency
              </div>

              <button
                onClick={() => setCelebrationData(null)}
                className="w-full py-3 rounded-xl bg-[#171A21] hover:bg-[#202530] border border-[#303642] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import { LEVEL_CONFIG } from '@/lib/progressionEngine';
import {
  Trophy,
  Check,
  Lock,
  Sparkles,
  Zap,
  ChevronRight,
  Flame,
  Star,
  Target,
  Edit3,
  Plus,
  Compass,
  Play,
  X,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

interface AnimatedMobileRoadmapProps {
  onSelectAction?: (action: 'tasks' | 'arcade' | 'focus' | 'xp') => void;
  onOpenTaskModal?: () => void;
}

export function AnimatedMobileRoadmap({ onSelectAction, onOpenTaskModal }: AnimatedMobileRoadmapProps) {
  const { user } = useQuestly();
  const [selectedLevel, setSelectedLevel] = useState<number>(user.level);
  const [editingGoalLevel, setEditingGoalLevel] = useState<number | null>(null);
  const [goalInput, setGoalInput] = useState<string>('');

  // Persistent user-defined milestone goals (User input from scratch)
  const [customGoals, setCustomGoals] = useState<Record<number, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('questly_custom_roadmap_goals');
      if (saved) {
        setCustomGoals(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveCustomGoal = (lvl: number, goalText: string) => {
    const updated = { ...customGoals, [lvl]: goalText.trim() };
    setCustomGoals(updated);
    try {
      localStorage.setItem('questly_custom_roadmap_goals', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setEditingGoalLevel(null);
    sound.playButtonClick();
  };

  const currentLevel = user.level;
  const currentXp = user.totalXp;

  // Selected level details
  const activeLevelData = LEVEL_CONFIG.find((l) => l.level === selectedLevel) || LEVEL_CONFIG[0];
  const isSelectedUnlocked = currentLevel >= activeLevelData.level;
  const isSelectedCurrent = currentLevel === activeLevelData.level;
  const xpNeeded = activeLevelData.minXp;
  const xpToNext = Math.max(0, activeLevelData.minXp - currentXp);

  // Milestone node positions along the sinuous curve
  const milestoneNodes = [
    { level: 1, x: 50, y: 8, label: 'Initiate' },
    { level: 2, x: 75, y: 22, label: 'Explorer' },
    { level: 3, x: 30, y: 38, label: 'Builder' },
    { level: 4, x: 70, y: 54, label: 'Strategist' },
    { level: 5, x: 28, y: 68, label: 'Specialist' },
    { level: 6, x: 72, y: 82, label: 'Architect' },
    { level: 7, x: 50, y: 94, label: 'Master' },
  ];

  const handleNodeClick = (lvl: number) => {
    sound.playButtonClick();
    setSelectedLevel(lvl);
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Academic Roadmap Header */}
      <div className="px-4 py-2.5 bg-[#111319]/90 border-b border-[#303642] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#B5FF55]" />
          <div>
            <h3 className="text-xs font-bold text-zinc-100 font-display uppercase tracking-tight">
              Academic Roadmap
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Level {currentLevel} of 7 • {user.academicRank}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded-lg bg-[#171A21] border border-[#303642] text-[#B5FF55] font-bold">
            {currentXp} XP
          </span>
        </div>
      </div>

      {/* 2. Sinuous Interactive Map Canvas */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden p-4 flex flex-col items-center justify-center bg-graph-grid">
        <div className="relative w-full max-w-sm h-full min-h-[320px] py-2 flex items-center justify-center">
          {/* SVG Sinuous Energy Path Connecting the Milestones */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="roadmapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#B5FF55" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#42DFFF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#A879FF" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Background Track Line */}
            <path
              d="M 50 8 C 80 15, 80 20, 75 22 C 70 26, 25 32, 30 38 C 35 44, 75 48, 70 54 C 65 60, 25 62, 28 68 C 30 74, 75 76, 72 82 C 70 88, 50 90, 50 94"
              fill="none"
              stroke="#252A34"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Glowing Accent Progress Line */}
            <path
              d="M 50 8 C 80 15, 80 20, 75 22 C 70 26, 25 32, 30 38 C 35 44, 75 48, 70 54 C 65 60, 25 62, 28 68 C 30 74, 75 76, 72 82 C 70 88, 50 90, 50 94"
              fill="none"
              stroke="url(#roadmapGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 2"
              className="opacity-75"
            />
          </svg>

          {/* 7 Checkpoint Milestone Nodes Placed on the Path */}
          <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
            {milestoneNodes.map((node) => {
              const isUnlocked = currentLevel >= node.level;
              const isCurrent = currentLevel === node.level;
              const isSelected = selectedLevel === node.level;
              const hasCustomGoal = !!customGoals[node.level];

              return (
                <div
                  key={node.level}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                >
                  <button
                    onClick={() => handleNodeClick(node.level)}
                    className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    } ${
                      isCurrent
                        ? 'bg-[#B5FF55] text-[#090A0D] border-2 border-white shadow-[0_0_20px_rgba(181,255,85,0.6)] animate-pulse'
                        : isUnlocked
                        ? 'bg-[#171A21] border border-[#B5FF55] text-[#B5FF55]'
                        : 'bg-[#111319] border border-[#303642] text-zinc-500 opacity-60'
                    }`}
                    aria-label={`Milestone Level ${node.level}: ${node.label}`}
                  >
                    {isCurrent ? (
                      <Star className="w-5 h-5 fill-current stroke-[2.5]" />
                    ) : isUnlocked ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}

                    {/* Small badge dot if user set a custom goal */}
                    {hasCustomGoal && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#42DFFF] border border-[#090A0D]" />
                    )}
                  </button>

                  {/* Level Pill */}
                  <span
                    className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-[#B5FF55] text-[#090A0D]'
                        : isCurrent
                        ? 'bg-[#B5FF55]/20 text-[#B5FF55]'
                        : 'bg-[#171A21] text-zinc-400'
                    }`}
                  >
                    L{node.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Selected Milestone Detail Card & User Goal Editor */}
      <div className="p-4 bg-[#111319] border-t border-[#303642] shrink-0 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isSelectedCurrent
                    ? 'bg-[#B5FF55] text-[#090A0D]'
                    : isSelectedUnlocked
                    ? 'bg-[#B5FF55]/20 text-[#B5FF55]'
                    : 'bg-[#252A34] text-zinc-400'
                }`}
              >
                LEVEL {activeLevelData.level}
              </span>
              <h4 className="text-sm font-bold text-zinc-100 font-display uppercase tracking-tight">
                {activeLevelData.title}
              </h4>
              {isSelectedCurrent && (
                <span className="text-[9px] font-mono font-bold text-[#B5FF55] border border-[#B5FF55]/30 px-1.5 py-0.2 rounded">
                  Current Rank
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              {isSelectedUnlocked
                ? `Unlocked at ${xpNeeded} XP`
                : `${xpToNext} XP required to reach`}
            </p>
          </div>

          {/* Edit Milestone Target Button */}
          <button
            onClick={() => {
              sound.playButtonClick();
              setGoalInput(customGoals[activeLevelData.level] || '');
              setEditingGoalLevel(activeLevelData.level);
            }}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] font-mono text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3 h-3 text-[#B5FF55]" />
            <span>{customGoals[activeLevelData.level] ? 'Edit Goal' : '+ Set Goal'}</span>
          </button>
        </div>

        {/* Milestone Goal Display or Inline Editor */}
        {editingGoalLevel === activeLevelData.level ? (
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] space-y-2">
            <label className="text-[10px] font-mono text-zinc-400 block">
              Set your target learning objective for Level {activeLevelData.level}:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Master Linear Algebra & complete 20 problem sets"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#B5FF55]"
                autoFocus
              />
              <button
                onClick={() => saveCustomGoal(activeLevelData.level, goalInput)}
                className="px-3 py-1.5 rounded-lg bg-[#B5FF55] text-[#090A0D] text-xs font-bold font-display uppercase hover:bg-[#A3F040]"
              >
                Save
              </button>
              <button
                onClick={() => setEditingGoalLevel(null)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#171A21] border border-[#303642] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 truncate pr-2">
              <Target className="w-3.5 h-3.5 text-[#B5FF55] shrink-0" />
              <span className="truncate text-zinc-300">
                {customGoals[activeLevelData.level] ? (
                  <span>
                    <strong className="text-[#B5FF55]">Goal: </strong>
                    {customGoals[activeLevelData.level]}
                  </span>
                ) : (
                  <span className="text-zinc-500 italic">No custom goal set yet for this rank.</span>
                )}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 shrink-0 font-bold">
              {activeLevelData.unlockTitle}
            </span>
          </div>
        )}

        {/* Milestone Action CTAs */}
        <div className="flex items-center gap-2 pt-1">
          {onOpenTaskModal && (
            <button
              onClick={() => {
                sound.playButtonClick();
                onOpenTaskModal();
              }}
              className="flex-1 py-2 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] font-black text-xs uppercase font-display tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create Task for Level {activeLevelData.level}</span>
            </button>
          )}

          {onSelectAction && (
            <button
              onClick={() => {
                sound.playButtonClick();
                onSelectAction('focus');
              }}
              className="px-3.5 py-2 rounded-xl bg-[#171A21] hover:bg-[#20242D] border border-[#303642] text-xs font-mono text-zinc-300 transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3 text-[#B5FF55] fill-current" />
              <span>Focus Chamber</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

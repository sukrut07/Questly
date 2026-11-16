'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import { LEVEL_CONFIG } from '@/lib/progressionEngine';
import { Check, Lock, Sparkles, Trophy, Star, Target, Edit3, X } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function AcademicRoadmap() {
  const { user } = useQuestly();
  const [customGoals, setCustomGoals] = useState<Record<number, string>>({});
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [goalText, setGoalText] = useState<string>('');

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

  const handleSaveGoal = (lvl: number) => {
    const updated = { ...customGoals, [lvl]: goalText.trim() };
    setCustomGoals(updated);
    try {
      localStorage.setItem('questly_custom_roadmap_goals', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setEditingLevel(null);
    sound.playButtonClick();
  };

  const currentLevel = user.level;
  const currentXp = user.totalXp;

  return (
    <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] space-y-6 relative overflow-hidden bg-graph-grid">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#303642]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-[#B5FF55]" />
            <h3 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight">
              Academic Progression Roadmap
            </h3>
          </div>
          <p className="text-xs text-[#A1A1A1] font-mono">
            Earn verified XP through study sprints and completed tasks to unlock ranks and personalize targets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#111319] border border-[#303642] text-xs font-mono">
            <span className="text-[#A1A1A1]">Total Progress: </span>
            <strong className="text-[#B5FF55]">{currentXp} XP</strong>
          </div>
        </div>
      </div>

      {/* Stepped Milestones */}
      <div className="relative pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 relative z-10">
          {LEVEL_CONFIG.map((lvl) => {
            const isUnlocked = currentLevel >= lvl.level;
            const isCurrent = currentLevel === lvl.level;
            const xpNeeded = lvl.minXp;
            const hasGoal = !!customGoals[lvl.level];

            return (
              <div
                key={lvl.level}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                  isCurrent
                    ? 'bg-[#1C2029] border-[#B5FF55] shadow-[0_0_20px_rgba(181,255,85,0.2)]'
                    : isUnlocked
                    ? 'bg-[#171A21] border-[#303642]'
                    : 'bg-[#111319]/80 border-[#252A34] opacity-60'
                }`}
              >
                {/* Level badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? 'bg-[#B5FF55] text-[#090A0D]'
                        : isUnlocked
                        ? 'bg-[#B5FF55]/20 text-[#B5FF55]'
                        : 'bg-[#252A34] text-[#777]'
                    }`}
                  >
                    LVL {lvl.level}
                  </span>

                  {isUnlocked ? (
                    <Check className="w-3.5 h-3.5 text-[#B5FF55]" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#777]" />
                  )}
                </div>

                {/* Rank title */}
                <div className="space-y-1 mb-2">
                  <h4 className="text-sm font-black text-[#F5F5F0] font-display uppercase tracking-tight">
                    {lvl.title}
                  </h4>
                  <span className="text-[10px] font-mono text-[#A1A1A1] block">
                    {xpNeeded} XP Req
                  </span>
                </div>

                {/* Custom Goal target */}
                <div className="mb-2">
                  {editingLevel === lvl.level ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Set goal..."
                        value={goalText}
                        onChange={(e) => setGoalText(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-black/50 border border-white/20 text-[10px] text-white focus:outline-none focus:border-[#B5FF55]"
                        autoFocus
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSaveGoal(lvl.level)}
                          className="px-2 py-0.5 rounded bg-[#B5FF55] text-[#090A0D] text-[9px] font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingLevel(null)}
                          className="px-2 py-0.5 rounded bg-white/10 text-zinc-300 text-[9px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setGoalText(customGoals[lvl.level] || '');
                        setEditingLevel(lvl.level);
                      }}
                      className="cursor-pointer group flex items-start justify-between gap-1 p-1.5 rounded bg-[#111319] border border-white/[0.04] hover:border-white/[0.12] transition-colors"
                      title="Click to edit custom milestone goal"
                    >
                      <div className="flex items-start gap-1 min-w-0">
                        <Target className="w-3 h-3 text-[#B5FF55] shrink-0 mt-0.5" />
                        <span className="text-[9px] font-mono line-clamp-2 text-zinc-300">
                          {hasGoal ? customGoals[lvl.level] : '+ Set target goal'}
                        </span>
                      </div>
                      <Edit3 className="w-2.5 h-2.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  )}
                </div>

                {/* Unlock description */}
                <div className="pt-2 border-t border-[#303642]/60 text-[10px] font-mono text-[#D0D0D0]">
                  <span className="text-[#B5FF55] font-bold block mb-0.5">UNLOCK:</span>
                  <span className="line-clamp-2">{lvl.unlockDescription}</span>
                </div>

                {isCurrent && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 bg-[#B5FF55] text-[#090A0D] text-[8px] font-black font-display uppercase tracking-widest rounded-full">
                    YOU ARE HERE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

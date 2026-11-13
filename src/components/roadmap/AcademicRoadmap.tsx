'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { LEVEL_CONFIG } from '@/lib/progressionEngine';
import { Check, Lock, Sparkles, Trophy, Star } from 'lucide-react';

export function AcademicRoadmap() {
  const { user } = useQuestly();

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
            Earn XP through verified task completion and deep study sessions to unlock interface customisations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#111319] border border-[#303642] text-xs font-mono">
            <span className="text-[#A1A1A1]">Total XP: </span>
            <strong className="text-[#B5FF55]">{currentXp} XP</strong>
          </div>
        </div>
      </div>

      {/* Serpentine / Stepped Milestones */}
      <div className="relative pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 relative z-10">
          {LEVEL_CONFIG.map((lvl) => {
            const isUnlocked = currentLevel >= lvl.level;
            const isCurrent = currentLevel === lvl.level;
            const xpNeeded = lvl.minXp;

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
                <div className="space-y-1 mb-3">
                  <h4 className="text-sm font-black text-[#F5F5F0] font-display uppercase tracking-tight">
                    {lvl.title}
                  </h4>
                  <span className="text-[10px] font-mono text-[#A1A1A1] block">
                    {xpNeeded} XP Req
                  </span>
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

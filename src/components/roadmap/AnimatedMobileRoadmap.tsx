'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { LEVEL_CONFIG } from '@/lib/progressionEngine';
import {
  Trophy,
  Check,
  Lock,
  Sparkles,
  Zap,
  ChevronRight,
  ShieldAlert,
  Flame,
  Star,
  Crosshair,
  Compass,
  Play,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

interface AnimatedMobileRoadmapProps {
  onSelectAction?: (action: 'tasks' | 'arcade' | 'focus' | 'xp') => void;
}

export function AnimatedMobileRoadmap({ onSelectAction }: AnimatedMobileRoadmapProps) {
  const { user } = useQuestly();
  const [selectedLevel, setSelectedLevel] = useState<number>(user.level);

  const currentLevel = user.level;
  const currentXp = user.totalXp;

  // Selected level details
  const activeLevelData = LEVEL_CONFIG.find((l) => l.level === selectedLevel) || LEVEL_CONFIG[0];
  const isSelectedUnlocked = currentLevel >= activeLevelData.level;
  const isSelectedCurrent = currentLevel === activeLevelData.level;

  const handleNodeClick = (lvl: number) => {
    sound.playButtonClick();
    setSelectedLevel(lvl);
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Tactical Map Header */}
      <div className="px-4 py-2.5 bg-[#111319]/90 border-b border-[#303642] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#B5FF55] animate-ping" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#B5FF55] uppercase">
            [GEO_ZONE: ACADEMIC_MAP]
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1A1]">
          <span>SECTOR: 0{currentLevel}/07</span>
          <span className="px-1.5 py-0.5 rounded bg-[#171A21] border border-[#303642] text-[#F5F5F0] font-bold">
            {currentXp} XP
          </span>
        </div>
      </div>

      {/* 2. Interactive Animated Sinuous Map Canvas */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden p-4 flex flex-col items-center justify-center bg-graph-grid">
        {/* Animated Background HUD Scan Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#B5FF55_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative w-full max-w-sm py-2">
          {/* SVG Animated Path Connecting the 7 Milestones */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 320 480"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="roadmapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#B5FF55" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#42DFFF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#A879FF" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing background guide path */}
            <path
              d="M 160 30 C 260 90, 260 110, 160 160 C 60 210, 60 250, 160 290 C 260 330, 260 370, 160 410 C 100 440, 100 450, 160 460"
              fill="none"
              stroke="#252A34"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Animated neon energy path */}
            <path
              d="M 160 30 C 260 90, 260 110, 160 160 C 60 210, 60 250, 160 290 C 260 330, 260 370, 160 410 C 100 440, 100 450, 160 460"
              fill="none"
              stroke="url(#roadmapGrad)"
              strokeWidth="3.5"
              strokeDasharray="8 6"
              strokeLinecap="round"
              className="animate-[dash_20s_linear_infinite]"
              filter="url(#glow)"
            />
          </svg>

          {/* Map Nodes (Levels 1 to 7) */}
          <div className="relative z-10 flex flex-col gap-3 py-1">
            {LEVEL_CONFIG.map((lvl, index) => {
              const isUnlocked = currentLevel >= lvl.level;
              const isCurrent = currentLevel === lvl.level;
              const isSelected = selectedLevel === lvl.level;

              // Alternating horizontal alignment for serpentine rhythm
              const alignClass =
                index % 3 === 0
                  ? 'justify-center'
                  : index % 2 === 0
                  ? 'justify-start pl-6'
                  : 'justify-end pr-6';

              return (
                <div key={lvl.level} className={`w-full flex ${alignClass}`}>
                  <button
                    onClick={() => handleNodeClick(lvl.level)}
                    className={`group relative flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 text-left ${
                      isSelected
                        ? 'bg-[#1C2029] border-[#B5FF55] ring-2 ring-[#B5FF55]/40 shadow-[0_0_24px_rgba(181,255,85,0.25)] scale-105'
                        : isCurrent
                        ? 'bg-[#171A21] border-[#B5FF55] shadow-[0_0_15px_rgba(181,255,85,0.15)]'
                        : isUnlocked
                        ? 'bg-[#14171F] border-[#303642] hover:border-[#42DFFF]'
                        : 'bg-[#0E1015]/90 border-[#202530] opacity-50'
                    }`}
                  >
                    {/* Node Icon Avatar */}
                    <div
                      className={`relative w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs font-mono transition-transform ${
                        isCurrent
                          ? 'bg-[#B5FF55] text-[#090A0D] shadow-lg animate-bounce'
                          : isUnlocked
                          ? 'bg-[#1D222D] text-[#B5FF55] border border-[#B5FF55]/40'
                          : 'bg-[#111319] text-[#555] border border-[#252A34]'
                      }`}
                    >
                      {isUnlocked ? (
                        isCurrent ? (
                          <Star className="w-5 h-5 fill-current" />
                        ) : (
                          <Check className="w-5 h-5 stroke-[3]" />
                        )
                      ) : (
                        <Lock className="w-4 h-4 text-[#555]" />
                      )}

                      {/* Beacon Pulse on Current Level */}
                      {isCurrent && (
                        <span className="absolute -inset-1 rounded-xl border border-[#B5FF55] animate-ping opacity-75" />
                      )}
                    </div>

                    {/* Node Text & Badge */}
                    <div className="pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded ${
                            isCurrent
                              ? 'bg-[#B5FF55] text-[#090A0D]'
                              : isUnlocked
                              ? 'bg-[#B5FF55]/20 text-[#B5FF55]'
                              : 'bg-[#1F2430] text-[#777]'
                          }`}
                        >
                          LVL {lvl.level}
                        </span>
                        {isCurrent && (
                          <span className="text-[8px] font-mono font-bold text-[#B5FF55] tracking-widest animate-pulse">
                            [YOU]
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                        {lvl.title}
                      </div>
                      <span className="text-[10px] font-mono text-[#A1A1A1] block">
                        {lvl.minXp} XP REQ
                      </span>
                    </div>

                    {/* Active Selected Pointer */}
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#B5FF55] rounded-full border-2 border-[#090A0D]" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Bottom Inspection & Action Sheet (Clickable Node Details) */}
      <div className="p-3.5 bg-[#14171F] border-t border-[#303642] space-y-2.5 shrink-0 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#1D222D] border border-[#303642]">
              <Trophy className="w-4 h-4 text-[#B5FF55]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-black text-[#B5FF55]">
                  [CHECKPOINT // 0{activeLevelData.level}]
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                    isSelectedUnlocked
                      ? 'bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/30'
                      : 'bg-[#252A34] text-[#A1A1A1]'
                  }`}
                >
                  {isSelectedUnlocked ? 'STATUS: CLEARED' : 'STATUS: LOCKED'}
                </span>
              </div>
              <h4 className="text-sm font-black font-display uppercase tracking-tight text-[#F5F5F0]">
                {activeLevelData.title}
              </h4>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-[#A1A1A1] block">UNLOCK THRESHOLD</span>
            <span className="text-xs font-bold text-[#F5F5F0]">{activeLevelData.minXp} XP</span>
          </div>
        </div>

        {/* Unlock Perk */}
        <div className="p-2.5 rounded-xl bg-[#0E1015] border border-[#252A34] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#42DFFF] shrink-0" />
            <span className="text-[#C5C5C0] text-[11px] line-clamp-1">
              {activeLevelData.unlockDescription}
            </span>
          </div>
        </div>

        {/* CTA Buttons with proper tactical markings */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            onClick={() => {
              sound.playButtonClick();
              onSelectAction?.('tasks');
            }}
            className="py-2.5 px-3 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] font-black text-xs uppercase tracking-wider font-display brutal-shadow flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>[DO QUESTS +XP]</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onSelectAction?.('arcade');
            }}
            className="py-2.5 px-3 rounded-xl bg-[#1A1E26] hover:bg-[#252B37] text-[#42DFFF] border border-[#42DFFF]/40 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>[PLAY DUEL]</span>
          </button>
        </div>
      </div>
    </div>
  );
}

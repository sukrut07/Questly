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
  Flame,
  Star,
  Target,
  Gamepad2,
  CheckSquare,
  ArrowRight,
  X,
  Volume2,
  Gift,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

interface LevelSelectionMapProps {
  onOpenTasks?: () => void;
  onOpenArcade?: () => void;
  onOpenFocus?: () => void;
  compact?: boolean;
}

export function LevelSelectionMap({
  onOpenTasks,
  onOpenArcade,
  onOpenFocus,
  compact = false,
}: LevelSelectionMapProps) {
  const { user } = useQuestly();
  const currentLevel = user.level;
  const currentXp = user.totalXp;

  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(user.level);
  const [showDetailCard, setShowDetailCard] = useState<boolean>(true);

  // Selected level metadata
  const selectedConfig =
    LEVEL_CONFIG.find((l) => l.level === selectedLevelNum) || LEVEL_CONFIG[0];
  const isUnlocked = currentLevel >= selectedConfig.level;
  const isCurrent = currentLevel === selectedConfig.level;
  const isCompleted = currentLevel > selectedConfig.level;
  const xpNeeded = selectedConfig.minXp;
  const xpRemaining = Math.max(0, xpNeeded - currentXp);

  // Road coordinates for the 7 levels winding back and forth like a classic map
  // viewBox: 400 x 680
  const nodes = [
    { level: 1, cx: 100, cy: 590, rank: 'Initiate' },
    { level: 2, cx: 280, cy: 520, rank: 'Explorer' },
    { level: 3, cx: 310, cy: 390, rank: 'Builder' },
    { level: 4, cx: 130, cy: 330, rank: 'Strategist' },
    { level: 5, cx: 90, cy: 200, rank: 'Specialist' },
    { level: 6, cx: 270, cy: 140, rank: 'Architect' },
    { level: 7, cx: 200, cy: 50, rank: 'Master' },
  ];

  // SVG curved road path connecting the nodes smoothly
  const roadPath = `
    M 100 630
    C 100 600, 260 560, 280 520
    C 300 480, 340 430, 310 390
    C 280 350, 150 360, 130 330
    C 110 300, 70 240, 90 200
    C 110 160, 250 170, 270 140
    C 290 110, 220 70, 200 50
  `;

  const handleSelectLevel = (lvl: number) => {
    sound.playButtonClick();
    setSelectedLevelNum(lvl);
    setShowDetailCard(true);
  };

  return (
    <div className="w-full flex flex-col bg-[#090A0D] text-[#F5F5F0] rounded-2xl border border-[#303642] overflow-hidden select-none relative shadow-xl">
      {/* 1. Header: Level Stats & XP Progress */}
      <div className="px-4 py-3 bg-[#111319] border-b border-[#303642] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#B5FF55]/15 border border-[#B5FF55]/40 flex items-center justify-center text-[#B5FF55]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm tracking-tight uppercase text-[#F5F5F0]">
                LEVEL MAP
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#B5FF55] text-[#090A0D]">
                LVL {currentLevel}
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#A1A1A1]">
              Rank: <span className="text-zinc-200 font-bold">{user.academicRank}</span> • {currentXp} Total XP
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-[10px] font-mono text-[#B5FF55] font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current" />
            <span>Next: {user.nextLevelXp - user.currentXp} XP</span>
          </div>
          <div className="w-24 sm:w-32 h-2 bg-[#171A21] rounded-full border border-[#303642] overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-[#B5FF55] to-[#42DFFF] transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((user.currentXp / Math.max(1, user.nextLevelXp)) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Interactive Graphical Map Canvas */}
      <div className="relative w-full overflow-hidden bg-[#3D6328] flex items-center justify-center">
        {/* Cartoon Grass Texture & Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 10px 10px, rgba(255,255,255,0.15) 2px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Decorative Map Features: Buildings & Trees (Inspired by user's Level Selection image) */}
        {/* Building 1: Top-left library/school house */}
        <div className="absolute top-4 left-4 w-28 h-24 bg-[#7A4B3A] border-2 border-[#45281D] rounded-xl shadow-2xl pointer-events-none hidden sm:block z-0">
          <div className="w-full h-8 bg-[#9E5D48] border-b-2 border-[#45281D] rounded-t-lg flex items-center justify-around px-2">
            <div className="w-5 h-4 bg-[#23150F] rounded-sm border border-[#C5826C]/40" />
            <div className="w-5 h-4 bg-[#23150F] rounded-sm border border-[#C5826C]/40" />
            <div className="w-5 h-4 bg-[#23150F] rounded-sm border border-[#C5826C]/40" />
          </div>
          <div className="p-2 flex items-center justify-between">
            <div className="w-6 h-9 bg-[#3B1F13] rounded-t border border-[#C5826C]/40 mt-1" />
            <div className="w-12 h-3 bg-[#B5FF55]/80 rounded-full border border-[#45281D]" />
          </div>
        </div>

        {/* Building 2: Mid-right study house */}
        <div className="absolute top-48 right-3 w-24 h-24 bg-[#6E4232] border-2 border-[#381E15] rounded-xl shadow-2xl pointer-events-none hidden sm:block z-0">
          <div className="w-full h-7 bg-[#8C533F] border-b-2 border-[#381E15] rounded-t-lg flex items-center justify-around px-2">
            <div className="w-4 h-4 bg-[#1E110A] rounded-sm border border-[#C5826C]/30" />
            <div className="w-4 h-4 bg-[#1E110A] rounded-sm border border-[#C5826C]/30" />
          </div>
          <div className="p-2 flex justify-end">
            <div className="w-6 h-8 bg-[#30160B] rounded-t border border-[#C5826C]/30 mt-2" />
          </div>
        </div>

        {/* Trees & Shrubbery */}
        <div className="absolute bottom-20 left-4 w-10 h-10 rounded-full bg-[#2F4D1F] border-2 border-[#1E3213] shadow-md hidden sm:block pointer-events-none" />
        <div className="absolute bottom-24 left-10 w-8 h-8 rounded-full bg-[#3B5F27] border-2 border-[#1E3213] shadow-md hidden sm:block pointer-events-none" />
        <div className="absolute top-72 left-2 w-9 h-9 rounded-full bg-[#2F4D1F] border-2 border-[#1E3213] shadow-md hidden sm:block pointer-events-none" />
        <div className="absolute bottom-4 right-6 w-11 h-11 rounded-full bg-[#365723] border-2 border-[#1E3213] shadow-md hidden sm:block pointer-events-none" />

        {/* Street Lamp Post */}
        <div className="absolute top-64 left-44 w-2 h-14 bg-[#23272F] rounded-full hidden sm:block pointer-events-none shadow-lg">
          <div className="absolute -top-2 -left-2 w-6 h-3 bg-[#424856] rounded-t-full border border-[#585F72]" />
          <div className="absolute -top-0.5 -left-1 w-4 h-2 bg-[#FFEF9D] rounded-full blur-[1px] animate-pulse" />
        </div>

        {/* The SVG Road & 3D Stone Nodes */}
        <svg
          viewBox="0 0 400 660"
          className="w-full max-w-[420px] h-[520px] sm:h-[580px] z-10 overflow-visible"
        >
          {/* Road Curb / Outer Shoulder */}
          <path
            d={roadPath}
            fill="none"
            stroke="#171A21"
            strokeWidth="86"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Asphalt Road Surface */}
          <path
            d={roadPath}
            fill="none"
            stroke="#2B313D"
            strokeWidth="74"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dashed Center Road Markings */}
          <path
            d={roadPath}
            fill="none"
            stroke="#B5FF55"
            strokeWidth="4"
            strokeDasharray="14 16"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />

          {/* Level Nodes (3D Stepping Stone Buttons) */}
          {nodes.map((node) => {
            const config = LEVEL_CONFIG.find((l) => l.level === node.level)!;
            const nodeUnlocked = currentLevel >= node.level;
            const nodeCurrent = currentLevel === node.level;
            const nodeCompleted = currentLevel > node.level;
            const isSelected = selectedLevelNum === node.level;

            return (
              <g
                key={node.level}
                onClick={() => handleSelectLevel(node.level)}
                className="cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
              >
                {/* 3D Drop Shadow */}
                <ellipse
                  cx={node.cx}
                  cy={node.cy + 16}
                  rx="34"
                  ry="14"
                  fill="rgba(0,0,0,0.45)"
                />

                {/* 3D Bottom Cylinder Rim */}
                <ellipse
                  cx={node.cx}
                  cy={node.cy + 8}
                  rx="32"
                  ry="18"
                  fill={
                    nodeCurrent
                      ? '#456619'
                      : nodeCompleted
                      ? '#2A3C16'
                      : '#1C2029'
                  }
                  stroke="#0E1015"
                  strokeWidth="2"
                />

                {/* 3D Middle Extrusion */}
                <rect
                  x={node.cx - 32}
                  y={node.cy}
                  width="64"
                  height="8"
                  fill={
                    nodeCurrent
                      ? '#6B9D26'
                      : nodeCompleted
                      ? '#3E581F'
                      : '#2A303D'
                  }
                />

                {/* Top Circular Button Face */}
                <ellipse
                  cx={node.cx}
                  cy={node.cy}
                  rx="32"
                  ry="18"
                  fill={
                    nodeCurrent
                      ? '#B5FF55'
                      : nodeCompleted
                      ? '#4C7323'
                      : isSelected
                      ? '#4A5364'
                      : '#3A4252'
                  }
                  stroke={
                    nodeCurrent
                      ? '#FFFFFF'
                      : isSelected
                      ? '#B5FF55'
                      : nodeCompleted
                      ? '#78B038'
                      : '#525C70'
                  }
                  strokeWidth={nodeCurrent || isSelected ? '3' : '2'}
                />

                {/* Inner Bevel Ring */}
                <ellipse
                  cx={node.cx}
                  cy={node.cy}
                  rx="26"
                  ry="14"
                  fill="none"
                  stroke={
                    nodeCurrent
                      ? 'rgba(0,0,0,0.2)'
                      : nodeCompleted
                      ? 'rgba(255,255,255,0.25)'
                      : 'rgba(255,255,255,0.1)'
                  }
                  strokeWidth="1.5"
                />

                {/* Node Content: Current Star, Completed Check, or Lock */}
                {nodeCurrent ? (
                  // Current Active Player Level (Glowing Star + Level Number)
                  <>
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="12"
                      fill="#090A0D"
                    />
                    <text
                      x={node.cx}
                      y={node.cy + 4}
                      textAnchor="middle"
                      fill="#B5FF55"
                      fontSize="12"
                      fontWeight="900"
                      fontFamily="monospace"
                    >
                      {node.level}
                    </text>
                  </>
                ) : nodeCompleted ? (
                  // Completed Level (Checkmark + Level)
                  <>
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="10"
                      fill="#090A0D"
                    />
                    <text
                      x={node.cx}
                      y={node.cy + 4}
                      textAnchor="middle"
                      fill="#B5FF55"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ✓
                    </text>
                  </>
                ) : (
                  // Locked Level (3D Padlock Icon)
                  <>
                    <g transform={`translate(${node.cx - 7}, ${node.cy - 9})`}>
                      <rect
                        x="1"
                        y="6"
                        width="12"
                        height="9"
                        rx="2"
                        fill="#A1A8B8"
                        stroke="#1F2430"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3.5 6 V3.5 A3.5 3.5 0 0 1 10.5 3.5 V6"
                        fill="none"
                        stroke="#A1A8B8"
                        strokeWidth="1.5"
                      />
                      <circle cx="7" cy="10.5" r="1.2" fill="#1F2430" />
                    </g>
                  </>
                )}

                {/* Level Title Ribbon / Label on map */}
                <g transform={`translate(${node.cx}, ${node.cy + 34})`}>
                  <rect
                    x="-38"
                    y="-8"
                    width="76"
                    height="16"
                    rx="8"
                    fill="#111319"
                    stroke={nodeCurrent ? '#B5FF55' : '#303642'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={nodeCurrent ? '#B5FF55' : nodeUnlocked ? '#F5F5F0' : '#888F9E'}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    LVL {node.level} • {node.rank}
                  </text>
                </g>

                {/* Animated "YOU ARE HERE" Beacon on Current Level */}
                {nodeCurrent && (
                  <g transform={`translate(${node.cx}, ${node.cy - 36})`}>
                    <rect
                      x="-42"
                      y="-12"
                      width="84"
                      height="20"
                      rx="10"
                      fill="#B5FF55"
                      stroke="#090A0D"
                      strokeWidth="2"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill="#090A0D"
                      fontSize="9"
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      ★ CURRENT
                    </text>
                    {/* Small pointer triangle */}
                    <polygon
                      points="-4,8 4,8 0,14"
                      fill="#B5FF55"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. Interactive Milestone Details Card for Selected Level */}
      {showDetailCard && selectedConfig && (
        <div className="p-4 bg-[#111319] border-t border-[#303642] space-y-3 z-20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                  isCurrent
                    ? 'bg-[#B5FF55] text-[#090A0D]'
                    : isUnlocked
                    ? 'bg-[#42DFFF]/20 text-[#42DFFF] border border-[#42DFFF]/40'
                    : 'bg-[#171A21] text-[#A1A1A1] border border-[#303642]'
                }`}
              >
                {selectedLevelNum}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-black text-sm text-[#F5F5F0] uppercase tracking-tight">
                    Level {selectedConfig.level}: {selectedConfig.title}
                  </h4>
                  {isCompleted ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/30">
                      COMPLETED ✓
                    </span>
                  ) : isCurrent ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#B5FF55] text-[#090A0D]">
                      ACTIVE NOW
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-[#A1A1A1]">
                  Threshold: {selectedConfig.minXp} XP {isUnlocked ? '(Achieved)' : `(${xpRemaining} XP needed)`}
                </p>
              </div>
            </div>

            {/* Level Selector quick jump */}
            <div className="flex items-center gap-1">
              {LEVEL_CONFIG.map((lvl) => (
                <button
                  key={lvl.level}
                  onClick={() => handleSelectLevel(lvl.level)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    selectedLevelNum === lvl.level
                      ? 'bg-[#B5FF55] text-[#090A0D]'
                      : lvl.level <= currentLevel
                      ? 'bg-[#171A21] text-[#B5FF55] border border-[#303642]'
                      : 'bg-[#090A0D] text-zinc-600 border border-zinc-800'
                  }`}
                >
                  {lvl.level}
                </button>
              ))}
            </div>
          </div>

          {/* Unlocked Reward Perk */}
          <div className="p-3 rounded-xl bg-[#171A21] border border-[#303642] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Gift className="w-4 h-4 text-[#B5FF55] shrink-0" />
              <div>
                <span className="text-[10px] font-mono font-bold text-[#B5FF55] uppercase block">
                  LEVEL REWARD: {selectedConfig.unlockTitle}
                </span>
                <span className="text-xs text-[#D0D0D0] font-mono">
                  {selectedConfig.unlockDescription}
                </span>
              </div>
            </div>
            {isUnlocked ? (
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-[#B5FF55]/15 text-[#B5FF55]">
                UNLOCKED
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>{xpRemaining} XP away</span>
              </span>
            )}
          </div>

          {/* Action CTAs: Earn XP to advance */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onOpenTasks && (
              <button
                onClick={() => {
                  sound.playButtonClick();
                  onOpenTasks();
                }}
                className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Earn +20 XP (Tasks)</span>
              </button>
            )}

            {onOpenArcade && (
              <button
                onClick={() => {
                  sound.playButtonClick();
                  onOpenArcade();
                }}
                className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-[#171A21] hover:bg-[#20242D] border border-[#303642] text-[#F5F5F0] text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-[#A879FF]" />
                <span>Play Games (+10 XP)</span>
              </button>
            )}

            {onOpenFocus && (
              <button
                onClick={() => {
                  sound.playButtonClick();
                  onOpenFocus();
                }}
                className="px-3 py-2 rounded-xl bg-[#171A21] hover:bg-[#20242D] border border-[#303642] text-zinc-300 text-xs font-mono transition-colors"
                title="Focus Chamber"
              >
                Focus (+50 XP)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

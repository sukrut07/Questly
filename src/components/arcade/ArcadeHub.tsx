'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { ArcadeGameType } from '@/lib/types';
import { MathSprintGame } from './MathSprintGame';
import { CrossMathGame } from './CrossMathGame';
import { MindSnapGame } from './MindSnapGame';
import { SudokuGame } from './SudokuGame';
import { SpaceDefenderGame } from './SpaceDefenderGame';
import { MatchGridGame } from './MatchGridGame';
import { PatternMemoryGame } from './PatternMemoryGame';
import {
  Gamepad2,
  Trophy,
  Brain,
  Rocket,
  Grid,
  Zap,
  Sparkles,
  Flame,
  ChevronRight,
  Timer,
  Play,
  RotateCcw,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function ArcadeHub() {
  const { xpTransactions, arcadeRecords, user, streak } = useQuestly();
  const [activeGame, setActiveGame] = useState<ArcadeGameType | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'math' | 'memory' | 'puzzle'>('all');

  // Calculate today's arcade XP (Daily Cap: 20 XP)
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayArcadeXp = xpTransactions
    .filter((tx) => tx.sourceEvent === 'arcade_challenge' && tx.timestamp >= todayStart)
    .reduce((sum, tx) => sum + tx.xpAmount, 0);

  const getHighScore = (type: ArcadeGameType) => {
    const record = arcadeRecords.find((r) => r.gameType === type);
    return record?.highScore || 0;
  };

  const handleSelectGame = (type: ArcadeGameType) => {
    sound.playButtonClick();
    setActiveGame(type);
  };

  // Render active game
  if (activeGame === 'math_sprint') {
    return <MathSprintGame onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'cross_math') {
    return <CrossMathGame onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'mind_snap') {
    return <MindSnapGame onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'sudoku') {
    return <SudokuGame onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'space_defender') {
    return <SpaceDefenderGame onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'match_grid') {
    return <MatchGridGame onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'pattern_memory') {
    return <PatternMemoryGame onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* 1. Matiks Arena Header Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#171A21] border border-[#303642] flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutal-shadow relative overflow-hidden bg-graph-grid">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#B5FF55]/15 border border-[#B5FF55]/40 flex items-center justify-center text-[#B5FF55]">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#F5F5F0] tracking-tight font-display uppercase">
              Questly Arcade Arena
            </h1>
          </div>
          <p className="text-xs text-[#A1A1A1] font-mono">
            Fast mental calculation, pattern recognition, and focus duels.
          </p>
        </div>

        {/* Daily XP Cap Counter */}
        <div className="p-3 rounded-2xl bg-[#111319] border border-[#303642] flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#FF806B] fill-[#FF806B]" />
            <span className="text-xs font-mono font-bold text-[#F5F5F0]">{streak.currentStreak}d</span>
          </div>

          <div className="h-4 w-[1px] bg-[#303642]" />

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
              <span className="text-[#A1A1A1]">Daily Cap:</span>
              <strong className="text-[#B5FF55]">{todayArcadeXp} / 20 XP</strong>
            </div>
            <div className="w-28 h-1.5 rounded-full bg-[#090A0D] border border-[#303642] overflow-hidden">
              <div
                className="h-full bg-[#B5FF55] rounded-full transition-all duration-300"
                style={{ width: `${Math.min((todayArcadeXp / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Challenges (Inspired by Matiks Image 4) */}
      <div className="space-y-3">
        <span className="text-[11px] font-mono font-black uppercase text-[#A1A1A1] tracking-wider block">
          TODAY&apos;S CHALLENGE
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: PUZZLE (Cross-Math) */}
          <div
            onClick={() => handleSelectGame('cross_math')}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#A879FF] to-[#8E59EE] text-[#090A0D] cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all brutal-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#090A0D]/20 text-[#090A0D] border border-[#090A0D]/20">
                  ARITHMETIC CROSSWORD
                </span>
                <h3 className="text-3xl sm:text-4xl font-black uppercase font-display tracking-tight mt-2 text-[#090A0D]">
                  PUZZLE
                </h3>
                <p className="text-xs font-mono font-bold text-[#090A0D]/80 mt-1">
                  Balance intersecting math equations using number tiles.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#090A0D] text-[#A879FF] flex items-center justify-center shrink-0 brutal-shadow group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Card 2: MATH (Fast Math Duel) */}
          <div
            onClick={() => handleSelectGame('math_sprint')}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FF9C45] to-[#E87E20] text-[#090A0D] cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all brutal-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#090A0D]/20 text-[#090A0D] border border-[#090A0D]/20">
                  30S SPEED DUEL
                </span>
                <h3 className="text-3xl sm:text-4xl font-black uppercase font-display tracking-tight mt-2 text-[#090A0D]">
                  MATH
                </h3>
                <p className="text-xs font-mono font-bold text-[#090A0D]/80 mt-1">
                  Solve rapid equations and rack up 5x combo multipliers.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#090A0D] text-[#FF9C45] flex items-center justify-center shrink-0 brutal-shadow group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Duels Category Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase text-[#A1A1A1] tracking-wider">
            ALL DUELS & GAMES
          </span>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#171A21] border border-[#303642]">
            {(['all', 'math', 'memory', 'puzzle'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  sound.playButtonClick();
                  setActiveTab(tab);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-[#B5FF55] text-[#090A0D] brutal-shadow'
                    : 'text-[#A1A1A1] hover:text-[#F5F5F0]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Math Sprint */}
          {(activeTab === 'all' || activeTab === 'math') && (
            <div
              onClick={() => handleSelectGame('math_sprint')}
              className="p-5 rounded-3xl bg-[#171A21] border border-[#303642] hover:border-[#FF9C45] transition-all cursor-pointer brutal-shadow flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FF9C45]/15 border border-[#FF9C45]/40 flex items-center justify-center text-[#FF9C45]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight group-hover:text-[#FF9C45] transition-colors">
                      Fast Math Duel
                    </h4>
                    <span className="text-[10px] font-mono text-[#A1A1A1]">30s Arithmetic Blitz</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#FF9C45] block">
                    BEST: {getHighScore('math_sprint')}
                  </span>
                  <span className="text-[10px] font-mono text-[#B5FF55]">+10 XP</span>
                </div>
              </div>

              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                Rapid mental arithmetic with instant combo multipliers. Perfect for pre-study cognitive warmup.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#303642] text-xs font-mono">
                <span className="text-[#A1A1A1]">Arithmetic & Speed</span>
                <span className="text-[#FF9C45] font-bold group-hover:underline">Play Duel →</span>
              </div>
            </div>
          )}

          {/* Cross Math */}
          {(activeTab === 'all' || activeTab === 'puzzle' || activeTab === 'math') && (
            <div
              onClick={() => handleSelectGame('cross_math')}
              className="p-5 rounded-3xl bg-[#171A21] border border-[#303642] hover:border-[#A879FF] transition-all cursor-pointer brutal-shadow flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#A879FF]/15 border border-[#A879FF]/40 flex items-center justify-center text-[#A879FF]">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight group-hover:text-[#A879FF] transition-colors">
                      Number Crossword
                    </h4>
                    <span className="text-[10px] font-mono text-[#A1A1A1]">Cross-Math Grid</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#A879FF] block">
                    BEST: {getHighScore('cross_math')}
                  </span>
                  <span className="text-[10px] font-mono text-[#B5FF55]">+10 XP</span>
                </div>
              </div>

              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                Crossword equations on dark graph paper. Place number tiles from your dock to balance all rows and columns.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#303642] text-xs font-mono">
                <span className="text-[#A1A1A1]">Logic & Equations</span>
                <span className="text-[#A879FF] font-bold group-hover:underline">Play Duel →</span>
              </div>
            </div>
          )}

          {/* Mind Snap */}
          {(activeTab === 'all' || activeTab === 'memory') && (
            <div
              onClick={() => handleSelectGame('mind_snap')}
              className="p-5 rounded-3xl bg-[#171A21] border border-[#303642] hover:border-[#42DFFF] transition-all cursor-pointer brutal-shadow flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#42DFFF]/15 border border-[#42DFFF]/40 flex items-center justify-center text-[#42DFFF]">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight group-hover:text-[#42DFFF] transition-colors">
                      Mind Snap Duel
                    </h4>
                    <span className="text-[10px] font-mono text-[#A1A1A1]">Reflex Reaction</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#42DFFF] block">
                    BEST: {getHighScore('mind_snap')}
                  </span>
                  <span className="text-[10px] font-mono text-[#B5FF55]">+10 XP</span>
                </div>
              </div>

              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                Who can snap faster? Decide if dual flash cards match by shape, color, or value under intense time pressure.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#303642] text-xs font-mono">
                <span className="text-[#A1A1A1]">Reaction & Processing</span>
                <span className="text-[#42DFFF] font-bold group-hover:underline">Play Duel →</span>
              </div>
            </div>
          )}

          {/* 6x6 Blitz Sudoku */}
          {(activeTab === 'all' || activeTab === 'puzzle') && (
            <div
              onClick={() => handleSelectGame('sudoku')}
              className="p-5 rounded-3xl bg-[#171A21] border border-[#303642] hover:border-[#B5FF55] transition-all cursor-pointer brutal-shadow flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#B5FF55]/15 border border-[#B5FF55]/40 flex items-center justify-center text-[#B5FF55]">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight group-hover:text-[#B5FF55] transition-colors">
                      Blitz Sudoku
                    </h4>
                    <span className="text-[10px] font-mono text-[#A1A1A1]">6×6 Mobile Touch Logic</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#B5FF55] block">
                    BEST: {getHighScore('sudoku')}
                  </span>
                  <span className="text-[10px] font-mono text-[#B5FF55]">+10 XP</span>
                </div>
              </div>

              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                Streamlined 6x6 logic puzzle with pencil notes, cell highlights, and instant mistake detection.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#303642] text-xs font-mono">
                <span className="text-[#A1A1A1]">Deduction & Logic</span>
                <span className="text-[#B5FF55] font-bold group-hover:underline">Play Duel →</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { ArcadeGameType } from '@/lib/types';
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
  Info,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function ArcadeHub() {
  const { xpTransactions, arcadeRecords } = useQuestly();
  const [activeGame, setActiveGame] = useState<ArcadeGameType | null>(null);

  // Calculate today's arcade XP (Daily Cap: 20 XP)
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayArcadeXp = xpTransactions
    .filter((tx) => tx.sourceEvent === 'arcade_challenge' && tx.timestamp >= todayStart)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const getHighScore = (type: ArcadeGameType) => {
    const record = arcadeRecords.find((r) => r.gameType === type);
    return record?.highScore || 0;
  };

  const handleSelectGame = (type: ArcadeGameType) => {
    sound.playButtonClick();
    setActiveGame(type);
  };

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
    <div className="space-y-6">
      {/* 1. Header with Neon Accent */}
      <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutal-shadow relative overflow-hidden bg-graph-grid">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#A879FF]/10 border border-[#A879FF]/40 flex items-center justify-center text-[#A879FF]">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-[#F5F5F0] tracking-tight font-display uppercase">
              Questly Arcade
            </h1>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#A879FF]/10 text-[#A879FF] border border-[#A879FF]/30">
              4 MINI-GAMES
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] font-mono max-w-xl">
            Cognitive warm-up micro-games. Earn bonus XP for your daily streak without distracting from deep work.
          </p>
        </div>

        {/* Daily Arcade XP Cap Meter */}
        <div className="p-3.5 rounded-xl bg-[#111319] border border-[#303642] shrink-0 min-w-[200px] relative z-10">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-[#A1A1A1] flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#B5FF55]" />
              <span>Daily Cap</span>
            </span>
            <span className="font-bold text-[#F5F5F0]">{todayArcadeXp} / 20 XP</span>
          </div>
          <div className="h-1.5 w-full bg-[#090A0D] rounded-full overflow-hidden border border-[#303642]">
            <div
              className="h-full bg-[#B5FF55] rounded-full transition-all duration-300"
              style={{ width: `${Math.min((todayArcadeXp / 20) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-[#777] mt-1 block">
            {todayArcadeXp >= 20 ? 'Max daily arcade XP reached' : `${20 - todayArcadeXp} XP available today`}
          </span>
        </div>
      </div>

      {/* 2. Game Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Game 1: Space Defender */}
        <div
          onClick={() => handleSelectGame('space_defender')}
          className="p-5 rounded-2xl bg-[#171A21] border border-[#303642] hover:border-[#42DFFF] transition-all cursor-pointer group brutal-shadow relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#42DFFF]/15 border border-[#42DFFF]/40 flex items-center justify-center text-[#42DFFF] group-hover:scale-105 transition-transform">
              <Rocket className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-[#42DFFF] block">
                BEST: {getHighScore('space_defender')} PTS
              </span>
              <span className="text-[9px] font-mono text-[#A1A1A1]">+10 XP at 300 pts</span>
            </div>
          </div>
          <h3 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight group-hover:text-[#42DFFF] transition-colors">
            Neon Space Defender
          </h3>
          <p className="text-xs text-[#A1A1A1] font-mono mt-1 mb-4">
            Retro 2D arcade shooter. Steer your ship, fire neon pulses, and hold off alien invaders.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-[#303642] text-xs font-mono">
            <span className="text-[#A1A1A1]">Reaction & Precision</span>
            <span className="text-[#42DFFF] font-bold group-hover:underline">Play Now →</span>
          </div>
        </div>

        {/* Game 2: Sudoku */}
        <div
          onClick={() => handleSelectGame('sudoku')}
          className="p-5 rounded-2xl bg-[#171A21] border border-[#303642] hover:border-[#B5FF55] transition-all cursor-pointer group brutal-shadow relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#B5FF55]/15 border border-[#B5FF55]/40 flex items-center justify-center text-[#B5FF55] group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-[#B5FF55] block">
                BEST: {getHighScore('sudoku')} PTS
              </span>
              <span className="text-[9px] font-mono text-[#A1A1A1]">+10 XP on solve</span>
            </div>
          </div>
          <h3 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight group-hover:text-[#B5FF55] transition-colors">
            Logic Sudoku
          </h3>
          <p className="text-xs text-[#A1A1A1] font-mono mt-1 mb-4">
            Classic 9x9 numerical logic puzzle with instant validation and mistake tracking.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-[#303642] text-xs font-mono">
            <span className="text-[#A1A1A1]">Deductive Logic</span>
            <span className="text-[#B5FF55] font-bold group-hover:underline">Play Now →</span>
          </div>
        </div>

        {/* Game 3: Match Grid */}
        <div
          onClick={() => handleSelectGame('match_grid')}
          className="p-5 rounded-2xl bg-[#171A21] border border-[#303642] hover:border-[#A879FF] transition-all cursor-pointer group brutal-shadow relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#A879FF]/15 border border-[#A879FF]/40 flex items-center justify-center text-[#A879FF] group-hover:scale-105 transition-transform">
              <Grid className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-[#A879FF] block">
                BEST: {getHighScore('match_grid')} PTS
              </span>
              <span className="text-[9px] font-mono text-[#A1A1A1]">+10 XP at 500 pts</span>
            </div>
          </div>
          <h3 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight group-hover:text-[#A879FF] transition-colors">
            Neon Match Grid
          </h3>
          <p className="text-xs text-[#A1A1A1] font-mono mt-1 mb-4">
            6x6 match-3 puzzle. Swap glowing tiles to trigger cascading combos in 15 moves.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-[#303642] text-xs font-mono">
            <span className="text-[#A1A1A1]">Spatial Patterns</span>
            <span className="text-[#A879FF] font-bold group-hover:underline">Play Now →</span>
          </div>
        </div>

        {/* Game 4: Pattern Memory */}
        <div
          onClick={() => handleSelectGame('pattern_memory')}
          className="p-5 rounded-2xl bg-[#171A21] border border-[#303642] hover:border-[#FF9C45] transition-all cursor-pointer group brutal-shadow relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF9C45]/15 border border-[#FF9C45]/40 flex items-center justify-center text-[#FF9C45] group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-[#FF9C45] block">
                BEST: ROUND {getHighScore('pattern_memory')}
              </span>
              <span className="text-[9px] font-mono text-[#A1A1A1]">+10 XP at Round 6</span>
            </div>
          </div>
          <h3 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight group-hover:text-[#FF9C45] transition-colors">
            Mind Snap Memory
          </h3>
          <p className="text-xs text-[#A1A1A1] font-mono mt-1 mb-4">
            Simon-says sequence recall. Memorize increasingly rapid sequences of glowing pads.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-[#303642] text-xs font-mono">
            <span className="text-[#A1A1A1]">Working Memory</span>
            <span className="text-[#FF9C45] font-bold group-hover:underline">Play Now →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

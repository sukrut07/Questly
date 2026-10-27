'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { QuestDefender } from './QuestDefender';
import { CrystalMaze } from './CrystalMaze';
import {
  Gamepad2,
  Trophy,
  Sparkles,
  Rocket,
  Gem,
  Coffee,
  ShieldCheck,
  ChevronRight,
  Clock,
  History,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function ArcadeHub() {
  const { gameRecords } = useQuestly();
  const [activeGame, setActiveGame] = useState<'none' | 'defender' | 'maze'>('none');

  if (activeGame === 'defender') {
    return <QuestDefender onExit={() => setActiveGame('none')} />;
  }

  if (activeGame === 'maze') {
    return <CrystalMaze onExit={() => setActiveGame('none')} />;
  }

  const defenderBest = Math.max(
    0,
    ...gameRecords.filter((g) => g.gameType === 'QUEST_DEFENDER').map((g) => g.score)
  );

  const mazeBest = Math.max(
    0,
    ...gameRecords.filter((g) => g.gameType === 'CRYSTAL_MAZE').map((g) => g.score)
  );

  const totalPlays = gameRecords.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-surface-main border border-theme shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-theme-main tracking-tight">The Tavern Arcade</h2>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-primary-violet/20 border border-primary-violet/40 text-primary-violet uppercase tracking-wider">
                Rest & Recreation
              </span>
            </div>
            <p className="text-xs text-theme-muted">
              Step away from your workstation for a quick mental reset. Play retro arcade mini-games crafted for focus breaks.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-surface-elevated/70 border border-theme shrink-0">
            <Coffee className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <span className="text-theme-muted">Games Logged: </span>
              <span className="font-bold text-theme-main">{totalPlays}</span>
            </div>
          </div>
        </div>

        {/* Productivity Boundary Policy Notice */}
        <div className="mt-4 p-3 rounded-2xl bg-surface-elevated/40 border border-theme/80 flex items-start gap-2.5 text-xs text-theme-muted">
          <ShieldCheck className="w-4 h-4 text-mint-green shrink-0 mt-0.5" />
          <span>
            <strong className="text-theme-main">Healthy Boundary Notice: </strong>
            Arcade high scores are tracked independently and unlock cosmetic trophies. Game sessions do{' '}
            <strong className="text-theme-main">not</strong> count toward your qualifying daily focus time or completed quests.
          </span>
        </div>
      </div>

      {/* Playable Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Game 1: Quest Defender */}
        <div
          onClick={() => {
            sound.playButtonClick();
            setActiveGame('defender');
          }}
          className="group relative p-6 rounded-3xl bg-surface-main border border-theme hover:border-primary-violet transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
                Best: {defenderBest.toLocaleString()} Pts
              </span>
            </div>

            <h3 className="font-black text-xl text-theme-main tracking-tight group-hover:text-primary-violet transition-colors">
              Quest Defender
            </h3>
            <p className="text-xs text-theme-muted mt-1 leading-relaxed">
              Classic vertical retro space shooter. Pilot your starship, blast through waves of alien distraction drones, and collect energy power-ups.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-theme flex items-center justify-between">
            <span className="text-[11px] text-theme-muted font-semibold">1-3 min casual sprint</span>
            <div className="flex items-center gap-1.5 font-bold text-xs text-primary-violet group-hover:translate-x-1 transition-transform">
              <span>Play Mission</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Game 2: Crystal Maze */}
        <div
          onClick={() => {
            sound.playButtonClick();
            setActiveGame('maze');
          }}
          className="group relative p-6 rounded-3xl bg-surface-main border border-theme hover:border-cyan-500 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/20 transition-all pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30 group-hover:scale-105 transition-transform">
                <Gem className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
                Best: {mazeBest.toLocaleString()} Pts
              </span>
            </div>

            <h3 className="font-black text-xl text-theme-main tracking-tight group-hover:text-cyan-400 transition-colors">
              Crystal Maze
            </h3>
            <p className="text-xs text-theme-muted mt-1 leading-relaxed">
              Arcane labyrinth chase game. Traverse winding stone corridors, gather luminous crystal shards, and outsmart roaming shadow phantoms.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-theme flex items-center justify-between">
            <span className="text-[11px] text-theme-muted font-semibold">Grid maze puzzle</span>
            <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Enter Maze</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Game Records */}
      {gameRecords.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface-main border border-theme">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-theme-muted" />
            <h4 className="font-bold text-sm text-theme-main">Arcade Match History</h4>
          </div>

          <div className="divide-y divide-theme">
            {gameRecords.slice(0, 5).map((rec) => (
              <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-theme-main">
                    {rec.gameType === 'QUEST_DEFENDER' ? 'Quest Defender' : 'Crystal Maze'}
                  </span>
                  <span className="text-[10px] text-theme-muted px-2 py-0.5 rounded-md bg-surface-elevated">
                    Stage {rec.levelReached}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-amber-400">
                    {rec.score.toLocaleString()} pts
                  </span>
                  <span className="text-theme-muted text-[11px]">
                    {new Date(rec.playedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

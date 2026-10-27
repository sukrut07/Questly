'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { AdventureLevel, LevelCategory } from '@/lib/types';
import {
  Sparkles,
  Lock,
  Star,
  Trophy,
  Hourglass,
  CheckSquare,
  Flame,
  Skull,
  Shield,
  ChevronRight,
  Info,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function getCategoryBadge(cat: LevelCategory) {
  switch (cat) {
    case 'boss':
      return { label: 'Boss Encounter', color: 'text-coral bg-coral/15 border-coral/30', icon: <Skull className="w-3.5 h-3.5" /> };
    case 'focus':
      return { label: 'Focus Trial', color: 'text-electric-blue bg-electric-blue/15 border-electric-blue/30', icon: <Hourglass className="w-3.5 h-3.5" /> };
    case 'quest':
      return { label: 'Quest Surge', color: 'text-primary-violet bg-primary-violet/15 border-primary-violet/30', icon: <CheckSquare className="w-3.5 h-3.5" /> };
    case 'consistency':
      return { label: 'Streak Trial', color: 'text-amber-400 bg-amber-400/15 border-amber-400/30', icon: <Flame className="w-3.5 h-3.5" /> };
    case 'special':
    default:
      return { label: 'Mystic Trial', color: 'text-mint-green bg-mint-green/15 border-mint-green/30', icon: <Sparkles className="w-3.5 h-3.5" /> };
  }
}

export function AdventureMap() {
  const { adventureLevels, setSelectedLevel, setActiveModal } = useQuestly();

  // Group by Zone
  const zones = [
    { id: 1, name: 'Zone 1: Whispering Glade', subtitle: 'Humble beginnings and foundational focus rituals' },
    { id: 2, name: 'Zone 2: Crystal Spires', subtitle: 'Ascending crystalline plateaus of sustained momentum' },
    { id: 3, name: 'Zone 3: Sunken Citadel', subtitle: 'Deep caverns testing your discipline against distractions' },
  ];

  const totalEarnedStars = adventureLevels.reduce((acc, lvl) => acc + lvl.starsEarned, 0);
  const totalPossibleStars = adventureLevels.length * 3;

  const handleNodeClick = (level: AdventureLevel) => {
    sound.playButtonClick();
    setSelectedLevel(level);
    setActiveModal('level_detail');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface-main border border-theme shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-theme-main tracking-tight">Adventure Map</h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-primary-violet/20 border border-primary-violet/40 text-primary-violet uppercase tracking-wider">
              Realm Expedition
            </span>
          </div>
          <p className="text-xs text-theme-muted">
            Progress through handcrafted challenges. Every level node conquered expands your kingdom.
          </p>
        </div>

        {/* Stars Counter Banner */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-elevated border border-theme">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-amber-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-theme-main">
              {totalEarnedStars} / {totalPossibleStars} Stars
            </div>
            <div className="text-[10px] text-theme-muted">Expedition Mastery</div>
          </div>
        </div>
      </div>

      {/* Vertical Progression Map Container */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-surface-main border border-theme overflow-hidden shadow-xl">
        {/* Ambient background grid / stars */}
        <div className="absolute inset-0 bg-[radial-gradient(#8B7CFF_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Zones and Winding Path */}
        <div className="space-y-16 relative z-10 max-w-2xl mx-auto">
          {zones.map((zone) => {
            const zoneLevels = adventureLevels.filter((lvl) => lvl.zone === zone.id);
            const zoneStars = zoneLevels.reduce((acc, lvl) => acc + lvl.starsEarned, 0);

            return (
              <div key={zone.id} className="space-y-8">
                {/* Zone Landmark Header */}
                <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-theme/80 backdrop-blur-md flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-theme-main tracking-tight flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-violet" />
                      <span>{zone.name}</span>
                    </h3>
                    <p className="text-[11px] text-theme-muted">{zone.subtitle}</p>
                  </div>
                  <div className="text-xs font-bold px-3 py-1 rounded-full bg-surface-main border border-theme text-amber-400 flex items-center gap-1.5 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{zoneStars} / {zoneLevels.length * 3}</span>
                  </div>
                </div>

                {/* Level Nodes in winding serpentine rhythm */}
                <div className="space-y-10 relative">
                  {zoneLevels.map((lvl, index) => {
                    const isCompleted = lvl.status === 'completed';
                    const isAvailable = lvl.status === 'available';
                    const isLocked = lvl.status === 'locked';
                    const isBoss = lvl.category === 'boss';

                    // Alternate zig-zag alignment: left, center, right, center
                    const alignClasses = [
                      'sm:justify-start sm:pl-8',
                      'sm:justify-center',
                      'sm:justify-end sm:pr-8',
                      'sm:justify-center',
                    ][index % 4];

                    return (
                      <div key={lvl.id} className={`flex items-center justify-center ${alignClasses} relative group`}>
                        {/* Connecting Path line indicator */}
                        {index > 0 && (
                          <div className="hidden sm:block absolute -top-10 left-1/2 w-0.5 h-10 -translate-x-1/2 bg-gradient-to-b from-primary-violet/30 to-primary-violet/70 border-l border-dashed border-primary-violet/40 pointer-events-none" />
                        )}

                        {/* Interactive Node Card */}
                        <div
                          onClick={() => handleNodeClick(lvl)}
                          className={`relative cursor-pointer transition-all duration-300 p-4 rounded-3xl border w-full sm:w-[320px] flex items-center gap-4 ${
                            isCompleted
                              ? 'bg-surface-elevated/80 border-mint-green/40 hover:border-mint-green shadow-md hover:scale-[1.02]'
                              : isAvailable
                              ? 'bg-gradient-to-r from-purple-950/70 to-surface-elevated border-primary-violet glow-violet animate-pulse-slow hover:scale-105'
                              : 'bg-surface-elevated/30 border-theme/40 opacity-60 hover:opacity-80'
                          }`}
                        >
                          {/* Circle Avatar Emblem */}
                          <div
                            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-lg transition-transform group-hover:rotate-3 ${
                              isCompleted
                                ? 'bg-mint-green/20 border-mint-green text-mint-green'
                                : isAvailable
                                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-white/30 text-white glow-violet'
                                : 'bg-surface-elevated border-theme text-theme-muted'
                            }`}
                          >
                            {isLocked ? (
                              <Lock className="w-5 h-5" />
                            ) : isBoss ? (
                              <Skull className="w-6 h-6 animate-pulse text-coral" />
                            ) : (
                              <span className="font-black text-lg">{lvl.id}</span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1 ${
                                  getCategoryBadge(lvl.category).color
                                }`}
                              >
                                {getCategoryBadge(lvl.category).icon}
                                <span>{lvl.category}</span>
                              </span>
                            </div>

                            <h4 className="font-extrabold text-sm text-theme-main truncate">
                              {lvl.title}
                            </h4>

                            {/* Stars rating */}
                            <div className="flex items-center gap-1 mt-1.5">
                              {[1, 2, 3].map((starNum) => (
                                <Star
                                  key={starNum}
                                  className={`w-3.5 h-3.5 ${
                                    starNum <= lvl.starsEarned
                                      ? 'text-amber-400 fill-amber-400 drop-shadow'
                                      : 'text-white/15'
                                  }`}
                                />
                              ))}
                              <span className="text-[10px] text-theme-muted ml-2 font-bold">
                                +{lvl.xpReward} XP
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-main transition-colors shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

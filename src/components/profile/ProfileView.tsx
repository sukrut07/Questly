'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import {
  User,
  Shield,
  Sparkles,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  Settings,
  Palette,
  Crown,
  Lock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function ProfileView() {
  const { user, streak, quests, focusSessions, achievements, updateProfile, setActiveModal } =
    useQuestly();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'cosmetics' | 'achievements'>('overview');

  const totalFocusHours = (
    focusSessions.reduce((acc, fs) => acc + Math.floor(fs.elapsedSeconds / 60), 0) / 60
  ).toFixed(1);

  const completedQuestsCount = quests.filter((q) => q.status === 'COMPLETED').length;
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  const avatarFrames = [
    { id: 'frame_amethyst', label: 'Amethyst Ward', color: 'border-purple-500 shadow-purple-500/30' },
    { id: 'frame_gilded', label: 'Gilded Sun', color: 'border-yellow-400 shadow-yellow-400/30' },
    { id: 'frame_celestial', label: 'Celestial Starlight', color: 'border-cyan-400 shadow-cyan-400/30' },
    { id: 'frame_emerald', label: 'Verdant Grove', color: 'border-emerald-400 shadow-emerald-400/30' },
  ];

  const worldThemes = [
    { id: 'arcane', label: 'Arcane Twilight', desc: 'Mystic violet and deep starlight skies' },
    { id: 'verdant', label: 'Verdant Haven', desc: 'Emerald pines and rolling green hills' },
    { id: 'celestial', label: 'Celestial Aurora', desc: 'Aurora borealis and cosmic floating obelisks' },
    { id: 'volcanic', label: 'Molten Ember', desc: 'Gleaming ember lanterns and warm hearthstones' },
  ];

  const auras = [
    { id: 'sparkles', label: 'Arcane Sparkles' },
    { id: 'fireflies', label: 'Glade Fireflies' },
    { id: 'aurora', label: 'Stardust Veil' },
    { id: 'none', label: 'Minimalist (None)' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-main border border-theme shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with customized frame */}
            <div
              className={`relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-1 flex items-center justify-center text-white shadow-xl ${
                avatarFrames.find((f) => f.id === user.activeCosmetics.avatarFrame)?.color || ''
              }`}
            >
              <Shield className="w-10 h-10" />
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-yellow-400 text-black text-xs font-black border border-black/40 shadow-md">
                L{user.level}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-theme-main tracking-tight">
                  {user.displayName}
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-primary-violet/20 border border-primary-violet/40 text-primary-violet uppercase tracking-wider">
                  {user.currentStage}
                </span>
              </div>
              <p className="text-xs text-theme-muted font-medium">{user.title}</p>
              <div className="flex items-center gap-3 text-xs text-theme-muted pt-1">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{streak.currentStreak} Day Streak</span>
                </span>
                <span>•</span>
                <span>Stage {streak.worldStage} Realm</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveModal('settings');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-elevated hover:bg-surface-elevated/80 border border-theme text-theme-main text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
          >
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-6 border-t border-theme/60 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-theme-muted">Rank Ascension Progress</span>
            <span className="text-primary-violet font-bold">
              {user.currentXp} / {user.nextLevelXp} XP ({Math.round((user.currentXp / user.nextLevelXp) * 100)}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-400 rounded-full transition-all duration-700 shadow-sm"
              style={{
                width: `${Math.min(100, (user.currentXp / user.nextLevelXp) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-main border border-theme w-fit text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'overview'
              ? 'bg-primary-violet text-white shadow-md'
              : 'text-theme-muted hover:text-theme-main'
          }`}
        >
          Character Sheet
        </button>
        <button
          onClick={() => setActiveSubTab('cosmetics')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'cosmetics'
              ? 'bg-primary-violet text-white shadow-md'
              : 'text-theme-muted hover:text-theme-main'
          }`}
        >
          Realm Cosmetics
        </button>
        <button
          onClick={() => setActiveSubTab('achievements')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'achievements'
              ? 'bg-primary-violet text-white shadow-md'
              : 'text-theme-muted hover:text-theme-main'
          }`}
        >
          Trophies ({unlockedAchievementsCount}/{achievements.length})
        </button>
      </div>

      {/* 1. Character Sheet Overview */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-surface-main border border-theme text-center space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-primary-violet/15 text-primary-violet flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-theme-main">{completedQuestsCount}</div>
            <div className="text-xs text-theme-muted font-bold">Quests Fulfilled</div>
          </div>

          <div className="p-5 rounded-3xl bg-surface-main border border-theme text-center space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-electric-blue/15 text-electric-blue flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-theme-main">{totalFocusHours}h</div>
            <div className="text-xs text-theme-muted font-bold">Deep Work Hours</div>
          </div>

          <div className="p-5 rounded-3xl bg-surface-main border border-theme text-center space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-theme-main">{user.totalXp.toLocaleString()}</div>
            <div className="text-xs text-theme-muted font-bold">Lifetime XP Earned</div>
          </div>
        </div>
      )}

      {/* 2. Realm Cosmetics */}
      {activeSubTab === 'cosmetics' && (
        <div className="space-y-6">
          {/* Avatar Frames */}
          <div className="p-6 rounded-3xl bg-surface-main border border-theme space-y-3">
            <h3 className="font-extrabold text-sm text-theme-main">Avatar Frames</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {avatarFrames.map((frame) => {
                const isSelected = user.activeCosmetics.avatarFrame === frame.id;
                return (
                  <div
                    key={frame.id}
                    onClick={() => {
                      sound.playButtonClick();
                      updateProfile({
                        activeCosmetics: { ...user.activeCosmetics, avatarFrame: frame.id },
                      });
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary-violet/15 border-primary-violet text-theme-main font-bold shadow-md'
                        : 'bg-surface-elevated/40 border-theme text-theme-muted hover:text-theme-main'
                    }`}
                  >
                    <span className="text-xs">{frame.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-violet" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* World Themes */}
          <div className="p-6 rounded-3xl bg-surface-main border border-theme space-y-3">
            <h3 className="font-extrabold text-sm text-theme-main">World Visual Themes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {worldThemes.map((th) => {
                const isSelected = user.activeCosmetics.worldTheme === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => {
                      sound.playButtonClick();
                      updateProfile({
                        activeCosmetics: {
                          ...user.activeCosmetics,
                          worldTheme: th.id as 'celestial' | 'arcane' | 'verdant' | 'volcanic',
                        },
                      });
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary-violet/15 border-primary-violet text-theme-main font-bold shadow-md'
                        : 'bg-surface-elevated/40 border-theme text-theme-muted hover:text-theme-main'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-theme-main">{th.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-violet" />}
                    </div>
                    <p className="text-[11px] text-theme-muted">{th.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ambient Auras */}
          <div className="p-6 rounded-3xl bg-surface-main border border-theme space-y-3">
            <h3 className="font-extrabold text-sm text-theme-main">Ambient Auras</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {auras.map((aura) => {
                const isSelected = user.activeCosmetics.ambientAura === aura.id;
                return (
                  <div
                    key={aura.id}
                    onClick={() => {
                      sound.playButtonClick();
                      updateProfile({
                        activeCosmetics: {
                          ...user.activeCosmetics,
                          ambientAura: aura.id as 'sparkles' | 'fireflies' | 'aurora' | 'embers' | 'none',
                        },
                      });
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center ${
                      isSelected
                        ? 'bg-primary-violet/15 border-primary-violet text-theme-main font-bold shadow-md'
                        : 'bg-surface-elevated/40 border-theme text-theme-muted hover:text-theme-main'
                    }`}
                  >
                    <span className="text-xs">{aura.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Trophies & Achievements */}
      {activeSubTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                ach.isUnlocked
                  ? 'bg-surface-main border-amber-400/40 shadow-md'
                  : 'bg-surface-elevated/30 border-theme/40 opacity-70'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  ach.isUnlocked
                    ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-md'
                    : 'bg-surface-elevated border-theme text-theme-muted'
                }`}
              >
                {ach.isUnlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="font-bold text-xs text-theme-main truncate">{ach.title}</h4>
                  <span className="text-[10px] font-black text-amber-400 shrink-0">
                    +{ach.xpReward} XP
                  </span>
                </div>
                <p className="text-[11px] text-theme-muted leading-relaxed line-clamp-2">
                  {ach.description}
                </p>

                {ach.isUnlocked ? (
                  <div className="text-[10px] text-mint-green font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked</span>
                  </div>
                ) : (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-theme-muted">
                      <span>Progress</span>
                      <span>
                        {ach.progress} / {ach.maxProgress}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden">
                      <div
                        className="h-full bg-primary-violet rounded-full"
                        style={{
                          width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

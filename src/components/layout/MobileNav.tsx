'use client';

import React from 'react';
import { useQuestly, AppTab } from '@/lib/store';
import {
  Compass,
  CheckSquare,
  Map,
  Hourglass,
  Gamepad2,
  BarChart3,
  User,
  Sparkles,
  Flame,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function MobileNav() {
  const { currentTab, setCurrentTab, streak, user, settings, updateSettings } = useQuestly();

  const handleTab = (tab: AppTab) => {
    sound.playButtonClick();
    setCurrentTab(tab);
  };

  const toggleTheme = () => {
    sound.playButtonClick();
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleSound = () => {
    sound.playButtonClick();
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <>
      {/* Top Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface-main/90 border-b border-theme backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              Questly
            </h1>
            <p className="text-[9px] text-theme-muted font-bold">L{user.level} {user.currentStage}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak Flame */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>{streak.currentStreak}d</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main bg-surface-elevated/40"
            aria-label="Toggle sound"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-coral" />}
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main bg-surface-elevated/40"
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar */}
      <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-main/95 border-t border-theme backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'home' ? 'text-primary-violet font-bold' : 'text-theme-muted'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleTab('quests')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'quests' ? 'text-primary-violet font-bold' : 'text-theme-muted'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Quests</span>
        </button>

        <button
          onClick={() => handleTab('map')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'map' ? 'text-primary-violet font-bold' : 'text-theme-muted'
          }`}
        >
          <Map className="w-5 h-5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => handleTab('focus')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'focus' ? 'text-primary-violet font-bold' : 'text-theme-muted'
          }`}
        >
          <Hourglass className="w-5 h-5" />
          <span>Focus</span>
        </button>

        <button
          onClick={() => handleTab('arcade')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'arcade' ? 'text-primary-violet font-bold' : 'text-theme-muted'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span>Arcade</span>
        </button>

        <button
          onClick={() => handleTab('analytics')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'analytics' ? 'text-primary-violet font-bold' : 'text-theme-muted'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Stats</span>
        </button>

        <button
          onClick={() => handleTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'profile' ? 'text-primary-violet font-bold' : 'text-theme-muted'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
}

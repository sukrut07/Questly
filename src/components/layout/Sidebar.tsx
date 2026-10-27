'use client';

import React from 'react';
import { useQuestly, AppTab } from '@/lib/store';
import {
  Sparkles,
  Flame,
  Compass,
  CheckSquare,
  Map,
  Hourglass,
  Gamepad2,
  BarChart3,
  User,
  Settings,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Shield,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function Sidebar() {
  const {
    currentTab,
    setCurrentTab,
    user,
    streak,
    quests,
    focusSessions,
    settings,
    updateSettings,
    setActiveModal,
  } = useQuestly();

  // Navigation tabs
  const navItems: { tab: AppTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      tab: 'home',
      label: 'Home',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      tab: 'quests',
      label: 'Quests',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: quests.filter((q) => q.status === 'IN_PROGRESS' || q.status === 'NOT_STARTED').length,
    },
    {
      tab: 'map',
      label: 'Adventure Map',
      icon: <Map className="w-5 h-5" />,
    },
    {
      tab: 'focus',
      label: 'Focus Chamber',
      icon: <Hourglass className="w-5 h-5" />,
    },
    {
      tab: 'arcade',
      label: 'Arcade',
      icon: <Gamepad2 className="w-5 h-5" />,
    },
    {
      tab: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      tab: 'profile',
      label: 'Profile & Gear',
      icon: <User className="w-5 h-5" />,
    },
  ];

  // Daily goal calculation for compact ring
  const completedTodayQuests = quests.filter((q) => q.status === 'COMPLETED').length;
  const questProgress = Math.min(100, Math.round((completedTodayQuests / Math.max(1, settings.dailyQuestTargetCount)) * 100));

  const handleTabClick = (tab: AppTab) => {
    sound.playButtonClick();
    setCurrentTab(tab);
  };

  const toggleSound = () => {
    sound.playButtonClick();
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleTheme = () => {
    sound.playButtonClick();
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 bg-surface-main/90 border-r border-theme backdrop-blur-xl z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-theme">
        <div
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              Questly
            </h1>
            <p className="text-[10px] text-theme-muted font-medium tracking-wider uppercase">
              Living Kingdom
            </p>
          </div>
        </div>

        {/* Streak Flame Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs"
          title={`Current Streak: ${streak.currentStreak} active days`}
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
          <span>{streak.currentStreak}d</span>
        </div>
      </div>

      {/* User Progress Mini Card */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-surface-elevated/70 border border-theme">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-yellow-400 text-black text-[9px] font-black border border-black/40">
              L{user.level}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-bold truncate text-theme-main">{user.displayName}</h2>
            <p className="text-[10px] text-theme-muted truncate">{user.title}</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-theme-muted font-medium">
            <span>XP Progress</span>
            <span className="text-primary-violet font-bold">
              {user.currentXp} / {user.nextLevelXp}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (user.currentXp / user.nextLevelXp) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => handleTabClick(item.tab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-primary-violet/15 text-primary-violet border border-primary-violet/30 font-semibold shadow-sm'
                  : 'text-theme-muted hover:text-theme-main hover:bg-surface-elevated/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-primary-violet' : 'text-theme-muted group-hover:text-theme-main'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-primary-violet text-white'
                      : 'bg-surface-elevated text-theme-muted group-hover:text-theme-main'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Daily Goal Compact Indicator */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-surface-elevated/40 border border-theme flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg className="w-7 h-7 transform -rotate-90">
              <circle
                cx="14"
                cy="14"
                r="11"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-white/10"
                fill="none"
              />
              <circle
                cx="14"
                cy="14"
                r="11"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={2 * Math.PI * 11}
                strokeDashoffset={2 * Math.PI * 11 * (1 - questProgress / 100)}
                strokeLinecap="round"
                className="text-mint-green transition-all duration-700"
                fill="none"
              />
            </svg>
            <span className="absolute text-[8px] font-black text-theme-main">{questProgress}%</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-theme-main">Daily Quests</p>
            <p className="text-[9px] text-theme-muted">
              {completedTodayQuests} of {settings.dailyQuestTargetCount} fulfilled
            </p>
          </div>
        </div>
      </div>

      {/* Footer Controls: Audio, Theme & Settings */}
      <div className="p-3 border-t border-theme flex items-center justify-between text-theme-muted">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg hover:bg-surface-elevated hover:text-theme-main transition-colors"
            title={settings.soundEnabled ? 'Mute synthesized sound effects' : 'Enable synthesized sound effects'}
            aria-label="Toggle sound"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-coral" />}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-elevated hover:text-theme-main transition-colors"
            title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} theme`}
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={() => {
            sound.playButtonClick();
            setActiveModal('settings');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-surface-elevated hover:text-theme-main transition-colors"
          title="Open Settings"
        >
          <Settings className="w-4 h-4" />
          <span>Config</span>
        </button>
      </div>
    </aside>
  );
}

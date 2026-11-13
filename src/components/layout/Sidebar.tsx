'use client';

import React from 'react';
import { useQuestly, AppTab } from '@/lib/store';
import {
  Compass,
  Calendar,
  BookOpen,
  Inbox,
  Hourglass,
  BarChart3,
  User,
  Sparkles,
  RotateCcw,
  Download,
  Search,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function Sidebar() {
  const {
    currentTab,
    setCurrentTab,
    user,
    inbox,
    quests,
    settings,
    updateSettings,
    setCommandPaletteOpen,
    setActiveModal,
  } = useQuestly();

  const navItems: { tab: AppTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      tab: 'home',
      label: 'Command Center',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      tab: 'planner',
      label: 'Planner',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      tab: 'subjects',
      label: 'Subjects',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      tab: 'inbox',
      label: 'Academic Inbox',
      icon: <Inbox className="w-4 h-4" />,
      badge: inbox.length > 0 ? inbox.length : undefined,
    },
    {
      tab: 'focus',
      label: 'Focus Chamber',
      icon: <Hourglass className="w-4 h-4" />,
    },
    {
      tab: 'analytics',
      label: 'Insights',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      tab: 'profile',
      label: 'Profile & Settings',
      icon: <User className="w-4 h-4" />,
    },
  ];

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
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 bg-zinc-950 border-r border-zinc-800 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-lime-400 flex items-center justify-center text-zinc-950 font-black text-sm">
            Q
          </div>
          <div>
            <h1 className="text-sm font-black text-zinc-100 tracking-tight">QUESTLY</h1>
            <p className="text-[10px] text-zinc-500 font-mono">Academic OS v2.0</p>
          </div>
        </div>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors"
          title="Search (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-3 py-1.5">
          Workspace
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => handleTabClick(item.tab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-lime-400' : 'text-zinc-500'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-400 font-bold border border-amber-400/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Tools & Utilities */}
        <div className="pt-4">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-3 py-1.5">
            Tools
          </div>

          <button
            onClick={() => setActiveModal('templates')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => setActiveModal('weekly_review')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-blue-400" />
            <span>Weekly Review</span>
          </button>

          <button
            onClick={() => setActiveModal('data_backup')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <Download className="w-4 h-4 text-zinc-400" />
            <span>Data Backup</span>
          </button>
        </div>
      </div>

      {/* User Footer Profile & Settings */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80 space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
              {user.displayName.substring(0, 1)}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-zinc-200 truncate">{user.displayName}</div>
              <div className="text-[10px] text-zinc-500 font-mono">Lvl {user.level} {user.academicRank}</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
              title="Toggle Sound"
            >
              {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
              title="Toggle Theme"
            >
              {settings.theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

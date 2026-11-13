'use client';

import React from 'react';
import { useQuestly, AppTab } from '@/lib/store';
import {
  Compass,
  CheckSquare,
  Clock,
  FolderKanban,
  Gamepad2,
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
  LayoutGrid,
  Zap,
  Home,
  Smartphone,
} from 'lucide-react';
import { sound } from '@/common/SoundService';
import { QuestlyLogo } from '@/components/common/QuestlyLogo';

export function Sidebar() {
  const {
    setMode,
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
      tab: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: quests.filter((q) => q.status !== 'COMPLETED').length || undefined,
    },
    {
      tab: 'timetable',
      label: 'Timetable',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      tab: 'workspaces',
      label: 'Workspaces',
      icon: <FolderKanban className="w-4 h-4" />,
    },
    {
      tab: 'arcade',
      label: 'Questly Arcade',
      icon: <Gamepad2 className="w-4 h-4" />,
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
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 bg-[#090A0D] border-r border-[#303642] z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#303642]">
        <button
          onClick={() => {
            sound.playButtonClick();
            setMode('landing');
          }}
          className="flex items-center gap-2.5 text-left group"
          title="Return to Public Landing Page"
        >
          <div className="w-8 h-8 rounded-xl bg-[#171A21] border border-[#303642] flex items-center justify-center transition-transform group-hover:scale-105">
            <QuestlyLogo size={22} variant="lime" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-[#F5F5F0] tracking-tight group-hover:text-[#B5FF55] transition-colors font-display uppercase">
                QUESTLY
              </h1>
              <span className="text-[9px] font-mono font-bold text-[#B5FF55] px-1.5 py-0.2 rounded bg-[#B5FF55]/10 border border-[#B5FF55]/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-[#A1A1A1] font-mono">Academic OS</p>
          </div>
        </button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-1.5 rounded-lg bg-[#171A21] border border-[#303642] text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#20242D] transition-colors"
          title="Search (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[10px] font-mono font-bold text-[#737373] uppercase tracking-wider px-3 py-1.5">
          Workspace
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => handleTabClick(item.tab)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/40 font-black'
                  : 'text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#171A21] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-[#B5FF55]' : 'text-[#737373]'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#B5FF55]/20 text-[#B5FF55] font-bold border border-[#B5FF55]/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Tools & Utilities */}
        <div className="pt-3">
          <div className="text-[10px] font-mono font-bold text-[#737373] uppercase tracking-wider px-3 py-1.5">
            Tools & Systems
          </div>

          <button
            onClick={() => setActiveModal('xp_tracker')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#B5FF55] hover:bg-[#B5FF55]/10 transition-colors"
          >
            <Zap className="w-4 h-4 text-[#B5FF55]" />
            <span>XP Tracker & Ledger</span>
          </button>

          <button
            onClick={() => handleTabClick('widget')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1A1] hover:text-[#42DFFF] hover:bg-[#171A21] transition-colors"
          >
            <Smartphone className="w-4 h-4 text-[#42DFFF]" />
            <span>Mobile Widget</span>
          </button>

          <button
            onClick={() => setActiveModal('widgets')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#171A21] transition-colors"
          >
            <LayoutGrid className="w-4 h-4 text-[#42DFFF]" />
            <span>Customize Widgets</span>
          </button>

          <button
            onClick={() => setActiveModal('templates')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#171A21] transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#A879FF]" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => setActiveModal('weekly_review')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#171A21] transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#FF9C45]" />
            <span>Weekly Review</span>
          </button>

          <button
            onClick={() => setActiveModal('data_backup')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#171A21] transition-colors"
          >
            <Download className="w-4 h-4 text-[#A1A1A1]" />
            <span>Data Backup</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              setMode('landing');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#737373] hover:text-[#B5FF55] hover:bg-[#171A21] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Public Landing Page</span>
          </button>
        </div>
      </div>

      {/* User Footer Profile & Settings */}
      <div className="p-3 border-t border-[#303642] bg-[#111319] space-y-2">
        <div
          onClick={() => setActiveModal('xp_tracker')}
          className="p-2 rounded-xl bg-[#171A21] border border-[#303642] hover:border-[#B5FF55]/50 cursor-pointer transition-all flex items-center justify-between"
          title="Click to view full XP Ledger & Progression Roadmap"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#B5FF55] text-[#090A0D] flex items-center justify-center text-xs font-black font-display">
              {user.displayName.substring(0, 1)}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[#F5F5F0] truncate font-display">
                {user.displayName}
              </div>
              <div className="text-[10px] text-[#B5FF55] font-mono">
                LVL {user.level} {user.academicRank}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#A1A1A1] px-1.5 py-0.5 rounded bg-[#111319]">
            {user.totalXp} XP
          </span>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono text-[#737373]">Audio & Theme</span>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#F5F5F0] hover:bg-[#171A21] transition-colors"
              title="Toggle Sound"
            >
              {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#F5F5F0] hover:bg-[#171A21] transition-colors"
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

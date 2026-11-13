'use client';

import React, { useState } from 'react';
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
  Flame,
  Search,
  Plus,
  Menu,
  X,
  Sparkles,
  RotateCcw,
  Download,
  LayoutGrid,
  Home,
  Snowflake,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { sound } from '@/common/SoundService';
import { QuestlyLogo } from '@/components/common/QuestlyLogo';

export function MobileNav() {
  const {
    setMode,
    currentTab,
    setCurrentTab,
    streak,
    user,
    inbox,
    quests,
    settings,
    updateSettings,
    setCommandPaletteOpen,
    setActiveModal,
    setSelectedQuest,
  } = useQuestly();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTab = (tab: AppTab) => {
    sound.playButtonClick();
    setCurrentTab(tab);
    setDrawerOpen(false);
  };

  const handleQuickAdd = () => {
    sound.playButtonClick();
    setSelectedQuest(null);
    setActiveModal('new_task');
  };

  const toggleSound = () => {
    sound.playButtonClick();
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <>
      {/* Top Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#090A0D]/95 border-b border-[#303642] backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sound.playButtonClick();
              setDrawerOpen(true);
            }}
            className="p-1.5 rounded-lg bg-[#171A21] border border-[#303642] text-[#F5F5F0] hover:bg-[#20242D] transition-colors"
            aria-label="Open menu drawer"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              setMode('landing');
            }}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-[#171A21] border border-[#303642] flex items-center justify-center">
              <QuestlyLogo size={18} variant="lime" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-[#F5F5F0] font-display uppercase">
                  Questly
                </span>
                <span className="text-[9px] font-mono font-bold text-[#B5FF55] px-1 py-0.2 rounded bg-[#B5FF55]/10 border border-[#B5FF55]/30">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-[#A1A1A1] font-mono">
                L{user.level} {user.academicRank}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* XP Pill */}
          <button
            onClick={() => setActiveModal('xp_tracker')}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#B5FF55]/10 border border-[#B5FF55]/30 text-[#B5FF55] text-xs font-bold font-mono"
          >
            <Zap className="w-3 h-3 fill-[#B5FF55]" />
            <span>{user.totalXp} XP</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1.5 rounded-lg bg-[#171A21] border border-[#303642] text-[#A1A1A1] hover:text-[#F5F5F0]"
            aria-label="Search (Cmd+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Streak Flame */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF806B]/10 border border-[#FF806B]/30 text-[#FF806B] text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 fill-[#FF806B]" />
            <span>{streak.currentStreak}d</span>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-150"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-72 h-full bg-[#090A0D] border-r border-[#303642] flex flex-col p-4 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#303642]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#171A21] border border-[#303642] flex items-center justify-center">
                  <QuestlyLogo size={20} variant="lime" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F5F5F0] font-display uppercase">QUESTLY</h3>
                  <p className="text-[10px] text-[#A1A1A1] font-mono">Academic OS v2.0</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#171A21]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              <div className="text-[10px] font-mono font-bold text-[#737373] uppercase tracking-wider px-3 py-1.5">
                Workspace
              </div>

              {[
                { tab: 'home' as AppTab, label: 'Command Center', icon: <Compass className="w-4 h-4" /> },
                { tab: 'tasks' as AppTab, label: 'Tasks', icon: <CheckSquare className="w-4 h-4" />, count: quests.filter((q) => q.status !== 'COMPLETED').length },
                { tab: 'timetable' as AppTab, label: 'Timetable', icon: <Clock className="w-4 h-4" /> },
                { tab: 'workspaces' as AppTab, label: 'Workspaces', icon: <FolderKanban className="w-4 h-4" /> },
                { tab: 'arcade' as AppTab, label: 'Questly Arcade', icon: <Gamepad2 className="w-4 h-4" /> },
                { tab: 'planner' as AppTab, label: 'Planner & Deadlines', icon: <Calendar className="w-4 h-4" /> },
                { tab: 'subjects' as AppTab, label: 'Subjects & Syllabus', icon: <BookOpen className="w-4 h-4" /> },
                { tab: 'inbox' as AppTab, label: 'Academic Inbox', icon: <Inbox className="w-4 h-4" />, count: inbox.length },
                { tab: 'focus' as AppTab, label: 'Focus Chamber', icon: <Hourglass className="w-4 h-4" /> },
                { tab: 'analytics' as AppTab, label: 'Insights & Mastery', icon: <BarChart3 className="w-4 h-4" /> },
                { tab: 'profile' as AppTab, label: 'Profile & Settings', icon: <User className="w-4 h-4" /> },
              ].map((item) => {
                const isActive = currentTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => handleTab(item.tab)}
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
                    {item.count ? (
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#B5FF55]/20 text-[#B5FF55] font-bold border border-[#B5FF55]/40">
                        {item.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              <div className="pt-3">
                <div className="text-[10px] font-mono font-bold text-[#737373] uppercase tracking-wider px-3 py-1.5">
                  Tools & System
                </div>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setActiveModal('xp_tracker');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#B5FF55] hover:bg-[#B5FF55]/10"
                >
                  <Zap className="w-4 h-4" />
                  <span>XP Ledger & Progression</span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setActiveModal('widgets');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#171A21]"
                >
                  <LayoutGrid className="w-4 h-4 text-[#42DFFF]" />
                  <span>Customize Widgets</span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setActiveModal('templates');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#171A21]"
                >
                  <Sparkles className="w-4 h-4 text-[#A879FF]" />
                  <span>Templates</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#303642] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#A1A1A1]">
                LVL {user.level} • {user.totalXp} XP
              </span>
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#F5F5F0] hover:bg-[#171A21]"
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Mobile Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090A0D]/95 border-t border-[#303642] backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl"
      >
        <button
          onClick={() => handleTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'home' ? 'text-[#B5FF55] font-black' : 'text-[#737373]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleTab('tasks')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'tasks' ? 'text-[#B5FF55] font-black' : 'text-[#737373]'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tasks</span>
        </button>

        {/* Center Floating Action Button */}
        <button
          onClick={handleQuickAdd}
          className="flex items-center justify-center w-11 h-11 -mt-5 rounded-full bg-[#B5FF55] text-[#090A0D] shadow-lg border-2 border-[#090A0D] transition-transform active:scale-95 brutal-shadow"
          aria-label="Add Task"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>

        <button
          onClick={() => handleTab('timetable')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'timetable' ? 'text-[#B5FF55] font-black' : 'text-[#737373]'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>Classes</span>
        </button>

        <button
          onClick={() => handleTab('arcade')}
          className={`relative flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'arcade' ? 'text-[#B5FF55] font-black' : 'text-[#737373]'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span>Arcade</span>
        </button>
      </nav>
    </>
  );
}

'use client';

import React from 'react';
import { useQuestly, AppTab } from '@/lib/store';
import {
  Compass,
  Calendar,
  BookOpen,
  Inbox,
  Hourglass,
  Flame,
  Search,
  Plus,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function MobileNav() {
  const {
    currentTab,
    setCurrentTab,
    streak,
    user,
    inbox,
    setCommandPaletteOpen,
    setActiveModal,
    setSelectedQuest,
  } = useQuestly();

  const handleTab = (tab: AppTab) => {
    sound.playButtonClick();
    setCurrentTab(tab);
  };

  const handleQuickAdd = () => {
    sound.playButtonClick();
    setSelectedQuest(null);
    setActiveModal('new_task');
  };

  return (
    <>
      {/* Top Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-zinc-950/90 border-b border-zinc-800 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-lime-400 flex items-center justify-center text-zinc-950 font-black text-xs">
            Q
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-zinc-100">
              Questly
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono">
              L{user.level} {user.academicRank}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Streak Flame */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>{streak.currentStreak}d</span>
          </div>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl"
      >
        <button
          onClick={() => handleTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'home' ? 'text-lime-400 font-bold' : 'text-zinc-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleTab('planner')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'planner' ? 'text-lime-400 font-bold' : 'text-zinc-500'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Planner</span>
        </button>

        {/* Center Floating Action Button */}
        <button
          onClick={handleQuickAdd}
          className="flex items-center justify-center w-11 h-11 -mt-5 rounded-full bg-lime-400 text-zinc-950 shadow-lg border-2 border-zinc-950 transition-transform active:scale-95"
          aria-label="Add Task"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>

        <button
          onClick={() => handleTab('subjects')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'subjects' ? 'text-lime-400 font-bold' : 'text-zinc-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Subjects</span>
        </button>

        <button
          onClick={() => handleTab('inbox')}
          className={`relative flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'inbox' ? 'text-lime-400 font-bold' : 'text-zinc-500'
          }`}
        >
          <Inbox className="w-5 h-5" />
          <span>Inbox</span>
          {inbox.length > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>
      </nav>
    </>
  );
}

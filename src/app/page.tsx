'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Toast } from '@/components/layout/Toast';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { QuestList } from '@/components/quests/QuestList';
import { AdventureMap } from '@/components/map/AdventureMap';
import { FocusChamber } from '@/components/focus/FocusChamber';
import { ArcadeHub } from '@/components/arcade/ArcadeHub';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { ProfileView } from '@/components/profile/ProfileView';

// Modals
import { WorldModal } from '@/components/world/WorldModal';
import { QuestModal } from '@/components/quests/QuestModal';
import { LevelDetailModal } from '@/components/map/LevelDetailModal';
import { SettingsModal } from '@/components/profile/SettingsModal';

export default function QuestlyApp() {
  const { currentTab, isHydrated } = useQuestly();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-theme-main flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white animate-spin">
            ✦
          </div>
          <span className="text-xs font-bold text-theme-muted tracking-wider uppercase">
            Summoning Kingdom...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-theme-main text-theme-main selection:bg-purple-600 selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Header and Bottom Navigation */}
      <MobileNav />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 pb-24 lg:pb-12 max-w-7xl mx-auto w-full transition-all duration-300">
        {currentTab === 'home' && <HomeDashboard />}
        {currentTab === 'quests' && <QuestList />}
        {currentTab === 'map' && <AdventureMap />}
        {currentTab === 'focus' && <FocusChamber />}
        {currentTab === 'arcade' && <ArcadeHub />}
        {currentTab === 'analytics' && <AnalyticsDashboard />}
        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Global Overlays & Modals */}
      <Toast />
      <WorldModal />
      <QuestModal />
      <LevelDetailModal />
      <SettingsModal />
    </div>
  );
}

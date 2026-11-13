'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { LandingPage } from '@/components/landing/LandingPage';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Toast } from '@/components/layout/Toast';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { PlannerView } from '@/components/planner/PlannerView';
import { SubjectsView } from '@/components/subjects/SubjectsView';
import { AcademicInboxView } from '@/components/inbox/AcademicInboxView';
import { FocusChamber } from '@/components/focus/FocusChamber';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { ProfileView } from '@/components/profile/ProfileView';

// Modals
import { QuestModal } from '@/components/quests/QuestModal';
import { SubjectModal } from '@/components/subjects/SubjectModal';
import { DeadlineModal } from '@/components/planner/DeadlineModal';
import { WidgetManagerModal } from '@/components/widgets/WidgetManagerModal';
import { CommandPalette } from '@/components/command/CommandPalette';
import { TemplatesModal } from '@/components/templates/TemplatesModal';
import { DataBackupModal } from '@/components/backup/DataBackupModal';
import { WeeklyReviewModal } from '@/components/review/WeeklyReviewModal';
import { SettingsModal } from '@/components/profile/SettingsModal';

export default function QuestlyApp() {
  const { mode, currentTab, isHydrated } = useQuestly();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#101010] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B5FF55] flex items-center justify-center text-[#101010] font-black text-sm animate-pulse brutal-shadow">
            Q
          </div>
          <span className="text-xs font-mono font-bold text-[#A1A1A1] tracking-wider">
            Loading academic workspace...
          </span>
        </div>
      </div>
    );
  }

  // If mode is landing, show public-facing landing page
  if (mode === 'landing') {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#101010] text-[#F5F5F0] selection:bg-[#B5FF55] selection:text-[#101010]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Header and Bottom Navigation */}
      <MobileNav />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-12 max-w-6xl mx-auto w-full transition-all duration-200">
        {currentTab === 'home' && <HomeDashboard />}
        {currentTab === 'planner' && <PlannerView />}
        {currentTab === 'subjects' && <SubjectsView />}
        {currentTab === 'inbox' && <AcademicInboxView />}
        {currentTab === 'focus' && <FocusChamber />}
        {currentTab === 'analytics' && <AnalyticsDashboard />}
        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Global Overlays & Modals */}
      <Toast />
      <QuestModal />
      <SubjectModal />
      <DeadlineModal />
      <WidgetManagerModal />
      <CommandPalette />
      <TemplatesModal />
      <DataBackupModal />
      <WeeklyReviewModal />
      <SettingsModal />
    </div>
  );
}


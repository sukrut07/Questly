'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import {
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { sound } from '@/common/SoundService';
import { QuestlyLogo } from '@/components/common/QuestlyLogo';

export type WidgetFamily = 'small' | 'medium' | 'large';

interface MobileWidgetViewProps {
  standalone?: boolean;
}

export function MobileWidgetView({ standalone = false }: MobileWidgetViewProps) {
  const {
    user,
    streak,
    quests,
    timetable,
    focusSessions,
    completeQuest,
    reopenQuest,
    setCurrentTab,
  } = useQuestly();

  const [widgetSize, setWidgetSize] = useState<WidgetFamily>('medium');
  const [copied, setCopied] = useState(false);
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState<number>(1);
  const [todayDateStr, setTodayDateStr] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setCurrentDayOfWeek(now.getDay() === 0 ? 7 : now.getDay());
    setTodayDateStr(now.toDateString());
  }, []);

  // Active / next task
  const activeQuests = quests.filter((q) => q.status !== 'COMPLETED');
  const completedTodayQuests = quests.filter((q) => q.status === 'COMPLETED').length;
  const primaryTask = activeQuests[0];

  // Today's focus minutes
  const todaySessions = focusSessions.filter((fs) => {
    return todayDateStr ? new Date(fs.startedAt).toDateString() === todayDateStr : false;
  });
  const todayFocusMinutes = todaySessions.reduce(
    (acc, fs) => acc + Math.floor(fs.elapsedSeconds / 60),
    0
  );

  // Timetable slot
  const todaySlots = timetable
    .filter((slot) => slot.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nextClass = todaySlots[0];

  const handleCopyEmbed = () => {
    sound.playButtonClick();
    const embedCode = `<iframe src="${window.location.origin}/widget" width="340" height="180" frameborder="0" style="border-radius:24px;border:none;"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleQuest = (questId: string, isCompleted: boolean) => {
    sound.playButtonClick();
    if (isCompleted) {
      reopenQuest(questId);
    } else {
      sound.playQuestComplete();
      completeQuest(questId);
    }
  };

  return (
    <div className={`space-y-6 ${standalone ? 'p-4 flex flex-col items-center justify-center min-h-screen bg-[#090A0D]' : ''}`}>
      {/* Selector & Actions Bar (hidden when rendered pure) */}
      {!standalone && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#171A21] border border-[#303642] flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutal-shadow">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#42DFFF]/15 border border-[#42DFFF]/40 flex items-center justify-center text-[#42DFFF]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#F5F5F0] font-display uppercase tracking-tight">
                Interactive Mobile Widget
              </h2>
              <p className="text-xs text-[#A1A1A1] font-mono">
                Live interactive home-screen widget. Check off tasks, track XP, and monitor class schedules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Size switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111319] border border-[#303642]">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    sound.playButtonClick();
                    setWidgetSize(size);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                    widgetSize === size
                      ? 'bg-[#42DFFF] text-[#090A0D] brutal-shadow'
                      : 'text-[#A1A1A1] hover:text-[#F5F5F0]'
                  }`}
                >
                  {size === 'small' ? '2×2' : size === 'medium' ? '4×2' : '4×4'}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyEmbed}
              className="px-3.5 py-1.5 rounded-xl bg-[#111319] hover:bg-[#1C2029] border border-[#303642] text-xs font-mono text-[#A1A1A1] hover:text-[#F5F5F0] transition-colors flex items-center gap-1.5"
              title="Copy HTML embed code for Webflow, Notion, or personal sites"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#B5FF55]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Embed Code'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Widget Container */}
      <div className="flex items-center justify-center w-full">
        {/* 1. Small (2x2) Widget */}
        {widgetSize === 'small' && (
          <div className="w-[160px] h-[160px] p-3.5 rounded-[26px] bg-[#090A0D] border-2 border-[#303642] shadow-[0_0_25px_rgba(0,0,0,0.8)] flex flex-col justify-between select-none relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-lg bg-[#171A21] border border-[#303642] flex items-center justify-center">
                <QuestlyLogo size={14} variant="lime" />
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#FF806B]">
                <Flame className="w-3.5 h-3.5 fill-[#FF806B]" />
                <span>{streak.currentStreak}d</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl font-black font-display text-[#B5FF55] tracking-tight">
                {user.totalXp} XP
              </div>
              <div className="text-[9px] font-mono text-[#A1A1A1] font-bold">
                LVL {user.level} {user.academicRank.toUpperCase()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-[#A1A1A1]">
                <span>Tasks</span>
                <span className="font-bold text-[#F5F5F0]">
                  {completedTodayQuests}/{quests.length}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#171A21] rounded-full overflow-hidden border border-[#303642]">
                <div
                  className="h-full bg-[#B5FF55] rounded-full transition-all duration-300"
                  style={{
                    width: `${quests.length > 0 ? (completedTodayQuests / quests.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Medium (4x2) Widget */}
        {widgetSize === 'medium' && (
          <div className="w-full max-w-[340px] h-[160px] p-4 rounded-[28px] bg-[#090A0D] border-2 border-[#303642] shadow-[0_0_25px_rgba(0,0,0,0.8)] flex items-stretch gap-3 select-none relative overflow-hidden">
            {/* Left Column: Stats & XP */}
            <div className="flex-1 flex flex-col justify-between pr-3 border-r border-[#303642]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#171A21] border border-[#303642] flex items-center justify-center">
                    <QuestlyLogo size={14} variant="lime" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#B5FF55]">
                    LVL {user.level}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-[11px] font-mono font-bold text-[#FF806B]">
                  <Flame className="w-3 h-3 fill-[#FF806B]" />
                  <span>{streak.currentStreak}d</span>
                </div>
              </div>

              <div>
                <div className="text-2xl font-black font-display text-[#F5F5F0] tracking-tight">
                  {user.totalXp} XP
                </div>
                <div className="text-[10px] font-mono text-[#A1A1A1]">
                  {todayFocusMinutes}m deep flow
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#B5FF55] font-bold">
                {completedTodayQuests}/{quests.length} Tasks Done
              </div>
            </div>

            {/* Right Column: Interactive Next Task */}
            <div className="flex-1 flex flex-col justify-between pl-1">
              <div>
                <span className="text-[8px] font-mono font-black uppercase text-[#42DFFF] tracking-wider block mb-1">
                  NEXT ACADEMIC ACTION
                </span>

                {primaryTask ? (
                  <div
                    onClick={() => handleToggleQuest(primaryTask.id, primaryTask.status === 'COMPLETED')}
                    className="p-2 rounded-xl bg-[#171A21] border border-[#303642] hover:border-[#B5FF55] transition-all cursor-pointer space-y-1 group"
                  >
                    <div className="flex items-start gap-1.5">
                      <div className="mt-0.5 text-[#B5FF55]">
                        {primaryTask.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 group-hover:text-[#B5FF55]" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#F5F5F0] line-clamp-2 leading-tight">
                        {primaryTask.title}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-[#A1A1A1] pt-0.5">
                      <span className="text-[#42DFFF] font-bold">
                        {primaryTask.subjectCode || 'ACADEMIC'}
                      </span>
                      <span>+{primaryTask.xpReward} XP</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#171A21] border border-dashed border-[#303642] text-center text-[10px] font-mono text-[#A1A1A1]">
                    All daily tasks cleared!
                  </div>
                )}
              </div>

              {nextClass && (
                <div className="text-[9px] font-mono text-[#A1A1A1] truncate pt-1">
                  Class: <strong className="text-[#F5F5F0]">{nextClass.subjectCode}</strong> @ {nextClass.startTime}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Large (4x4) Widget */}
        {widgetSize === 'large' && (
          <div className="w-full max-w-[340px] h-[340px] p-5 rounded-[32px] bg-[#090A0D] border-2 border-[#303642] shadow-[0_0_30px_rgba(0,0,0,0.85)] flex flex-col justify-between select-none relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#303642]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#171A21] border border-[#303642] flex items-center justify-center">
                  <QuestlyLogo size={16} variant="lime" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#F5F5F0] font-display uppercase tracking-wider">
                    QUESTLY ACADEMIC OS
                  </h3>
                  <span className="text-[9px] font-mono text-[#B5FF55]">
                    LVL {user.level} {user.academicRank.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#FF806B]">
                <Flame className="w-3.5 h-3.5 fill-[#FF806B]" />
                <span>{streak.currentStreak}d</span>
              </div>
            </div>

            {/* Metrics Triple Box */}
            <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-[#111319] border border-[#303642] text-center">
              <div>
                <span className="text-base font-black text-[#B5FF55] font-display block">
                  {user.totalXp}
                </span>
                <span className="text-[8px] font-mono text-[#A1A1A1]">TOTAL XP</span>
              </div>
              <div>
                <span className="text-base font-black text-[#A879FF] font-display block">
                  {todayFocusMinutes}m
                </span>
                <span className="text-[8px] font-mono text-[#A1A1A1]">FLOW TIME</span>
              </div>
              <div>
                <span className="text-base font-black text-[#42DFFF] font-display block">
                  {completedTodayQuests}/{quests.length}
                </span>
                <span className="text-[8px] font-mono text-[#A1A1A1]">TASKS</span>
              </div>
            </div>

            {/* Interactive Tasks Checklist */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-black uppercase text-[#A1A1A1] tracking-wider block">
                PRIORITY TASKS (TAP TO COMPLETE)
              </span>

              {activeQuests.slice(0, 2).map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleToggleQuest(q.id, q.status === 'COMPLETED')}
                  className="p-2.5 rounded-xl bg-[#171A21] border border-[#303642] hover:border-[#B5FF55] transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-[#B5FF55]">
                      {q.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#777]" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-mono truncate ${
                        q.status === 'COMPLETED' ? 'line-through text-[#777]' : 'text-[#F5F5F0]'
                      }`}
                    >
                      {q.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#B5FF55] shrink-0 font-bold">
                    +{q.xpReward} XP
                  </span>
                </div>
              ))}
            </div>

            {/* Timetable Session Footer */}
            <div className="p-2.5 rounded-xl bg-[#171A21] border border-[#303642] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#42DFFF]" />
                <span className="text-[10px] font-mono text-[#F5F5F0]">
                  {nextClass ? `${nextClass.subjectCode} (${nextClass.locationRoom || 'Hall TBA'})` : 'No classes today'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#42DFFF]">
                {nextClass ? `${nextClass.startTime} - ${nextClass.endTime}` : '--'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

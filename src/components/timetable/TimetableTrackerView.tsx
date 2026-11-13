'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { InteractiveGraphBackground } from '@/components/common/InteractiveGraphBackground';
import { sound } from '@/common/SoundService';

export function TimetableTrackerView() {
  const { timetable, deleteTimetableSlot, setActiveModal, showToast } = useQuestly();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'agenda'>('week');
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 1); // 1 = Mon .. 7 = Sun

  const days = [
    { num: 1, name: 'Monday', short: 'Mon' },
    { num: 2, name: 'Tuesday', short: 'Tue' },
    { num: 3, name: 'Wednesday', short: 'Wed' },
    { num: 4, name: 'Thursday', short: 'Thu' },
    { num: 5, name: 'Friday', short: 'Fri' },
    { num: 6, name: 'Saturday', short: 'Sat' },
    { num: 7, name: 'Sunday', short: 'Sun' },
  ];

  // Current time comparison
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentDayNum = now.getDay() === 0 ? 7 : now.getDay();

  const isCurrentSession = (slot: any) => {
    if (slot.dayOfWeek !== currentDayNum) return false;
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    return currentMinutes >= startMins && currentMinutes <= endMins;
  };

  const daySlots = timetable
    .filter((t) => t.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const sortedAllSlots = [...timetable].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.startTime.localeCompare(b.startTime);
  });

  const handleDelete = (id: string, code: string) => {
    sound.playButtonClick();
    deleteTimetableSlot(id);
    showToast({
      title: 'Session Removed',
      subtitle: `${code} removed from timetable`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Interactive Graph */}
      <div className="relative p-6 rounded-2xl bg-[#171A21] border border-[#303642] brutal-shadow overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <InteractiveGraphBackground
          cellSize={24}
          glowColor="cyan"
          intensity={0.65}
          className="opacity-30"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <CalendarIcon className="w-5 h-5 text-[#42DFFF]" />
            <h2 className="font-display font-black text-2xl text-[#F5F5F5] tracking-wide uppercase">
              Academic Timetable & Schedule
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#42DFFF]/15 text-[#42DFFF] border border-[#42DFFF]/30">
              {timetable.length} SESSIONS
            </span>
          </div>
          <p className="text-xs text-[#A0A4AE] font-mono">
            Weekly class schedule, lecture rooms, and verified study blocks
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#111319] border border-[#303642]">
            {(['week', 'day', 'agenda'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  sound.playButtonClick();
                  setViewMode(mode);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  viewMode === mode
                    ? 'bg-[#42DFFF] text-[#090A0D]'
                    : 'text-[#A0A4AE] hover:text-[#F5F5F5]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveModal('new_timetable_session');
            }}
            className="px-4 py-2 rounded-xl bg-[#42DFFF] hover:bg-[#2BC8ED] text-[#090A0D] text-xs font-black transition-all brutal-shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Main Content Area Based on View Mode */}
      {timetable.length === 0 ? (
        <div className="p-12 text-center bg-[#171A21] rounded-2xl border border-[#303642] space-y-3 brutal-shadow relative overflow-hidden">
          <InteractiveGraphBackground
            cellSize={28}
            glowColor="cyan"
            intensity={0.5}
            className="opacity-25"
          />
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#42DFFF]/10 border border-[#42DFFF]/30 text-[#42DFFF] flex items-center justify-center mx-auto">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-[#F5F5F5] uppercase">
                Your Timetable is Empty
              </h3>
              <p className="text-xs text-[#A0A4AE] mt-1 max-w-sm mx-auto">
                Add lectures, lab sessions, or recurring deep study blocks to keep your daily academic schedule synchronized.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('new_timetable_session')}
              className="px-5 py-2.5 rounded-xl bg-[#42DFFF] hover:bg-[#2BC8ED] text-[#090A0D] text-xs font-black transition-all brutal-shadow"
            >
              + Add First Session
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Day View */}
          {viewMode === 'day' && (
            <div className="space-y-4">
              {/* Day selector pills */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((d) => (
                  <button
                    key={d.num}
                    onClick={() => {
                      sound.playButtonClick();
                      setSelectedDay(d.num);
                    }}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-mono font-bold transition-all ${
                      selectedDay === d.num
                        ? 'bg-[#42DFFF]/20 border-[#42DFFF]/60 text-[#42DFFF]'
                        : 'bg-[#171A21] border-[#303642] text-[#A0A4AE] hover:text-[#F5F5F5]'
                    }`}
                  >
                    <div>{d.short}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {daySlots.length > 0 ? (
                  daySlots.map((slot) => {
                    const active = isCurrentSession(slot);

                    return (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 brutal-shadow ${
                          active
                            ? 'bg-[#171A21] border-[#B5FF55] shadow-[0_0_16px_rgba(181,255,85,0.25)]'
                            : 'bg-[#171A21] border-[#303642] hover:border-[#42DFFF]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="w-2.5 h-12 rounded-full shrink-0"
                            style={{ backgroundColor: slot.subjectColorHex }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-xs font-mono font-black"
                                style={{ color: slot.subjectColorHex }}
                              >
                                {slot.subjectCode}
                              </span>
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#20242D] text-[#A0A4AE] border border-[#303642]">
                                {slot.slotType}
                              </span>
                              {active && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/40 animate-pulse">
                                  ACTIVE NOW
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-[#F5F5F5] mt-0.5 truncate">
                              {slot.subjectName}
                            </h4>
                            <div className="flex items-center gap-3 text-[11px] text-[#A0A4AE] mt-1 font-mono">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#737373]" />
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#737373]" />
                                {slot.locationRoom}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(slot.id, slot.subjectCode)}
                          className="p-1.5 rounded-lg text-[#737373] hover:text-[#FF806B] hover:bg-[#20242D]"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-[#A0A4AE] bg-[#171A21]/50 rounded-xl border border-[#303642]">
                    No scheduled sessions for {days.find((d) => d.num === selectedDay)?.name}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Week Grid View */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
              {days.slice(0, 5).map((d) => {
                const slotsForDay = timetable
                  .filter((t) => t.dayOfWeek === d.num)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div
                    key={d.num}
                    className="p-3.5 rounded-2xl bg-[#171A21] border border-[#303642] space-y-3 flex flex-col"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#303642]">
                      <span className="font-display font-black text-sm text-[#F5F5F5] uppercase">
                        {d.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#A0A4AE]">
                        {slotsForDay.length}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {slotsForDay.map((slot) => {
                        const active = isCurrentSession(slot);

                        return (
                          <div
                            key={slot.id}
                            className={`p-2.5 rounded-xl border text-xs transition-all ${
                              active
                                ? 'bg-[#20242D] border-[#B5FF55]'
                                : 'bg-[#111319] border-[#303642]'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono text-[10px] text-[#A0A4AE] mb-1">
                              <span style={{ color: slot.subjectColorHex }} className="font-bold">
                                {slot.subjectCode}
                              </span>
                              <span>{slot.startTime}</span>
                            </div>
                            <div className="font-bold text-[#F5F5F5] truncate text-[11px]">
                              {slot.subjectName}
                            </div>
                            <div className="text-[10px] text-[#A0A4AE] mt-1 flex items-center gap-1 font-mono truncate">
                              <MapPin className="w-2.5 h-2.5" />
                              <span className="truncate">{slot.locationRoom}</span>
                            </div>
                          </div>
                        );
                      })}
                      {slotsForDay.length === 0 && (
                        <div className="h-20 flex items-center justify-center text-[11px] font-mono text-[#737373]">
                          Free Day
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Agenda View */}
          {viewMode === 'agenda' && (
            <div className="space-y-3">
              {sortedAllSlots.map((slot) => {
                const dayName = days.find((d) => d.num === slot.dayOfWeek)?.name;

                return (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl bg-[#171A21] border border-[#303642] flex items-center justify-between gap-4 brutal-shadow"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 shrink-0 font-mono text-xs text-[#42DFFF] font-bold">
                        {dayName?.substring(0, 3).toUpperCase()}
                      </div>
                      <div
                        className="w-2.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: slot.subjectColorHex }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold" style={{ color: slot.subjectColorHex }}>
                            {slot.subjectCode}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#20242D] text-[#A0A4AE]">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#F5F5F5] truncate">{slot.subjectName}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-[#A0A4AE] font-mono hidden sm:inline">
                        {slot.locationRoom}
                      </span>
                      <button
                        onClick={() => handleDelete(slot.id, slot.subjectCode)}
                        className="p-1.5 rounded-lg text-[#737373] hover:text-[#FF806B]"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

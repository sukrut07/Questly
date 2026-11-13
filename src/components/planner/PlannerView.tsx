'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  AlertTriangle,
  GraduationCap,
  Plus,
  Trash2,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function PlannerView() {
  const {
    timetable,
    deadlines,
    toggleDeadline,
    deleteDeadline,
    setActiveModal,
    showToast,
  } = useQuestly();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 1);

  const days = [
    { num: 1, name: 'Monday', short: 'Mon' },
    { num: 2, name: 'Tuesday', short: 'Tue' },
    { num: 3, name: 'Wednesday', short: 'Wed' },
    { num: 4, name: 'Thursday', short: 'Thu' },
    { num: 5, name: 'Friday', short: 'Fri' },
  ];

  const daySlots = timetable
    .filter((t) => t.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.deadlineIso).getTime() - new Date(b.deadlineIso).getTime()
  );

  const handleToggleDeadline = (id: string) => {
    sound.playButtonClick();
    toggleDeadline(id);
  };

  const handleDeleteDeadline = (id: string, title: string) => {
    sound.playButtonClick();
    deleteDeadline(id);
    showToast({
      title: 'Deadline Deleted',
      subtitle: title,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#171717] border border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutal-shadow relative overflow-hidden bg-graph-grid">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <CalendarIcon className="w-5 h-5 text-[#B9A3FF]" />
            <h2 className="text-xl font-black text-[#F5F5F0] tracking-tight">Academic Planner</h2>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#B9A3FF]/15 text-[#B9A3FF] border border-[#B9A3FF]/30">
              Timetable & Deadlines
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] font-mono">
            Weekly class schedule, lecture halls, assignments, and examination countdowns.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveModal('new_deadline')}
            className="px-4 py-2 rounded-xl bg-[#B9A3FF] hover:bg-[#A88DFB] text-[#101010] text-xs font-black transition-all brutal-shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Deadline</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid: Left Weekly Schedule, Right Deadlines Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Timetable Schedule (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[#171717] border border-[#383838] space-y-4 brutal-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#F5F5F0]">Weekly Lecture & Lab Schedule</h3>
              <span className="text-[11px] font-mono text-[#A1A1A1]">
                {daySlots.length} sessions scheduled
              </span>
            </div>

            {/* Day Selector Pills */}
            <div className="grid grid-cols-5 gap-2">
              {days.map((d) => (
                <button
                  key={d.num}
                  onClick={() => {
                    sound.playButtonClick();
                    setSelectedDay(d.num);
                  }}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-mono font-bold transition-all ${
                    selectedDay === d.num
                      ? 'bg-[#B9A3FF]/20 border-[#B9A3FF]/60 text-[#B9A3FF]'
                      : 'bg-[#1E1E1E] border-[#383838] text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#252525]'
                  }`}
                >
                  <div>{d.short}</div>
                </button>
              ))}
            </div>

            {/* Class Slots for Selected Day */}
            <div className="space-y-3 pt-2">
              {daySlots.length > 0 ? (
                daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl bg-[#1E1E1E] border border-[#383838] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-2.5 h-10 rounded-full"
                        style={{ backgroundColor: slot.subjectColorHex }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black" style={{ color: slot.subjectColorHex }}>
                            {slot.subjectCode}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#252525] text-[#A1A1A1] border border-[#383838]">
                            {slot.slotType}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#F5F5F0] mt-0.5">{slot.subjectName}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-[#A1A1A1] mt-1 font-mono">
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
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#A1A1A1] bg-[#1E1E1E]/40 rounded-xl border border-[#383838]">
                  No scheduled classes for {days.find((d) => d.num === selectedDay)?.name}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deadlines Radar (1 col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#171717] border border-[#383838] space-y-4 brutal-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#F5F5F0]">Deadlines Radar</h3>
                <span className="text-[11px] font-mono text-[#A1A1A1]">
                  {deadlines.filter((d) => !d.isCompleted).length} pending milestones
                </span>
              </div>

              <button
                onClick={() => setActiveModal('new_deadline')}
                className="px-2.5 py-1 rounded-lg bg-[#B9A3FF]/15 border border-[#B9A3FF]/40 text-[#B9A3FF] text-[11px] font-mono font-bold hover:bg-[#B9A3FF]/25 transition-colors"
              >
                + Add
              </button>
            </div>

            <div className="space-y-3">
              {sortedDeadlines.length > 0 ? (
                sortedDeadlines.map((deadline) => {
                  const deadlineDate = new Date(deadline.deadlineIso);
                  const daysRemaining = Math.ceil(
                    (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={deadline.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        deadline.isCompleted
                          ? 'bg-[#1E1E1E]/40 border-[#2A2A2A] opacity-60'
                          : daysRemaining <= 3
                          ? 'bg-[#FF806B]/10 border-[#FF806B]/30'
                          : 'bg-[#1E1E1E] border-[#383838]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => handleToggleDeadline(deadline.id)}
                          className="mt-0.5 text-[#737373] hover:text-[#B5FF55] transition-colors shrink-0"
                          title={deadline.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                        >
                          {deadline.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-[#B5FF55]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#737373]" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span
                              className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                              style={{
                                backgroundColor: `${deadline.subjectColorHex}20`,
                                color: deadline.subjectColorHex,
                              }}
                            >
                              {deadline.subjectCode}
                            </span>
                            <span className="text-[10px] font-mono uppercase text-[#737373]">
                              {deadline.type}
                            </span>
                          </div>
                          <h4
                            className={`text-xs font-bold leading-snug ${
                              deadline.isCompleted ? 'line-through text-[#737373]' : 'text-[#F5F5F0]'
                            }`}
                          >
                            {deadline.title}
                          </h4>

                          <div className="flex items-center justify-between text-[11px] text-[#A1A1A1] mt-2 font-mono">
                            <span>Weight: {deadline.weightagePercentage}%</span>
                            <span
                              className={
                                daysRemaining <= 3 && !deadline.isCompleted
                                  ? 'text-[#FF806B] font-bold'
                                  : 'text-[#A1A1A1]'
                              }
                            >
                              {daysRemaining <= 0
                                ? 'Due Today'
                                : `${daysRemaining} days left`}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteDeadline(deadline.id, deadline.title)}
                          className="p-1 rounded text-[#737373] hover:text-[#FF806B]"
                          title="Delete Deadline"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-[#1E1E1E]/40 rounded-xl border border-[#383838] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#B9A3FF]/10 border border-[#B9A3FF]/30 text-[#B9A3FF] flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F5F0]">No deadlines recorded</h4>
                    <p className="text-[11px] text-[#A1A1A1] mt-0.5">
                      Track upcoming midterm exams, problem set due dates, or thesis milestones.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal('new_deadline')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#B9A3FF] hover:bg-[#A88DFB] text-[#101010] text-xs font-black transition-all"
                  >
                    + Add Deadline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

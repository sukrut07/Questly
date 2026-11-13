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
} from 'lucide-react';

export function PlannerView() {
  const { timetable, deadlines, toggleDeadline } = useQuestly();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 1); // Default to today or Monday

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-black text-zinc-100 tracking-tight">Academic Planner</h2>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-400/10 text-purple-400 border border-purple-400/30">
              Timetable & Deadlines
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Weekly class schedule, lecture halls, assignments, and examination countdowns.
          </p>
        </div>
      </div>

      {/* 2-Column Grid: Left Weekly Schedule, Right Deadlines Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Timetable Schedule (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-zinc-100">Weekly Lecture & Lab Schedule</h3>
              <span className="text-[11px] font-mono text-zinc-400">{daySlots.length} sessions scheduled</span>
            </div>

            {/* Day Selector Pills */}
            <div className="grid grid-cols-5 gap-2">
              {days.map((d) => (
                <button
                  key={d.num}
                  onClick={() => setSelectedDay(d.num)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                    selectedDay === d.num
                      ? 'bg-purple-500/15 border-purple-500/50 text-purple-300'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
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
                    className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-2.5 h-10 rounded-full"
                        style={{ backgroundColor: slot.subjectColorHex }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold" style={{ color: slot.subjectColorHex }}>
                            {slot.subjectCode}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                            {slot.slotType}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-100 mt-0.5">{slot.subjectName}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {slot.locationRoom}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900/20 rounded-xl border border-zinc-850">
                  No scheduled lectures or labs for {days.find((d) => d.num === selectedDay)?.name}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deadlines Radar (1 col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-zinc-100">Deadlines Radar</h3>
              <span className="text-[11px] font-mono text-zinc-400">
                {deadlines.filter((d) => !d.isCompleted).length} pending
              </span>
            </div>

            <div className="space-y-3">
              {sortedDeadlines.map((deadline) => {
                const deadlineDate = new Date(deadline.deadlineIso);
                const daysRemaining = Math.ceil(
                  (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={deadline.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      deadline.isCompleted
                        ? 'bg-zinc-900/30 border-zinc-850 opacity-60'
                        : daysRemaining <= 3
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => toggleDeadline(deadline.id)}
                        className="mt-0.5 text-zinc-400 hover:text-lime-400 transition-colors shrink-0"
                      >
                        {deadline.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-lime-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                            style={{
                              backgroundColor: `${deadline.subjectColorHex}20`,
                              color: deadline.subjectColorHex,
                            }}
                          >
                            {deadline.subjectCode}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-zinc-500">
                            {deadline.type}
                          </span>
                        </div>
                        <h4
                          className={`text-xs font-bold leading-snug ${
                            deadline.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                          }`}
                        >
                          {deadline.title}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 font-mono">
                          <span>Weight: {deadline.weightagePercentage}%</span>
                          <span
                            className={
                              daysRemaining <= 3 && !deadline.isCompleted
                                ? 'text-amber-400 font-bold'
                                : 'text-zinc-400'
                            }
                          >
                            {daysRemaining <= 0
                              ? 'Due Today'
                              : `${daysRemaining} days left`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


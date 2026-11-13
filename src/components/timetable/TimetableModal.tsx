'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { TimetableSlot } from '@/lib/types';
import { X, Calendar, Clock, MapPin, BookOpen, Layers } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function TimetableModal() {
  const { activeModal, setActiveModal, subjects, addTimetableSlot } = useQuestly();

  if (activeModal !== 'new_timetable_session') return null;

  return (
    <TimetableModalForm
      subjects={subjects}
      onClose={() => setActiveModal(null)}
      addTimetableSlot={addTimetableSlot}
    />
  );
}

function TimetableModalForm({
  subjects,
  onClose,
  addTimetableSlot,
}: {
  subjects: any[];
  onClose: () => void;
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday default
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('11:00');
  const [locationRoom, setLocationRoom] = useState('');
  const [slotType, setSlotType] = useState<'lecture' | 'lab' | 'tutorial' | 'study_group'>('lecture');
  const [notes, setNotes] = useState('');

  const days = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' },
    { num: 6, name: 'Saturday' },
    { num: 7, name: 'Sunday' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playButtonClick();

    const matchedSubject = subjects.find((s) => s.id === subjectId);

    addTimetableSlot({
      subjectId: matchedSubject ? matchedSubject.id : 'gen',
      subjectCode: matchedSubject ? matchedSubject.code : 'STUDY',
      subjectName: matchedSubject ? matchedSubject.name : 'Independent Study',
      subjectColorHex: matchedSubject ? matchedSubject.colorHex : '#B5FF55',
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      locationRoom: locationRoom.trim() || 'Online / Library',
      slotType,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#171A21] border border-[#303642] rounded-2xl shadow-2xl overflow-hidden flex flex-col brutal-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#303642] bg-[#111319]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#42DFFF] text-[#090A0D] flex items-center justify-center font-black">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F5F5F5] tracking-tight">Add Timetable Session</h3>
              <p className="text-xs text-[#A0A4AE] font-mono">Lecture, laboratory, or scheduled study block</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A0A4AE] hover:text-[#F5F5F5] hover:bg-[#20242D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Subject & Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F5]">Course / Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#20242D] border border-[#303642] text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#42DFFF]"
              >
                <option value="">Independent Study / Review</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F5]">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#20242D] border border-[#303642] text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#42DFFF]"
              >
                {days.map((d) => (
                  <option key={d.num} value={d.num}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F5]">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#20242D] border border-[#303642] text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#42DFFF]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F5]">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#20242D] border border-[#303642] text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#42DFFF]"
              />
            </div>
          </div>

          {/* Session Type & Room Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F5]">Session Type</label>
              <select
                value={slotType}
                onChange={(e) => setSlotType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#20242D] border border-[#303642] text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#42DFFF]"
              >
                <option value="lecture">Lecture</option>
                <option value="lab">Laboratory Work</option>
                <option value="tutorial">Tutorial / Discussion</option>
                <option value="study_group">Deep Focus Block</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F5]">Room / Hall / Zoom Link</label>
              <input
                type="text"
                value={locationRoom}
                onChange={(e) => setLocationRoom(e.target.value)}
                placeholder="e.g. Hall B-102 or Zoom"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#20242D] border border-[#303642] text-xs text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#42DFFF]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#303642]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-[#A0A4AE] hover:text-[#F5F5F5] hover:bg-[#20242D] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#42DFFF] hover:bg-[#2BC8ED] text-[#090A0D] text-xs font-black transition-all brutal-shadow"
            >
              Add Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

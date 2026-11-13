'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { DeadlineType } from '@/lib/types';
import { X, Calendar } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function DeadlineModal() {
  const { activeModal, setActiveModal, subjects, addDeadline, showToast } = useQuestly();

  if (activeModal !== 'new_deadline') {
    return null;
  }

  return (
    <DeadlineModalForm
      subjects={subjects}
      onClose={() => setActiveModal(null)}
      addDeadline={addDeadline}
      showToast={showToast}
    />
  );
}

function DeadlineModalForm({
  subjects,
  onClose,
  addDeadline,
  showToast,
}: {
  subjects: any[];
  onClose: () => void;
  addDeadline: (d: any) => void;
  showToast: (t: any) => void;
}) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [type, setType] = useState<DeadlineType>('assignment');
  const [deadlineDate, setDeadlineDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [weightage, setWeightage] = useState(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playButtonClick();

    const matchedSubject = subjects.find((s) => s.id === subjectId);

    addDeadline({
      title: title.trim(),
      subjectId: matchedSubject ? matchedSubject.id : 'gen',
      subjectCode: matchedSubject ? matchedSubject.code : 'GEN',
      subjectName: matchedSubject ? matchedSubject.name : 'General Academic',
      subjectColorHex: matchedSubject ? matchedSubject.colorHex : '#B5FF55',
      deadlineIso: new Date(deadlineDate).toISOString(),
      weightagePercentage: Number(weightage),
      type,
    });

    showToast({
      title: 'Deadline Created',
      subtitle: `${title.trim()} scheduled for ${deadlineDate}`,
      type: 'success',
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#171717] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#383838] bg-[#1E1E1E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B9A3FF] text-[#101010] flex items-center justify-center font-black">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F5F5F0] tracking-tight">Add Academic Deadline</h3>
              <p className="text-xs text-[#A1A1A1] font-mono">Exams, assignments, and research milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#252525] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#F5F5F0]">Deadline Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Examination / Project Deliverable 1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs text-[#F5F5F0] placeholder-[#737373] focus:outline-none focus:border-[#B9A3FF]"
            />
          </div>

          {/* Subject & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F0]">Associated Course</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs font-mono text-[#F5F5F0] focus:outline-none focus:border-[#B9A3FF]"
              >
                <option value="">General / No Specific Course</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F0]">Assessment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DeadlineType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs font-mono text-[#F5F5F0] focus:outline-none focus:border-[#B9A3FF]"
              >
                <option value="assignment">Homework Assignment</option>
                <option value="examination">Examination / Midterm / Final</option>
                <option value="project">Course Project / Thesis</option>
              </select>
            </div>
          </div>

          {/* Date & Weightage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F0]">Due Date</label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs font-mono text-[#F5F5F0] focus:outline-none focus:border-[#B9A3FF]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F0]">Grade Weight (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={weightage}
                onChange={(e) => setWeightage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs font-mono text-[#F5F5F0] focus:outline-none focus:border-[#B9A3FF]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#383838]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#252525] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#B9A3FF] hover:bg-[#A88DFB] text-[#101010] text-xs font-black transition-all brutal-shadow"
            >
              Add Deadline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

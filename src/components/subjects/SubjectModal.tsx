'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { AcademicSubject, SubjectColor } from '@/lib/types';
import { X, BookOpen, Check, Palette } from 'lucide-react';
import { sound } from '@/common/SoundService';

const COLOR_PALETTE: { name: string; hex: SubjectColor }[] = [
  { name: 'Neon Lime', hex: '#B5FF55' },
  { name: 'Lavender Purple', hex: '#B9A3FF' },
  { name: 'Cyan Blue', hex: '#62D9FF' },
  { name: 'Sunset Coral', hex: '#FF806B' },
  { name: 'Golden Yellow', hex: '#FFD76A' },
  { name: 'Emerald Green', hex: '#34D399' },
];

export function SubjectModal() {
  const {
    activeModal,
    setActiveModal,
    selectedSubject,
    setSelectedSubject,
    addSubject,
    updateSubject,
    showToast,
  } = useQuestly();

  const isEditing = activeModal === 'edit_subject' && selectedSubject !== null;
  const isOpen = activeModal === 'new_subject' || isEditing;

  if (!isOpen) return null;

  return (
    <SubjectModalForm
      key={isEditing && selectedSubject ? selectedSubject.id : 'new'}
      selectedSubject={selectedSubject}
      isEditing={isEditing}
      onClose={() => {
        setActiveModal(null);
        setSelectedSubject(null);
      }}
      addSubject={addSubject}
      updateSubject={updateSubject}
      showToast={showToast}
    />
  );
}

function SubjectModalForm({
  selectedSubject,
  isEditing,
  onClose,
  addSubject,
  updateSubject,
  showToast,
}: {
  selectedSubject: AcademicSubject | null;
  isEditing: boolean;
  onClose: () => void;
  addSubject: (s: Omit<AcademicSubject, 'id' | 'syllabusProgress' | 'modules'>) => void;
  updateSubject: (s: AcademicSubject) => void;
  showToast: (t: any) => void;
}) {
  const [code, setCode] = useState(isEditing && selectedSubject ? selectedSubject.code : '');
  const [name, setName] = useState(isEditing && selectedSubject ? selectedSubject.name : '');
  const [instructorName, setInstructorName] = useState(
    isEditing && selectedSubject ? selectedSubject.instructorName || '' : ''
  );
  const [credits, setCredits] = useState(isEditing && selectedSubject ? selectedSubject.credits : 3);
  const [targetGrade, setTargetGrade] = useState(
    isEditing && selectedSubject ? selectedSubject.targetGrade || 'A' : 'A'
  );
  const [colorHex, setColorHex] = useState<SubjectColor>(
    isEditing && selectedSubject ? (selectedSubject.colorHex as SubjectColor) : COLOR_PALETTE[0].hex
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    sound.playButtonClick();

    if (isEditing && selectedSubject) {
      updateSubject({
        ...selectedSubject,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        instructorName: instructorName.trim() || undefined,
        credits: Number(credits),
        targetGrade,
        colorHex,
      });
      showToast({
        title: 'Subject Updated',
        subtitle: `${code.trim().toUpperCase()} details updated`,
        type: 'success',
      });
    } else {
      addSubject({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        instructorName: instructorName.trim() || undefined,
        credits: Number(credits),
        targetGrade,
        colorHex,
      });
      showToast({
        title: 'Course Enrolled',
        subtitle: `${code.trim().toUpperCase()}: ${name.trim()} added to curriculum`,
        type: 'success',
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#171717] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#383838] bg-[#1E1E1E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B5FF55] text-[#101010] flex items-center justify-center font-black">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F5F5F0] tracking-tight">
                {isEditing ? 'Edit Academic Course' : 'Enroll Academic Course'}
              </h3>
              <p className="text-xs text-[#A1A1A1] font-mono">Configure syllabus tracking & credit weight</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F0]">Course Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS 201"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs font-mono text-[#F5F5F0] placeholder-[#737373] focus:outline-none focus:border-[#B5FF55]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-[#F5F5F0]">Course Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs text-[#F5F5F0] placeholder-[#737373] focus:outline-none focus:border-[#B5FF55]"
              />
            </div>
          </div>

          {/* Instructor Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#F5F5F0]">Instructor / Professor (Optional)</label>
            <input
              type="text"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              placeholder="e.g. Dr. Jane Smith"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs text-[#F5F5F0] placeholder-[#737373] focus:outline-none focus:border-[#B5FF55]"
            />
          </div>

          {/* Credits & Target Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F0]">Credits</label>
              <select
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs font-mono text-[#F5F5F0] focus:outline-none focus:border-[#B5FF55]"
              >
                <option value={1}>1 Credit</option>
                <option value={2}>2 Credits</option>
                <option value={3}>3 Credits</option>
                <option value={4}>4 Credits</option>
                <option value={5}>5 Credits</option>
                <option value={6}>6 Credits</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#F5F5F0]">Target Grade</label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs font-mono text-[#F5F5F0] focus:outline-none focus:border-[#B5FF55]"
              >
                <option value="A+">A+ (4.0)</option>
                <option value="A">A (4.0)</option>
                <option value="A-">A- (3.7)</option>
                <option value="B+">B+ (3.3)</option>
                <option value="B">B (3.0)</option>
                <option value="B-">B- (2.7)</option>
                <option value="Pass">Pass / Satisfactory</option>
              </select>
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-[#F5F5F0] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#B5FF55]" />
              <span>Course Accent Color</span>
            </label>
            <div className="flex items-center gap-3">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColorHex(c.hex)}
                  className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center border-2 ${
                    colorHex === c.hex ? 'scale-110 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {colorHex === c.hex && <Check className="w-4 h-4 text-black stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
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
              className="px-5 py-2.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#101010] text-xs font-black transition-all brutal-shadow"
            >
              {isEditing ? 'Save Changes' : 'Enroll Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { AcademicWorkspace } from '@/lib/types';
import { X, Layers, Palette, Check } from 'lucide-react';
import { sound } from '@/common/SoundService';

const WORKSPACE_COLORS = [
  '#B5FF55', // Lime
  '#42DFFF', // Cyan
  '#A879FF', // Purple
  '#FF9C45', // Orange
  '#FF5EBB', // Pink
  '#538CFF', // Blue
];

export function WorkspaceModal() {
  const { activeModal, setActiveModal, subjects, createWorkspace } = useQuestly();

  if (activeModal !== 'new_workspace') return null;

  return (
    <WorkspaceModalForm
      subjects={subjects}
      onClose={() => setActiveModal(null)}
      createWorkspace={createWorkspace}
    />
  );
}

function WorkspaceModalForm({
  subjects,
  onClose,
  createWorkspace,
}: {
  subjects: any[];
  onClose: () => void;
  createWorkspace: (ws: Omit<AcademicWorkspace, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorHex, setColorHex] = useState(WORKSPACE_COLORS[0]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sound.playButtonClick();

    createWorkspace({
      name: name.trim(),
      description: description.trim(),
      colorHex,
      iconName: 'folder',
      subjectIds: selectedSubjectIds,
      isArchived: false,
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
            <div className="w-8 h-8 rounded-lg bg-[#B5FF55] text-[#090A0D] flex items-center justify-center font-black">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F5F5F5] tracking-tight">Create Workspace</h3>
              <p className="text-xs text-[#A0A4AE] font-mono">Organize research projects, thesis, or semester terms</p>
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
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#F5F5F5]">Workspace Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master Thesis / Competitive Programming / Semester 4"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#20242D] border border-[#303642] text-xs text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#B5FF55]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#F5F5F5]">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope, deliverables, and core academic milestones..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#20242D] border border-[#303642] text-xs text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#B5FF55]"
            />
          </div>

          {/* Color Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#B5FF55]" />
              <span>Workspace Accent Color</span>
            </label>
            <div className="flex items-center gap-3">
              {WORKSPACE_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColorHex(hex)}
                  className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center border-2 ${
                    colorHex === hex ? 'scale-110 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {colorHex === hex && <Check className="w-4 h-4 text-black stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Associated Subjects */}
          {subjects.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-[#F5F5F5]">
                Link Enrolled Subjects (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {subjects.map((s) => {
                  const isSelected = selectedSubjectIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSubject(s.id)}
                      className={`p-2 rounded-lg border text-left text-xs font-mono transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#B5FF55]/15 border-[#B5FF55]/50 text-[#F5F5F5]'
                          : 'bg-[#20242D] border-[#303642] text-[#A0A4AE]'
                      }`}
                    >
                      <span className="truncate">{s.code}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#B5FF55]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
              className="px-5 py-2.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-black transition-all brutal-shadow"
            >
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


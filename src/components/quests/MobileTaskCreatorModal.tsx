'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { QuestPriority, TaskType, QuestDifficulty } from '@/lib/types';
import { getXpForDifficulty, getTodayDateString } from '@/lib/progressionEngine';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Flag,
  Sparkles,
  Layers,
  BookOpen,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

interface MobileTaskCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileTaskCreatorModal({ isOpen, onClose }: MobileTaskCreatorModalProps) {
  const { createQuest, subjects } = useQuestly();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [checkpointTime, setCheckpointTime] = useState('');
  const [priority, setPriority] = useState<QuestPriority>('MEDIUM');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('MEDIUM');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'gen');

  // Subtasks & Checkpoints
  const [subtasks, setSubtasks] = useState<
    { id: string; title: string; isCompleted: boolean; checkpointTime?: string }[]
  >([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtaskTimeInput, setSubtaskTimeInput] = useState('');

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    sound.playButtonClick();
    setSubtasks([
      ...subtasks,
      {
        id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: subtaskInput.trim(),
        isCompleted: false,
        checkpointTime: subtaskTimeInput.trim() || undefined,
      },
    ]);
    setSubtaskInput('');
    setSubtaskTimeInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    sound.playButtonClick();
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const setDeadlinePreset = (daysFromToday: number) => {
    sound.playButtonClick();
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playButtonClick();
    const matchedSubject = subjects.find((s) => s.id === subjectId);
    const xpReward = getXpForDifficulty(difficulty);

    createQuest({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      priority,
      difficulty,
      taskType: 'problem_solving',
      subjectId: matchedSubject?.id || 'gen',
      subjectCode: matchedSubject?.code || 'General',
      subjectColorHex: matchedSubject?.colorHex || '#A3E635',
      estimatedMinutes: 30,
      status: 'NOT_STARTED',
      isRecurring: false,
      subtasks,
      xpReward,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-150 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#0D0F14] border border-white/[0.08] p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] shrink-0">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#B5FF55]" />
              <span>Create Quest & Checkpoints</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Add task details, deadlines, and atomic checkpoints
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Quest Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems Raft Consensus Lab"
              className="w-full bg-[#141720] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#B5FF55] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Description & Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key concepts, formulas, links, or specific deliverables..."
              className="w-full bg-[#141720] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#B5FF55] transition-colors resize-none"
            />
          </div>

          {/* Deadlines & Checkpoint Time */}
          <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Task Deadline</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">{dueDate}</span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setDeadlinePreset(0)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-zinc-300 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDeadlinePreset(1)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-zinc-300 transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDeadlinePreset(3)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-zinc-300 transition-colors"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => setDeadlinePreset(7)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-zinc-300 transition-colors"
              >
                Next Week
              </button>
            </div>

            {/* Date and Time Picker */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-zinc-400 block mb-0.5 font-mono">Date</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#141720] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#B5FF55]"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block mb-0.5 font-mono">
                  Checkpoint Time (Optional)
                </span>
                <input
                  type="time"
                  value={checkpointTime}
                  onChange={(e) => setCheckpointTime(e.target.value)}
                  className="w-full bg-[#141720] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#B5FF55]"
                />
              </div>
            </div>
          </div>

          {/* Subtasks & Milestone Checkpoints */}
          <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF55]" />
                <span>Subtasks & Checkpoints</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {subtasks.length} added
              </span>
            </div>

            {/* Subtask Input with optional milestone time */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  placeholder="e.g. Phase 1: Draft mathematical proof"
                  className="flex-1 bg-[#141720] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#B5FF55]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <input
                  type="time"
                  value={subtaskTimeInput}
                  onChange={(e) => setSubtaskTimeInput(e.target.value)}
                  placeholder="Time"
                  className="w-24 bg-[#141720] border border-white/[0.08] rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#B5FF55]"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={!subtaskInput.trim()}
                  className="px-3 py-1.5 bg-white/10 hover:bg-[#B5FF55] hover:text-black disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Subtasks List */}
              {subtasks.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {subtasks.map((st, idx) => (
                    <div
                      key={st.id}
                      className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-zinc-500">
                          #{idx + 1}
                        </span>
                        <span className="text-zinc-200 truncate">{st.title}</span>
                        {st.checkpointTime && (
                          <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                            {st.checkpointTime}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Priority & Subject */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as QuestPriority)}
                className="w-full bg-[#141720] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B5FF55]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent 🔥</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Course / Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-[#141720] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B5FF55]"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] disabled:opacity-40 text-black font-extrabold text-xs uppercase tracking-wide transition-all shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Quest & Set Checkpoints</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import { Quest, QuestCategory, QuestDifficulty, QuestPriority, QuestSubtask } from '@/lib/types';
import { getXpForDifficulty, getTodayDateString } from '@/lib/progressionEngine';
import { X, Plus, Trash2, Sparkles, CheckSquare } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function QuestModal() {
  const { activeModal, setActiveModal, selectedQuest, setSelectedQuest, createQuest, updateQuest } =
    useQuestly();

  const isEditing = activeModal === 'edit_quest' && selectedQuest !== null;
  const isOpen = activeModal === 'new_quest' || activeModal === 'edit_quest';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('CODING');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('MEDIUM');
  const [priority, setPriority] = useState<QuestPriority>('MEDIUM');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [isRecurring, setIsRecurring] = useState(false);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; isCompleted: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (isEditing && selectedQuest) {
      setTitle(selectedQuest.title);
      setDescription(selectedQuest.description);
      setCategory(selectedQuest.category);
      setDifficulty(selectedQuest.difficulty);
      setPriority(selectedQuest.priority);
      setEstimatedMinutes(selectedQuest.estimatedMinutes);
      setDueDate(selectedQuest.dueDate || getTodayDateString());
      setIsRecurring(selectedQuest.isRecurring);
      setSubtasks(selectedQuest.subtasks);
    } else {
      setTitle('');
      setDescription('');
      setCategory('CODING');
      setDifficulty('MEDIUM');
      setPriority('MEDIUM');
      setEstimatedMinutes(30);
      setDueDate(getTodayDateString());
      setIsRecurring(false);
      setSubtasks([]);
      setNewSubtaskTitle('');
    }
  }, [isEditing, selectedQuest, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    sound.playButtonClick();
    setSubtasks([
      ...subtasks,
      { id: `st_${Date.now()}`, title: newSubtaskTitle.trim(), isCompleted: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const xpReward = getXpForDifficulty(difficulty);

    if (isEditing && selectedQuest) {
      updateQuest({
        ...selectedQuest,
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        priority,
        estimatedMinutes,
        dueDate,
        isRecurring,
        xpReward,
        subtasks,
      });
    } else {
      createQuest({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        priority,
        estimatedMinutes,
        dueDate,
        status: 'NOT_STARTED',
        xpReward,
        isRecurring,
        subtasks,
      });
    }

    setActiveModal(null);
    setSelectedQuest(null);
  };

  const categories: QuestCategory[] = [
    'CODING',
    'STUDY',
    'WORK',
    'FITNESS',
    'READING',
    'CREATIVITY',
    'PERSONAL',
    'CUSTOM',
  ];

  const difficulties: { diff: QuestDifficulty; label: string; xp: number }[] = [
    { diff: 'EASY', label: 'Easy', xp: 25 },
    { diff: 'MEDIUM', label: 'Medium', xp: 50 },
    { diff: 'HARD', label: 'Hard', xp: 90 },
    { diff: 'EPIC', label: 'Epic', xp: 150 },
  ];

  const priorities: QuestPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Modify Inscribed Quest' : 'Inscribe New Quest'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] bg-surface-main border border-theme rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-theme flex items-center justify-between bg-surface-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-theme-main tracking-tight">
                {isEditing ? 'Modify Inscribed Quest' : 'Inscribe New Quest'}
              </h2>
              <p className="text-xs text-theme-muted">
                Each completed quest empowers your character and expands your world
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveModal(null);
              setSelectedQuest(null);
            }}
            className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-surface-elevated transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-theme-main mb-1">
              Quest Title <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master dynamic programming graph problems"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-theme text-theme-main placeholder:text-theme-muted/50 focus:outline-none focus:border-primary-violet text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-theme-main mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, resources, or requirements for this quest..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-theme text-theme-main placeholder:text-theme-muted/50 focus:outline-none focus:border-primary-violet text-xs leading-relaxed"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block font-bold text-theme-main mb-1.5">Category</label>
            <div className="grid grid-cols-4 gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 rounded-xl text-center font-bold text-[10px] transition-all border ${
                    category === cat
                      ? 'bg-primary-violet/20 border-primary-violet text-primary-violet shadow-sm'
                      : 'bg-surface-elevated/40 border-theme text-theme-muted hover:text-theme-main'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & XP reward */}
          <div>
            <label className="block font-bold text-theme-main mb-1.5 flex items-center justify-between">
              <span>Difficulty & Reward</span>
              <span className="text-amber-400 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />+{getXpForDifficulty(difficulty)} XP Reward
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {difficulties.map((d) => (
                <button
                  type="button"
                  key={d.diff}
                  onClick={() => setDifficulty(d.diff)}
                  className={`py-2.5 rounded-xl text-center font-bold transition-all border ${
                    difficulty === d.diff
                      ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-primary-violet text-theme-main shadow-md'
                      : 'bg-surface-elevated/40 border-theme text-theme-muted hover:text-theme-main'
                  }`}
                >
                  <div className="text-xs">{d.label}</div>
                  <div className="text-[10px] text-amber-400">+{d.xp} XP</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-theme-main mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as QuestPriority)}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-theme text-theme-main focus:outline-none focus:border-primary-violet"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-theme-main mb-1">Est. Minutes</label>
              <input
                type="number"
                min="5"
                max="360"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Math.max(5, parseInt(e.target.value) || 25))}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-theme text-theme-main focus:outline-none focus:border-primary-violet"
              >
              </input>
            </div>

            <div>
              <label className="block font-bold text-theme-main mb-1">Target Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-theme text-theme-main focus:outline-none focus:border-primary-violet"
              />
            </div>
          </div>

          {/* Subtasks checklist builder */}
          <div>
            <label className="block font-bold text-theme-main mb-1">
              Subtasks ({subtasks.length})
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add actionable subtask step..."
                className="flex-1 px-3 py-2 rounded-xl bg-surface-elevated border border-theme text-theme-main placeholder:text-theme-muted/50 focus:outline-none focus:border-primary-violet text-xs"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-surface-elevated hover:bg-primary-violet text-theme-main hover:text-white border border-theme transition-colors font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 p-2 rounded-xl bg-surface-elevated/30 border border-theme max-h-36 overflow-y-auto">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-surface-elevated/50 text-theme-main text-xs"
                  >
                    <span className="truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-theme-muted hover:text-coral transition-colors p-1"
                      aria-label="Remove subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-theme flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                setSelectedQuest(null);
              }}
              className="px-4 py-2.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-surface-elevated transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:opacity-95 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              {isEditing ? 'Save Quest' : 'Inscribe Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

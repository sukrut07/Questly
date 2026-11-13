'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { Quest, TaskType, QuestDifficulty, QuestPriority } from '@/lib/types';
import { getXpForDifficulty, getTodayDateString } from '@/lib/progressionEngine';
import { X, Plus, Trash2, Check, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function QuestModal() {
  const { activeModal, setActiveModal, selectedQuest, setSelectedQuest, createQuest, updateQuest, subjects } =
    useQuestly();

  const isEditing = activeModal === 'edit_quest' && selectedQuest !== null;
  const isOpen = activeModal === 'new_task' || activeModal === 'new_quest' || isEditing;

  if (!isOpen) return null;

  return (
    <QuestModalForm
      key={isEditing && selectedQuest ? selectedQuest.id : 'new'}
      selectedQuest={selectedQuest}
      isEditing={isEditing}
      subjects={subjects}
      onClose={() => {
        setActiveModal(null);
        setSelectedQuest(null);
      }}
      createQuest={createQuest}
      updateQuest={updateQuest}
    />
  );
}

function QuestModalForm({
  selectedQuest,
  isEditing,
  subjects,
  onClose,
  createQuest,
  updateQuest,
}: {
  selectedQuest: Quest | null;
  isEditing: boolean;
  subjects: any[];
  onClose: () => void;
  createQuest: (q: Omit<Quest, 'id' | 'createdAt' | 'completedAt' | 'actualMinutes'>) => void;
  updateQuest: (q: Quest) => void;
}) {
  const [title, setTitle] = useState(isEditing && selectedQuest ? selectedQuest.title : '');
  const [description, setDescription] = useState(isEditing && selectedQuest ? selectedQuest.description : '');
  const [subjectId, setSubjectId] = useState(
    isEditing && selectedQuest ? selectedQuest.subjectId || subjects[0]?.id : subjects[0]?.id || ''
  );
  const [taskType, setTaskType] = useState<TaskType>(
    isEditing && selectedQuest ? selectedQuest.taskType : 'problem_solving'
  );
  const [difficulty, setDifficulty] = useState<QuestDifficulty>(
    isEditing && selectedQuest ? selectedQuest.difficulty : 'MEDIUM'
  );
  const [priority, setPriority] = useState<QuestPriority>(
    isEditing && selectedQuest ? selectedQuest.priority : 'MEDIUM'
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    isEditing && selectedQuest ? selectedQuest.estimatedMinutes : 45
  );
  const [dueDate, setDueDate] = useState(
    isEditing && selectedQuest ? selectedQuest.dueDate || getTodayDateString() : getTodayDateString()
  );
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; isCompleted: boolean }[]>(
    isEditing && selectedQuest ? selectedQuest.subtasks : []
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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

    const matchedSubject = subjects.find((s) => s.id === subjectId);
    const xpReward = getXpForDifficulty(difficulty);

    if (isEditing && selectedQuest) {
      updateQuest({
        ...selectedQuest,
        title: title.trim(),
        description: description.trim(),
        subjectId: matchedSubject?.id,
        subjectCode: matchedSubject?.code,
        subjectColorHex: matchedSubject?.colorHex,
        taskType,
        difficulty,
        priority,
        estimatedMinutes,
        dueDate,
        xpReward,
        subtasks,
      });
    } else {
      createQuest({
        title: title.trim(),
        description: description.trim(),
        subjectId: matchedSubject?.id,
        subjectCode: matchedSubject?.code,
        subjectColorHex: matchedSubject?.colorHex || '#A3E635',
        taskType,
        difficulty,
        priority,
        estimatedMinutes,
        dueDate,
        status: 'IN_PROGRESS',
        xpReward,
        isRecurring: false,
        subtasks,
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
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div>
            <h3 className="text-base font-extrabold text-zinc-100">
              {isEditing ? 'Edit Academic Task' : 'Add Academic Task'}
            </h3>
            <p className="text-xs text-zinc-400">Problem sets, reading assignments, and lab tasks</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Red-Black Tree rotation in C++"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* Subject & Task Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Associated Course</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
              >
                <option value="">General / Independent Study</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Academic Task Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
              >
                <option value="problem_solving">Problem Solving</option>
                <option value="coding">Coding / Implementation</option>
                <option value="reading">Textbook Reading</option>
                <option value="revision">Spaced Revision</option>
                <option value="lab_work">Laboratory Work</option>
                <option value="writing">Paper / Essay Writing</option>
              </select>
            </div>
          </div>

          {/* Priority & Estimated Minutes & Due Date */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as QuestPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Duration (min)</label>
              <input
                type="number"
                min={10}
                max={300}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300">Description / Guidelines (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key textbook page numbers, theorem references, or assignment criteria..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* Checklist Subtasks */}
          <div className="space-y-2 pt-2 border-t border-zinc-850">
            <label className="text-xs font-bold text-zinc-300">Checklist Subtasks</label>
            <div className="flex gap-2">
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
                placeholder="Add subtask step and press Enter..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 text-xs font-bold"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 pt-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-850 text-xs"
                  >
                    <span className="text-zinc-200 truncate">{st.title}</span>
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

          {/* Footer Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 text-xs font-extrabold shadow-md transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

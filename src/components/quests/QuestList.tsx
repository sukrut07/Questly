'use client';

import React, { useState, useMemo } from 'react';
import { useQuestly } from '@/lib/store';
import { Quest } from '@/lib/types';
import { QuestCard } from './QuestCard';
import { Plus, Search, Filter, CheckCircle2 } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function QuestList() {
  const { quests, subjects, setActiveModal, setSelectedQuest } = useQuestly();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [sortBy, setSortBy] = useState<'priority' | 'due' | 'duration'>('priority');

  const filteredQuests = useMemo(() => {
    return quests
      .filter((q) => {
        if (searchQuery.trim()) {
          const matchTitle = q.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchDesc = q.description.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchTitle && !matchDesc) return false;
        }

        if (selectedSubjectId !== 'ALL' && q.subjectId !== selectedSubjectId) {
          return false;
        }

        if (selectedStatus === 'ACTIVE' && q.status === 'COMPLETED') return false;
        if (selectedStatus === 'COMPLETED' && q.status !== 'COMPLETED') return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const prioScore: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (prioScore[b.priority] || 0) - (prioScore[a.priority] || 0);
        }
        if (sortBy === 'due') {
          return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
        }
        if (sortBy === 'duration') {
          return a.estimatedMinutes - b.estimatedMinutes;
        }
        return 0;
      });
  }, [quests, searchQuery, selectedSubjectId, selectedStatus, sortBy]);

  const handleOpenNewTask = () => {
    sound.playButtonClick();
    setSelectedQuest(null);
    setActiveModal('new_task');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight">Academic Tasks</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Coursework problems, reading assignments, and laboratory reports
          </p>
        </div>

        <button
          onClick={handleOpenNewTask}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 text-xs font-extrabold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-lime-400"
            />
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
          >
            <option value="ACTIVE">Active Tasks</option>
            <option value="COMPLETED">Completed</option>
            <option value="ALL">All</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredQuests.length > 0 ? (
          filteredQuests.map((quest) => <QuestCard key={quest.id} quest={quest} />)
        ) : (
          <div className="p-12 text-center bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-lime-400 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-200">No tasks match your filters</h4>
            <p className="text-xs text-zinc-500">Try adjusting your search query or subject filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

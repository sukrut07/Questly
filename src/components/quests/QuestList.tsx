'use client';

import React, { useState, useMemo } from 'react';
import { useQuestly } from '@/lib/store';
import { Quest, QuestCategory, QuestStatus } from '@/lib/types';
import { QuestCard, getCategoryIcon } from './QuestCard';
import { Plus, Search, Filter, ArrowUpDown, Sparkles, CheckCircle2, ListFilter } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function QuestList() {
  const { quests, setActiveModal, setSelectedQuest } = useQuestly();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [sortBy, setSortBy] = useState<'priority' | 'due' | 'xp' | 'duration'>('priority');

  const categories: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Quests' },
    { key: 'CODING', label: 'Coding' },
    { key: 'STUDY', label: 'Study' },
    { key: 'WORK', label: 'Work' },
    { key: 'FITNESS', label: 'Fitness' },
    { key: 'READING', label: 'Reading' },
    { key: 'CREATIVITY', label: 'Creativity' },
    { key: 'PERSONAL', label: 'Personal' },
  ];

  // Filtering & Sorting
  const filteredQuests = useMemo(() => {
    return quests
      .filter((q) => {
        // Search query
        if (searchQuery.trim()) {
          const matchTitle = q.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchDesc = q.description.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchTitle && !matchDesc) return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && q.category !== selectedCategory) {
          return false;
        }

        // Status filter
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
        if (sortBy === 'xp') {
          return b.xpReward - a.xpReward;
        }
        if (sortBy === 'duration') {
          return a.estimatedMinutes - b.estimatedMinutes;
        }
        return 0;
      });
  }, [quests, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const activeCount = quests.filter((q) => q.status !== 'COMPLETED').length;
  const completedCount = quests.filter((q) => q.status === 'COMPLETED').length;

  const handleOpenNewQuest = () => {
    sound.playButtonClick();
    setSelectedQuest(null);
    setActiveModal('new_quest');
  };

  const handleEditQuest = (q: Quest) => {
    sound.playButtonClick();
    setSelectedQuest(q);
    setActiveModal('edit_quest');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-theme-main tracking-tight">Quest Log</h2>
          <p className="text-xs text-theme-muted mt-0.5">
            Real missions that shape your character level and evolve your world
          </p>
        </div>

        <button
          onClick={handleOpenNewQuest}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Inscribe Quest</span>
        </button>
      </div>

      {/* Controls Bar: Search, Category Pills, Status & Sort */}
      <div className="space-y-3 p-4 rounded-3xl bg-surface-main border border-theme shadow-sm">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active missions, skills, or objectives..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated/70 border border-theme text-theme-main placeholder:text-theme-muted text-xs focus:outline-none focus:border-primary-violet"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {/* Status toggle buttons */}
            <div className="flex items-center p-1 rounded-xl bg-surface-elevated/80 border border-theme text-xs font-semibold">
              <button
                onClick={() => setSelectedStatus('ACTIVE')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedStatus === 'ACTIVE'
                    ? 'bg-primary-violet text-white shadow-sm'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setSelectedStatus('COMPLETED')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedStatus === 'COMPLETED'
                    ? 'bg-mint-green text-black font-bold shadow-sm'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                Done ({completedCount})
              </button>
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedStatus === 'ALL'
                    ? 'bg-surface-main text-theme-main shadow-sm'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                All
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated/80 border border-theme text-xs text-theme-muted">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'priority' | 'due' | 'xp' | 'duration')}
                className="bg-transparent text-theme-main text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="priority" className="bg-surface-elevated">Sort: Priority</option>
                <option value="due" className="bg-surface-elevated">Sort: Due Date</option>
                <option value="xp" className="bg-surface-elevated">Sort: XP Reward</option>
                <option value="duration" className="bg-surface-elevated">Sort: Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => {
                  sound.playButtonClick();
                  setSelectedCategory(c.key);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border shrink-0 text-xs ${
                  isSelected
                    ? 'bg-primary-violet/20 border-primary-violet text-primary-violet shadow-sm'
                    : 'bg-surface-elevated/40 border-theme text-theme-muted hover:text-theme-main'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quests Cards Grid / List */}
      {filteredQuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onEdit={handleEditQuest} />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-surface-main border border-theme text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto text-theme-muted">
            <Sparkles className="w-6 h-6 text-primary-violet/60" />
          </div>
          <h4 className="font-extrabold text-base text-theme-main">No quests found in this scroll</h4>
          <p className="text-xs text-theme-muted max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms or filter criteria.'
              : selectedStatus === 'ACTIVE'
              ? 'All active missions completed! Your kingdom flourishes. Inscribe a new quest to continue expanding.'
              : 'No quests match the current filters.'}
          </p>
          <button
            onClick={handleOpenNewQuest}
            className="px-4 py-2 rounded-xl bg-primary-violet text-white text-xs font-bold hover:bg-purple-600 transition-colors shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Inscribe a Quest</span>
          </button>
        </div>
      )}
    </div>
  );
}

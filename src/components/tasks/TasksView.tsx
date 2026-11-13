'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { Quest, QuestPriority } from '@/lib/types';
import {
  CheckSquare,
  Plus,
  Play,
  Calendar,
  Tag,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  Trash2,
  ListTodo,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function TasksView() {
  const {
    quests,
    subjects,
    completeQuest,
    reopenQuest,
    deleteQuest,
    toggleSubtask,
    setActiveModal,
    setSelectedQuest,
    setCurrentTab,
  } = useQuestly();

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'urgent' | 'completed'>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  const filteredQuests = quests.filter((q) => {
    // Subject filter
    if (selectedSubjectId !== 'all' && q.subjectId !== selectedSubjectId) {
      return false;
    }

    // Tab filter
    if (activeFilter === 'today') {
      return q.status !== 'COMPLETED';
    }
    if (activeFilter === 'urgent') {
      return q.priority === 'URGENT' || q.priority === 'HIGH';
    }
    if (activeFilter === 'completed') {
      return q.status === 'COMPLETED';
    }
    return true;
  });

  const handleCreateTask = () => {
    sound.playButtonClick();
    setSelectedQuest(null);
    setActiveModal('new_task');
  };

  const handleStartFocus = (quest: Quest) => {
    sound.playButtonClick();
    setSelectedQuest(quest);
    setCurrentTab('focus');
  };

  const getPriorityBadge = (priority: QuestPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF806B]/15 text-[#FF806B] border border-[#FF806B]/40">
            URGENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF9C45]/15 text-[#FF9C45] border border-[#FF9C45]/40">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#42DFFF]/15 text-[#42DFFF] border border-[#42DFFF]/40">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#A1A1A1]/15 text-[#A1A1A1] border border-[#A1A1A1]/40">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutal-shadow relative overflow-hidden bg-graph-grid">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#B5FF55]/10 border border-[#B5FF55]/40 flex items-center justify-center text-[#B5FF55]">
              <ListTodo className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-[#F5F5F0] tracking-tight font-display uppercase">
              Academic Task Engine
            </h1>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#B5FF55]/10 text-[#B5FF55] border border-[#B5FF55]/30">
              {quests.filter((q) => q.status !== 'COMPLETED').length} PENDING
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] font-mono max-w-xl">
            Atomic academic tasks verified by idempotent XP rewards. Break coursework down into structured actions.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-black transition-all brutal-shadow font-display uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Subject Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#171A21] border border-[#303642]">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'today', 'urgent', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                sound.playButtonClick();
                setActiveFilter(filter);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-[#B5FF55] text-[#090A0D] brutal-shadow'
                  : 'bg-[#111319] text-[#A1A1A1] hover:text-[#F5F5F0] border border-[#303642]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {subjects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#A1A1A1]">Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-[#111319] border border-[#303642] text-xs font-mono text-[#F5F5F0] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#B5FF55]"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Task List or Empty State */}
      {filteredQuests.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#171A21] border border-dashed border-[#303642] text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#B5FF55]/10 border border-[#B5FF55]/30 flex items-center justify-center text-[#B5FF55] mb-4">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#F5F5F0] mb-1 font-display uppercase">
            No Academic Tasks Found
          </h3>
          <p className="text-xs text-[#A1A1A1] font-mono max-w-md mb-6">
            {activeFilter === 'completed'
              ? 'No completed tasks yet. Finish a task or study session to log your progress.'
              : 'Keep your academic pipeline clear. Add an upcoming assignment, revision topic, or lab task.'}
          </p>
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B5FF55] text-[#090A0D] text-xs font-black brutal-shadow font-display uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create First Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuests.map((quest) => {
            const subject = subjects.find((s) => s.id === quest.subjectId);
            const isCompleted = quest.status === 'COMPLETED';

            return (
              <div
                key={quest.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-[#111319] border-[#252A34] opacity-75'
                    : 'bg-[#171A21] border-[#303642] hover:border-[#B5FF55]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => {
                        if (isCompleted) {
                          reopenQuest(quest.id);
                        } else {
                          completeQuest(quest.id);
                        }
                      }}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                        isCompleted
                          ? 'bg-[#B5FF55] border-[#B5FF55] text-[#090A0D]'
                          : 'border-[#303642] hover:border-[#B5FF55] hover:bg-[#B5FF55]/10'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm sm:text-base font-black tracking-tight font-display ${
                            isCompleted ? 'text-[#A1A1A1] line-through' : 'text-[#F5F5F0]'
                          }`}
                        >
                          {quest.title}
                        </h3>
                        {getPriorityBadge(quest.priority)}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111319] border border-[#303642] text-[#B5FF55]">
                          +{quest.xpReward} XP
                        </span>
                      </div>

                      {quest.description && (
                        <p className="text-xs text-[#A1A1A1] font-mono line-clamp-2">
                          {quest.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#A1A1A1] flex-wrap">
                        {subject && (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: subject.colorHex || '#A879FF' }}
                            />
                            <span>{subject.code}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#A1A1A1]" />
                          <span>{quest.estimatedMinutes}m est</span>
                        </div>
                        {quest.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#A1A1A1]" />
                            <span>Due {new Date(quest.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Subtask Checklists */}
                      {quest.subtasks && quest.subtasks.length > 0 && (
                        <div className="pt-3 border-t border-[#303642]/60 space-y-1.5 mt-2">
                          {quest.subtasks.map((st) => (
                            <div
                              key={st.id}
                              onClick={() => toggleSubtask(quest.id, st.id)}
                              className="flex items-center gap-2 text-xs font-mono cursor-pointer group select-none"
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  st.isCompleted
                                    ? 'bg-[#B5FF55] border-[#B5FF55] text-[#090A0D]'
                                    : 'border-[#303642] group-hover:border-[#B5FF55]'
                                }`}
                              >
                                {st.isCompleted && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                              <span
                                className={`${
                                  st.isCompleted
                                    ? 'text-[#777] line-through'
                                    : 'text-[#D0D0D0] group-hover:text-[#F5F5F0]'
                                }`}
                              >
                                {st.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isCompleted && (
                      <button
                        onClick={() => handleStartFocus(quest)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111319] border border-[#303642] text-[#B5FF55] hover:bg-[#B5FF55]/10 hover:border-[#B5FF55]/40 text-xs font-mono font-bold transition-all"
                        title="Start Focus Timer on this task"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#B5FF55]" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        sound.playButtonClick();
                        setSelectedQuest(quest);
                        setActiveModal('edit_task');
                      }}
                      className="p-1.5 rounded-xl bg-[#111319] border border-[#303642] text-[#A1A1A1] hover:text-[#F5F5F0] transition-colors text-xs font-mono"
                      title="Edit Task"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${quest.title}"?`)) {
                          sound.playButtonClick();
                          deleteQuest(quest.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-[#111319] border border-[#303642] text-[#A1A1A1] hover:text-[#FF806B] hover:border-[#FF806B]/40 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Quest, TaskType, QuestDifficulty, QuestPriority } from '@/lib/types';
import { useQuestly } from '@/lib/store';
import {
  Check,
  Play,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Code2,
  BookOpen,
  FileText,
  FlaskConical,
  RotateCcw,
  Circle,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function getTaskTypeIcon(taskType: TaskType) {
  switch (taskType) {
    case 'coding':
      return <Code2 className="w-3.5 h-3.5" />;
    case 'reading':
      return <BookOpen className="w-3.5 h-3.5" />;
    case 'lab_work':
      return <FlaskConical className="w-3.5 h-3.5" />;
    case 'writing':
      return <FileText className="w-3.5 h-3.5" />;
    case 'revision':
      return <RotateCcw className="w-3.5 h-3.5" />;
    case 'problem_solving':
    default:
      return <BookOpen className="w-3.5 h-3.5" />;
  }
}

export function getDifficultyBadge(diff: QuestDifficulty) {
  switch (diff) {
    case 'EPIC':
      return { label: 'Epic', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
    case 'HARD':
      return { label: 'Hard', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    case 'MEDIUM':
      return { label: 'Medium', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
    case 'EASY':
    default:
      return { label: 'Easy', color: 'text-lime-400 bg-lime-400/10 border-lime-400/30' };
  }
}

interface QuestCardProps {
  quest: Quest;
  onEdit?: (quest: Quest) => void;
  compact?: boolean;
}

export function QuestCard({ quest, onEdit, compact = false }: QuestCardProps) {
  const { completeQuest, reopenQuest, deleteQuest, toggleSubtask, setCurrentTab, setSelectedQuest } = useQuestly();

  const isCompleted = quest.status === 'COMPLETED';
  const diffInfo = getDifficultyBadge(quest.difficulty);

  const completedSubtasksCount = quest.subtasks.filter((st) => st.isCompleted).length;
  const totalSubtasksCount = quest.subtasks.length;

  const handleToggleComplete = () => {
    if (isCompleted) {
      reopenQuest(quest.id);
    } else {
      completeQuest(quest.id);
    }
  };

  const handleStartFocus = () => {
    sound.playButtonClick();
    setSelectedQuest(quest);
    setCurrentTab('focus');
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={handleToggleComplete}
            className="mt-0.5 text-zinc-500 hover:text-lime-400 transition-colors shrink-0"
          >
            {isCompleted ? <CheckCircle2 className="w-5 h-5 text-lime-400" /> : <Circle className="w-5 h-5" />}
          </button>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              {quest.subjectCode && (
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border"
                  style={{
                    backgroundColor: `${quest.subjectColorHex}15`,
                    borderColor: `${quest.subjectColorHex}40`,
                    color: quest.subjectColorHex,
                  }}
                >
                  {quest.subjectCode}
                </span>
              )}
              <span className="text-[10px] font-mono uppercase text-zinc-500">
                {quest.taskType}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400">
                {quest.estimatedMinutes}m
              </span>
            </div>

            <h4 className={`text-xs font-bold leading-snug ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              {quest.title}
            </h4>

            {quest.description && (
              <p className="text-[11px] text-zinc-400 line-clamp-2">{quest.description}</p>
            )}

            {totalSubtasksCount > 0 && (
              <div className="text-[11px] text-zinc-400 font-mono pt-1">
                {completedSubtasksCount} / {totalSubtasksCount} subtasks
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isCompleted && (
            <button
              onClick={handleStartFocus}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800"
              title="Focus"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => deleteQuest(quest.id)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

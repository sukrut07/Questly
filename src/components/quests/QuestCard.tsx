'use client';

import React from 'react';
import { Quest, QuestCategory, QuestDifficulty, QuestPriority } from '@/lib/types';
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
  Briefcase,
  Dumbbell,
  Palette,
  User,
  Star,
  ListTodo,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function getCategoryIcon(cat: QuestCategory) {
  switch (cat) {
    case 'CODING':
      return <Code2 className="w-3.5 h-3.5" />;
    case 'STUDY':
      return <BookOpen className="w-3.5 h-3.5" />;
    case 'WORK':
      return <Briefcase className="w-3.5 h-3.5" />;
    case 'FITNESS':
      return <Dumbbell className="w-3.5 h-3.5" />;
    case 'READING':
      return <BookOpen className="w-3.5 h-3.5" />;
    case 'CREATIVITY':
      return <Palette className="w-3.5 h-3.5" />;
    case 'PERSONAL':
      return <User className="w-3.5 h-3.5" />;
    case 'CUSTOM':
    default:
      return <Star className="w-3.5 h-3.5" />;
  }
}

export function getDifficultyBadge(diff: QuestDifficulty) {
  switch (diff) {
    case 'EPIC':
      return { label: 'Epic', color: 'text-coral bg-coral/10 border-coral/30' };
    case 'HARD':
      return { label: 'Hard', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    case 'MEDIUM':
      return { label: 'Medium', color: 'text-primary-violet bg-primary-violet/10 border-primary-violet/30' };
    case 'EASY':
    default:
      return { label: 'Easy', color: 'text-mint-green bg-mint-green/10 border-mint-green/30' };
  }
}

export function getPriorityIndicator(prio: QuestPriority) {
  switch (prio) {
    case 'URGENT':
      return <span className="w-2 h-2 rounded-full bg-coral animate-ping" title="Urgent Priority" />;
    case 'HIGH':
      return <span className="w-2 h-2 rounded-full bg-amber-400" title="High Priority" />;
    case 'MEDIUM':
      return <span className="w-2 h-2 rounded-full bg-primary-violet" title="Medium Priority" />;
    case 'LOW':
    default:
      return <span className="w-2 h-2 rounded-full bg-electric-blue" title="Low Priority" />;
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
      className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
        isCompleted
          ? 'bg-surface-elevated/30 border-theme/40 opacity-70'
          : 'bg-surface-main hover:bg-surface-elevated/60 border-theme hover:border-theme-glow shadow-sm hover:shadow-lg'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox Button */}
        <button
          onClick={handleToggleComplete}
          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
            isCompleted
              ? 'bg-mint-green border-mint-green text-black scale-95'
              : 'border-theme-glow hover:border-mint-green bg-surface-elevated text-transparent hover:text-mint-green/50'
          }`}
          aria-label={isCompleted ? 'Mark quest as incomplete' : 'Complete quest'}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Priority dot */}
            {getPriorityIndicator(quest.priority)}

            {/* Category Pill */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-elevated border border-theme text-theme-muted flex items-center gap-1">
              {getCategoryIcon(quest.category)}
              <span>{quest.category}</span>
            </span>

            {/* Difficulty & XP Reward */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${diffInfo.color}`}
            >
              <span>{diffInfo.label}</span>
              <span>•</span>
              <span>+{quest.xpReward} XP</span>
            </span>

            {/* Due Date */}
            {quest.dueDate && (
              <span className="text-[10px] text-theme-muted flex items-center gap-1 ml-auto">
                <Calendar className="w-3 h-3" />
                <span>{quest.dueDate}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h4
            className={`font-bold text-sm leading-snug break-words ${
              isCompleted ? 'line-through text-theme-muted' : 'text-theme-main'
            }`}
          >
            {quest.title}
          </h4>

          {/* Description */}
          {quest.description && !compact && (
            <p className="text-xs text-theme-muted mt-1 leading-relaxed line-clamp-2">
              {quest.description}
            </p>
          )}

          {/* Subtasks checklist */}
          {totalSubtasksCount > 0 && !compact && (
            <div className="mt-3 pt-2.5 border-t border-theme/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-theme-muted font-medium mb-1">
                <span className="flex items-center gap-1">
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>Subtasks</span>
                </span>
                <span>
                  {completedSubtasksCount} / {totalSubtasksCount}
                </span>
              </div>
              <div className="space-y-1">
                {quest.subtasks.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => toggleSubtask(quest.id, st.id)}
                    className="flex items-center gap-2 text-xs cursor-pointer text-theme-muted hover:text-theme-main select-none p-1 rounded-md hover:bg-surface-elevated/40"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        st.isCompleted
                          ? 'bg-mint-green/80 border-mint-green text-black'
                          : 'border-theme bg-surface-elevated'
                      }`}
                    >
                      {st.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className={st.isCompleted ? 'line-through text-theme-muted/60' : ''}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions & Estimated duration bar */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-theme/40 text-xs">
            <div className="flex items-center gap-3 text-theme-muted text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{quest.estimatedMinutes}m est</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {!isCompleted && (
                <button
                  onClick={handleStartFocus}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-violet/15 hover:bg-primary-violet text-primary-violet hover:text-white border border-primary-violet/30 text-xs font-semibold transition-all active:scale-95"
                  title="Launch Focus Session for this Quest"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Focus</span>
                </button>
              )}

              {onEdit && (
                <button
                  onClick={() => onEdit(quest)}
                  className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main hover:bg-surface-elevated transition-colors"
                  title="Edit quest"
                  aria-label="Edit quest"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => deleteQuest(quest.id)}
                className="p-1.5 rounded-lg text-theme-muted hover:text-coral hover:bg-surface-elevated transition-colors"
                title="Archive quest"
                aria-label="Archive quest"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

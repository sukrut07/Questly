'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Target,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  ChevronRight,
  Check,
  Calendar,
  X,
} from 'lucide-react';
import { sound } from '@/common/SoundService';
import { fireCelebrationConfetti } from '@/common/Confetti';
import { StreakFlameAnimation } from '@/components/animations/StreakFlameAnimation';

export interface UserCheckpoint {
  id: string;
  title: string;
  time: string;
  xpReward: number;
  completed: boolean;
  category: 'study' | 'task' | 'review' | 'custom';
  createdAt: number;
}

interface DailyCheckpointsProps {
  onStartFocus?: () => void;
  onOpenTasks?: () => void;
}

export function DailyCheckpoints({ onStartFocus, onOpenTasks }: DailyCheckpointsProps) {
  const { quests, focusSessions, settings, streak, awardXp } = useQuestly();

  // Local state for user checkpoints, persisted per day
  const todayDateStr = new Date().toISOString().split('T')[0];
  const storageKey = `questly_user_checkpoints_${todayDateStr}`;

  const [checkpoints, setCheckpoints] = useState<UserCheckpoint[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newXp, setNewXp] = useState<number>(30);
  const [newCategory, setNewCategory] = useState<'study' | 'task' | 'review' | 'custom'>('study');
  const [celebratingCheckpoint, setCelebratingCheckpoint] = useState<UserCheckpoint | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckpoints(JSON.parse(saved));
      } else {
        // Initial clean state: 0 dummy data. User starts from scratch.
        setCheckpoints([]);
      }
    } catch {
      setCheckpoints([]);
    }
  }, [storageKey]);

  // Save to localStorage whenever checkpoints change
  const saveCheckpoints = (updated: UserCheckpoint[]) => {
    setCheckpoints(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save daily checkpoints', e);
    }
  };

  // Completed user checkpoints count
  const completedCheckpointsCount = checkpoints.filter((c) => c.completed).length;

  // Real-time task progress
  const todayQuests = quests.filter((q) => q.dueDate === todayDateStr || !q.dueDate);

  // Real-time focus time today
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayFocusSecs = focusSessions
    .filter((s) => s.startedAt >= todayStart)
    .reduce((acc, s) => acc + s.elapsedSeconds, 0);
  const todayFocusMins = Math.floor(todayFocusSecs / 60);
  const targetFocusMins = settings.dailyFocusTargetMinutes || 90;
  const focusProgressPct = Math.min(100, Math.round((todayFocusMins / targetFocusMins) * 100));

  // Add new checkpoint from scratch
  const handleAddCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    sound.playButtonClick();
    const created: UserCheckpoint = {
      id: `cp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newTitle.trim(),
      time: newTime.trim() || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      xpReward: Number(newXp) || 25,
      completed: false,
      category: newCategory,
      createdAt: Date.now(),
    };

    saveCheckpoints([...checkpoints, created]);
    setNewTitle('');
    setNewTime('');
    setNewXp(30);
    setShowAddModal(false);
  };

  // Toggle checkpoint completion
  const handleToggleCheckpoint = (cp: UserCheckpoint) => {
    const isNowCompleted = !cp.completed;
    const updated = checkpoints.map((item) =>
      item.id === cp.id ? { ...item, completed: isNowCompleted } : item
    );
    saveCheckpoints(updated);

    if (isNowCompleted) {
      sound.playQuestComplete();
      awardXp(cp.xpReward, `Completed Checkpoint: ${cp.title}`);
      fireCelebrationConfetti();
      setCelebratingCheckpoint(cp);
    } else {
      sound.playButtonClick();
    }
  };

  // Delete checkpoint
  const handleDeleteCheckpoint = (id: string) => {
    sound.playButtonClick();
    saveCheckpoints(checkpoints.filter((c) => c.id !== id));
  };

  // Quick helper to populate checkpoints from today's quests
  const handleSyncFromQuests = () => {
    sound.playButtonClick();
    const existingTitles = new Set(checkpoints.map((c) => c.title.toLowerCase()));
    const generated: UserCheckpoint[] = todayQuests
      .filter((q) => !existingTitles.has(q.title.toLowerCase()))
      .map((q) => ({
        id: `cp-quest-${q.id}`,
        title: q.title,
        time: q.dueDate ? `Due ${q.dueDate}` : 'Today',
        xpReward: q.xpReward || 30,
        completed: q.status === 'COMPLETED',
        category: 'task',
        createdAt: Date.now(),
      }));

    if (generated.length > 0) {
      saveCheckpoints([...checkpoints, ...generated]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Goals Summary Ring Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Goal 1: Daily Focus Target */}
        <div className="p-4 rounded-2xl bg-[#0D0F14] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Daily Focus</span>
            <span className="text-xs font-mono font-bold text-[#86EFAC]">
              {todayFocusMins}/{targetFocusMins}m
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-[#86EFAC] to-[#15803D] rounded-full transition-all duration-500"
              style={{ width: `${focusProgressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>{focusProgressPct}% Target Met</span>
            {onStartFocus && (
              <button
                onClick={onStartFocus}
                className="text-[#86EFAC] hover:underline flex items-center gap-0.5"
              >
                <span>Focus</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Goal 2: Checkpoints Completed */}
        <div className="p-4 rounded-2xl bg-[#0D0F14] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Checkpoints</span>
            <span className="text-xs font-mono font-bold text-[#C084FC]">
              {completedCheckpointsCount}/{Math.max(checkpoints.length, 1)}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-[#C084FC] to-[#7E22CE] rounded-full transition-all duration-500"
              style={{
                width: `${
                  checkpoints.length > 0
                    ? Math.round((completedCheckpointsCount / checkpoints.length) * 100)
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>
              {checkpoints.length > 0
                ? `${Math.round((completedCheckpointsCount / checkpoints.length) * 100)}% Cleared`
                : 'No checkpoints'}
            </span>
            <span className="text-[#C084FC] font-bold">
              +{checkpoints.filter((c) => c.completed).reduce((sum, c) => sum + c.xpReward, 0)} XP
            </span>
          </div>
        </div>
      </div>

      {/* 2. Checkpoints Header & Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#86EFAC]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-display">
            Today's Checkpoints
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400">
            {checkpoints.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {todayQuests.length > 0 && (
            <button
              onClick={handleSyncFromQuests}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] font-mono text-zinc-300 transition-colors"
              title="Import active tasks as checkpoints"
            >
              Sync Tasks
            </button>
          )}

          <button
            onClick={() => {
              sound.playButtonClick();
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#86EFAC] hover:bg-[#4ADE80] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Checkpoint</span>
          </button>
        </div>
      </div>

      {/* 3. Checkpoints List or Empty Zero-State */}
      {checkpoints.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0D0F14] border border-dashed border-white/[0.12] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] mx-auto flex items-center justify-center text-zinc-400">
            <Target className="w-6 h-6 text-[#86EFAC]" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-zinc-200">No checkpoints scheduled yet</h5>
            <p className="text-xs text-zinc-500 font-mono mt-1 max-w-xs mx-auto">
              Plan your day by adding target milestones, study sprints, or importing tasks.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                sound.playButtonClick();
                setShowAddModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#86EFAC] text-[#090A0D] font-black text-xs uppercase font-display tracking-wider hover:bg-[#4ADE80] transition-colors"
            >
              + Create First Checkpoint
            </button>
            {onOpenTasks && (
              <button
                onClick={onOpenTasks}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-zinc-300 font-mono text-xs hover:bg-white/[0.1] transition-colors"
              >
                Go to Tasks
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {checkpoints.map((cp) => (
            <div
              key={cp.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                cp.completed
                  ? 'bg-white/[0.02] border-white/[0.05] opacity-75'
                  : 'bg-[#0D0F14] border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              {/* Checkbox & Time/Title */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => handleToggleCheckpoint(cp)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    cp.completed
                      ? 'bg-[#86EFAC] border-[#86EFAC] text-[#090A0D]'
                      : 'border-white/[0.2] hover:border-[#86EFAC] text-transparent'
                  }`}
                  aria-label={cp.completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold truncate ${
                        cp.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                      }`}
                    >
                      {cp.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 shrink-0">
                      {cp.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* XP reward & Delete */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono font-bold text-[#86EFAC] px-2 py-0.5 rounded bg-[#86EFAC]/10 border border-[#86EFAC]/20">
                  +{cp.xpReward} XP
                </span>
                <button
                  onClick={() => handleDeleteCheckpoint(cp.id)}
                  className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors"
                  aria-label="Delete checkpoint"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Add Checkpoint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111319] border border-white/[0.12] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#86EFAC]" />
                <h3 className="text-sm font-bold text-zinc-100 font-display uppercase tracking-tight">
                  New Checkpoint
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCheckpoint} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Checkpoint Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish Calculus Chapter 3 Problem Set"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#86EFAC]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#86EFAC]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">XP Reward</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={newXp}
                    onChange={(e) => setNewXp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#86EFAC]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Category</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['study', 'task', 'review', 'custom'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors ${
                        newCategory === cat
                          ? 'bg-[#86EFAC] text-[#090A0D] font-bold'
                          : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl bg-white/[0.04] text-xs font-mono text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#86EFAC] hover:bg-[#4ADE80] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider transition-colors"
                >
                  Save Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Streak Flame Completion Celebration Modal */}
      {celebratingCheckpoint && (
        <StreakFlameAnimation
          isOpen={true}
          streakCount={streak.currentStreak || 1}
          xpEarned={celebratingCheckpoint.xpReward}
          taskTitle={celebratingCheckpoint.title}
          onClose={() => setCelebratingCheckpoint(null)}
        />
      )}
    </div>
  );
}

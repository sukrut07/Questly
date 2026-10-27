'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { getCategoryBadge } from './AdventureMap';
import { X, Star, Sparkles, CheckCircle2, Lock, ArrowRight, Hourglass, CheckSquare } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function LevelDetailModal() {
  const {
    activeModal,
    setActiveModal,
    selectedLevel,
    setSelectedLevel,
    completeAdventureLevel,
    setCurrentTab,
  } = useQuestly();

  if (activeModal !== 'level_detail' || !selectedLevel) return null;

  const isCompleted = selectedLevel.status === 'completed';
  const isAvailable = selectedLevel.status === 'available';
  const isLocked = selectedLevel.status === 'locked';

  const badge = getCategoryBadge(selectedLevel.category);

  // Check condition satisfaction
  const isConditionMet = selectedLevel.condition.current >= selectedLevel.condition.target;

  const handleClaim = () => {
    sound.playQuestComplete();
    completeAdventureLevel(selectedLevel.id, 3);
    setActiveModal(null);
  };

  const handleStartActivity = () => {
    sound.playButtonClick();
    setActiveModal(null);
    if (selectedLevel.category === 'focus') {
      setCurrentTab('focus');
    } else {
      setCurrentTab('quests');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Level ${selectedLevel.id}: ${selectedLevel.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-surface-main border border-theme rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Zone Banner */}
        <div className="p-6 border-b border-theme bg-surface-elevated/40 relative">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1.5 ${badge.color}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </span>

            <button
              onClick={() => {
                sound.playButtonClick();
                setActiveModal(null);
                setSelectedLevel(null);
              }}
              className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-surface-elevated transition-colors"
              aria-label="Close level modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-600/30 shrink-0">
              {selectedLevel.id}
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-theme-main tracking-tight">
                {selectedLevel.title}
              </h3>
              <p className="text-xs text-theme-muted">{selectedLevel.zoneName}</p>
            </div>
          </div>
        </div>

        {/* Challenge details */}
        <div className="p-6 space-y-5 text-xs">
          <div>
            <h4 className="font-bold text-theme-main mb-1">Expedition Directive</h4>
            <p className="text-theme-muted leading-relaxed">{selectedLevel.description}</p>
          </div>

          {/* Condition meter */}
          <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-theme space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-theme-main">Challenge Objective</span>
              <span className="text-primary-violet font-bold">
                {selectedLevel.condition.current} / {selectedLevel.condition.target}{' '}
                {selectedLevel.condition.type === 'focus_minutes' ? 'Minutes' : 'Progress'}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (selectedLevel.condition.current / Math.max(1, selectedLevel.condition.target)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Rewards preview */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-elevated/30 border border-theme">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-theme-main">Earned Stars:</span>
              <span className="font-extrabold text-amber-400">
                {selectedLevel.starsEarned} / 3 Stars
              </span>
            </div>

            <div className="flex items-center gap-1 text-primary-violet font-extrabold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{selectedLevel.xpReward} XP Reward</span>
            </div>
          </div>

          {/* Locked notice */}
          {isLocked && (
            <div className="p-3 rounded-2xl bg-surface-elevated/80 border border-coral/30 flex items-center gap-2 text-coral">
              <Lock className="w-4 h-4 shrink-0" />
              <span className="text-[11px] leading-tight">
                {selectedLevel.unlockMessage || 'Conquer the preceding adventure node to break the arcane seal.'}
              </span>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="p-4 border-t border-theme bg-surface-elevated/40 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setActiveModal(null);
              setSelectedLevel(null);
            }}
            className="px-4 py-2 rounded-xl text-theme-muted hover:text-theme-main text-xs font-bold"
          >
            Close
          </button>

          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-mint-green/20 border border-mint-green/40 text-mint-green font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Level Conquered</span>
            </div>
          ) : isConditionMet ? (
            <button
              onClick={handleClaim}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-mint-green to-emerald-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim Victory & Stars</span>
            </button>
          ) : isAvailable ? (
            <button
              onClick={handleStartActivity}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Commence Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

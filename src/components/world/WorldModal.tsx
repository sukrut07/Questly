'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { WORLD_STAGES, WorldStageNumber } from '@/lib/progressionEngine';
import { X, Sparkles, Flame, Shield, CheckCircle2, Lock, Landmark, HeartHandshake } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function WorldModal() {
  const { activeModal, setActiveModal, streak } = useQuestly();

  if (activeModal !== 'world_inspect') return null;

  const currentStageNum = streak.worldStage;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="World Evolution Codex"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface-main border border-theme rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-theme flex items-center justify-between bg-surface-elevated/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-theme-main tracking-tight">
                World Evolution Codex
              </h2>
              <p className="text-xs text-theme-muted">
                How your consistency transforms the living productivity realm
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveModal(null);
            }}
            className="p-2 rounded-xl text-theme-muted hover:text-theme-main hover:bg-surface-elevated transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Philosophy alert box */}
        <div className="px-6 py-4 bg-surface-elevated/30 border-b border-theme flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-mint-green shrink-0 mt-0.5" />
          <div className="text-xs text-theme-muted leading-relaxed">
            <strong className="text-theme-main">The Living World Law: </strong>
            Consistency breathes life into your realm: colors deepen, towers rise, and flora flourishes.
            When you take a break, your world simply rests in quiet twilight. Your permanent structures and achievements
            are <span className="text-theme-main font-semibold">never destroyed</span> or confiscated.
          </div>
        </div>

        {/* 6 Stages Timeline */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {([1, 2, 3, 4, 5, 6] as WorldStageNumber[]).map((stageNum) => {
            const stg = WORLD_STAGES[stageNum];
            const isCurrent = stageNum === currentStageNum;
            const isUnlocked = stageNum <= currentStageNum;

            return (
              <div
                key={stageNum}
                className={`p-5 rounded-2xl border transition-all duration-300 relative ${
                  isCurrent
                    ? 'bg-gradient-to-r from-purple-950/40 via-surface-elevated to-indigo-950/30 border-primary-violet shadow-lg glow-violet'
                    : isUnlocked
                    ? 'bg-surface-elevated/40 border-theme text-theme-main'
                    : 'bg-surface-elevated/15 border-theme/50 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs ${
                        isCurrent
                          ? 'bg-primary-violet text-white shadow-md'
                          : isUnlocked
                          ? 'bg-mint-green/20 text-mint-green border border-mint-green/40'
                          : 'bg-surface-elevated text-theme-muted border border-theme'
                      }`}
                    >
                      {isUnlocked ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-theme-main">{stg.title}</h3>
                        {isCurrent && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary-violet text-white uppercase tracking-wider">
                            Active Realm
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-primary-violet/80 font-medium">{stg.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-theme-muted font-semibold bg-surface-main/80 px-3 py-1.5 rounded-xl border border-theme shrink-0">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Req: {stg.minStreakDays} Streak Days</span>
                  </div>
                </div>

                <p className="text-xs text-theme-muted leading-relaxed pl-11">
                  {stg.description}
                </p>

                <div className="mt-3 pl-11 text-[11px] text-theme-muted font-medium flex items-center gap-2">
                  <span className="text-theme-main font-semibold">Milestone:</span>
                  <span>{stg.nextMilestoneDesc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme bg-surface-elevated/40 flex justify-end">
          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveModal(null);
            }}
            className="px-5 py-2 rounded-xl bg-primary-violet text-white text-xs font-bold hover:bg-purple-600 transition-colors shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

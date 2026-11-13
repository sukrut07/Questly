'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import {
  RotateCcw,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react';

export function WeeklyReviewModal() {
  const {
    activeModal,
    setActiveModal,
    quests,
    focusSessions,
    deadlines,
    subjects,
    showToast,
  } = useQuestly();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [priorities, setPriorities] = useState(['', '', '']);

  if (activeModal !== 'weekly_review') return null;

  const completedQuests = quests.filter((q) => q.status === 'COMPLETED');
  const unfinishedQuests = quests.filter((q) => q.status !== 'COMPLETED');

  // Focus time past 7 days
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const recentSessions = focusSessions.filter((s) => s.startedAt >= sevenDaysAgo);
  const totalFocusMinutes = recentSessions.reduce(
    (acc, s) => acc + Math.floor(s.elapsedSeconds / 60),
    0
  );
  const totalXp = recentSessions.reduce((acc, s) => acc + s.xpEarned, 0) +
    completedQuests.reduce((acc, q) => acc + q.xpReward, 0);

  const handleFinish = () => {
    showToast({
      title: 'Weekly Review Completed',
      subtitle: 'Next week priorities committed to your workspace',
      type: 'success',
    });
    setActiveModal(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-extrabold text-zinc-100">Guided Weekly Review</h3>
              <p className="text-xs text-zinc-400">Step {step} of 4 • Close loops and align next week</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-zinc-900">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Body content based on step */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-zinc-100">1. Celebrate Achievements</h4>
                <p className="text-xs text-zinc-400 mt-1">Here is the verified work you completed this past week:</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                  <CheckCircle2 className="w-5 h-5 text-lime-400 mx-auto mb-1.5" />
                  <div className="text-xl font-mono font-extrabold text-zinc-100">{completedQuests.length}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Tasks Cleared</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                  <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
                  <div className="text-xl font-mono font-extrabold text-zinc-100">
                    {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Deep Focus</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                  <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                  <div className="text-xl font-mono font-extrabold text-amber-400">+{totalXp}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">XP Minted</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recently Completed</div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {completedQuests.slice(0, 4).map((q) => (
                    <div key={q.id} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200">{q.title}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{q.subjectCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-zinc-100">2. Inspect Unfinished Tasks</h4>
                <p className="text-xs text-zinc-400 mt-1">Review carried-over tasks. Decide what to reschedule or drop:</p>
              </div>

              {unfinishedQuests.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {unfinishedQuests.map((q) => (
                    <div key={q.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-3">
                        <div className="font-semibold text-zinc-200 truncate">{q.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                          <span style={{ color: q.subjectColorHex }}>{q.subjectCode || 'General'}</span>
                          <span>•</span>
                          <span>{q.estimatedMinutes}m</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] text-amber-400">{q.priority}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        Rolled Over
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-zinc-900/40 rounded-xl border border-zinc-800">
                  <CheckCircle2 className="w-6 h-6 text-lime-400 mx-auto mb-2" />
                  <p className="text-xs text-zinc-300 font-bold">Zero unfinished tasks carried over!</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-zinc-100">3. Upcoming Deadlines Radar</h4>
                <p className="text-xs text-zinc-400 mt-1">Assignments and examinations approaching within the next 14 days:</p>
              </div>

              <div className="space-y-2.5">
                {deadlines.filter((d) => !d.isCompleted).map((d) => (
                  <div key={d.id} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-zinc-100">{d.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {d.subjectCode} • Weight: {d.weightagePercentage}% of grade
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                      {new Date(d.deadlineIso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-zinc-100">4. Commit Next Week Priorities</h4>
                <p className="text-xs text-zinc-400 mt-1">State your top 3 non-negotiable academic goals for the upcoming week:</p>
              </div>

              <div className="space-y-3">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Priority #{idx + 1}
                    </label>
                    <input
                      type="text"
                      value={priorities[idx]}
                      onChange={(e) => {
                        const copy = [...priorities];
                        copy[idx] = e.target.value;
                        setPriorities(copy);
                      }}
                      placeholder={
                        idx === 0
                          ? 'e.g. Master Red-Black tree deletion and rotations'
                          : idx === 1
                          ? 'e.g. Solve all questions in Linear Algebra Midterm mock paper'
                          : 'e.g. Complete 5 hours of verified deep focus'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 text-xs font-extrabold transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Commit & Complete Review</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


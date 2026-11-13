'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { LEVEL_CONFIG, XP_RULES } from '@/lib/progressionEngine';
import {
  Sparkles,
  X,
  Zap,
  CheckCircle2,
  Clock,
  Gamepad2,
  RotateCcw,
  CheckSquare,
  Lock,
  Unlock,
  Shield,
  Award,
  Layers,
} from 'lucide-react';
import { InteractiveGraphBackground } from '@/components/common/InteractiveGraphBackground';
import { QuestlyLogo } from '@/components/common/QuestlyLogo';
import { sound } from '@/common/SoundService';

export function XpTrackerModal() {
  const { activeModal, setActiveModal, user, xpTransactions } = useQuestly();

  if (activeModal !== 'xp_tracker') return null;

  const currentLevelConfig =
    LEVEL_CONFIG.find((l) => l.level === user.level) || LEVEL_CONFIG[0];
  const nextLevelConfig =
    LEVEL_CONFIG.find((l) => l.level === user.level + 1) || null;

  const xpRequiredForNext = user.nextLevelXp - user.currentXp;
  const progressPercent = Math.min(
    100,
    Math.round((user.currentXp / Math.max(1, user.nextLevelXp)) * 100)
  );

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayXp = xpTransactions
    .filter((tx) => tx.timestamp >= todayStart)
    .reduce((sum, tx) => sum + tx.xpAmount, 0);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'task_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF55]" />;
      case 'focus_session':
        return <Clock className="w-3.5 h-3.5 text-[#42DFFF]" />;
      case 'checklist_completed':
        return <CheckSquare className="w-3.5 h-3.5 text-[#A879FF]" />;
      case 'weekly_review':
        return <RotateCcw className="w-3.5 h-3.5 text-[#538CFF]" />;
      case 'arcade_challenge':
        return <Gamepad2 className="w-3.5 h-3.5 text-[#FF9C45]" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-[#B5FF55]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="w-full max-w-2xl bg-[#171A21] border border-[#303642] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative brutal-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Interactive Header with Graph Background */}
        <div className="relative p-6 border-b border-[#303642] overflow-hidden bg-[#111319]">
          <InteractiveGraphBackground
            cellSize={24}
            glowColor="lime"
            intensity={0.8}
            className="opacity-40"
          />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <QuestlyLogo size={40} variant="lime" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl tracking-wide text-[#F5F5F5] uppercase">
                    Level {String(user.level).padStart(2, '0')} — {user.academicRank}
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: `${currentLevelConfig.color}15`,
                      borderColor: `${currentLevelConfig.color}40`,
                      color: currentLevelConfig.color,
                    }}
                  >
                    RANK {user.academicRank.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#A0A4AE] font-mono mt-0.5">
                  Verified Academic Ledger • Total XP: {user.totalXp} XP • Today: +{todayXp} XP
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-lg text-[#A0A4AE] hover:text-[#F5F5F5] hover:bg-[#20242D] transition-colors relative z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Large Neon Progress Bar */}
          <div className="relative z-10 mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#B5FF55] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-[#B5FF55]" />
                {user.currentXp} / {user.nextLevelXp} XP
              </span>
              <span className="text-[#A0A4AE]">
                {nextLevelConfig
                  ? `${xpRequiredForNext} XP TO LEVEL ${nextLevelConfig.level}`
                  : 'MAX LEVEL ACHIEVED'}
              </span>
            </div>

            <div className="w-full h-3.5 rounded-full bg-[#090A0D] border border-[#303642] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#42DFFF] via-[#B5FF55] to-[#B5FF55]"
                style={{
                  width: `${progressPercent}%`,
                  boxShadow: '0 0 14px rgba(181, 255, 85, 0.45)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Modal Body: Tabs for Unlocks & Ledger */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Level Progression & Cosmetic Unlocks Roadmap */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-[#A0A4AE] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#B5FF55]" />
                Progression & Cosmetic Unlocks
              </h4>
              <span className="text-[10px] font-mono text-[#A0A4AE]">
                Purely cosmetic rewards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LEVEL_CONFIG.map((lvl) => {
                const isCurrent = lvl.level === user.level;
                const isUnlocked = user.level >= lvl.level;

                return (
                  <div
                    key={lvl.level}
                    className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-[#171A21] border-[#B5FF55] shadow-[0_0_12px_rgba(181,255,85,0.2)]'
                        : isUnlocked
                        ? 'bg-[#111319] border-[#303642]'
                        : 'bg-[#090A0D]/60 border-[#20242D] opacity-60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-display font-black text-xs ${
                        isUnlocked
                          ? 'bg-[#B5FF55]/15 text-[#B5FF55] border border-[#B5FF55]/40'
                          : 'bg-[#20242D] text-[#A0A4AE]'
                      }`}
                    >
                      {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-sm text-[#F5F5F5]">
                          Lvl {lvl.level}: {lvl.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-mono font-bold text-[#B5FF55] px-1.5 py-0.2 rounded bg-[#B5FF55]/10 border border-[#B5FF55]/30">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-[#42DFFF] mt-0.5 truncate">
                        {lvl.unlockTitle}
                      </div>
                      <div className="text-[10px] text-[#A0A4AE] line-clamp-1">
                        {lvl.unlockDescription}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Idempotent XP Transaction Ledger */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-[#A0A4AE] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#42DFFF]" />
                Authoritative XP Ledger (Idempotent Audit)
              </h4>
              <span className="text-[10px] font-mono text-[#A0A4AE]">
                {xpTransactions.length} recorded events
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {xpTransactions.length > 0 ? (
                xpTransactions.slice(0, 15).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-[#111319] border border-[#303642] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-[#20242D] flex items-center justify-center shrink-0">
                        {getSourceIcon(tx.sourceEvent)}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#F5F5F5] truncate">{tx.activityTitle}</div>
                        <div className="text-[10px] text-[#A0A4AE] font-mono">
                          {tx.sourceEvent.replace('_', ' ')} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-black text-xs text-[#B5FF55] px-2 py-0.5 rounded bg-[#B5FF55]/10 border border-[#B5FF55]/30 shrink-0">
                      +{tx.xpAmount} XP
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#A0A4AE] bg-[#111319]/40 rounded-xl border border-[#303642]">
                  No XP transactions recorded yet. Complete tasks or focus sessions to earn verified XP!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#303642] bg-[#111319] flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#A0A4AE]">
            XP Rules: Normal Task 75 XP • Major Task 100 XP • Focus 50 XP • Arcade max 20 XP/day
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-black transition-all brutal-shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

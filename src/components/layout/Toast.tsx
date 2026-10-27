'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { Sparkles, Trophy, CheckCircle2, Info, X } from 'lucide-react';

export function Toast() {
  const { toast, clearToast } = useQuestly();

  if (!toast) return null;

  const isLevelUp = toast.type === 'level_up';
  const isAchievement = toast.type === 'achievement';

  return (
    <aside
      aria-label="Notification alert"
      className="fixed top-5 right-5 z-50 max-w-sm w-full animate-float"
    >
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 flex items-start gap-3 ${
          isLevelUp
            ? 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border-yellow-400/50 glow-gold text-white'
            : isAchievement
            ? 'bg-gradient-to-r from-amber-900/90 to-yellow-900/90 border-amber-400/50 glow-gold text-white'
            : 'bg-surface-elevated/95 border-theme-glow text-theme-main shadow-purple-900/30'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isLevelUp
              ? 'bg-yellow-400/20 text-yellow-300'
              : isAchievement
              ? 'bg-amber-400/20 text-amber-300'
              : 'bg-primary-violet/20 text-primary-violet'
          }`}
        >
          {isLevelUp ? (
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
          ) : isAchievement ? (
            <Trophy className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm truncate tracking-tight">{toast.title}</h4>
            {toast.xp !== undefined && toast.xp > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shrink-0">
                +{toast.xp} XP
              </span>
            )}
          </div>
          {toast.subtitle && (
            <p className="text-xs text-theme-muted mt-0.5 line-clamp-2 leading-relaxed">
              {toast.subtitle}
            </p>
          )}
        </div>

        <button
          onClick={clearToast}
          className="text-theme-muted hover:text-theme-main transition-colors p-1 -mr-1"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

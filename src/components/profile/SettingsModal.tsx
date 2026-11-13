'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Laptop,
  RotateCcw,
  Check,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function SettingsModal() {
  const {
    activeModal,
    setActiveModal,
    settings,
    updateSettings,
    resetAllData,
  } = useQuestly();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (activeModal !== 'settings') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Workspace & System Preferences"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-lime-400" />
            <div>
              <h3 className="font-extrabold text-base text-zinc-100 tracking-tight">
                Workspace Preferences
              </h3>
              <p className="text-xs text-zinc-400">
                Study targets, theme, and audio preferences
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs max-h-[75vh]">
          {/* Theme Switcher */}
          <div className="space-y-2">
            <label className="font-bold text-zinc-300 block">Color Theme</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all ${
                  settings.theme === 'light'
                    ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ theme: 'system' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all ${
                  settings.theme === 'system'
                    ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Academic Study Targets */}
          <div className="space-y-4 pt-4 border-t border-zinc-850">
            <div>
              <div className="flex items-center justify-between mb-1.5 font-bold">
                <span className="text-zinc-200">Daily Focus Target</span>
                <span className="text-lime-400 font-mono">{settings.dailyFocusTargetMinutes} Minutes</span>
              </div>
              <input
                type="range"
                min="30"
                max="360"
                step="15"
                value={settings.dailyFocusTargetMinutes}
                onChange={(e) => updateSettings({ dailyFocusTargetMinutes: parseInt(e.target.value) })}
                className="w-full accent-lime-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-bold">
                <span className="text-zinc-200">Daily Task Target</span>
                <span className="text-lime-400 font-mono">{settings.dailyTaskTargetCount} Tasks</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={settings.dailyTaskTargetCount}
                onChange={(e) => updateSettings({ dailyTaskTargetCount: parseInt(e.target.value) })}
                className="w-full accent-lime-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Sound & Feedback */}
          <div className="space-y-3 pt-4 border-t border-zinc-850">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-zinc-200 block">Sound Effects & Chimes</span>
                <span className="text-[11px] text-zinc-400">
                  Micro-audio feedback on task completions and timer conclusions
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playButtonClick();
                  updateSettings({ soundEnabled: !settings.soundEnabled });
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  settings.soundEnabled
                    ? 'bg-lime-400/10 border-lime-400/40 text-lime-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Reset All Data */}
          <div className="pt-4 border-t border-zinc-850 space-y-2">
            <span className="font-bold text-rose-400 block">Reset Academic Workspace</span>
            <p className="text-[11px] text-zinc-400">
              Restores default Semester 3 academic courses, tasks, and timetables.
            </p>

            {showResetConfirm ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setShowResetConfirm(false);
                    setActiveModal(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-500/15 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 font-bold text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Demo State</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-900/40 border-t border-zinc-800 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

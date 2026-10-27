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
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function SettingsModal() {
  const {
    activeModal,
    setActiveModal,
    settings,
    updateSettings,
    exportDataJson,
    importDataJson,
    resetAllData,
  } = useQuestly();

  const [importText, setImportText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  if (activeModal !== 'settings') return null;

  const handleCopyExport = () => {
    const json = exportDataJson();
    navigator.clipboard.writeText(json);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  const handleDownloadBackup = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questly_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importDataJson(importText.trim());
    if (success) {
      setImportText('');
      setActiveModal(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kingdom & System Preferences"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] bg-surface-main border border-theme rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-theme flex items-center justify-between bg-surface-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-theme flex items-center justify-center text-primary-violet">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-theme-main tracking-tight">
                Kingdom & System Preferences
              </h3>
              <p className="text-xs text-theme-muted">
                Configure your productivity targets, sensory ambience, and backup data
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-surface-elevated transition-colors"
            aria-label="Close preferences"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Theme Switcher */}
          <div>
            <label className="block font-bold text-theme-main mb-2">Visual Theme</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playButtonClick();
                  updateSettings({ theme: 'dark' });
                }}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-primary-violet text-white border-primary-violet shadow-sm'
                    : 'bg-surface-elevated/40 border-theme text-theme-muted hover:text-theme-main'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Theme</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playButtonClick();
                  updateSettings({ theme: 'light' });
                }}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  settings.theme === 'light'
                    ? 'bg-primary-violet text-white border-primary-violet shadow-sm'
                    : 'bg-surface-elevated/40 border-theme text-theme-muted hover:text-theme-main'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Theme</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playButtonClick();
                  updateSettings({ theme: 'system' });
                }}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  settings.theme === 'system'
                    ? 'bg-primary-violet text-white border-primary-violet shadow-sm'
                    : 'bg-surface-elevated/40 border-theme text-theme-muted hover:text-theme-main'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>System OS</span>
              </button>
            </div>
          </div>

          {/* Productivity Goals */}
          <div className="space-y-4 pt-4 border-t border-theme">
            <div>
              <div className="flex items-center justify-between mb-1.5 font-bold">
                <span className="text-theme-main">Daily Focus Target</span>
                <span className="text-primary-violet font-mono">{settings.dailyFocusTargetMinutes} Minutes</span>
              </div>
              <input
                type="range"
                min="15"
                max="180"
                step="5"
                value={settings.dailyFocusTargetMinutes}
                onChange={(e) => updateSettings({ dailyFocusTargetMinutes: parseInt(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-bold">
                <span className="text-theme-main">Daily Quests Target</span>
                <span className="text-primary-violet font-mono">{settings.dailyQuestTargetCount} Quests</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.dailyQuestTargetCount}
                onChange={(e) => updateSettings({ dailyQuestTargetCount: parseInt(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Sound & Audio Synthesizer */}
          <div className="space-y-3 pt-4 border-t border-theme">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-theme-main block">Synthesized Sound Effects</span>
                <span className="text-[11px] text-theme-muted">
                  Interactive Web Audio chimes for level ups, quest completions, and arcade sfx
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playButtonClick();
                  updateSettings({ soundEnabled: !settings.soundEnabled });
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                  settings.soundEnabled ? 'bg-primary-violet' : 'bg-surface-elevated border border-theme'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.soundEnabled && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-theme-muted">
                  <span>Volume Level</span>
                  <span>{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Backup, Export & Import */}
          <div className="space-y-3 pt-4 border-t border-theme">
            <label className="block font-bold text-theme-main">Save Data & Persistence</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex-1 py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-theme font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Backup (JSON)</span>
              </button>
              <button
                type="button"
                onClick={handleCopyExport}
                className="py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-theme font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedExport ? <Check className="w-3.5 h-3.5 text-mint-green" /> : null}
                <span>{copiedExport ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="pt-2 space-y-2">
              <textarea
                rows={2}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste backup JSON string here to restore..."
                className="w-full p-2.5 rounded-xl bg-surface-elevated border border-theme text-theme-main placeholder:text-theme-muted/50 font-mono text-[10px] focus:outline-none focus:border-primary-violet"
              />
              {importText.trim() && (
                <button
                  type="button"
                  onClick={handleImport}
                  className="w-full py-2 rounded-xl bg-primary-violet text-white font-bold text-xs"
                >
                  Confirm & Hydrate State
                </button>
              )}
            </div>
          </div>

          {/* Reset Factory Defaults */}
          <div className="pt-4 border-t border-theme">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-coral/10 border border-theme hover:border-coral/40 text-coral font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Kingdom to Initial Default State</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-coral/15 border border-coral/40 space-y-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-coral font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Are you sure? This resets all progress to starter defaults.</span>
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-xl bg-surface-elevated text-theme-main text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetAllData();
                      setShowResetConfirm(false);
                      setActiveModal(null);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-coral text-white text-xs font-black"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

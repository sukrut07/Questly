'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuestly } from '@/lib/store';
import { Quest } from '@/lib/types';
import { ambientSound } from './AmbientAudio';
import { sound } from '@/common/SoundService';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  CheckCircle2,
  Flame,
  Clock,
  Compass,
  ArrowRight,
} from 'lucide-react';

export function FocusChamber() {
  const { quests, selectedQuest, setSelectedQuest, recordFocusSession, setCurrentTab } = useQuestly();

  const presets = [15, 25, 45, 60];
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(targetMinutes * 60);
  const [elapsedFocusSeconds, setElapsedFocusSeconds] = useState(0);

  const [ambientTrack, setAmbientTrack] = useState<'none' | 'rain' | 'ethereal'>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCompleteSession = React.useCallback(() => {
    ambientSound.stop();
    setIsRunning(false);
    setIsPaused(false);
    setIsSessionFinished(true);

    const plannedSeconds = (isCustomMode ? customMinutes : targetMinutes) * 60;
    recordFocusSession({
      questId: selectedQuest?.id || null,
      questTitle: selectedQuest?.title || null,
      plannedSeconds,
      elapsedSeconds: elapsedFocusSeconds + 1,
      isCompleted: true,
      notes: sessionNotes,
    });
  }, [ambientSound, isCustomMode, customMinutes, targetMinutes, recordFocusSession, selectedQuest, elapsedFocusSeconds, sessionNotes]);

  const completeSessionRef = useRef(handleCompleteSession);
  useEffect(() => {
    completeSessionRef.current = handleCompleteSession;
  }, [handleCompleteSession]);

  // Ambient sound sync
  useEffect(() => {
    if (!isRunning || isPaused) {
      ambientSound.stop();
    } else {
      if (ambientTrack === 'rain') ambientSound.playRain();
      else if (ambientTrack === 'ethereal') ambientSound.playEthereal();
      else ambientSound.stop();
    }
    return () => ambientSound.stop();
  }, [ambientTrack, isRunning, isPaused]);

  // Timer interval ticker
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            completeSessionRef.current();
            return 0;
          }
          return prev - 1;
        });
        setElapsedFocusSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    sound.playFocusStart();
    setIsRunning(true);
    setIsPaused(false);
    setIsSessionFinished(false);
  };

  const handlePause = () => {
    sound.playButtonClick();
    setIsPaused(true);
  };

  const handleResume = () => {
    sound.playButtonClick();
    setIsPaused(false);
  };

  const handleReset = () => {
    sound.playButtonClick();
    setIsRunning(false);
    setIsPaused(false);
    ambientSound.stop();
    const mins = isCustomMode ? customMinutes : targetMinutes;
    setSecondsRemaining(mins * 60);
    setElapsedFocusSeconds(0);
    setIsSessionFinished(false);
  };

  const handleEndEarly = () => {
    if (elapsedFocusSeconds >= 60) {
      // Record whatever qualifying minutes were achieved
      const plannedSeconds = (isCustomMode ? customMinutes : targetMinutes) * 60;
      recordFocusSession({
        questId: selectedQuest?.id || null,
        questTitle: selectedQuest?.title || null,
        plannedSeconds,
        elapsedSeconds: elapsedFocusSeconds,
        isCompleted: false,
        notes: sessionNotes,
      });
    }
    handleReset();
  };

  // Calculations for radial progress
  const totalPlannedSeconds = (isCustomMode ? customMinutes : targetMinutes) * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalPlannedSeconds - secondsRemaining) / Math.max(1, totalPlannedSeconds)) * 100)
  );

  const displayMinutes = Math.floor(secondsRemaining / 60);
  const displaySeconds = secondsRemaining % 60;
  const formattedTime = `${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(
    2,
    '0'
  )}`;

  const activeQuests = quests.filter((q) => q.status !== 'COMPLETED');

  return (
    <div
      className={`space-y-6 transition-all duration-500 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-theme-main p-6 overflow-y-auto flex flex-col justify-center' : ''
      }`}
    >
      {/* Top title & Fullscreen Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-2xl font-black text-theme-main tracking-tight">Focus Chamber</h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-electric-blue/15 border border-electric-blue/30 text-electric-blue uppercase tracking-wider">
              Sanctuary of Deep Work
            </span>
          </div>
          <p className="text-xs text-theme-muted">
            Enter a distraction-free sanctuary. Every minute of verified deep work nourishes your realm.
          </p>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-theme text-theme-muted hover:text-theme-main transition-colors shadow-sm"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Zen Mode'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Zen Mode'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Focus Console Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-surface-main border border-theme shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Subtle radial glow */}
        <div
          className={`absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isRunning && !isPaused
              ? 'bg-primary-violet/15 glow-violet'
              : 'bg-primary-violet/5'
          }`}
        />

        {/* Quest Linking Selector */}
        <div className="w-full max-w-md mb-8 relative z-10 text-center">
          <label className="block text-[11px] font-bold text-theme-muted uppercase tracking-wider mb-2">
            Sanctuary Directive (Linked Quest)
          </label>
          <select
            disabled={isRunning}
            value={selectedQuest?.id || ''}
            onChange={(e) => {
              const q = quests.find((item) => item.id === e.target.value) || null;
              setSelectedQuest(q);
            }}
            className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-theme text-theme-main font-semibold text-xs focus:outline-none focus:border-primary-violet text-center cursor-pointer disabled:opacity-70"
          >
            <option value="">(Solo Sanctuary • General Habit Cultivation)</option>
            {activeQuests.map((q) => (
              <option key={q.id} value={q.id}>
                [{q.category}] {q.title} (+{q.xpReward} XP)
              </option>
            ))}
          </select>
        </div>

        {/* Large Radial Progress Indicator & Clock */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-2 z-10">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="currentColor"
              strokeWidth="8"
              className="text-surface-elevated/80"
              fill="none"
            />
            {/* Animated progress ring */}
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="currentColor"
              strokeWidth="9"
              strokeDasharray={2 * Math.PI * 135}
              strokeDashoffset={2 * Math.PI * 135 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${
                isRunning && !isPaused
                  ? 'text-primary-violet filter drop-shadow-[0_0_12px_rgba(139,124,255,0.4)]'
                  : 'text-primary-violet/50'
              }`}
              fill="none"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute flex flex-col items-center justify-center text-center select-none">
            <span className="font-black text-5xl sm:text-6xl tracking-tight text-theme-main font-mono">
              {formattedTime}
            </span>
            <span className="text-xs text-theme-muted font-bold mt-2 uppercase tracking-widest">
              {isRunning
                ? isPaused
                  ? 'Session Paused'
                  : 'Deep Flow Active'
                : 'Sanctuary Ready'}
            </span>
            {selectedQuest && (
              <span className="text-[10px] text-primary-violet font-semibold max-w-[180px] truncate mt-1">
                {selectedQuest.title}
              </span>
            )}
          </div>
        </div>

        {/* Duration Preset Selector (When Not Running) */}
        {!isRunning && !isPaused && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 z-10">
            {presets.map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  sound.playButtonClick();
                  setIsCustomMode(false);
                  setTargetMinutes(mins);
                  setSecondsRemaining(mins * 60);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  !isCustomMode && targetMinutes === mins
                    ? 'bg-primary-violet text-white border-primary-violet shadow-md'
                    : 'bg-surface-elevated/60 border-theme text-theme-muted hover:text-theme-main'
                }`}
              >
                {mins} Minutes
              </button>
            ))}

            <button
              onClick={() => {
                sound.playButtonClick();
                setIsCustomMode(true);
                setSecondsRemaining(customMinutes * 60);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isCustomMode
                  ? 'bg-primary-violet text-white border-primary-violet shadow-md'
                  : 'bg-surface-elevated/60 border-theme text-theme-muted hover:text-theme-main'
              }`}
            >
              Custom
            </button>
          </div>
        )}

        {/* Custom duration slider if active */}
        {!isRunning && isCustomMode && (
          <div className="w-full max-w-xs mt-4 flex items-center gap-3 z-10">
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={customMinutes}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setCustomMinutes(val);
                setSecondsRemaining(val * 60);
              }}
              className="flex-1 accent-purple-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-theme-main w-14 text-right">
              {customMinutes} mins
            </span>
          </div>
        )}

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4 mt-8 z-10">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-purple-600/30 hover:opacity-95 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Begin Focus</span>
            </button>
          ) : isPaused ? (
            <>
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-mint-green text-black font-extrabold text-xs shadow-lg hover:opacity-95 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>
              <button
                onClick={handleEndEarly}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-elevated border border-theme text-theme-muted hover:text-coral hover:border-coral/40 font-bold text-xs transition-colors"
              >
                <span>Conclude Early</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-elevated border border-theme text-theme-main hover:bg-surface-elevated/80 font-bold text-xs transition-all active:scale-95 shadow-md"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
              <button
                onClick={handleEndEarly}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-elevated border border-theme text-theme-muted hover:text-coral font-bold text-xs transition-colors"
              >
                <span>End Session</span>
              </button>
            </>
          )}

          {(isRunning || isPaused) && (
            <button
              onClick={handleReset}
              className="p-3 rounded-2xl bg-surface-elevated border border-theme text-theme-muted hover:text-theme-main transition-colors"
              title="Cancel and Reset"
              aria-label="Cancel and Reset session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Ambient Sound Selector */}
        <div className="mt-8 pt-6 border-t border-theme/60 w-full max-w-md flex items-center justify-between gap-2 z-10 text-xs">
          <span className="text-theme-muted font-medium flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Ambient Atmosphere</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAmbientTrack('none')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition-all ${
                ambientTrack === 'none'
                  ? 'bg-surface-elevated text-theme-main border-primary-violet'
                  : 'border-theme text-theme-muted hover:text-theme-main'
              }`}
            >
              Mute
            </button>
            <button
              onClick={() => setAmbientTrack('rain')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition-all ${
                ambientTrack === 'rain'
                  ? 'bg-electric-blue/20 text-electric-blue border-electric-blue shadow-sm'
                  : 'border-theme text-theme-muted hover:text-theme-main'
              }`}
            >
              Rainfall
            </button>
            <button
              onClick={() => setAmbientTrack('ethereal')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition-all ${
                ambientTrack === 'ethereal'
                  ? 'bg-primary-violet/20 text-primary-violet border-primary-violet shadow-sm'
                  : 'border-theme text-theme-muted hover:text-theme-main'
              }`}
            >
              Ethereal Drone
            </button>
          </div>
        </div>
      </div>

      {/* Session Finished Summary Modal */}
      {isSessionFinished && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sanctuary Triumph"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div className="w-full max-w-md p-6 rounded-3xl bg-surface-main border border-primary-violet/50 shadow-2xl text-center space-y-4 glow-violet">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-mint-green to-emerald-400 flex items-center justify-center text-black mx-auto shadow-lg shadow-mint-green/30">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="font-extrabold text-xl text-theme-main tracking-tight">
                Sanctuary Triumph!
              </h3>
              <p className="text-xs text-theme-muted mt-1">
                Your focused concentration has poured vital life energy into your kingdom.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-elevated border border-theme flex items-center justify-around">
              <div>
                <div className="text-xs text-theme-muted">Logged Focus</div>
                <div className="text-base font-black text-theme-main">
                  {Math.floor(elapsedFocusSeconds / 60)} mins
                </div>
              </div>
              <div className="w-px h-8 bg-theme" />
              <div>
                <div className="text-xs text-theme-muted">Energy Earned</div>
                <div className="text-base font-black text-yellow-400">
                  +{Math.floor(elapsedFocusSeconds / 60) * 2 + 25} XP
                </div>
              </div>
            </div>

            <p className="text-[11px] text-theme-muted italic">
              Tip: Take a 5-minute break. Walk around, stretch, or visit the Arcade for a quick arcade game before your next sprint.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  setIsSessionFinished(false);
                  setCurrentTab('arcade');
                }}
                className="flex-1 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-theme font-bold text-xs text-theme-main transition-colors"
              >
                Visit Arcade
              </button>
              <button
                onClick={() => {
                  setIsSessionFinished(false);
                  handleReset();
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary-violet hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                Continue Quests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

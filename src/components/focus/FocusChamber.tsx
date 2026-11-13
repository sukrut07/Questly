'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuestly } from '@/lib/store';
import { ambientSound } from './AmbientAudio';
import { sound } from '@/common/SoundService';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';

export function FocusChamber() {
  const { quests, selectedQuest, setSelectedQuest, recordFocusSession } = useQuestly();

  const presets = [15, 25, 45, 60];
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(targetMinutes * 60);
  const [elapsedFocusSeconds, setElapsedFocusSeconds] = useState(0);

  const [ambientTrack, setAmbientTrack] = useState<'none' | 'rain' | 'ethereal'>('none');
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCompleteSession = useCallback(() => {
    ambientSound.stop();
    setIsRunning(false);
    setIsPaused(false);
    setIsSessionFinished(true);

    const plannedSeconds = (isCustomMode ? customMinutes : targetMinutes) * 60;
    recordFocusSession({
      questId: selectedQuest?.id || null,
      questTitle: selectedQuest?.title || null,
      subjectId: selectedQuest?.subjectId || null,
      subjectCode: selectedQuest?.subjectCode || null,
      plannedSeconds,
      elapsedSeconds: elapsedFocusSeconds + 1,
      isCompleted: true,
      notes: sessionNotes,
    });
  }, [isCustomMode, customMinutes, targetMinutes, recordFocusSession, selectedQuest, elapsedFocusSeconds, sessionNotes]);

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
    sound.playButtonClick();
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

  const handleEndEarly = () => {
    sound.playButtonClick();
    if (elapsedFocusSeconds >= 60) {
      handleCompleteSession();
    } else {
      ambientSound.stop();
      setIsRunning(false);
      setIsPaused(false);
      setSecondsRemaining((isCustomMode ? customMinutes : targetMinutes) * 60);
      setElapsedFocusSeconds(0);
    }
  };

  const activeQuests = quests.filter((q) => q.status !== 'COMPLETED');
  const totalSeconds = (isCustomMode ? customMinutes : targetMinutes) * 60;
  const progressPercent = Math.min(100, Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100));

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-lime-400" />
            <h2 className="text-xl font-black text-zinc-100 tracking-tight">Deep Focus Chamber</h2>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30">
              Pomodoro
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Distraction-free timer block for problem solving, coursework reading, and exam preparation.
          </p>
        </div>
      </div>

      {/* Main Focus Chamber Card */}
      <div className="p-8 sm:p-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Linked Task Selector */}
        <div className="w-full max-w-md mb-8 space-y-1.5 text-center">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Target Academic Task
          </label>
          <select
            disabled={isRunning}
            value={selectedQuest?.id || ''}
            onChange={(e) => {
              const q = quests.find((item) => item.id === e.target.value) || null;
              setSelectedQuest(q);
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-semibold text-xs focus:outline-none focus:border-lime-400 text-center cursor-pointer disabled:opacity-60"
          >
            <option value="">(General Focus • Unlinked)</option>
            {activeQuests.map((q) => (
              <option key={q.id} value={q.id}>
                [{q.subjectCode || 'General'}] {q.title}
              </option>
            ))}
          </select>
        </div>

        {/* Large Radial Timer Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="currentColor"
              strokeWidth="8"
              className="text-zinc-900"
              fill="none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 125}
              strokeDashoffset={2 * Math.PI * 125 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${
                isRunning && !isPaused ? 'text-lime-400' : 'text-zinc-700'
              }`}
              fill="none"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center select-none">
            <span className="font-mono font-black text-5xl sm:text-6xl text-zinc-100 tracking-tight">
              {formattedTime}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 font-bold mt-2 uppercase tracking-widest">
              {isRunning ? (isPaused ? 'Paused' : 'Deep Flow Active') : 'Timer Ready'}
            </span>
            {selectedQuest && (
              <span className="text-[11px] text-lime-400 font-bold max-w-[200px] truncate mt-1">
                {selectedQuest.subjectCode}: {selectedQuest.title}
              </span>
            )}
          </div>
        </div>

        {/* Preset Duration Buttons (When Not Running) */}
        {!isRunning && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
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
                    ? 'bg-lime-400 text-zinc-950 border-lime-400 shadow-md font-extrabold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mins}m
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
                  ? 'bg-lime-400 text-zinc-950 border-lime-400 font-extrabold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Custom
            </button>
          </div>
        )}

        {/* Custom duration slider */}
        {!isRunning && isCustomMode && (
          <div className="w-full max-w-xs mt-4 flex items-center gap-3">
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
              className="flex-1 accent-lime-400 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-zinc-300 w-14 text-right">
              {customMinutes} mins
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-8">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Start Session</span>
            </button>
          ) : isPaused ? (
            <>
              <button
                onClick={handleResume}
                className="px-6 py-2.5 rounded-xl bg-lime-400 text-zinc-950 font-extrabold text-xs shadow-md"
              >
                Resume
              </button>
              <button
                onClick={handleEndEarly}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-bold"
              >
                End Session
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-850 font-bold text-xs"
              >
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={handleEndEarly}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-bold"
              >
                End Session
              </button>
            </>
          )}
        </div>

        {/* Ambient Audio Toggles */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-zinc-900 text-xs text-zinc-400">
          <span className="text-[11px] font-bold text-zinc-500 uppercase mr-1">Ambient Sound:</span>
          {(['none', 'rain', 'ethereal'] as const).map((track) => (
            <button
              key={track}
              onClick={() => {
                sound.playButtonClick();
                setAmbientTrack(track);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                ambientTrack === track
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

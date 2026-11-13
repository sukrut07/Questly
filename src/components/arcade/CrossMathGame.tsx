'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import {
  ArrowLeft,
  RotateCcw,
  Check,
  Undo2,
  Trash2,
  Trophy,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

interface CrossMathProps {
  onBack: () => void;
}

interface PuzzleSlot {
  r: number;
  c: number;
  val: string;
  isFixed: boolean;
  isOperator?: boolean;
}

// 5x5 Cross-Math board setup matching Matiks Image 3
// Row 0: 15 + [ ? ] = 21  (missing 6)
// Row 2: 8  ×   3   = [ ? ]  (missing 24)
// Row 4: [ ? ] + 11  = 29  (missing 18)
// Col 0: 15 - 8 = [ ? ] (missing 7)
// Col 2: 6 + 3 = 9
// Col 4: 21 + 24 = 45
const PUZZLE_LEVELS = [
  {
    id: 1,
    title: 'Warmup Crossword',
    grid: [
      ['15', '+', '?', '=', '21'],
      ['-', '', '+', '', '+'],
      ['8', '×', '3', '=', '?'],
      ['=', '', '=', '', '='],
      ['?', '+', '9', '=', '16'],
    ],
    // Solution missing values for slots: (0,2)=6, (2,4)=24, (4,0)=7
    solutions: {
      '0-2': '6',
      '2-4': '24',
      '4-0': '7',
    },
    dockNumbers: ['6', '7', '12', '18', '24', '28'],
  },
  {
    id: 2,
    title: 'Intermediate Equations',
    grid: [
      ['12', '×', '?', '=', '36'],
      ['+', '', '+', '', '-'],
      ['?', '+', '8', '=', '22'],
      ['=', '', '=', '', '='],
      ['26', '-', '11', '=', '?'],
    ],
    solutions: {
      '0-2': '3',
      '2-0': '14',
      '4-4': '15',
    },
    dockNumbers: ['3', '9', '14', '15', '20', '32'],
  },
];

export function CrossMathGame({ onBack }: CrossMathProps) {
  const { awardXp, recordArcadeScore, arcadeRecords } = useQuestly();

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentPuzzle = PUZZLE_LEVELS[currentLevelIdx];

  // User input state: key = "r-c", value = string
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>('0-2');
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const bestScore =
    arcadeRecords.find((r) => r.gameType === 'cross_math')?.highScore || 0;

  const handleSlotClick = (r: number, c: number, isMissing: boolean) => {
    if (!isMissing || isCompleted) return;
    sound.playButtonClick();
    setSelectedSlot(`${r}-${c}`);
    setHasError(false);
  };

  const handleTileClick = (numStr: string) => {
    if (!selectedSlot || isCompleted) return;
    sound.playButtonClick();

    setUserInputs((prev) => ({
      ...prev,
      [selectedSlot]: numStr,
    }));
    setHasError(false);

    // Auto-advance to next missing slot
    const missingKeys = Object.keys(currentPuzzle.solutions);
    const nextSlot = missingKeys.find((k) => k !== selectedSlot && !userInputs[k]);
    if (nextSlot) {
      setSelectedSlot(nextSlot);
    }
  };

  const handleUndo = () => {
    if (!selectedSlot) return;
    sound.playButtonClick();
    setUserInputs((prev) => {
      const next = { ...prev };
      delete next[selectedSlot];
      return next;
    });
    setHasError(false);
  };

  const handleClear = () => {
    sound.playButtonClick();
    setUserInputs({});
    setHasError(false);
    setSelectedSlot(Object.keys(currentPuzzle.solutions)[0]);
  };

  const handleCheck = () => {
    sound.playButtonClick();

    let allCorrect = true;
    for (const [key, sol] of Object.entries(currentPuzzle.solutions)) {
      if (userInputs[key] !== sol) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setIsCompleted(true);
      setHasError(false);
      const points = 350 + (currentLevelIdx + 1) * 100;
      recordArcadeScore('cross_math', points);

      if (!xpAwarded) {
        setXpAwarded(true);
        awardXp('arcade_challenge', `cross_math_lvl_${currentPuzzle.id}`, 'Cross-Math Solved', 10);
        sound.playLevelUp();
      }
    } else {
      setHasError(true);
    }
  };

  const handleNextLevel = () => {
    sound.playButtonClick();
    const nextIdx = (currentLevelIdx + 1) % PUZZLE_LEVELS.length;
    setCurrentLevelIdx(nextIdx);
    setUserInputs({});
    setIsCompleted(false);
    setHasError(false);
    setXpAwarded(false);
    setSelectedSlot(Object.keys(PUZZLE_LEVELS[nextIdx].solutions)[0]);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto w-full px-2 sm:px-0">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#303642]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1A1] hover:text-[#B5FF55] transition-colors py-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Arcade</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A879FF]/15 text-[#A879FF] border border-[#A879FF]/30 font-bold">
            LEVEL {currentPuzzle.id} OF {PUZZLE_LEVELS.length}
          </span>
          <span className="text-[11px] font-mono text-[#B5FF55] font-bold">
            BEST: {bestScore} PTS
          </span>
        </div>
      </div>

      {/* Main Cross-Math Board */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#171A21] border border-[#303642] brutal-shadow space-y-5">
        <div className="text-center">
          <h3 className="text-lg font-black text-[#F5F5F0] font-display uppercase tracking-tight">
            {currentPuzzle.title}
          </h3>
          <p className="text-xs text-[#A1A1A1] font-mono mt-0.5">
            Tap a missing slot, then select the number from the dock to balance the equations.
          </p>
        </div>

        {/* 5x5 Crossword Grid */}
        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 p-2 rounded-2xl bg-[#090A0D] border border-[#303642]">
            {currentPuzzle.grid.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r}-${c}`;
                const isBlank = cell === '';
                const isMissing = cell === '?';
                const isSelected = selectedSlot === key;
                const userVal = userInputs[key];

                if (isBlank) {
                  return <div key={key} className="w-11 h-11 sm:w-13 sm:h-13" />;
                }

                if (isMissing) {
                  return (
                    <button
                      key={key}
                      onClick={() => handleSlotClick(r, c, true)}
                      className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl border-2 flex items-center justify-center font-display font-black text-lg sm:text-xl transition-all ${
                        isSelected
                          ? 'border-[#42DFFF] bg-[#42DFFF]/20 text-[#42DFFF] shadow-[0_0_15px_rgba(66,223,255,0.4)]'
                          : userVal
                          ? 'border-[#A879FF] bg-[#A879FF]/20 text-[#A879FF]'
                          : 'border-dashed border-[#555] bg-[#171A21] text-[#777] hover:border-[#42DFFF]'
                      }`}
                    >
                      {userVal || '?'}
                    </button>
                  );
                }

                const isOperator = ['+', '-', '×', '÷', '='].includes(cell);

                return (
                  <div
                    key={key}
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center font-display font-black text-base sm:text-lg select-none ${
                      isOperator
                        ? 'text-[#A1A1A1] bg-transparent'
                        : 'bg-[#1C2029] border border-[#303642] text-[#F5F5F0]'
                    }`}
                  >
                    {cell}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Error notice */}
        {hasError && (
          <div className="p-3 rounded-xl bg-[#FF806B]/15 border border-[#FF806B] text-center text-xs font-mono text-[#FF806B] flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>One or more equations do not balance. Recheck!</span>
          </div>
        )}

        {/* Victory state */}
        {isCompleted && (
          <div className="p-4 rounded-xl bg-[#B5FF55]/15 border border-[#B5FF55] text-center space-y-2">
            <h4 className="text-sm font-black text-[#B5FF55] font-display uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Equations Balanced! +10 XP</span>
            </h4>
            <button
              onClick={handleNextLevel}
              className="px-4 py-2 rounded-xl bg-[#B5FF55] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider"
            >
              Next Puzzle Level →
            </button>
          </div>
        )}

        {/* Number Tile Dock (Lavender Buttons matching Matiks Image 3) */}
        <div className="space-y-2 pt-2 border-t border-[#303642]">
          <span className="text-[10px] font-mono font-bold text-[#A1A1A1] uppercase tracking-wider block text-center">
            AVAILABLE NUMBER TILES
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {currentPuzzle.dockNumbers.map((numStr) => (
              <button
                key={numStr}
                onClick={() => handleTileClick(numStr)}
                disabled={isCompleted}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#A879FF] hover:bg-[#B98DFF] active:scale-95 text-[#090A0D] font-display font-black text-lg sm:text-xl brutal-shadow transition-all disabled:opacity-40"
              >
                {numStr}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions Bar (Undo, Clear, Submit) */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={handleUndo}
            disabled={isCompleted}
            className="py-2.5 rounded-xl bg-[#111319] hover:bg-[#1C2029] border border-[#303642] text-xs font-mono text-[#A1A1A1] hover:text-[#F5F5F0] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleClear}
            disabled={isCompleted}
            className="py-2.5 rounded-xl bg-[#111319] hover:bg-[#1C2029] border border-[#303642] text-xs font-mono text-[#A1A1A1] hover:text-[#FF806B] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleCheck}
            disabled={isCompleted}
            className="py-2.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider brutal-shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Check</span>
          </button>
        </div>
      </div>
    </div>
  );
}

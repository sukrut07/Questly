'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Timer as TimerIcon,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { sound } from '@/common/SoundService';
import { fireCelebrationConfetti } from '@/common/Confetti';

interface KenKenGameProps {
  onBack?: () => void;
}

interface Cage {
  id: string;
  target: number;
  operation: '+' | '-' | 'x' | '÷' | '';
  cellIndices: number[]; // 0 to 15 for 4x4
  color: string;
}

interface KenKenPuzzle {
  size: 4;
  solution: number[];
  cages: Cage[];
}

const PUZZLES: KenKenPuzzle[] = [
  {
    size: 4,
    // Row 0: [2, 1, 4, 3]
    // Row 1: [1, 4, 3, 2]
    // Row 2: [4, 3, 2, 1]
    // Row 3: [3, 2, 1, 4]
    solution: [
      2, 1, 4, 3,
      1, 4, 3, 2,
      4, 3, 2, 1,
      3, 2, 1, 4,
    ],
    cages: [
      { id: 'c1', target: 3, operation: '+', cellIndices: [0, 1], color: '#B5FF55' },
      { id: 'c2', target: 12, operation: 'x', cellIndices: [2, 3], color: '#42DFFF' },
      { id: 'c3', target: 4, operation: '÷', cellIndices: [4, 8], color: '#A879FF' },
      { id: 'c4', target: 7, operation: '+', cellIndices: [5, 6], color: '#FF806B' },
      { id: 'c5', target: 2, operation: '÷', cellIndices: [7, 11], color: '#FFD76A' },
      { id: 'c6', target: 1, operation: '-', cellIndices: [9, 10], color: '#B5FF55' },
      { id: 'c7', target: 6, operation: '+', cellIndices: [12, 13, 14], color: '#42DFFF' },
      { id: 'c8', target: 4, operation: '', cellIndices: [15], color: '#A879FF' },
    ],
  },
  {
    size: 4,
    // Row 0: [3, 4, 1, 2]
    // Row 1: [4, 3, 2, 1]
    // Row 2: [1, 2, 4, 3]
    // Row 3: [2, 1, 3, 4]
    solution: [
      3, 4, 1, 2,
      4, 3, 2, 1,
      1, 2, 4, 3,
      2, 1, 3, 4,
    ],
    cages: [
      { id: 'p2_c1', target: 7, operation: '+', cellIndices: [0, 1], color: '#42DFFF' },
      { id: 'p2_c2', target: 2, operation: '÷', cellIndices: [2, 3], color: '#B5FF55' },
      { id: 'p2_c3', target: 12, operation: 'x', cellIndices: [4, 5], color: '#FF806B' },
      { id: 'p2_c4', target: 1, operation: '-', cellIndices: [6, 7], color: '#FFD76A' },
      { id: 'p2_c5', target: 2, operation: 'x', cellIndices: [8, 12], color: '#A879FF' },
      { id: 'p2_c6', target: 1, operation: '-', cellIndices: [9, 13], color: '#42DFFF' },
      { id: 'p2_c7', target: 12, operation: 'x', cellIndices: [10, 11], color: '#B5FF55' },
      { id: 'p2_c8', target: 4, operation: '', cellIndices: [14], color: '#FF806B' },
      { id: 'p2_c9', target: 4, operation: '', cellIndices: [15], color: '#FFD76A' },
    ],
  },
];

export function KenKenGame({ onBack }: KenKenGameProps = {}) {
  const { awardXp } = useQuestly();
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const activePuzzle = PUZZLES[puzzleIndex % PUZZLES.length];

  const [grid, setGrid] = useState<number[]>(Array(16).fill(0));
  const [selectedCell, setSelectedCell] = useState<number | null>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const resetGame = () => {
    sound.playButtonClick();
    setGrid(Array(16).fill(0));
    setSelectedCell(0);
    setElapsedSeconds(0);
    setIsWon(false);
    setErrors(new Set());
  };

  const handleCellClick = (index: number) => {
    sound.playButtonClick();
    setSelectedCell(index);
  };

  const handleInputNumber = (val: number) => {
    if (selectedCell === null || isWon) return;
    sound.playButtonClick();

    const newGrid = [...grid];
    newGrid[selectedCell] = val;
    setGrid(newGrid);

    // Validate logic
    validateGrid(newGrid);
  };

  const handleClearCell = () => {
    if (selectedCell === null || isWon) return;
    sound.playButtonClick();
    const newGrid = [...grid];
    newGrid[selectedCell] = 0;
    setGrid(newGrid);
    validateGrid(newGrid);
  };

  // Check if cell is the top-left of its cage to display the target label
  const getCageLabel = (cellIdx: number) => {
    const cage = activePuzzle.cages.find((c) => c.cellIndices.includes(cellIdx));
    if (!cage) return null;
    const firstCell = Math.min(...cage.cellIndices);
    if (firstCell === cellIdx) {
      return `${cage.target}${cage.operation}`;
    }
    return null;
  };

  const getCage = (cellIdx: number) => {
    return activePuzzle.cages.find((c) => c.cellIndices.includes(cellIdx));
  };

  const validateGrid = (currentGrid: number[]) => {
    const newErrors = new Set<number>();

    // 1. Check Row & Column duplicates
    for (let r = 0; r < 4; r++) {
      const seenRow: Record<number, number> = {};
      for (let c = 0; c < 4; c++) {
        const idx = r * 4 + c;
        const val = currentGrid[idx];
        if (val > 0) {
          if (seenRow[val] !== undefined) {
            newErrors.add(idx);
            newErrors.add(seenRow[val]);
          } else {
            seenRow[val] = idx;
          }
        }
      }
    }

    for (let c = 0; c < 4; c++) {
      const seenCol: Record<number, number> = {};
      for (let r = 0; r < 4; r++) {
        const idx = r * 4 + c;
        const val = currentGrid[idx];
        if (val > 0) {
          if (seenCol[val] !== undefined) {
            newErrors.add(idx);
            newErrors.add(seenCol[val]);
          } else {
            seenCol[val] = idx;
          }
        }
      }
    }

    // 2. Check full completion matching solution
    const isFull = currentGrid.every((v) => v > 0);
    const isCorrect = currentGrid.every((v, i) => v === activePuzzle.solution[i]);

    setErrors(newErrors);

    if (isFull && isCorrect && newErrors.size === 0 && !isWon) {
      setIsWon(true);
      sound.playQuestComplete();
      fireCelebrationConfetti();
      awardXp(
        'arcade_challenge',
        `kenken_${Date.now()}`,
        'KenKen Math Puzzle Solved',
        10
      );
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-[#111319] border border-[#303642] space-y-4 text-[#F5F5F0] select-none shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={() => {
                sound.playButtonClick();
                onBack();
              }}
              className="p-1.5 rounded-lg bg-[#171A21] border border-[#303642] text-zinc-400 hover:text-white transition-colors"
              title="Return to Arcade Arena"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg uppercase tracking-tight text-[#B5FF55]">
                KENKEN 4×4
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#B5FF55]/15 text-[#B5FF55]">
                CALCUDOKU
              </span>
            </div>
            <p className="text-xs text-[#A1A1A1] font-mono">
              Fill 1-4 without duplicates to satisfy cage math
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 rounded-lg bg-[#171A21] border border-[#303642] text-zinc-400 hover:text-white"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={resetGame}
            className="p-1.5 rounded-lg bg-[#171A21] border border-[#303642] text-zinc-400 hover:text-white"
            title="Reset Puzzle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rules Banner (Expandable) */}
      {showHelp && (
        <div className="p-3 rounded-xl bg-[#171A21] border border-[#303642] text-xs font-mono space-y-1.5 text-zinc-300">
          <div className="font-bold text-[#B5FF55]">HOW TO PLAY KENKEN:</div>
          <p>• Fill each row and column with digits 1 to 4 exactly once.</p>
          <p>• The numbers inside each colored outline (cage) must combine using the indicated operation (+, -, x, ÷) to equal the target.</p>
          <p>• Single-cell cages just equal their target number.</p>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded-xl bg-[#090A0D] border border-[#303642]">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <TimerIcon className="w-3.5 h-3.5 text-[#42DFFF]" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#B5FF55] font-bold">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Reward: +10 XP</span>
        </div>
      </div>

      {/* 4x4 KenKen Grid */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#090A0D] rounded-2xl border-2 border-[#303642] aspect-square">
        {grid.map((cellValue, idx) => {
          const isSelected = selectedCell === idx;
          const hasError = errors.has(idx);
          const cage = getCage(idx);
          const cageLabel = getCageLabel(idx);

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`relative rounded-xl flex items-center justify-center font-display font-black text-2xl transition-all duration-150 ${
                isSelected
                  ? 'bg-[#B5FF55]/20 ring-2 ring-[#B5FF55]'
                  : 'bg-[#171A21]/90 hover:bg-[#20242D]'
              } ${hasError ? 'text-[#FF806B] bg-[#FF806B]/15' : 'text-[#F5F5F0]'}`}
              style={{
                border: cage ? `2px solid ${cage.color}50` : '1px solid #303642',
              }}
            >
              {/* Cage math target label at top-left */}
              {cageLabel && (
                <span
                  className="absolute top-1 left-1.5 text-[10px] font-mono font-bold leading-none pointer-events-none"
                  style={{ color: cage?.color || '#B5FF55' }}
                >
                  {cageLabel}
                </span>
              )}

              {/* Number Value */}
              <span>{cellValue > 0 ? cellValue : ''}</span>
            </button>
          );
        })}
      </div>

      {/* Virtual Keypad for touch/mobile devices */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => handleInputNumber(num)}
            className="flex-1 py-3 rounded-xl bg-[#171A21] hover:bg-[#20242D] border border-[#303642] text-xl font-display font-black text-[#F5F5F0] hover:text-[#B5FF55] hover:border-[#B5FF55] transition-all brutal-shadow active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClearCell}
          className="px-4 py-3 rounded-xl bg-[#171A21] hover:bg-[#20242D] border border-[#303642] text-xs font-mono font-bold text-[#FF806B] transition-all active:scale-95"
        >
          CLEAR
        </button>
      </div>

      {/* Victory Celebration Overlay */}
      {isWon && (
        <div className="p-4 rounded-xl bg-[#B5FF55] text-[#090A0D] flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 stroke-[2.5]" />
            <div>
              <span className="font-display font-black text-sm uppercase block">
                KENKEN SOLVED!
              </span>
              <span className="text-xs font-mono font-bold opacity-90">
                Time: {formatTime(elapsedSeconds)} • +10 XP Awarded
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setPuzzleIndex((prev) => prev + 1);
              resetGame();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#090A0D] text-[#B5FF55] text-xs font-mono font-bold hover:bg-[#171A21] transition-colors"
          >
            Next Puzzle →
          </button>
        </div>
      )}
    </div>
  );
}

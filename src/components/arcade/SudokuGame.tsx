'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import { Trophy, RotateCcw, ArrowLeft, Check, AlertCircle, Sparkles } from 'lucide-react';
import { sound } from '@/common/SoundService';

interface SudokuProps {
  onBack: () => void;
}

// Simple valid base puzzle with blanks for 9x9
const INITIAL_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

export function SudokuGame({ onBack }: SudokuProps) {
  const { awardXp, recordArcadeScore } = useQuestly();
  const [board, setBoard] = useState<number[][]>(() => INITIAL_PUZZLE.map((r) => [...r]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 2]);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (isCompleted || gameOver) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isCompleted, gameOver]);

  const handleCellClick = (r: number, c: number) => {
    sound.playButtonClick();
    setSelectedCell([r, c]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isCompleted || gameOver) return;
    const [r, c] = selectedCell;

    // Cannot modify initial given numbers
    if (INITIAL_PUZZLE[r][c] !== 0) return;

    sound.playButtonClick();

    if (SOLUTION[r][c] === num) {
      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = num;
      setBoard(newBoard);

      // Check win condition
      const allFilled = newBoard.every((row, ri) =>
        row.every((val, ci) => val === SOLUTION[ri][ci])
      );

      if (allFilled) {
        setIsCompleted(true);
        awardXp('arcade_challenge', 'sudoku_solve', 10, 'Sudoku Solved');
        recordArcadeScore('sudoku', Math.max(1000 - timer * 2, 100));
        sound.playLevelUp();
      }
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 3) {
        setGameOver(true);
      }
    }
  };

  const handleReset = () => {
    sound.playButtonClick();
    setBoard(INITIAL_PUZZLE.map((r) => [...r]));
    setMistakes(0);
    setTimer(0);
    setIsCompleted(false);
    setGameOver(false);
    setSelectedCell([0, 2]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1A1] hover:text-[#B5FF55] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Arcade</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-[#A1A1A1]">
            Time: <strong className="text-[#F5F5F0]">{formatTime(timer)}</strong>
          </span>
          <span className="text-[#FF806B]">
            Mistakes: <strong>{mistakes}/3</strong>
          </span>
        </div>
      </div>

      {/* Sudoku Board */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#171A21] border border-[#303642] brutal-shadow flex flex-col items-center">
        <div className="grid grid-cols-9 gap-[2px] bg-[#303642] p-[2px] rounded-xl border border-[#303642] max-w-full">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isInitial = INITIAL_PUZZLE[r][c] !== 0;
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-[#555]' : '';
              const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-[#555]' : '';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center font-display font-black text-sm sm:text-lg transition-all ${borderRight} ${borderBottom} ${
                    isSelected
                      ? 'bg-[#B5FF55] text-[#090A0D]'
                      : isInitial
                      ? 'bg-[#111319] text-[#F5F5F0]'
                      : val !== 0
                      ? 'bg-[#1C2029] text-[#42DFFF]'
                      : 'bg-[#171A21] text-transparent hover:bg-[#20242D]'
                  }`}
                >
                  {val !== 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-9 gap-1.5 sm:gap-2 mt-6 w-full max-w-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              disabled={isCompleted || gameOver}
              className="py-2.5 rounded-xl bg-[#111319] hover:bg-[#B5FF55] hover:text-[#090A0D] text-[#F5F5F0] border border-[#303642] font-display font-black text-base sm:text-lg transition-all brutal-shadow disabled:opacity-40"
            >
              {num}
            </button>
          ))}
        </div>

        {/* Status Overlays */}
        {isCompleted && (
          <div className="mt-6 p-4 rounded-xl bg-[#B5FF55]/10 border border-[#B5FF55] text-center w-full">
            <h4 className="text-base font-black text-[#B5FF55] font-display uppercase">
              Puzzle Solved! +10 XP
            </h4>
            <p className="text-xs font-mono text-[#A1A1A1] mt-1">
              Time: {formatTime(timer)} • Mistakes: {mistakes}
            </p>
          </div>
        )}

        {gameOver && (
          <div className="mt-6 p-4 rounded-xl bg-[#FF806B]/10 border border-[#FF806B] text-center w-full space-y-2">
            <h4 className="text-base font-black text-[#FF806B] font-display uppercase">
              Game Over (3 Mistakes)
            </h4>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-[#FF806B] text-[#090A0D] text-xs font-black font-display uppercase"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import {
  ArrowLeft,
  RotateCcw,
  Check,
  Undo2,
  Eraser,
  Sparkles,
  Trophy,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

interface SudokuProps {
  onBack: () => void;
}

// 6x6 Mini Blitz board (3x2 blocks) - optimized for fast mobile play
const MINI_6X6_INITIAL = [
  [1, 0, 3, 0, 5, 0],
  [0, 5, 0, 1, 0, 3],
  [0, 0, 1, 6, 0, 0],
  [0, 0, 5, 4, 0, 0],
  [4, 0, 6, 0, 3, 0],
  [0, 3, 0, 5, 0, 6],
];

const MINI_6X6_SOLUTION = [
  [1, 6, 3, 2, 5, 4],
  [2, 5, 4, 1, 6, 3],
  [5, 4, 1, 6, 2, 3],
  [3, 2, 5, 4, 1, 6],
  [4, 1, 6, 2, 3, 5],
  [6, 3, 2, 5, 4, 1],
];

export function SudokuGame({ onBack }: SudokuProps) {
  const { awardXp, recordArcadeScore, arcadeRecords } = useQuestly();

  const [board, setBoard] = useState<number[][]>(() => MINI_6X6_INITIAL.map((r) => [...r]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 1]);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [xpAwarded, setXpAwarded] = useState(false);

  const bestScore =
    arcadeRecords.find((r) => r.gameType === 'sudoku')?.highScore || 0;

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

    // Cannot modify fixed initial numbers
    if (MINI_6X6_INITIAL[r][c] !== 0) return;

    sound.playButtonClick();

    if (notesMode) {
      // Toggle pencil note
      const key = `${r}-${c}`;
      setNotes((prev) => {
        const existing = prev[key] || [];
        const updated = existing.includes(num)
          ? existing.filter((n) => n !== num)
          : [...existing, num];
        return { ...prev, [key]: updated };
      });
      return;
    }

    if (MINI_6X6_SOLUTION[r][c] === num) {
      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = num;
      setBoard(newBoard);

      // Clear notes on that cell
      const key = `${r}-${c}`;
      if (notes[key]) {
        const updatedNotes = { ...notes };
        delete updatedNotes[key];
        setNotes(updatedNotes);
      }

      // Check win condition
      const allFilled = newBoard.every((row, ri) =>
        row.every((val, ci) => val === MINI_6X6_SOLUTION[ri][ci])
      );

      if (allFilled) {
        setIsCompleted(true);
        const score = Math.max(800 - timer * 2 - mistakes * 50, 150);
        recordArcadeScore('sudoku', score);

        if (!xpAwarded) {
          setXpAwarded(true);
          awardXp('arcade_challenge', 'sudoku_blitz_solve', 'Sudoku Blitz Solved', 10);
          sound.playLevelUp();
        }
      }
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 3) {
        setGameOver(true);
      }
    }
  };

  const handleErase = () => {
    if (!selectedCell || isCompleted || gameOver) return;
    const [r, c] = selectedCell;
    if (MINI_6X6_INITIAL[r][c] !== 0) return;

    sound.playButtonClick();
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
  };

  const handleReset = () => {
    sound.playButtonClick();
    setBoard(MINI_6X6_INITIAL.map((r) => [...r]));
    setMistakes(0);
    setTimer(0);
    setIsCompleted(false);
    setGameOver(false);
    setNotes({});
    setSelectedCell([0, 1]);
    setXpAwarded(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selectedValue = selectedCell ? board[selectedCell[0]][selectedCell[1]] : 0;

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

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#A1A1A1]">
            TIME: <strong className="text-[#F5F5F0]">{formatTime(timer)}</strong>
          </span>
          <span className="text-[#FF806B]">
            MISTAKES: <strong>{mistakes}/3</strong>
          </span>
        </div>
      </div>

      {/* 6x6 Mobile-First Board */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#171A21] border border-[#303642] brutal-shadow flex flex-col items-center space-y-4">
        <div className="w-full flex items-center justify-between">
          <span className="text-xs font-black text-[#F5F5F0] font-display uppercase tracking-wider">
            6×6 Blitz Sudoku
          </span>
          <span className="text-[10px] font-mono text-[#B5FF55] font-bold">
            BEST: {bestScore} PTS
          </span>
        </div>

        {/* The Grid (6x6) */}
        <div className="grid grid-cols-6 gap-1 bg-[#303642] p-1.5 rounded-2xl border border-[#303642] w-full max-w-[340px]">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isInitial = MINI_6X6_INITIAL[r][c] !== 0;
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isMatchingValue = selectedValue > 0 && val === selectedValue;
              const isInSelectedRowOrCol =
                selectedCell && (selectedCell[0] === r || selectedCell[1] === c);

              const borderRight = (c + 1) % 3 === 0 && c !== 5 ? 'border-r-2 border-[#555]' : '';
              const borderBottom = (r + 1) % 2 === 0 && r !== 5 ? 'border-b-2 border-[#555]' : '';
              const cellNotes = notes[`${r}-${c}`] || [];

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center font-display font-black text-lg sm:text-xl transition-all ${borderRight} ${borderBottom} ${
                    isSelected
                      ? 'bg-[#B5FF55] text-[#090A0D] shadow-[0_0_15px_rgba(181,255,85,0.4)] scale-105 z-10'
                      : isMatchingValue
                      ? 'bg-[#42DFFF]/25 text-[#42DFFF]'
                      : isInSelectedRowOrCol
                      ? 'bg-[#20242D] text-[#F5F5F0]'
                      : isInitial
                      ? 'bg-[#111319] text-[#F5F5F0]'
                      : val !== 0
                      ? 'bg-[#171A21] text-[#42DFFF]'
                      : 'bg-[#111319] text-transparent hover:bg-[#1C2029]'
                  }`}
                >
                  {val !== 0 ? (
                    val
                  ) : cellNotes.length > 0 ? (
                    <span className="text-[8px] font-mono text-[#A879FF] leading-tight">
                      {cellNotes.join('')}
                    </span>
                  ) : (
                    ''
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Numpad 1 to 6 (Touch Friendly) */}
        <div className="grid grid-cols-6 gap-2 w-full max-w-[340px] pt-2">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              disabled={isCompleted || gameOver}
              className="py-3 rounded-xl bg-[#111319] hover:bg-[#B5FF55] hover:text-[#090A0D] text-[#F5F5F0] border border-[#303642] font-display font-black text-xl brutal-shadow transition-all active:scale-95 disabled:opacity-40"
            >
              {num}
            </button>
          ))}
        </div>

        {/* Secondary Action Bar (Notes, Erase, Reset) */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[340px] pt-1">
          <button
            onClick={() => setNotesMode(!notesMode)}
            className={`py-2 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors ${
              notesMode
                ? 'bg-[#A879FF] border-[#A879FF] text-[#090A0D]'
                : 'bg-[#111319] border-[#303642] text-[#A1A1A1] hover:text-[#F5F5F0]'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Pencil {notesMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleErase}
            className="py-2 rounded-xl bg-[#111319] hover:bg-[#1C2029] border border-[#303642] text-xs font-mono text-[#A1A1A1] hover:text-[#F5F5F0] flex items-center justify-center gap-1.5"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Erase</span>
          </button>

          <button
            onClick={handleReset}
            className="py-2 rounded-xl bg-[#111319] hover:bg-[#1C2029] border border-[#303642] text-xs font-mono text-[#A1A1A1] hover:text-[#FF806B] flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>

        {/* Win State */}
        {isCompleted && (
          <div className="w-full p-4 rounded-xl bg-[#B5FF55]/15 border border-[#B5FF55] text-center space-y-1">
            <h4 className="text-base font-black text-[#B5FF55] font-display uppercase tracking-wider">
              Sudoku Solved! +10 XP
            </h4>
            <p className="text-xs font-mono text-[#A1A1A1]">
              Time: {formatTime(timer)} • Mistakes: {mistakes}
            </p>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="w-full p-4 rounded-xl bg-[#FF806B]/15 border border-[#FF806B] text-center space-y-2">
            <h4 className="text-base font-black text-[#FF806B] font-display uppercase">
              Game Over (3 Mistakes)
            </h4>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-[#FF806B] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

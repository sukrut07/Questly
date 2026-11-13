'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '@/common/SoundService';

interface MatchGridProps {
  onBack: () => void;
}

const COLORS = ['#B5FF55', '#42DFFF', '#A879FF', '#FF9C45', '#FF5EBB'];
const GRID_SIZE = 6;

function getRandomGem() {
  return Math.floor(Math.random() * COLORS.length);
}

function createInitialGrid(): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = getRandomGem();
    }
  }
  return grid;
}

export function MatchGridGame({ onBack }: MatchGridProps) {
  const { awardXp, recordArcadeScore } = useQuestly();
  const [grid, setGrid] = useState<number[][]>(createInitialGrid);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Check for matches and clear
  const checkMatches = (currentGrid: number[][]) => {
    const toClear: boolean[][] = Array(GRID_SIZE)
      .fill(false)
      .map(() => Array(GRID_SIZE).fill(false));
    let hasMatch = false;

    // Horizontal check
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const val = currentGrid[r][c];
        if (val !== -1 && val === currentGrid[r][c + 1] && val === currentGrid[r][c + 2]) {
          toClear[r][c] = true;
          toClear[r][c + 1] = true;
          toClear[r][c + 2] = true;
          hasMatch = true;
        }
      }
    }

    // Vertical check
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const val = currentGrid[r][c];
        if (val !== -1 && val === currentGrid[r + 1][c] && val === currentGrid[r + 2][c]) {
          toClear[r][c] = true;
          toClear[r + 1][c] = true;
          toClear[r + 2][c] = true;
          hasMatch = true;
        }
      }
    }

    if (!hasMatch) return { hasMatch: false, newGrid: currentGrid, matchCount: 0 };

    let count = 0;
    const newGrid = currentGrid.map((row) => [...row]);
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (toClear[r][c]) {
          newGrid[r][c] = -1; // marked for refill
          count++;
        }
      }
    }

    // Drop and refill
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (newGrid[r][c] === -1) {
          // Look up for replacement
          for (let k = r - 1; k >= 0; k--) {
            if (newGrid[k][c] !== -1) {
              newGrid[r][c] = newGrid[k][c];
              newGrid[k][c] = -1;
              break;
            }
          }
          if (newGrid[r][c] === -1) {
            newGrid[r][c] = getRandomGem();
          }
        }
      }
    }

    return { hasMatch: true, newGrid, matchCount: count };
  };

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || movesLeft <= 0) return;

    if (!selected) {
      sound.playButtonClick();
      setSelected([r, c]);
      return;
    }

    const [sr, sc] = selected;
    const isAdjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;

    if (!isAdjacent) {
      setSelected([r, c]);
      return;
    }

    // Swap
    const swapped = grid.map((row) => [...row]);
    const temp = swapped[sr][sc];
    swapped[sr][sc] = swapped[r][c];
    swapped[r][c] = temp;

    const result = checkMatches(swapped);

    if (result.hasMatch) {
      sound.playButtonClick();
      setGrid(result.newGrid);
      const points = result.matchCount * 20;
      const newScore = score + points;
      setScore(newScore);

      if (newScore >= 500 && !xpAwarded) {
        setXpAwarded(true);
        awardXp('arcade_challenge', 'match_grid_500', 10, 'Match Grid Target Reached');
        sound.playLevelUp();
      }
    }

    const newMoves = movesLeft - 1;
    setMovesLeft(newMoves);
    setSelected(null);

    if (newMoves <= 0) {
      setIsGameOver(true);
      recordArcadeScore('match_grid', score);
    }
  };

  const handleRestart = () => {
    sound.playButtonClick();
    setGrid(createInitialGrid());
    setSelected(null);
    setScore(0);
    setMovesLeft(15);
    setIsGameOver(false);
    setXpAwarded(false);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
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
            Moves: <strong className="text-[#F5F5F0]">{movesLeft}</strong>
          </span>
          <span className="text-[#B5FF55]">
            Score: <strong>{score} / 500 pts</strong>
          </span>
        </div>
      </div>

      {/* Gem Grid */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#171A21] border border-[#303642] brutal-shadow flex flex-col items-center">
        <div className="grid grid-cols-6 gap-2 sm:gap-2.5 p-2 bg-[#111319] rounded-2xl border border-[#303642]">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const gemColor = COLORS[val % COLORS.length];

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all brutal-shadow ${
                    isSelected
                      ? 'scale-110 ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: gemColor,
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-white/20 border border-white/40" />
                </button>
              );
            })
          )}
        </div>

        {/* Milestone status */}
        {score >= 500 && (
          <div className="mt-4 p-3 rounded-xl bg-[#B5FF55]/10 border border-[#B5FF55] text-center w-full">
            <span className="text-xs font-mono font-bold text-[#B5FF55]">
              Goal Reached! +10 XP Awarded
            </span>
          </div>
        )}

        {isGameOver && (
          <div className="mt-4 p-4 rounded-xl bg-[#111319] border border-[#303642] text-center w-full space-y-2">
            <h4 className="text-sm font-black text-[#F5F5F0] font-display uppercase">
              Out of Moves! Final Score: {score}
            </h4>
            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-xl bg-[#42DFFF] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

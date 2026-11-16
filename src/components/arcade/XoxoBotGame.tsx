'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import {
  Trophy,
  RotateCcw,
  Bot,
  User,
  Zap,
  Sparkles,
  ShieldAlert,
  Flame,
  ArrowLeft,
} from 'lucide-react';
import { sound } from '@/common/SoundService';
import { fireCelebrationConfetti } from '@/common/Confetti';

interface XoxoBotGameProps {
  onBack?: () => void;
}

type BoardState = (string | null)[];
type BotDifficulty = 'rookie' | 'scholar' | 'grandmaster';

export function XoxoBotGame({ onBack }: XoxoBotGameProps = {}) {
  const { awardXp } = useQuestly();
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('scholar');
  const [winner, setWinner] = useState<string | null>(null); // 'X' | 'O' | 'draw' | null
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  // Match statistics
  const [stats, setStats] = useState({
    playerWins: 0,
    botWins: 0,
    draws: 0,
    streak: 0,
  });

  const checkWinner = (squares: BoardState): { winner: string | null; line: number[] | null } => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }

    if (squares.every((sq) => sq !== null)) {
      return { winner: 'draw', line: null };
    }

    return { winner: null, line: null };
  };

  // Minimax optimal move calculation for Grandmaster bot
  const minimax = (squares: BoardState, depth: number, isMaximizing: boolean): number => {
    const { winner: res } = checkWinner(squares);
    if (res === 'O') return 10 - depth;
    if (res === 'X') return depth - 10;
    if (res === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // Compute best bot move based on chosen difficulty
  const getBotMove = (squares: BoardState): number => {
    const available = squares
      .map((val, idx) => (val === null ? idx : null))
      .filter((v): v is number => v !== null);

    if (available.length === 0) return -1;

    // 1. Rookie: random move
    if (difficulty === 'rookie') {
      return available[Math.floor(Math.random() * available.length)];
    }

    // 2. Scholar: check win or block win, otherwise pick center/corners
    if (difficulty === 'scholar') {
      // Check if bot can win immediately
      for (const idx of available) {
        const copy = [...squares];
        copy[idx] = 'O';
        if (checkWinner(copy).winner === 'O') return idx;
      }
      // Check if player would win on next turn and block
      for (const idx of available) {
        const copy = [...squares];
        copy[idx] = 'X';
        if (checkWinner(copy).winner === 'X') return idx;
      }
      // Prefer center
      if (squares[4] === null) return 4;
      // Prefer corners
      const corners = [0, 2, 6, 8].filter((c) => squares[c] === null);
      if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
      }
      return available[Math.floor(Math.random() * available.length)];
    }

    // 3. Grandmaster: Minimax search
    let bestScore = -Infinity;
    let move = available[0];
    for (const idx of available) {
      squares[idx] = 'O';
      const score = minimax(squares, 0, false);
      squares[idx] = null;
      if (score > bestScore) {
        bestScore = score;
        move = idx;
      }
    }
    return move;
  };

  // Handle Player Move
  const handleCellClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn || isBotThinking) return;

    sound.playButtonClick();
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const { winner: win, line } = checkWinner(newBoard);
    if (win) {
      handleGameOver(win, line);
    } else {
      setIsPlayerTurn(false);
      setIsBotThinking(true);
    }
  };

  // Bot Turn trigger with realistic delay
  useEffect(() => {
    if (!isPlayerTurn && !winner && isBotThinking) {
      const timer = setTimeout(() => {
        const botIdx = getBotMove(board);
        if (botIdx !== -1) {
          const newBoard = [...board];
          newBoard[botIdx] = 'O';
          setBoard(newBoard);

          const { winner: win, line } = checkWinner(newBoard);
          if (win) {
            handleGameOver(win, line);
          } else {
            setIsPlayerTurn(true);
          }
        }
        setIsBotThinking(false);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, isBotThinking, board]);

  const handleGameOver = (win: string, line: number[] | null) => {
    setWinner(win);
    setWinningLine(line);

    if (win === 'X') {
      sound.playQuestComplete();
      fireCelebrationConfetti();
      setStats((prev) => ({
        ...prev,
        playerWins: prev.playerWins + 1,
        streak: prev.streak + 1,
      }));
      awardXp('arcade_challenge', `xoxo_win_${Date.now()}`, 'XOXO Victory vs Bot', 8);
    } else if (win === 'O') {
      sound.playError();
      setStats((prev) => ({
        ...prev,
        botWins: prev.botWins + 1,
        streak: 0,
      }));
    } else if (win === 'draw') {
      sound.playButtonClick();
      setStats((prev) => ({
        ...prev,
        draws: prev.draws + 1,
      }));
      awardXp('arcade_challenge', `xoxo_draw_${Date.now()}`, 'XOXO Draw vs Bot', 3);
    }
  };

  const resetGame = () => {
    sound.playButtonClick();
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setIsPlayerTurn(true);
    setIsBotThinking(false);
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
                XOXO vs BOT
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#A879FF]/15 text-[#A879FF]">
                TIC-TAC-TOE
              </span>
            </div>
            <p className="text-xs text-[#A1A1A1] font-mono">
              Outsmart the AI bot in tactical 3×3 grid battles
            </p>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="p-1.5 rounded-lg bg-[#171A21] border border-[#303642] text-zinc-400 hover:text-white"
          title="Restart Match"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Difficulty Selector */}
      <div className="flex items-center gap-1.5 bg-[#090A0D] p-1 rounded-xl border border-[#303642]">
        {(['rookie', 'scholar', 'grandmaster'] as const).map((diff) => (
          <button
            key={diff}
            onClick={() => {
              sound.playButtonClick();
              setDifficulty(diff);
              resetGame();
            }}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
              difficulty === diff
                ? 'bg-[#B5FF55] text-[#090A0D]'
                : 'text-[#A1A1A1] hover:text-[#F5F5F0]'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Match Scoreboard */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
        <div className="p-2 rounded-xl bg-[#171A21] border border-[#303642]">
          <span className="text-[10px] text-[#A1A1A1] block">YOU (X)</span>
          <span className="font-bold text-[#B5FF55] text-sm">{stats.playerWins}</span>
        </div>
        <div className="p-2 rounded-xl bg-[#171A21] border border-[#303642]">
          <span className="text-[10px] text-[#A1A1A1] block">BOT (O)</span>
          <span className="font-bold text-[#FF806B] text-sm">{stats.botWins}</span>
        </div>
        <div className="p-2 rounded-xl bg-[#171A21] border border-[#303642]">
          <span className="text-[10px] text-[#A1A1A1] block">DRAWS</span>
          <span className="font-bold text-[#42DFFF] text-sm">{stats.draws}</span>
        </div>
        <div className="p-2 rounded-xl bg-[#171A21] border border-[#303642]">
          <span className="text-[10px] text-[#A1A1A1] block">STREAK</span>
          <span className="font-bold text-[#FFD76A] text-sm flex items-center justify-center gap-0.5">
            <Flame className="w-3 h-3 fill-current text-[#FF806B]" />
            {stats.streak}
          </span>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#090A0D] border border-[#303642] text-xs font-mono">
        <div className="flex items-center gap-2">
          {isPlayerTurn ? (
            <>
              <User className="w-3.5 h-3.5 text-[#B5FF55]" />
              <span className="text-[#B5FF55] font-bold">Your Turn (X)</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5 text-[#A879FF] animate-pulse" />
              <span className="text-[#A879FF] font-bold">
                {isBotThinking ? 'Bot thinking move...' : "Bot's Turn (O)"}
              </span>
            </>
          )}
        </div>
        <div className="text-[10px] text-[#A1A1A1]">
          Win: <span className="text-[#B5FF55] font-bold">+8 XP</span> • Draw:{' '}
          <span className="text-[#42DFFF] font-bold">+3 XP</span>
        </div>
      </div>

      {/* 3x3 Tic Tac Toe Grid */}
      <div className="grid grid-cols-3 gap-2 p-2 bg-[#090A0D] rounded-2xl border-2 border-[#303642] aspect-square touch-manipulation">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={Boolean(cell || winner || !isPlayerTurn || isBotThinking)}
              className={`min-h-[72px] rounded-xl flex items-center justify-center font-display font-black text-4xl sm:text-5xl transition-all duration-150 brutal-shadow active:scale-90 touch-target ${
                cell === 'X'
                  ? 'text-[#B5FF55] bg-[#171A21]'
                  : cell === 'O'
                  ? 'text-[#FF806B] bg-[#171A21]'
                  : 'bg-[#171A21]/50 hover:bg-[#171A21]'
              } ${
                isWinningCell
                  ? 'ring-4 ring-[#B5FF55] bg-[#B5FF55]/20 animate-pulse'
                  : 'border border-[#303642]'
              }`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {/* Game Over Banner */}
      {winner && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between font-mono animate-in zoom-in-95 duration-200 ${
            winner === 'X'
              ? 'bg-[#B5FF55] text-[#090A0D]'
              : winner === 'O'
              ? 'bg-[#FF806B] text-white'
              : 'bg-[#42DFFF] text-[#090A0D]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 stroke-[2.5]" />
            <div>
              <span className="font-display font-black text-sm uppercase block">
                {winner === 'X'
                  ? 'YOU DEFEATED THE BOT! (+8 XP)'
                  : winner === 'O'
                  ? 'BOT WON THIS ROUND!'
                  : 'TACTICAL DRAW (+3 XP)'}
              </span>
              <span className="text-[11px] font-bold opacity-90">
                Difficulty: {difficulty.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="px-3 py-1.5 rounded-lg bg-[#090A0D] text-[#F5F5F0] text-xs font-mono font-bold hover:bg-[#171A21] transition-colors"
          >
            Play Again →
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuestly } from '@/lib/store';
import {
  ArrowLeft,
  Zap,
  Flame,
  RotateCcw,
  Trophy,
  Timer,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

interface MindSnapProps {
  onBack: () => void;
}

const SYMBOLS = ['★', '▲', '■', '●', '◆', '✦'];
const COLORS = ['#B5FF55', '#42DFFF', '#A879FF', '#FF9C45'];

interface FlashCard {
  symbol: string;
  color: string;
  value: number;
}

export function MindSnapGame({ onBack }: MindSnapProps) {
  const { awardXp, recordArcadeScore, arcadeRecords } = useQuestly();

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [cardA, setCardA] = useState<FlashCard>({ symbol: '★', color: '#B5FF55', value: 5 });
  const [cardB, setCardB] = useState<FlashCard>({ symbol: '★', color: '#B5FF55', value: 5 });
  const [ruleType, setRuleType] = useState<'shape' | 'color' | 'value'>('shape');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  const cardStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bestScore =
    arcadeRecords.find((r) => r.gameType === 'mind_snap')?.highScore || 0;

  const nextRound = () => {
    const rules: ('shape' | 'color' | 'value')[] = ['shape', 'color', 'value'];
    const chosenRule = rules[Math.floor(Math.random() * rules.length)];
    setRuleType(chosenRule);

    const isMatch = Math.random() < 0.5;

    const symA = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const colA = COLORS[Math.floor(Math.random() * COLORS.length)];
    const valA = Math.floor(Math.random() * 9) + 1;

    let symB = symA;
    let colB = colA;
    let valB = valA;

    if (chosenRule === 'shape') {
      symB = isMatch
        ? symA
        : SYMBOLS.filter((s) => s !== symA)[Math.floor(Math.random() * (SYMBOLS.length - 1))];
      colB = COLORS[Math.floor(Math.random() * COLORS.length)];
      valB = Math.floor(Math.random() * 9) + 1;
    } else if (chosenRule === 'color') {
      colB = isMatch
        ? colA
        : COLORS.filter((c) => c !== colA)[Math.floor(Math.random() * (COLORS.length - 1))];
      symB = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      valB = Math.floor(Math.random() * 9) + 1;
    } else {
      valB = isMatch ? valA : ((valA + Math.floor(Math.random() * 5) + 1) % 9) + 1;
      symB = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      colB = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    setCardA({ symbol: symA, color: colA, value: valA });
    setCardB({ symbol: symB, color: colB, value: valB });
    cardStartTimeRef.current = Date.now();
  };

  const startGame = () => {
    sound.playButtonClick();
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setReactionTimes([]);
    setFeedback(null);
    setXpAwarded(false);
    nextRound();
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setGameState('gameover');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'gameover') {
      recordArcadeScore('mind_snap', score);
      if (score >= 300 && !xpAwarded) {
        setXpAwarded(true);
        awardXp('arcade_challenge', 'mind_snap_300', 'Mind Snap Reflex Champion', 10);
        sound.playLevelUp();
      }
    }
  }, [gameState, score, xpAwarded, recordArcadeScore, awardXp]);

  const handleUserAnswer = (userSaysMatch: boolean) => {
    if (feedback !== null || gameState !== 'playing') return;

    const reactionTime = Date.now() - cardStartTimeRef.current;
    setReactionTimes((prev) => [...prev, reactionTime]);

    let actualMatch = false;
    if (ruleType === 'shape') actualMatch = cardA.symbol === cardB.symbol;
    else if (ruleType === 'color') actualMatch = cardA.color === cardB.color;
    else actualMatch = cardA.value === cardB.value;

    const isCorrect = userSaysMatch === actualMatch;

    if (isCorrect) {
      sound.playButtonClick();
      setFeedback('correct');
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const bonus = reactionTime < 400 ? 50 : 30;
      setScore((s) => s + bonus + nextStreak * 5);

      setTimeout(() => {
        setFeedback(null);
        nextRound();
      }, 150);
    } else {
      sound.playButtonClick();
      setFeedback('wrong');
      setStreak(0);
      setScore((s) => Math.max(0, s - 20));

      setTimeout(() => {
        setFeedback(null);
        nextRound();
      }, 300);
    }
  };

  const avgReaction =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

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
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF806B]/15 border border-[#FF806B]/30 text-[#FF806B] text-xs font-mono font-bold">
            <Flame className="w-3.5 h-3.5 fill-[#FF806B]" />
            <span>{streak} STREAK</span>
          </div>
          <span className="text-[11px] font-mono text-[#B5FF55] font-bold">
            BEST: {bestScore}
          </span>
        </div>
      </div>

      {/* Intro State */}
      {gameState === 'intro' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#171A21] border border-[#303642] brutal-shadow text-center space-y-6 bg-graph-grid">
          <div className="w-16 h-16 rounded-2xl bg-[#FF9C45]/15 border border-[#FF9C45]/40 flex items-center justify-center text-[#FF9C45] mx-auto brutal-shadow">
            <Zap className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#111319] text-[#FF9C45] border border-[#FF9C45]/30">
              RAPID REACTION DUEL
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-display text-[#F5F5F0]">
              Mind Snap Duel
            </h2>
            <p className="text-xs text-[#A1A1A1] font-mono max-w-xs mx-auto leading-relaxed">
              Two cards flash on screen. Check the target rule (Shape, Color, or Value) and decide: Match or No Match?
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl bg-[#FF9C45] hover:bg-[#FFAE68] text-[#090A0D] font-display font-black text-sm uppercase tracking-wider brutal-shadow transition-all"
          >
            Start Reaction Duel
          </button>
        </div>
      )}

      {/* Playing State */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] flex items-center justify-between gap-4 brutal-shadow">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#F5F5F0]">
              <Timer className="w-4 h-4 text-[#42DFFF]" />
              <span>{timeLeft}s</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#111319] border border-[#303642] text-[10px] font-mono uppercase text-[#B5FF55] font-black tracking-wider">
              MATCH BY: {ruleType.toUpperCase()}
            </div>

            <div className="text-xs font-mono font-black text-[#B5FF55] font-display text-base">
              {score} PTS
            </div>
          </div>

          {/* Dual Flash Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div
              className="h-44 sm:h-52 rounded-3xl bg-[#111319] border-2 border-[#303642] flex flex-col items-center justify-center brutal-shadow transition-all"
              style={{ color: cardA.color }}
            >
              <span className="text-5xl sm:text-6xl font-black">{cardA.symbol}</span>
              <span className="font-display font-black text-2xl mt-1 text-[#F5F5F0]">
                {cardA.value}
              </span>
            </div>

            <div
              className="h-44 sm:h-52 rounded-3xl bg-[#111319] border-2 border-[#303642] flex flex-col items-center justify-center brutal-shadow transition-all"
              style={{ color: cardB.color }}
            >
              <span className="text-5xl sm:text-6xl font-black">{cardB.symbol}</span>
              <span className="font-display font-black text-2xl mt-1 text-[#F5F5F0]">
                {cardB.value}
              </span>
            </div>
          </div>

          {/* Touch Controls (Two Giant Thumb Buttons) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleUserAnswer(true)}
              className="h-20 rounded-2xl bg-[#B5FF55] active:scale-95 text-[#090A0D] font-display font-black text-xl uppercase tracking-wider brutal-shadow flex items-center justify-center gap-2 select-none"
            >
              <span>MATCH</span>
            </button>

            <button
              onClick={() => handleUserAnswer(false)}
              className="h-20 rounded-2xl bg-[#FF5EBB] active:scale-95 text-[#090A0D] font-display font-black text-xl uppercase tracking-wider brutal-shadow flex items-center justify-center gap-2 select-none"
            >
              <span>DIFFERENT</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#171A21] border border-[#303642] brutal-shadow text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FF9C45]/15 border border-[#FF9C45]/40 flex items-center justify-center text-[#FF9C45] mx-auto brutal-shadow">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black uppercase font-display text-[#F5F5F0]">
              Snap Duel Complete!
            </h3>
            <p className="text-xs text-[#A1A1A1] font-mono">
              Average Reaction: <strong>{avgReaction}ms</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111319] border border-[#303642] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#A1A1A1]">FINAL SCORE</span>
              <span className="text-2xl font-black text-[#FF9C45] font-display">{score} PTS</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#303642]">
              <span className="text-xs font-mono text-[#A1A1A1]">ACADEMIC XP</span>
              <span className="text-xs font-mono font-bold text-[#B5FF55]">
                {score >= 300 ? '+10 XP EARNED' : 'Goal: 300 PTS'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-xl bg-[#FF9C45] text-[#090A0D] font-display font-black text-xs uppercase tracking-wider brutal-shadow transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Snap Again</span>
            </button>

            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl bg-[#111319] text-[#A1A1A1] hover:text-[#F5F5F0] border border-[#303642] text-xs font-mono transition-colors"
            >
              Back to Arcade Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

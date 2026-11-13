'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuestly } from '@/lib/store';
import {
  ArrowLeft,
  Flame,
  Zap,
  RotateCcw,
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  Timer,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

interface MathSprintProps {
  onBack: () => void;
}

interface Question {
  prompt: string;
  targetGoal?: number;
  options: number[];
  correctIndex: number;
  operationType: 'add' | 'sub' | 'mul' | 'div' | 'alg';
}

function generateQuestion(difficultyLevel = 1): Question {
  const types: ('add' | 'sub' | 'mul' | 'div' | 'alg')[] = ['add', 'sub', 'mul', 'div', 'alg'];
  const opType = types[Math.floor(Math.random() * types.length)];

  let prompt = '';
  let answer = 0;

  if (opType === 'add') {
    const a = Math.floor(Math.random() * 40) + 10;
    const b = Math.floor(Math.random() * 40) + 10;
    prompt = `${a} + ${b}`;
    answer = a + b;
  } else if (opType === 'sub') {
    const a = Math.floor(Math.random() * 50) + 30;
    const b = Math.floor(Math.random() * 28) + 10;
    prompt = `${a} - ${b}`;
    answer = a - b;
  } else if (opType === 'mul') {
    const a = Math.floor(Math.random() * 11) + 3;
    const b = Math.floor(Math.random() * 11) + 3;
    prompt = `${a} × ${b}`;
    answer = a * b;
  } else if (opType === 'div') {
    const b = Math.floor(Math.random() * 9) + 2;
    const ans = Math.floor(Math.random() * 12) + 2;
    const a = b * ans;
    prompt = `${a} ÷ ${b}`;
    answer = ans;
  } else {
    // Basic algebra
    const x = Math.floor(Math.random() * 9) + 2;
    const m = Math.floor(Math.random() * 4) + 2;
    const c = Math.floor(Math.random() * 15) + 3;
    const rhs = m * x + c;
    prompt = `${m}x + ${c} = ${rhs}`;
    answer = x;
  }

  // Generate 3 unique distractors
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 6) + 1);
    const d = answer + offset;
    if (d !== answer && d >= 0) {
      distractors.add(d);
    }
  }

  const options = Array.from(distractors);
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, answer);

  return { prompt, options, correctIndex, operationType: opType, targetGoal: answer };
}

export function MathSprintGame({ onBack }: MathSprintProps) {
  const { awardXp, recordArcadeScore, arcadeRecords } = useQuestly();

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<Question>(generateQuestion);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bestScore =
    arcadeRecords.find((r) => r.gameType === 'math_sprint')?.highScore || 0;

  const startGame = () => {
    sound.playButtonClick();
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setTimeLeft(30);
    setTotalAnswered(0);
    setCorrectCount(0);
    setXpAwarded(false);
    setSelectedOption(null);
    setFeedback(null);
    setCurrentQuestion(generateQuestion());
    setGameState('playing');
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Handle gameover scoring
  useEffect(() => {
    if (gameState === 'gameover') {
      recordArcadeScore('math_sprint', score);
      if (score >= 250 && !xpAwarded) {
        setXpAwarded(true);
        awardXp('arcade_challenge', 'math_sprint_250', 'Math Speed Duel Target', 10);
        sound.playLevelUp();
      }
    }
  }, [gameState, score, xpAwarded, recordArcadeScore, awardXp]);

  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (feedback !== null || gameState !== 'playing') return;

      setSelectedOption(index);
      setTotalAnswered((t) => t + 1);

      if (index === currentQuestion.correctIndex) {
        sound.playButtonClick();
        setFeedback('correct');
        const nextStreak = streak + 1;
        setStreak(nextStreak);

        // Multiplier progression: 3 streak = 2x, 6 streak = 3x, 10 streak = 5x
        const nextMultiplier =
          nextStreak >= 10 ? 5 : nextStreak >= 6 ? 3 : nextStreak >= 3 ? 2 : 1;
        setMultiplier(nextMultiplier);

        const earnedPoints = 25 * nextMultiplier;
        setScore((s) => s + earnedPoints);
        setCorrectCount((c) => c + 1);

        setTimeout(() => {
          setSelectedOption(null);
          setFeedback(null);
          setCurrentQuestion(generateQuestion());
        }, 220);
      } else {
        sound.playButtonClick();
        setFeedback('wrong');
        setStreak(0);
        setMultiplier(1);
        setScore((s) => Math.max(0, s - 10));

        setTimeout(() => {
          setSelectedOption(null);
          setFeedback(null);
          setCurrentQuestion(generateQuestion());
        }, 350);
      }
    },
    [feedback, gameState, currentQuestion, streak]
  );

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
            <span>{streak} COMBO</span>
          </div>
          <span className="text-[11px] font-mono text-[#B5FF55] font-bold">
            BEST: {bestScore}
          </span>
        </div>
      </div>

      {/* Intro Screen */}
      {gameState === 'intro' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#171A21] border border-[#303642] brutal-shadow text-center space-y-6 relative overflow-hidden bg-graph-grid">
          <div className="w-16 h-16 rounded-2xl bg-[#B5FF55]/15 border border-[#B5FF55]/40 flex items-center justify-center text-[#B5FF55] mx-auto brutal-shadow">
            <Zap className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#111319] text-[#B5FF55] border border-[#B5FF55]/30">
              30-SECOND MENTAL BLITZ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-display text-[#F5F5F0]">
              Fast Math Duel
            </h2>
            <p className="text-xs text-[#A1A1A1] font-mono max-w-xs mx-auto leading-relaxed">
              Solve as many rapid arithmetic equations as possible before time expires. Chain correct answers to unlock 5x multipliers!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left">
            <div className="p-3 rounded-xl bg-[#111319] border border-[#303642]">
              <span className="text-[10px] font-mono text-[#A1A1A1] block">XP GOAL</span>
              <span className="text-xs font-black text-[#B5FF55] font-display">250+ PTS (+10 XP)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#111319] border border-[#303642]">
              <span className="text-[10px] font-mono text-[#A1A1A1] block">TIME LIMIT</span>
              <span className="text-xs font-black text-[#42DFFF] font-display">30 SECONDS</span>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] font-display font-black text-sm uppercase tracking-wider brutal-shadow transition-all"
          >
            Start Speed Duel
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] flex items-center justify-between gap-4 brutal-shadow">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#42DFFF]" />
              <span className="text-xs font-mono font-bold text-[#F5F5F0]">
                {timeLeft}s
              </span>
            </div>

            <div className="flex-1 max-w-[140px] h-2 rounded-full bg-[#111319] border border-[#303642] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  timeLeft > 10 ? 'bg-[#B5FF55]' : timeLeft > 5 ? 'bg-[#FF9C45]' : 'bg-[#FF5EBB]'
                }`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#A1A1A1]">SCORE:</span>
              <span className="text-base font-black text-[#B5FF55] font-display">
                {score}
              </span>
              {multiplier > 1 && (
                <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-[#FF806B] text-[#090A0D]">
                  {multiplier}X
                </span>
              )}
            </div>
          </div>

          {/* Prompt Card */}
          <div
            className={`p-8 sm:p-12 rounded-3xl border text-center transition-all brutal-shadow relative overflow-hidden ${
              feedback === 'correct'
                ? 'bg-[#B5FF55]/15 border-[#B5FF55] scale-[1.02]'
                : feedback === 'wrong'
                ? 'bg-[#FF806B]/15 border-[#FF806B] shake'
                : 'bg-[#171A21] border-[#303642]'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-[#A1A1A1] uppercase tracking-widest block mb-2">
              SOLVE EQUATION
            </span>
            <div className="text-4xl sm:text-6xl font-black font-display text-[#F5F5F0] tracking-tight">
              {currentQuestion.prompt}
            </div>

            {feedback === 'correct' && (
              <span className="text-xs font-mono font-bold text-[#B5FF55] mt-2 block animate-in fade-in">
                +{25 * multiplier} PTS!
              </span>
            )}
            {feedback === 'wrong' && (
              <span className="text-xs font-mono font-bold text-[#FF806B] mt-2 block animate-in fade-in">
                MISSED! -10 PTS
              </span>
            )}
          </div>

          {/* 4 Touch Option Buttons (Thumb Friendly) */}
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let btnStyle = 'bg-[#171A21] border-[#303642] text-[#F5F5F0] hover:border-[#B5FF55]/60';
              if (isSelected) {
                if (feedback === 'correct') {
                  btnStyle = 'bg-[#B5FF55] border-[#B5FF55] text-[#090A0D] font-black scale-[0.98]';
                } else if (feedback === 'wrong') {
                  btnStyle = 'bg-[#FF806B] border-[#FF806B] text-[#090A0D] font-black';
                }
              }

              return (
                <button
                  key={`${opt}-${idx}`}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={feedback !== null}
                  className={`h-16 sm:h-20 rounded-2xl border text-2xl sm:text-3xl font-display font-black transition-all brutal-shadow active:scale-95 flex items-center justify-center select-none ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#171A21] border border-[#303642] brutal-shadow text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#42DFFF]/15 border border-[#42DFFF]/40 flex items-center justify-center text-[#42DFFF] mx-auto brutal-shadow">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black uppercase font-display text-[#F5F5F0]">
              Sprint Completed!
            </h3>
            <p className="text-xs text-[#A1A1A1] font-mono">
              Accuracy: {totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0}% ({correctCount}/{totalAnswered})
            </p>
          </div>

          {/* Score Card */}
          <div className="p-5 rounded-2xl bg-[#111319] border border-[#303642] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#A1A1A1]">FINAL SCORE</span>
              <span className="text-2xl font-black text-[#B5FF55] font-display">{score} PTS</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#303642]">
              <span className="text-xs font-mono text-[#A1A1A1]">ACADEMIC XP</span>
              <span className="text-xs font-mono font-bold text-[#42DFFF]">
                {score >= 250 ? '+10 XP EARNED' : 'Goal: 250 PTS'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] font-display font-black text-xs uppercase tracking-wider brutal-shadow transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
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

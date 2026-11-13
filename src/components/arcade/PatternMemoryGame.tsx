'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import { ArrowLeft, Play, RotateCcw, Brain, Sparkles } from 'lucide-react';
import { sound } from '@/common/SoundService';

interface PatternMemoryProps {
  onBack: () => void;
}

const PADS = [
  { id: 0, label: 'ALPHA', color: '#B5FF55', activeColor: '#D4FF88' },
  { id: 1, label: 'BETA', color: '#42DFFF', activeColor: '#80E8FF' },
  { id: 2, label: 'GAMMA', color: '#A879FF', activeColor: '#C4A3FF' },
  { id: 3, label: 'DELTA', color: '#FF9C45', activeColor: '#FFBA78' },
];

export function PatternMemoryGame({ onBack }: PatternMemoryProps) {
  const { awardXp, recordArcadeScore } = useQuestly();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const startNewGame = () => {
    sound.playButtonClick();
    setSequence([Math.floor(Math.random() * 4)]);
    setUserStep(0);
    setRound(1);
    setGameOver(false);
    setGameStarted(true);
    setXpAwarded(false);
  };

  // Play sequence when round changes
  useEffect(() => {
    if (!gameStarted || gameOver || sequence.length === 0) return;

    setIsPlayingSequence(true);
    let step = 0;

    const interval = setInterval(() => {
      if (step < sequence.length) {
        const padId = sequence[step];
        setActivePad(padId);
        sound.playButtonClick();

        setTimeout(() => {
          setActivePad(null);
        }, 400);

        step++;
      } else {
        clearInterval(interval);
        setIsPlayingSequence(false);
        setUserStep(0);
      }
    }, 650);

    return () => clearInterval(interval);
  }, [sequence, gameStarted, gameOver]);

  const handlePadClick = (padId: number) => {
    if (isPlayingSequence || gameOver || !gameStarted) return;

    sound.playButtonClick();
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 200);

    if (padId === sequence[userStep]) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      // Completed this round's sequence!
      if (nextStep === sequence.length) {
        const nextRound = round + 1;
        setRound(nextRound);

        if (nextRound >= 6 && !xpAwarded) {
          setXpAwarded(true);
          awardXp('arcade_challenge', 'pattern_memory_round_6', 10, 'Memory Challenge Master');
          sound.playLevelUp();
        }

        // Add next step to sequence
        setTimeout(() => {
          setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
        }, 500);
      }
    } else {
      // Mistake!
      setGameOver(true);
      recordArcadeScore('pattern_memory', round);
    }
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
            Round: <strong className="text-[#F5F5F0]">{round}</strong>
          </span>
          <span className="text-[#42DFFF]">
            Goal: <strong>Round 6 (+10 XP)</strong>
          </span>
        </div>
      </div>

      {/* Memory Pad Board */}
      <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] brutal-shadow flex flex-col items-center">
        {!gameStarted && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#42DFFF]/10 border border-[#42DFFF]/40 flex items-center justify-center text-[#42DFFF] mx-auto">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#F5F5F0] font-display uppercase">
              Mind Snap Memory Duel
            </h3>
            <p className="text-xs font-mono text-[#A1A1A1] max-w-xs">
              Watch the sequence of glowing neon pads, then repeat it without making a single mistake.
            </p>
            <button
              onClick={startNewGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#42DFFF] text-[#090A0D] text-sm font-black font-display uppercase tracking-wider brutal-shadow hover:bg-[#35C5E3] mx-auto"
            >
              <Play className="w-4 h-4 fill-[#090A0D]" />
              <span>Start Challenge</span>
            </button>
          </div>
        )}

        {gameStarted && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <span className="text-xs font-mono text-[#A1A1A1]">
                {isPlayingSequence ? 'Observing Sequence...' : 'Your Turn! Repeat Pattern'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {PADS.map((pad) => {
                const isActive = activePad === pad.id;

                return (
                  <button
                    key={pad.id}
                    onClick={() => handlePadClick(pad.id)}
                    disabled={isPlayingSequence || gameOver}
                    className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center transition-all brutal-shadow ${
                      isActive
                        ? 'scale-105 shadow-[0_0_30px_var(--glow)] border-white'
                        : 'hover:scale-[1.02] border-transparent'
                    }`}
                    style={
                      {
                        backgroundColor: isActive ? pad.activeColor : pad.color + '25',
                        borderColor: isActive ? '#FFF' : pad.color + '60',
                        color: isActive ? '#090A0D' : pad.color,
                        '--glow': pad.color,
                      } as React.CSSProperties
                    }
                  >
                    <span className="font-display font-black text-lg tracking-wider">
                      {pad.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {gameOver && (
              <div className="p-4 rounded-xl bg-[#FF806B]/10 border border-[#FF806B] text-center space-y-2">
                <h4 className="text-sm font-black text-[#FF806B] font-display uppercase">
                  Sequence Broken! Reached Round {round}
                </h4>
                <button
                  onClick={startNewGame}
                  className="px-4 py-2 rounded-xl bg-[#42DFFF] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

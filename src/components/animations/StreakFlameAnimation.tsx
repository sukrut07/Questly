'use client';

import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import { Flame, X, Sparkles, Trophy } from 'lucide-react';
import { sound } from '@/common/SoundService';

interface StreakFlameAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  xpEarned?: number;
  taskTitle?: string;
}

export function StreakFlameAnimation({
  isOpen,
  onClose,
  streakCount,
  xpEarned = 50,
  taskTitle,
}: StreakFlameAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    sound.playLevelUp();

    let isMounted = true;

    fetch('/assets/flame.json')
      .then((res) => res.json())
      .then((animationData) => {
        if (!isMounted || !containerRef.current) return;

        // Clean up any existing instance
        if (animRef.current) {
          animRef.current.destroy();
        }

        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData,
        });
      })
      .catch((err) => {
        console.error('Failed to load flame animation:', err);
      });

    // Auto-dismiss after 4.5 seconds if user doesn't interact
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#171A21] via-[#12141A] to-[#0A0C10] border border-amber-500/30 p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle radial ambient warm glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close streak modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lottie Flame Container */}
        <div className="relative w-44 h-44 my-1 flex items-center justify-center">
          <div ref={containerRef} className="w-full h-full" />
        </div>

        {/* Streak Details */}
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>STREAK MAINTAINED</span>
          </div>

          <h3 className="text-3xl font-black text-white tracking-tight">
            {streakCount} {streakCount === 1 ? 'Day' : 'Days'} Strong
          </h3>

          {taskTitle && (
            <p className="text-xs text-zinc-400 line-clamp-1 max-w-[260px] mx-auto">
              Completed: <span className="text-zinc-200 font-medium">{taskTitle}</span>
            </p>
          )}
        </div>

        {/* Reward Pill */}
        <div className="mt-5 w-full grid grid-cols-2 gap-2 text-left">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">XP Earned</span>
            <div className="text-base font-bold text-[#B5FF55] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{xpEarned} XP</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">Bonus Multiplier</span>
            <div className="text-base font-bold text-amber-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>1.2x Active</span>
            </div>
          </div>
        </div>

        {/* Continue Action */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          Keep the Momentum
        </button>
      </div>
    </div>
  );
}

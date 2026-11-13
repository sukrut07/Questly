'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useQuestly } from '@/lib/store';
import { ArrowLeft, Play, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '@/common/SoundService';

interface SpaceDefenderProps {
  onBack: () => void;
}

export function SpaceDefenderGame({ onBack }: SpaceDefenderProps) {
  const { awardXp, recordArcadeScore } = useQuestly();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Game state stored in refs to avoid closure stalls in requestAnimationFrame
  const gameState = useRef({
    playerX: 200,
    playerWidth: 32,
    playerHeight: 20,
    lasers: [] as { x: number; y: number; vy: number }[],
    aliens: [] as { x: number; y: number; width: number; height: number; alive: boolean }[],
    alienDir: 1,
    alienSpeed: 1,
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    keys: { left: false, right: false, fire: false },
    lastFireTime: 0,
    score: 0,
    lives: 3,
  });

  const initAliens = () => {
    const aliens = [];
    const rows = 3;
    const cols = 8;
    const startX = 40;
    const startY = 40;
    const spacingX = 40;
    const spacingY = 30;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliens.push({
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          width: 24,
          height: 18,
          alive: true,
        });
      }
    }
    return aliens;
  };

  const startGame = () => {
    sound.playButtonClick();
    gameState.current = {
      playerX: 200,
      playerWidth: 32,
      playerHeight: 20,
      lasers: [],
      aliens: initAliens(),
      alienDir: 1,
      alienSpeed: 1,
      particles: [],
      keys: { left: false, right: false, fire: false },
      lastFireTime: 0,
      score: 0,
      lives: 3,
    };
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(true);
    setXpAwarded(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameState.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameState.current.keys.right = true;
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        gameState.current.keys.fire = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameState.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameState.current.keys.right = false;
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        gameState.current.keys.fire = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const state = gameState.current;
      const width = canvas.width;
      const height = canvas.height;

      // Update player
      if (state.keys.left) {
        state.playerX = Math.max(state.playerWidth / 2, state.playerX - 5);
      }
      if (state.keys.right) {
        state.playerX = Math.min(width - state.playerWidth / 2, state.playerX + 5);
      }

      // Fire laser
      const now = Date.now();
      if (state.keys.fire && now - state.lastFireTime > 250) {
        state.lasers.push({
          x: state.playerX,
          y: height - 35,
          vy: -8,
        });
        state.lastFireTime = now;
        sound.playButtonClick();
      }

      // Update lasers
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        state.lasers[i].y += state.lasers[i].vy;
        if (state.lasers[i].y < 0) {
          state.lasers.splice(i, 1);
        }
      }

      // Update aliens
      let touchEdge = false;
      for (const alien of state.aliens) {
        if (!alien.alive) continue;
        alien.x += state.alienDir * state.alienSpeed;
        if (alien.x + alien.width > width - 10 || alien.x < 10) {
          touchEdge = true;
        }
        if (alien.y + alien.height >= height - 40) {
          // Reached ground!
          setGameOver(true);
          setIsPlaying(false);
          recordArcadeScore('space_defender', state.score);
          return;
        }
      }

      if (touchEdge) {
        state.alienDir *= -1;
        for (const alien of state.aliens) {
          alien.y += 15;
        }
      }

      // Collisions: laser vs alien
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        const laser = state.lasers[i];
        for (const alien of state.aliens) {
          if (!alien.alive) continue;
          if (
            laser.x >= alien.x &&
            laser.x <= alien.x + alien.width &&
            laser.y >= alien.y &&
            laser.y <= alien.y + alien.height
          ) {
            alien.alive = false;
            state.lasers.splice(i, 1);
            state.score += 25;
            setScore(state.score);

            // Spawn neon particles
            for (let p = 0; p < 8; p++) {
              state.particles.push({
                x: alien.x + alien.width / 2,
                y: alien.y + alien.height / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: '#B5FF55',
                life: 15,
              });
            }

            // XP Milestone award
            if (state.score >= 300 && !xpAwarded) {
              setXpAwarded(true);
              awardXp('arcade_challenge', 'space_defender_300', 10, 'Space Defender Milestone');
              sound.playLevelUp();
            }
            break;
          }
        }
      }

      // Check wave clear
      if (state.aliens.every((a) => !a.alive)) {
        state.aliens = initAliens();
        state.alienSpeed += 0.5;
      }

      // Update particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        if (p.life <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // Render
      ctx.fillStyle = '#090A0D';
      ctx.fillRect(0, 0, width, height);

      // Starfield / Grid lines
      ctx.strokeStyle = '#171A21';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw player ship
      ctx.fillStyle = '#42DFFF';
      ctx.shadowColor = '#42DFFF';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(state.playerX, height - 35);
      ctx.lineTo(state.playerX - state.playerWidth / 2, height - 15);
      ctx.lineTo(state.playerX + state.playerWidth / 2, height - 15);
      ctx.closePath();
      ctx.fill();

      // Draw lasers
      ctx.fillStyle = '#B5FF55';
      ctx.shadowColor = '#B5FF55';
      ctx.shadowBlur = 8;
      for (const laser of state.lasers) {
        ctx.fillRect(laser.x - 2, laser.y, 4, 12);
      }

      // Draw aliens
      ctx.fillStyle = '#A879FF';
      ctx.shadowColor = '#A879FF';
      ctx.shadowBlur = 6;
      for (const alien of state.aliens) {
        if (!alien.alive) continue;
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
      }

      // Draw particles
      ctx.shadowBlur = 4;
      for (const p of state.particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, xpAwarded]);

  return (
    <div className="space-y-4 max-w-xl mx-auto">
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
            Score: <strong className="text-[#B5FF55]">{score}</strong>
          </span>
          <span className="text-[#42DFFF]">
            Goal: <strong>300 pts (+10 XP)</strong>
          </span>
        </div>
      </div>

      {/* Canvas Screen */}
      <div className="p-4 rounded-2xl bg-[#171A21] border border-[#303642] brutal-shadow flex flex-col items-center relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full max-w-[400px] h-auto bg-[#090A0D] rounded-xl border border-[#303642]"
        />

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-[#090A0D]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-black text-[#F5F5F0] font-display uppercase mb-2">
              Neon Space Defender
            </h3>
            <p className="text-xs font-mono text-[#A1A1A1] max-w-xs mb-6">
              Use [A/D] or [Arrow Keys] to steer, [Spacebar] to shoot. Destroy the invaders before they land!
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B5FF55] text-[#090A0D] text-sm font-black font-display uppercase tracking-wider brutal-shadow hover:bg-[#A3F040]"
            >
              <Play className="w-4 h-4 fill-[#090A0D]" />
              <span>Launch Defender</span>
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-[#090A0D]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
            <h3 className="text-2xl font-black text-[#FF806B] font-display uppercase">
              Mission Ended
            </h3>
            <p className="text-xs font-mono text-[#A1A1A1]">
              Final Score: <strong className="text-[#F5F5F0]">{score}</strong>
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#42DFFF] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider brutal-shadow"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        )}

        {/* Mobile Touch Controls */}
        <div className="flex items-center justify-between w-full max-w-[400px] mt-4 gap-2 sm:hidden">
          <button
            onTouchStart={() => (gameState.current.keys.left = true)}
            onTouchEnd={() => (gameState.current.keys.left = false)}
            className="flex-1 py-3 bg-[#111319] border border-[#303642] text-xs font-mono text-[#F5F5F0] rounded-xl active:bg-[#B5FF55] active:text-[#090A0D]"
          >
            ← Left
          </button>
          <button
            onTouchStart={() => {
              gameState.current.keys.fire = true;
              setTimeout(() => (gameState.current.keys.fire = false), 150);
            }}
            className="flex-1 py-3 bg-[#B5FF55] text-[#090A0D] font-black text-xs font-display uppercase rounded-xl"
          >
            Fire!
          </button>
          <button
            onTouchStart={() => (gameState.current.keys.right = true)}
            onTouchEnd={() => (gameState.current.keys.right = false)}
            className="flex-1 py-3 bg-[#111319] border border-[#303642] text-xs font-mono text-[#F5F5F0] rounded-xl active:bg-[#B5FF55] active:text-[#090A0D]"
          >
            Right →
          </button>
        </div>
      </div>
    </div>
  );
}

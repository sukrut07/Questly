'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useQuestly } from '@/lib/store';
import { sound } from '@/common/SoundService';
import { ArrowLeft, Heart, Sparkles, Gem, RefreshCw } from 'lucide-react';

const TILE_SIZE = 25;
const COLS = 19;
const ROWS = 19;

// 1 = Wall, 0 = Path with Crystal, 2 = Empty path, 3 = Power crystal
const DEFAULT_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1],
  [1,3,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,3,1],
  [1,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

interface ShadowEnemy {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  color: string;
}

export function CrystalMaze({ onExit }: { onExit: () => void }) {
  const { recordGameScore, gameRecords } = useQuestly();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [floor, setFloor] = useState(1);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');

  const personalBest = Math.max(
    0,
    ...gameRecords.filter((g) => g.gameType === 'CRYSTAL_MAZE').map((g) => g.score)
  );

  const stateRef = useRef({
    grid: JSON.parse(JSON.stringify(DEFAULT_MAP)) as number[][],
    player: { x: 9, y: 14, targetX: 9, targetY: 14, px: 9 * TILE_SIZE, py: 14 * TILE_SIZE },
    nextDir: { x: 0, y: 0 },
    currentDir: { x: 0, y: 0 },
    enemies: [
      { x: 9, y: 8, dirX: 1, dirY: 0, color: '#FF7D91' },
      { x: 8, y: 8, dirX: -1, dirY: 0, color: '#68BCFF' },
      { x: 10, y: 8, dirX: 0, dirY: -1, color: '#F5C96A' },
    ] as ShadowEnemy[],
    powerModeTimer: 0,
    crystalsLeft: 0,
    score: 0,
    lives: 3,
    floor: 1,
    startTime: Date.now(),
  });

  // Count crystals in map
  const resetMap = useCallback((floorNum: number) => {
    const grid = JSON.parse(JSON.stringify(DEFAULT_MAP));
    let count = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === 0 || grid[r][c] === 3) count++;
      }
    }
    stateRef.current.grid = grid;
    stateRef.current.crystalsLeft = count;
    stateRef.current.player = {
      x: 9,
      y: 14,
      targetX: 9,
      targetY: 14,
      px: 9 * TILE_SIZE,
      py: 14 * TILE_SIZE,
    };
    stateRef.current.enemies = [
      { x: 9, y: 8, dirX: 1, dirY: 0, color: '#FF7D91' },
      { x: 8, y: 8, dirX: -1, dirY: 0, color: '#68BCFF' },
      { x: 10, y: 8, dirX: 0, dirY: -1, color: '#F5C96A' },
    ];
    setFloor(floorNum);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) stateRef.current.nextDir = { x: -1, y: 0 };
      if (['ArrowRight', 'KeyD'].includes(e.code)) stateRef.current.nextDir = { x: 1, y: 0 };
      if (['ArrowUp', 'KeyW'].includes(e.code)) stateRef.current.nextDir = { x: 0, y: -1 };
      if (['ArrowDown', 'KeyS'].includes(e.code)) stateRef.current.nextDir = { x: 0, y: 1 };
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;
    let tickCount = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const state = stateRef.current;
      tickCount++;

      // Move player every 9 frames (smooth grid traversal)
      if (tickCount % 9 === 0) {
        // Try next desired direction first
        const nextX = state.player.x + state.nextDir.x;
        const nextY = state.player.y + state.nextDir.y;

        if (
          nextX >= 0 &&
          nextX < COLS &&
          nextY >= 0 &&
          nextY < ROWS &&
          state.grid[nextY][nextX] !== 1
        ) {
          state.currentDir = { ...state.nextDir };
          state.player.x = nextX;
          state.player.y = nextY;
        } else {
          // Keep current direction if valid
          const curX = state.player.x + state.currentDir.x;
          const curY = state.player.y + state.currentDir.y;
          if (
            curX >= 0 &&
            curX < COLS &&
            curY >= 0 &&
            curY < ROWS &&
            state.grid[curY][curX] !== 1
          ) {
            state.player.x = curX;
            state.player.y = curY;
          }
        }

        // Check tile pickups
        const tile = state.grid[state.player.y][state.player.x];
        if (tile === 0) {
          // Regular Crystal
          sound.playCrystalCollect();
          state.grid[state.player.y][state.player.x] = 2;
          state.score += 20;
          state.crystalsLeft--;
          setScore(state.score);
        } else if (tile === 3) {
          // Arcane Mega Crystal
          sound.playQuestComplete();
          state.grid[state.player.y][state.player.x] = 2;
          state.score += 100;
          state.powerModeTimer = 70;
          state.crystalsLeft--;
          setScore(state.score);
        }

        // Floor cleared!
        if (state.crystalsLeft <= 0) {
          sound.playLevelUp();
          state.floor++;
          resetMap(state.floor);
        }

        // Move Enemies
        state.enemies.forEach((en) => {
          const possibleDirs = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
          ].filter((d) => {
            const ex = en.x + d.x;
            const ey = en.y + d.y;
            return ex >= 0 && ex < COLS && ey >= 0 && ey < ROWS && state.grid[ey][ex] !== 1;
          });

          if (possibleDirs.length > 0) {
            // Bias toward player or pick random
            const chosen = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
            en.x += chosen.x;
            en.y += chosen.y;
          }

          // Check collision with player
          if (en.x === state.player.x && en.y === state.player.y) {
            if (state.powerModeTimer > 0) {
              // Banish enemy back to center
              sound.playArcadeExplosion();
              en.x = 9;
              en.y = 8;
              state.score += 200;
              setScore(state.score);
            } else {
              sound.playArcadeExplosion();
              state.lives--;
              setLives(state.lives);
              state.player.x = 9;
              state.player.y = 14;
              if (state.lives <= 0) {
                handleGameOver();
                return;
              }
            }
          }
        });

        if (state.powerModeTimer > 0) state.powerModeTimer--;
      }

      // RENDER
      ctx.fillStyle = '#0B0D14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const t = state.grid[r][c];
          const x = c * TILE_SIZE;
          const y = r * TILE_SIZE;

          if (t === 1) {
            // Arcane Wall
            ctx.fillStyle = '#181D2B';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#2A344A';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
          } else if (t === 0) {
            // Crystal Dot
            ctx.fillStyle = '#68BCFF';
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (t === 3) {
            // Arcane Mega Gem
            ctx.fillStyle = '#F5C96A';
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Enemies (Shadow Entities)
      state.enemies.forEach((en) => {
        const ex = en.x * TILE_SIZE + TILE_SIZE / 2;
        const ey = en.y * TILE_SIZE + TILE_SIZE / 2;
        ctx.fillStyle = state.powerModeTimer > 0 ? '#68BCFF' : en.color;
        ctx.beginPath();
        ctx.arc(ex, ey, 9, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(ex - 4, ey - 3, 3, 3);
        ctx.fillRect(ex + 1, ey - 3, 3, 3);
      });

      // Draw Player Character
      const px = state.player.x * TILE_SIZE + TILE_SIZE / 2;
      const py = state.player.y * TILE_SIZE + TILE_SIZE / 2;
      ctx.fillStyle = '#8B7CFF';
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, resetMap]);

  const handleStart = () => {
    sound.playButtonClick();
    resetMap(1);
    stateRef.current.score = 0;
    stateRef.current.lives = 3;
    stateRef.current.startTime = Date.now();
    setScore(0);
    setLives(3);
    setGameState('playing');
  };

  const handleGameOver = () => {
    const finalScore = stateRef.current.score;
    const finalFloor = stateRef.current.floor;
    const duration = Math.floor((Date.now() - stateRef.current.startTime) / 1000);
    setGameState('gameover');
    recordGameScore('CRYSTAL_MAZE', finalScore, finalFloor, duration);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-main border border-theme">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated text-theme-muted hover:text-theme-main text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Arcade</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-black">
          <div className="text-theme-muted">
            Floor: <span className="text-primary-violet">{floor}</span>
          </div>
          <div className="text-theme-muted">
            Score: <span className="text-amber-400 font-mono">{score.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-4 h-4 ${
                  heart <= lives ? 'text-coral fill-coral' : 'text-surface-elevated'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative rounded-3xl overflow-hidden border border-theme shadow-2xl bg-[#0B0D14] flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={COLS * TILE_SIZE}
          height={ROWS * TILE_SIZE}
          className="w-full max-w-[475px] aspect-square object-contain"
        />

        {/* Start Overlay */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
              <Gem className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">CRYSTAL MAZE</h3>
              <p className="text-xs text-theme-muted mt-1 max-w-xs">
                Navigate arcane corridors, gather glowing crystals, and evade wandering shadow phantoms. Use Arrow keys or WASD.
              </p>
            </div>

            <div className="text-[11px] text-amber-400 font-bold bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/30">
              Personal Best: {personalBest.toLocaleString()} Pts
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Enter Labyrinth
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4">
            <h3 className="text-2xl font-black text-coral tracking-tight">EXPEDITION LOST</h3>
            <div className="p-4 rounded-2xl bg-surface-elevated border border-theme w-64 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-theme-muted">Final Score:</span>
                <span className="font-black text-amber-400">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-theme-muted">Floor Reached:</span>
                <span className="font-black text-primary-violet">{floor}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onExit}
                className="px-4 py-2.5 rounded-xl bg-surface-elevated border border-theme text-xs font-bold text-theme-main hover:bg-surface-elevated/80"
              >
                Lobby
              </button>
              <button
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-primary-violet text-white text-xs font-black shadow-lg hover:bg-purple-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-screen Directional Pad for Mobile */}
      <div className="lg:hidden p-4 rounded-2xl bg-surface-main border border-theme flex justify-center">
        <div className="grid grid-cols-3 gap-2 w-48">
          <div />
          <button
            onClick={() => (stateRef.current.nextDir = { x: 0, y: -1 })}
            className="p-3.5 rounded-xl bg-surface-elevated border border-theme text-center font-bold active:bg-primary-violet"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => (stateRef.current.nextDir = { x: -1, y: 0 })}
            className="p-3.5 rounded-xl bg-surface-elevated border border-theme text-center font-bold active:bg-primary-violet"
          >
            ◀
          </button>
          <button
            onClick={() => (stateRef.current.nextDir = { x: 0, y: 1 })}
            className="p-3.5 rounded-xl bg-surface-elevated border border-theme text-center font-bold active:bg-primary-violet"
          >
            ▼
          </button>
          <button
            onClick={() => (stateRef.current.nextDir = { x: 1, y: 0 })}
            className="p-3.5 rounded-xl bg-surface-elevated border border-theme text-center font-bold active:bg-primary-violet"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}

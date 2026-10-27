'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useQuestly } from '@/lib/store';
import { sound } from '@/common/SoundService';
import { Play, Pause, RotateCcw, ArrowLeft, Heart, Sparkles, Volume2, Shield } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface Bullet {
  x: number;
  y: number;
  vy: number;
  isEnemy?: boolean;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  hp: number;
  color: string;
  shootCooldown: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'shield' | 'triple' | 'speed';
  vy: number;
}

export function QuestDefender({ onExit }: { onExit: () => void }) {
  const { recordGameScore, gameRecords } = useQuestly();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'gameover'>('ready');

  const personalBest = Math.max(
    0,
    ...gameRecords.filter((g) => g.gameType === 'QUEST_DEFENDER').map((g) => g.score)
  );

  // Mutable Game state kept in ref for 60fps animation loop
  const stateRef = useRef({
    player: { x: 250, y: 440, width: 34, height: 34, speed: 6, shield: false },
    keys: { left: false, right: false, up: false, down: false, shoot: false },
    bullets: [] as Bullet[],
    enemyBullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    powerups: [] as PowerUp[],
    stars: [] as { x: number; y: number; speed: number; size: number }[],
    score: 0,
    lives: 3,
    wave: 1,
    shootTimer: 0,
    tripleShotTimer: 0,
    startTime: Date.now(),
  });

  // Spawn initial enemies for wave
  const spawnWave = useCallback((waveNum: number) => {
    const enemies: Enemy[] = [];
    const rows = Math.min(5, 2 + Math.floor(waveNum / 2));
    const cols = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        enemies.push({
          x: 45 + c * 70,
          y: 40 + r * 45,
          width: 32,
          height: 26,
          vx: 1 + waveNum * 0.25,
          hp: r === 0 ? 2 : 1,
          color: r === 0 ? '#FF7D91' : r === 1 ? '#8B7CFF' : '#68BCFF',
          shootCooldown: Math.random() * 200 + 100,
        });
      }
    }
    stateRef.current.enemies = enemies;
    setWave(waveNum);
  }, []);

  // Initialize stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * 500,
        y: Math.random() * 500,
        speed: 0.5 + Math.random() * 2,
        size: 0.8 + Math.random() * 1.5,
      });
    }
    stateRef.current.stars = stars;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) stateRef.current.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) stateRef.current.keys.right = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) stateRef.current.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) stateRef.current.keys.down = true;
      if (['Space', 'KeyJ'].includes(e.code)) {
        e.preventDefault();
        stateRef.current.keys.shoot = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) stateRef.current.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) stateRef.current.keys.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) stateRef.current.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) stateRef.current.keys.down = false;
      if (['Space', 'KeyJ'].includes(e.code)) stateRef.current.keys.shoot = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const state = stateRef.current;

      // 1. Clear background
      ctx.fillStyle = '#080911';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Update & Draw Stars (Parallax)
      ctx.fillStyle = '#FFFFFF';
      state.stars.forEach((s) => {
        s.y += s.speed;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });

      // 3. Update Player Position
      if (state.keys.left && state.player.x > 10) state.player.x -= state.player.speed;
      if (state.keys.right && state.player.x < canvas.width - state.player.width - 10)
        state.player.x += state.player.speed;
      if (state.keys.up && state.player.y > 150) state.player.y -= state.player.speed;
      if (state.keys.down && state.player.y < canvas.height - state.player.height - 10)
        state.player.y += state.player.speed;

      // Player shooting
      state.shootTimer++;
      if (state.keys.shoot && state.shootTimer > 10) {
        sound.playArcadeLaser();
        state.shootTimer = 0;

        if (state.tripleShotTimer > 0) {
          state.bullets.push({ x: state.player.x + 16, y: state.player.y, vy: -9 });
          state.bullets.push({ x: state.player.x + 4, y: state.player.y + 4, vy: -8 });
          state.bullets.push({ x: state.player.x + 28, y: state.player.y + 4, vy: -8 });
          state.tripleShotTimer--;
        } else {
          state.bullets.push({ x: state.player.x + 16, y: state.player.y, vy: -9 });
        }
      }

      // Draw Player Ship
      ctx.save();
      ctx.translate(state.player.x, state.player.y);

      // Shield aura
      if (state.player.shield) {
        ctx.strokeStyle = '#68BCFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(17, 17, 26, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ship body
      ctx.fillStyle = '#8B7CFF';
      ctx.beginPath();
      ctx.moveTo(17, 0);
      ctx.lineTo(34, 30);
      ctx.lineTo(24, 25);
      ctx.lineTo(17, 34);
      ctx.lineTo(10, 25);
      ctx.lineTo(0, 30);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#68BCFF';
      ctx.beginPath();
      ctx.arc(17, 14, 4, 0, Math.PI * 2);
      ctx.fill();

      // Thruster flame
      ctx.fillStyle = Math.random() > 0.5 ? '#F5C96A' : '#FF7D91';
      ctx.beginPath();
      ctx.moveTo(13, 32);
      ctx.lineTo(17, 40 + Math.random() * 6);
      ctx.lineTo(21, 32);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 4. Update & Draw Bullets
      ctx.fillStyle = '#F5C96A';
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.y += b.vy;
        ctx.fillRect(b.x - 2, b.y, 4, 10);
        if (b.y < -10) state.bullets.splice(i, 1);
      }

      // 5. Update & Draw Enemy Bullets
      ctx.fillStyle = '#FF7D91';
      for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
        const eb = state.enemyBullets[i];
        eb.y += 4;
        ctx.fillRect(eb.x - 2, eb.y, 4, 8);

        // Check collision with player
        if (
          eb.x > state.player.x &&
          eb.x < state.player.x + state.player.width &&
          eb.y > state.player.y &&
          eb.y < state.player.y + state.player.height
        ) {
          state.enemyBullets.splice(i, 1);
          if (state.player.shield) {
            state.player.shield = false;
          } else {
            sound.playArcadeExplosion();
            state.lives--;
            setLives(state.lives);
            if (state.lives <= 0) {
              handleGameOver();
              return;
            }
          }
        } else if (eb.y > canvas.height + 10) {
          state.enemyBullets.splice(i, 1);
        }
      }

      // 6. Update & Draw Enemies
      let changeDir = false;
      state.enemies.forEach((en) => {
        en.x += en.vx;
        if (en.x < 15 || en.x > canvas.width - en.width - 15) {
          changeDir = true;
        }

        // Enemy shooting
        en.shootCooldown--;
        if (en.shootCooldown <= 0) {
          state.enemyBullets.push({ x: en.x + en.width / 2, y: en.y + en.height, vy: 4 });
          en.shootCooldown = Math.random() * 300 + 150;
        }

        // Draw Enemy
        ctx.fillStyle = en.color;
        ctx.beginPath();
        ctx.moveTo(en.x + en.width / 2, en.y + en.height);
        ctx.lineTo(en.x, en.y);
        ctx.lineTo(en.x + en.width, en.y);
        ctx.closePath();
        ctx.fill();

        // Enemy eye
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(en.x + 10, en.y + 6, 4, 4);
        ctx.fillRect(en.x + 18, en.y + 6, 4, 4);
      });

      if (changeDir) {
        state.enemies.forEach((en) => {
          en.vx = -en.vx;
          en.y += 12;
        });
      }

      // Check Bullet-Enemy Collisions
      for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
        const b = state.bullets[bi];
        for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
          const en = state.enemies[ei];
          if (
            b.x > en.x &&
            b.x < en.x + en.width &&
            b.y > en.y &&
            b.y < en.y + en.height
          ) {
            // Hit!
            state.bullets.splice(bi, 1);
            en.hp--;
            if (en.hp <= 0) {
              sound.playArcadeExplosion();

              // Spawn particles
              for (let p = 0; p < 12; p++) {
                state.particles.push({
                  x: en.x + en.width / 2,
                  y: en.y + en.height / 2,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  radius: Math.random() * 3 + 1,
                  color: en.color,
                  alpha: 1,
                });
              }

              // Powerup drop chance
              if (Math.random() < 0.15) {
                const types: ('shield' | 'triple' | 'speed')[] = ['shield', 'triple', 'speed'];
                state.powerups.push({
                  x: en.x,
                  y: en.y,
                  type: types[Math.floor(Math.random() * types.length)],
                  vy: 2,
                });
              }

              state.enemies.splice(ei, 1);
              state.score += 100;
              setScore(state.score);
            }
            break;
          }
        }
      }

      // Check Next Wave
      if (state.enemies.length === 0) {
        state.wave++;
        spawnWave(state.wave);
      }

      // 7. Update & Draw Powerups
      for (let i = state.powerups.length - 1; i >= 0; i--) {
        const pw = state.powerups[i];
        pw.y += pw.vy;

        ctx.fillStyle = pw.type === 'shield' ? '#68BCFF' : pw.type === 'triple' ? '#F5C96A' : '#70DDAA';
        ctx.beginPath();
        ctx.arc(pw.x + 8, pw.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Check pickup
        if (
          pw.x > state.player.x - 10 &&
          pw.x < state.player.x + state.player.width + 10 &&
          pw.y > state.player.y - 10 &&
          pw.y < state.player.y + state.player.height + 10
        ) {
          sound.playCrystalCollect();
          if (pw.type === 'shield') state.player.shield = true;
          if (pw.type === 'triple') state.tripleShotTimer = 40;
          if (pw.type === 'speed') state.player.speed = 8;
          state.powerups.splice(i, 1);
        } else if (pw.y > canvas.height + 20) {
          state.powerups.splice(i, 1);
        }
      }

      // 8. Update & Draw Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.alpha <= 0) state.particles.splice(i, 1);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, spawnWave]);

  const handleStartGame = () => {
    sound.playButtonClick();
    stateRef.current.score = 0;
    stateRef.current.lives = 3;
    stateRef.current.wave = 1;
    stateRef.current.bullets = [];
    stateRef.current.enemyBullets = [];
    stateRef.current.particles = [];
    stateRef.current.powerups = [];
    stateRef.current.startTime = Date.now();
    setScore(0);
    setLives(3);
    setWave(1);
    spawnWave(1);
    setGameState('playing');
  };

  const handleGameOver = () => {
    const finalScore = stateRef.current.score;
    const finalWave = stateRef.current.wave;
    const duration = Math.floor((Date.now() - stateRef.current.startTime) / 1000);
    setGameState('gameover');
    recordGameScore('QUEST_DEFENDER', finalScore, finalWave, duration);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto select-none">
      {/* Top Game Navigation & Status */}
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
            Wave: <span className="text-primary-violet">{wave}</span>
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
      <div className="relative rounded-3xl overflow-hidden border border-theme shadow-2xl bg-[#080911] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full max-w-[500px] aspect-square object-contain"
        />

        {/* Ready / Title Overlay */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg glow-violet">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">QUEST DEFENDER</h3>
              <p className="text-xs text-theme-muted mt-1 max-w-xs">
                Defend the outer perimeter from alien distractions. Controls: Arrow keys / WASD to move, Spacebar to fire lasers.
              </p>
            </div>

            <div className="text-[11px] text-amber-400 font-bold bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/30">
              Personal Best: {personalBest.toLocaleString()} Pts
            </div>

            <button
              onClick={handleStartGame}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all"
            >
              Launch Ship
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4">
            <h3 className="text-2xl font-black text-coral tracking-tight">MISSION CONCLUDED</h3>
            <div className="p-4 rounded-2xl bg-surface-elevated border border-theme w-64 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-theme-muted">Final Score:</span>
                <span className="font-black text-amber-400">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-theme-muted">Waves Cleared:</span>
                <span className="font-black text-primary-violet">{wave - 1}</span>
              </div>
            </div>

            <p className="text-[11px] text-theme-muted max-w-xs">
              Great run! Arcade scores are stored in your personal arcade logs and do not inflate productivity metrics.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={onExit}
                className="px-4 py-2.5 rounded-xl bg-surface-elevated border border-theme text-xs font-bold text-theme-main hover:bg-surface-elevated/80"
              >
                Lobby
              </button>
              <button
                onClick={handleStartGame}
                className="px-6 py-2.5 rounded-xl bg-primary-violet text-white text-xs font-black shadow-lg hover:bg-purple-600"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="lg:hidden p-4 rounded-2xl bg-surface-main border border-theme flex items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <button
            onTouchStart={() => (stateRef.current.keys.up = true)}
            onTouchEnd={() => (stateRef.current.keys.up = false)}
            className="p-3 rounded-xl bg-surface-elevated border border-theme text-center font-bold text-xs active:bg-primary-violet"
          >
            ▲
          </button>
          <div />
          <button
            onTouchStart={() => (stateRef.current.keys.left = true)}
            onTouchEnd={() => (stateRef.current.keys.left = false)}
            className="p-3 rounded-xl bg-surface-elevated border border-theme text-center font-bold text-xs active:bg-primary-violet"
          >
            ◀
          </button>
          <button
            onTouchStart={() => (stateRef.current.keys.down = true)}
            onTouchEnd={() => (stateRef.current.keys.down = false)}
            className="p-3 rounded-xl bg-surface-elevated border border-theme text-center font-bold text-xs active:bg-primary-violet"
          >
            ▼
          </button>
          <button
            onTouchStart={() => (stateRef.current.keys.right = true)}
            onTouchEnd={() => (stateRef.current.keys.right = false)}
            className="p-3 rounded-xl bg-surface-elevated border border-theme text-center font-bold text-xs active:bg-primary-violet"
          >
            ▶
          </button>
        </div>

        <button
          onTouchStart={() => (stateRef.current.keys.shoot = true)}
          onTouchEnd={() => (stateRef.current.keys.shoot = false)}
          className="flex-1 py-6 rounded-2xl bg-coral/20 border border-coral text-coral font-black text-sm active:bg-coral active:text-white"
        >
          FIRE LASER
        </button>
      </div>
    </div>
  );
}

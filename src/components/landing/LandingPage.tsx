'use client';

import React, { useState, useEffect } from 'react';
import { useQuestly } from '@/lib/store';
import {
  CheckSquare,
  BookOpen,
  Hourglass,
  Calendar,
  Layers,
  ArrowRight,
  Menu,
  X,
  Plus,
  Play,
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  Clock,
  Sparkles,
  Command,
  Gamepad2,
  Zap,
  FolderKanban,
  Trophy,
  Lock,
  Check,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { QuestlyLogo } from '@/components/common/QuestlyLogo';
import { InteractiveGraphBackground } from '@/components/common/InteractiveGraphBackground';

export function LandingPage() {
  const { setMode } = useQuestly();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLaunch = () => {
    setMobileMenuOpen(false);
    setMode('app');
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0D] text-[#F5F5F0] relative overflow-x-hidden selection:bg-[#B5FF55] selection:text-[#090A0D]">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#090A0D]/90 backdrop-blur-md border-b border-[#303642]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#171A21] border border-[#303642] flex items-center justify-center brutal-shadow">
              <QuestlyLogo size={20} variant="lime" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-xl tracking-tight uppercase">QUESTLY</span>
              <span className="text-[10px] font-mono font-bold text-[#B5FF55] px-1.5 py-0.2 rounded bg-[#B5FF55]/10 border border-[#B5FF55]/30">
                v2.0
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-[#A1A1A1]">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#B5FF55] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('roadmap')}
              className="hover:text-[#B5FF55] transition-colors"
            >
              Progression
            </button>
            <button
              onClick={() => scrollToSection('arcade')}
              className="hover:text-[#B5FF55] transition-colors"
            >
              Arcade
            </button>
            <button
              onClick={() => scrollToSection('mobile')}
              className="hover:text-[#B5FF55] transition-colors"
            >
              Mobile
            </button>
            <a
              href="https://github.com/sukrut07/Questly"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F5F5F0] transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleLaunch}
              className="px-5 py-2.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] font-black text-xs uppercase tracking-wider font-display brutal-shadow transition-all flex items-center gap-2"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#171A21] border border-[#303642] text-[#F5F5F0]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#111319] border-b border-[#303642] px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col gap-3 font-mono text-sm tracking-wider">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-2 text-[#A1A1A1] hover:text-[#B5FF55]"
              >
                // 01 Features
              </button>
              <button
                onClick={() => scrollToSection('roadmap')}
                className="text-left py-2 text-[#A1A1A1] hover:text-[#B5FF55]"
              >
                // 02 Progression Roadmap
              </button>
              <button
                onClick={() => scrollToSection('arcade')}
                className="text-left py-2 text-[#A1A1A1] hover:text-[#B5FF55]"
              >
                // 03 Questly Arcade
              </button>
              <button
                onClick={() => scrollToSection('mobile')}
                className="text-left py-2 text-[#A1A1A1] hover:text-[#B5FF55]"
              >
                // 04 Flutter Mobile App
              </button>
              <a
                href="https://github.com/sukrut07/Questly"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left py-2 text-[#A1A1A1] hover:text-[#B5FF55] flex items-center gap-1.5"
              >
                <span>// 05 GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="pt-3 border-t border-[#303642]">
              <button
                onClick={handleLaunch}
                className="w-full py-3 rounded-xl bg-[#B5FF55] text-[#090A0D] font-black text-xs uppercase tracking-wider font-display brutal-shadow flex items-center justify-center gap-2"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section on Interactive Coordinate Grid */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-36 px-4 sm:px-6 lg:px-8 border-b border-[#303642] overflow-hidden">
        {/* Interactive Responsive Canvas Grid */}
        <InteractiveGraphBackground intensity={0.65} cellSize={36} />

        {/* Decorative Grid References */}
        <div className="absolute top-6 left-6 coord-marker hidden sm:block z-10 text-[#777]">
          [COORD: 45°N // GRID_REF: 0x8F]
        </div>
        <div className="absolute top-6 right-6 coord-marker hidden sm:block z-10 text-[#777]">
          [WORKSPACE_ID: QS-2026]
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Top Pill Status */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#171A21] border border-[#303642] coord-marker shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#B5FF55] animate-ping" />
            <span className="text-[#F5F5F0] font-bold text-xs">YOUR WORK. YOUR PROGRESS. YOUR SYSTEM.</span>
          </div>

          {/* Condensed Punchy Heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.98] uppercase font-display">
            TURN STUDY TIME <br />
            <span className="text-[#B5FF55]">INTO REAL</span>{' '}
            <span className="text-[#A879FF]">PROGRESS.</span>
          </h1>

          {/* Supporting Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#A1A1A1] font-mono leading-relaxed">
            Questly combines academic timetables, atomic tasks, deep focus timers, and verified XP progression
            into one razor-sharp personal operating system.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleLaunch}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#090A0D] font-black text-sm uppercase tracking-wider font-display brutal-shadow-lime transition-all flex items-center justify-center gap-2.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#171A21] hover:bg-[#20242D] text-[#F5F5F0] border border-[#303642] font-mono font-bold text-xs uppercase tracking-wider transition-all"
            >
              Explore Features ↓
            </button>
          </div>
        </div>

        {/* 2.1 Hero Visual: Workspace Preview Card with Neon Accents */}
        <div className="max-w-5xl mx-auto mt-16 p-2 rounded-2xl bg-[#171A21] border border-[#303642] brutal-shadow relative z-10">
          <div className="p-4 sm:p-6 rounded-xl bg-[#090A0D] border border-[#303642] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#303642] coord-marker">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF806B]" />
                <span className="w-3 h-3 rounded-full bg-[#FFD76A]" />
                <span className="w-3 h-3 rounded-full bg-[#B5FF55]" />
                <span className="ml-2 text-xs font-bold text-[#F5F5F0] font-display uppercase tracking-wider">
                  QUESTLY WORKSPACE PREVIEW
                </span>
              </div>
              <div className="hidden sm:block text-[10px] font-mono text-[#A1A1A1]">
                [AUTHENTIC_DATA_SYSTEM]
              </div>
            </div>

            {/* 3 Modular Showcase Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Block 1: Tasks & XP */}
              <div className="p-5 rounded-xl bg-[#111319] border border-[#303642] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#B5FF55]" />
                    <span className="text-xs font-black uppercase font-display">Atomic Tasks</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#B5FF55] font-bold">+75 XP</span>
                </div>
                <p className="text-xs text-[#A1A1A1] font-mono">
                  Multi-step academic tasks with checklists and verified XP rewards.
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2 text-xs text-[#F5F5F0] p-2 rounded-lg bg-[#171A21] border border-[#303642]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF55]" />
                    <span>Dynamic Programming Proofs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#A1A1A1] p-2 rounded-lg bg-[#171A21] border border-[#303642]">
                    <Circle className="w-3.5 h-3.5 text-[#777]" />
                    <span>Distributed Systems Raft Lab</span>
                  </div>
                </div>
              </div>

              {/* Block 2: Timetable */}
              <div className="p-5 rounded-xl bg-[#111319] border border-[#303642] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#42DFFF]" />
                    <span className="text-xs font-black uppercase font-display">Live Timetable</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-[#42DFFF]/15 text-[#42DFFF] border border-[#42DFFF]/30">
                    ACTIVE NOW
                  </span>
                </div>
                <p className="text-xs text-[#A1A1A1] font-mono">
                  Weekly class tracker with room numbers, instructors, and Day/Week/Agenda views.
                </p>
                <div className="p-3 rounded-lg bg-[#171A21] border border-[#303642] space-y-1 font-mono">
                  <div className="flex justify-between text-xs font-bold text-[#F5F5F0]">
                    <span>CS-204 Algorithms</span>
                    <span className="text-[#42DFFF]">10:00 - 11:30</span>
                  </div>
                  <span className="text-[10px] text-[#A1A1A1]">Lecture Hall 3B • Prof. Vaswani</span>
                </div>
              </div>

              {/* Block 3: Questly Arcade */}
              <div className="p-5 rounded-xl bg-[#111319] border border-[#303642] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-[#A879FF]" />
                    <span className="text-xs font-black uppercase font-display">Questly Arcade</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A879FF] font-bold">20 XP CAP</span>
                </div>
                <p className="text-xs text-[#A1A1A1] font-mono">
                  Mini-games for cognitive warmup between deep focus sprints.
                </p>
                <div className="p-3 rounded-lg bg-[#171A21] border border-[#303642] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-[#F5F5F0] font-display uppercase">Space Defender</div>
                    <span className="text-[10px] font-mono text-[#A1A1A1]">Best: 450 pts</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#B5FF55]">+10 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features That Show Progress (Inspired by Matiks sticker cards) */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#303642]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="space-y-4">
            <span className="coord-marker text-[#B5FF55]">// 01 CORE CAPABILITIES</span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight font-display">
              FEATURES THAT SHOW <br />
              <span className="text-[#B5FF55]">REAL PROGRESS.</span>
            </h2>
            <p className="text-sm text-[#A1A1A1] font-mono max-w-xl">
              Eliminate academic ambiguity with verified task completions, transparent workload math, and dedicated study tracks.
            </p>
          </div>

          {/* Chunky Sticker Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] space-y-4 brutal-shadow hover:border-[#B5FF55] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#B5FF55]/15 border border-[#B5FF55]/40 flex items-center justify-center text-[#B5FF55]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                Idempotent XP Ledger
              </h3>
              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                No cheating by toggling tasks on and off. Every XP point is written to an immutable transaction ledger
                with source IDs and timestamps.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] space-y-4 brutal-shadow hover:border-[#42DFFF] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#42DFFF]/15 border border-[#42DFFF]/40 flex items-center justify-center text-[#42DFFF]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                Academic Timetable
              </h3>
              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                Full-featured class scheduler with Day, Week, and Agenda views. Highlights currently active sessions and
                upcoming lectures.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] space-y-4 brutal-shadow hover:border-[#A879FF] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#A879FF]/15 border border-[#A879FF]/40 flex items-center justify-center text-[#A879FF]">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                Academic Workspaces
              </h3>
              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                Isolate your coursework, research labs, and exam preparations into focused operational environments with
                linked subjects.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] space-y-4 brutal-shadow hover:border-[#FF9C45] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FF9C45]/15 border border-[#FF9C45]/40 flex items-center justify-center text-[#FF9C45]">
                <Hourglass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                Verified Focus Chamber
              </h3>
              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                Distraction-free Pomodoro sprints that log actual elapsed seconds into your daily flow quota and award XP
                upon sprint completion.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] space-y-4 brutal-shadow hover:border-[#FF5EBB] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FF5EBB]/15 border border-[#FF5EBB]/40 flex items-center justify-center text-[#FF5EBB]">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                Questly Arcade
              </h3>
              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                Sudoku, Space Defender, Match Grid, and Pattern Memory. Strictly capped at 20 XP/day so mini-games never
                compete with study time.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] space-y-4 brutal-shadow hover:border-[#B5FF55] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#B5FF55]/15 border border-[#B5FF55]/40 flex items-center justify-center text-[#B5FF55]">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase font-display tracking-tight text-[#F5F5F0]">
                Interactive Mobile Widgets
              </h3>
              <p className="text-xs text-[#A1A1A1] font-mono leading-relaxed">
                Android AppWidgets and iOS WidgetKit small, medium, and large widgets with interactive checkboxes and live
                progress sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Progression Roadmap (Inspired by 10 Steps Roadmap & Matiks Level Road) */}
      <section id="roadmap" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#303642] bg-[#111319]/40">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="coord-marker text-[#A879FF]">// 02 PROGRESSION ARCHITECTURE</span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight font-display">
              7-LEVEL ACADEMIC ROADMAP
            </h2>
            <p className="text-sm text-[#A1A1A1] font-mono max-w-lg mx-auto">
              Level up your scholar rank by finishing verified coursework and unlock custom cosmetic enhancements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {[
              { lvl: 1, rank: 'Initiate', xp: 0, unlock: 'Standard graph grid & lime theme' },
              { lvl: 2, rank: 'Explorer', xp: 200, unlock: 'Electric purple theme & coordinate crosshair' },
              { lvl: 3, rank: 'Builder', xp: 500, unlock: 'Electric cyan theme & audio sound pack' },
              { lvl: 4, rank: 'Strategist', xp: 900, unlock: 'Isometric grid & tactical calendar' },
              { lvl: 5, rank: 'Specialist', xp: 1400, unlock: 'Neon orange theme & particle trails' },
              { lvl: 6, rank: 'Architect', xp: 2000, unlock: 'Cyberpunk pink & soundboard' },
              { lvl: 7, rank: 'Master', xp: 2800, unlock: 'Golden scholar prestige & gradient cursor' },
            ].map((milestone) => (
              <div
                key={milestone.lvl}
                className="p-4 rounded-xl bg-[#171A21] border border-[#303642] flex flex-col justify-between space-y-3 brutal-shadow hover:border-[#B5FF55] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-[#B5FF55]/15 text-[#B5FF55]">
                    LVL {milestone.lvl}
                  </span>
                  <Trophy className="w-3.5 h-3.5 text-[#B5FF55]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#F5F5F0] font-display uppercase tracking-tight">
                    {milestone.rank}
                  </h4>
                  <span className="text-[10px] font-mono text-[#A1A1A1] block mt-0.5">
                    {milestone.xp} XP Required
                  </span>
                </div>
                <div className="pt-2 border-t border-[#303642]/60 text-[10px] font-mono text-[#D0D0D0]">
                  <span className="text-[#B5FF55] font-bold block">UNLOCK:</span>
                  <span>{milestone.unlock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Giant Neon Lime Sticker Card (Inspired by Matiks "LET'S SEE WHAT YOUR BRAIN CAN DO") */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#303642]">
        <div className="max-w-5xl mx-auto">
          <div className="p-8 sm:p-14 rounded-3xl bg-[#B5FF55] text-[#090A0D] brutal-shadow relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-left">
              <span className="text-xs font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#090A0D] text-[#B5FF55]">
                START ACADEMIC SPRINT
              </span>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.98] font-display">
                LET&apos;S SEE WHAT YOU ACCOMPLISH TODAY.
              </h2>
              <p className="text-sm font-mono font-bold text-[#090A0D]/80">
                Launch Questly directly in your browser or download the companion mobile app. Zero credit card or setup required.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleLaunch}
                className="px-8 py-4 rounded-2xl bg-[#090A0D] hover:bg-[#171A21] text-[#F5F5F0] font-display font-black text-sm uppercase tracking-wider brutal-shadow transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Web OS</span>
                <ArrowRight className="w-4 h-4 stroke-[3] text-[#B5FF55]" />
              </button>

              <a
                href="https://github.com/sukrut07/Questly"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-2xl bg-white hover:bg-[#F0F0F0] text-[#090A0D] font-display font-black text-xs uppercase tracking-wider text-center border-2 border-[#090A0D] transition-all"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Lavender Footer Banner (Inspired by Matiks footer banner) */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#A879FF] text-[#090A0D]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#090A0D] text-[#B5FF55] flex items-center justify-center font-display font-black text-sm">
              <QuestlyLogo size={18} variant="lime" />
            </div>
            <div>
              <span className="font-display font-black text-lg text-[#090A0D] tracking-tight">
                QUESTLY 2.0
              </span>
              <p className="text-[10px] text-[#090A0D]/80">Personal Academic Operating System</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-bold">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:underline flex items-center gap-1"
            >
              <span>BACK TO TOP</span>
              <span>↑</span>
            </button>
            <a
              href="https://github.com/sukrut07/Questly"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span>SOURCE CODE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button onClick={handleLaunch} className="hover:underline">
              WORKSPACE APP
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
} from 'lucide-react';

export function LandingPage() {
  const { setMode } = useQuestly();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape
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
    <div className="min-h-screen bg-[#101010] text-[#F5F5F0] relative overflow-x-hidden selection:bg-[#B5FF55] selection:text-[#101010]">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#101010]/90 backdrop-blur-md border-b border-[#383838]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B5FF55] text-[#101010] flex items-center justify-center font-black text-sm brutal-shadow">
              Q
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-black text-lg tracking-tight">QUESTLY</span>
              <span className="text-[10px] font-mono text-[#B5FF55] px-1.5 py-0.2 rounded bg-[#B5FF55]/10 border border-[#B5FF55]/30">
                v2.0
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-[#A1A1A1]">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#F5F5F0] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#F5F5F0] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('mobile')}
              className="hover:text-[#F5F5F0] transition-colors"
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
              className="px-5 py-2.5 rounded-xl bg-[#B5FF55] hover:bg-[#a3f044] text-[#101010] font-black text-xs uppercase tracking-wider brutal-shadow brutal-btn-press transition-all flex items-center gap-2"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#1E1E1E] border border-[#383838] text-[#F5F5F0]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#171717] border-b border-[#383838] px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col gap-3 font-mono text-sm tracking-wider">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-2 text-[#A1A1A1] hover:text-[#B5FF55]"
              >
                // 01 Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 text-[#A1A1A1] hover:text-[#B5FF55]"
              >
                // 02 How It Works
              </button>
              <button
                onClick={() => scrollToSection('mobile')}
                className="text-left py-2 text-[#A1A1A1] hover:text-[#B5FF55]"
              >
                // 03 Mobile App
              </button>
              <a
                href="https://github.com/sukrut07/Questly"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left py-2 text-[#A1A1A1] hover:text-[#B5FF55] flex items-center gap-1.5"
              >
                <span>// 04 GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="pt-3 border-t border-[#383838]">
              <button
                onClick={handleLaunch}
                className="w-full py-3 rounded-xl bg-[#B5FF55] text-[#101010] font-black text-xs uppercase tracking-wider brutal-shadow flex items-center justify-center gap-2"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section on Graph Paper */}
      <section className="relative bg-graph-grid pt-20 pb-24 lg:pt-32 lg:pb-36 px-4 sm:px-6 lg:px-8 border-b border-[#383838]">
        {/* Subtle Decorative Graph Coordinate Markers */}
        <div className="absolute top-6 left-6 coord-marker hidden sm:block">
          [COORD: 45°N // GRID_REF: 0x8F]
        </div>
        <div className="absolute top-6 right-6 coord-marker hidden sm:block">
          [WORKSPACE_ID: QS-2026]
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Top Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#1E1E1E] border border-[#383838] coord-marker">
            <span className="w-2 h-2 rounded-full bg-[#B5FF55] animate-ping" />
            <span className="text-[#F5F5F0] font-bold">YOUR WORK. YOUR PROGRESS. YOUR SYSTEM.</span>
          </div>

          {/* Chunky Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] uppercase">
            Make progress. <br />
            <span className="text-[#B5FF55]">Make it</span>{' '}
            <span className="text-[#B9A3FF]">count.</span>
          </h1>

          {/* Supporting Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#A1A1A1] leading-relaxed">
            Questly brings your tasks, coursework modules, custom checklists, and daily focus into one
            flexible personal operating system that you completely control.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleLaunch}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#B5FF55] hover:bg-[#a3f044] text-[#101010] font-black text-sm uppercase tracking-wider brutal-shadow-lime brutal-btn-press transition-all flex items-center justify-center gap-2.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1E1E1E] hover:bg-[#252525] text-[#F5F5F0] border border-[#383838] font-mono font-bold text-xs uppercase tracking-wider transition-all"
            >
              Explore Features ↓
            </button>
          </div>
        </div>

        {/* 2.1 Hero Visual: Modular Neo-brutalist Component Showcase */}
        <div className="max-w-5xl mx-auto mt-16 p-2 rounded-2xl bg-[#171717] border border-[#383838] brutal-shadow">
          <div className="p-4 sm:p-6 rounded-xl bg-[#101010] border border-[#383838] space-y-6">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#383838] coord-marker">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF806B]" />
                <span className="w-3 h-3 rounded-full bg-[#FFD76A]" />
                <span className="w-3 h-3 rounded-full bg-[#B5FF55]" />
                <span className="ml-2 text-xs font-bold text-[#F5F5F0]">QUESTLY WORKSPACE PREVIEW</span>
              </div>
              <div className="hidden sm:block">[REAL_USER_DATA_MODEL]</div>
            </div>

            {/* Simulated Modular Blocks on Graph */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Block 1: Tasks & Checklist Card */}
              <div className="p-5 rounded-xl bg-[#1E1E1E] border border-[#383838] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#B5FF55]" />
                    <span className="text-xs font-black uppercase">Tasks & Checklists</span>
                  </div>
                  <span className="coord-marker">[01]</span>
                </div>
                <p className="text-xs text-[#A1A1A1]">
                  Break down large problem sets into multi-step atomic subtasks.
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2 text-xs text-[#F5F5F0] p-2 rounded-lg bg-[#252525]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF55]" />
                    <span>Decompose algorithm into steps</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#A1A1A1] p-2 rounded-lg bg-[#252525]">
                    <Circle className="w-3.5 h-3.5 text-[#383838]" />
                    <span>Run time complexity proofs</span>
                  </div>
                </div>
              </div>

              {/* Block 2: Subjects & Modules Card */}
              <div className="p-5 rounded-xl bg-[#1E1E1E] border border-[#383838] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#B9A3FF]" />
                    <span className="text-xs font-black uppercase">Course Syllabi</span>
                  </div>
                  <span className="coord-marker">[02]</span>
                </div>
                <p className="text-xs text-[#A1A1A1]">
                  Create subjects, modules, and topics. Track syllabus progress as you finish chapters.
                </p>
                <div className="p-3 rounded-lg bg-[#252525] border border-[#383838] space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>CS-204 Algorithms</span>
                    <span className="text-[#B5FF55]">68%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#171717] overflow-hidden">
                    <div className="w-[68%] h-full bg-[#B5FF55] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Block 3: Focus Session Card */}
              <div className="p-5 rounded-xl bg-[#1E1E1E] border border-[#383838] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-[#62D9FF]" />
                    <span className="text-xs font-black uppercase">Deep Flow</span>
                  </div>
                  <span className="coord-marker">[03]</span>
                </div>
                <p className="text-xs text-[#A1A1A1]">
                  Distraction-free Pomodoro timer linked to your specific coursework goals.
                </p>
                <div className="p-3 rounded-lg bg-[#252525] border border-[#383838] text-center">
                  <div className="font-mono font-black text-2xl text-[#F5F5F0]">25:00</div>
                  <span className="text-[10px] font-mono text-[#62D9FF] uppercase tracking-wider">
                    Timer Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Exploration Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#383838]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="space-y-4">
            <span className="coord-marker text-[#B5FF55]">// 01 CORE CAPABILITIES</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              Designed for serious study, <br />
              <span className="text-[#B5FF55]">not generic task lists.</span>
            </h2>
            <p className="text-sm text-[#A1A1A1] max-w-xl">
              Every component in Questly was built to eliminate academic friction, keep deadlines visible,
              and help you build real mastery.
            </p>
          </div>

          {/* Asymmetric Editorial Feature Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#171717] border border-[#383838] space-y-4 brutal-shadow hover:border-[#B5FF55] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#B5FF55]/10 border border-[#B5FF55]/30 flex items-center justify-center text-[#B5FF55]">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase">Atomic Task Breakdown</h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Add priorities, difficulty ratings, due dates, and checklist subtasks. Mark items complete with
                instant tactile feedback and persistence.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#171717] border border-[#383838] space-y-4 brutal-shadow hover:border-[#B9A3FF] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#B9A3FF]/10 border border-[#B9A3FF]/30 flex items-center justify-center text-[#B9A3FF]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase">Hierarchical Syllabi</h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Organize your semester into subjects, modules, and concept checklists. Real-time progress bars
                reflect true syllabus completion.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#171717] border border-[#383838] space-y-4 brutal-shadow hover:border-[#62D9FF] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#62D9FF]/10 border border-[#62D9FF]/30 flex items-center justify-center text-[#62D9FF]">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase">Deadlines Radar</h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Track assignments, midterms, and project submissions with weightage percentages and days-left
                readouts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#171717] border border-[#383838] space-y-4 brutal-shadow hover:border-[#FFD76A] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FFD76A]/10 border border-[#FFD76A]/30 flex items-center justify-center text-[#FFD76A]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase">Workload Balancer</h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Transparent math comparing scheduled tasks with your daily focus capacity. Warns you before you
                overload your day.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#171717] border border-[#383838] space-y-4 brutal-shadow hover:border-[#FF806B] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FF806B]/10 border border-[#FF806B]/30 flex items-center justify-center text-[#FF806B]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase">Customizable Widgets</h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Toggle, reorder, or customize the dashboard cards that matter to your daily routine. Zero fake
                charts or decorative filler.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#171717] border border-[#383838] space-y-4 brutal-shadow hover:border-[#B5FF55] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#B5FF55]/10 border border-[#B5FF55]/30 flex items-center justify-center text-[#B5FF55]">
                <Command className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase">Command Palette (⌘K)</h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Navigate across your subjects, open tools, search tasks, or trigger quick additions without taking
                your fingers off the keyboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Timeline */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#383838] bg-[#171717]/40">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="coord-marker text-[#B9A3FF]">// 02 METHODOLOGY</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              How Questly Works
            </h2>
            <p className="text-sm text-[#A1A1A1] max-w-md mx-auto">
              A five-step disciplined workflow designed to turn ambitious syllabi into daily execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Create Workspace', desc: 'Initialize your clean semester space with your target courses.' },
              { step: '02', title: 'Add Syllabi', desc: 'Break courses down into modules and actionable concept topics.' },
              { step: '03', title: 'Build Checklists', desc: 'Add problems, readings, and lab milestones to your tasks.' },
              { step: '04', title: 'Focus & Execute', desc: 'Launch Pomodoro focus sessions tied directly to your active tasks.' },
              { step: '05', title: 'Review & Adapt', desc: 'Review weekly progress, workload balance, and exam countdowns.' },
            ].map((item) => (
              <div
                key={item.step}
                className="p-5 rounded-xl bg-[#1E1E1E] border border-[#383838] space-y-2 relative"
              >
                <span className="font-mono font-black text-2xl text-[#B5FF55]">{item.step}</span>
                <h4 className="text-xs font-black uppercase text-[#F5F5F0]">{item.title}</h4>
                <p className="text-[11px] text-[#A1A1A1] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Mobile Application Showcase */}
      <section id="mobile" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#383838]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-lg">
            <span className="coord-marker text-[#62D9FF]">// 03 MOBILE FIRST ARCHITECTURE</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              One identity. <br />
              <span className="text-[#62D9FF]">Web & Mobile</span> unified.
            </h2>
            <p className="text-sm text-[#A1A1A1] leading-relaxed">
              Questly on Flutter shares the exact same design language: deep obsidian canvas, graph-paper
              backgrounds, chunky typography, tactile buttons, and one-handed thumb-zone navigation.
            </p>

            <ul className="space-y-2 text-xs font-mono text-[#A1A1A1]">
              <li className="flex items-center gap-2">
                <span className="text-[#B5FF55] font-bold">✓</span>
                <span>Fast bottom navigation bar with quick capture</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#B5FF55] font-bold">✓</span>
                <span>Offline-first local synchronization</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#B5FF55] font-bold">✓</span>
                <span>Native Android & iOS home-screen widgets</span>
              </li>
            </ul>
          </div>

          {/* Phone Frame Mockup on Graph Paper */}
          <div className="w-full max-w-xs p-3 rounded-[36px] bg-[#171717] border-2 border-[#383838] brutal-shadow">
            <div className="rounded-[28px] bg-[#101010] p-4 border border-[#383838] space-y-4">
              {/* Phone Header */}
              <div className="flex items-center justify-between pt-1 pb-2 border-b border-[#383838]">
                <span className="font-mono font-bold text-xs">QUESTLY MOBILE</span>
                <span className="text-[10px] font-mono text-[#B5FF55]">FLUTTER</span>
              </div>

              {/* Sample Mobile Screen content */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#383838] space-y-1">
                  <div className="text-[10px] font-mono text-[#B5FF55] uppercase font-bold">NEXT UP</div>
                  <div className="text-xs font-bold text-[#F5F5F0]">Review Graph Theory Proofs</div>
                </div>

                <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#383838] space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span>Syllabus</span>
                    <span className="text-[#B5FF55]">4/6 Done</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#101010] overflow-hidden">
                    <div className="w-2/3 h-full bg-[#B5FF55]" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#383838] text-center">
                  <div className="font-mono font-black text-xl text-[#F5F5F0]">25:00</div>
                  <span className="text-[9px] font-mono text-[#A1A1A1]">POMODORO ACTIVE</span>
                </div>
              </div>

              {/* Mobile Bottom Nav Representation */}
              <div className="pt-2 border-t border-[#383838] flex justify-around text-[10px] font-mono text-[#A1A1A1]">
                <span className="text-[#B5FF55] font-bold">HOME</span>
                <span>TASKS</span>
                <span>(+)</span>
                <span>SUBJ</span>
                <span>MORE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final CTA Section with Dense Graph Paper */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-graph-grid-dense border-b border-[#383838] text-center relative">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="coord-marker text-[#B5FF55]">[START_WORKSPACE_FLOW]</span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
            Your system. <br />
            <span className="text-[#B5FF55]">Your pace.</span>
          </h2>
          <p className="text-sm text-[#A1A1A1] max-w-lg mx-auto leading-relaxed">
            No dummy metrics. No fake leaderboards. Build your courses, tasks, and habits in a system you
            control completely.
          </p>

          <div className="pt-2">
            <button
              onClick={handleLaunch}
              className="px-8 py-4 rounded-xl bg-[#B5FF55] hover:bg-[#a3f044] text-[#101010] font-black text-sm uppercase tracking-wider brutal-shadow-lime brutal-btn-press transition-all inline-flex items-center gap-2.5"
            >
              <span>Start Building Your Workspace</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#101010] text-[#A1A1A1]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#B5FF55] text-[#101010] flex items-center justify-center font-black text-xs">
              Q
            </div>
            <span className="text-[#F5F5F0] font-bold">QUESTLY 2.0</span>
            <span>•</span>
            <span>Personal Academic OS</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/sukrut07/Questly"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F5F5F0] transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={handleLaunch} className="hover:text-[#F5F5F0] transition-colors">
              Launch Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { WORLD_STAGES } from '@/lib/progressionEngine';
import { WorldStageNumber, WorldStageInfo } from '@/lib/types';
import {
  Sparkles,
  Flame,
  Eye,
  Compass,
  ChevronRight,
  Sun,
  Moon,
  Info,
  Layers,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function LivingWorldCard() {
  const { streak, user, setActiveModal, quests } = useQuestly();
  const [interactiveMode, setInteractiveMode] = useState<'day' | 'night' | 'auto'>('auto');
  const [inspectedLandmark, setInspectedLandmark] = useState<string | null>(null);

  const stage = (WORLD_STAGES as Record<number, WorldStageInfo>)[streak.worldStage] || WORLD_STAGES[1];
  const nextStageNum = Math.min(6, streak.worldStage + 1);
  const nextStage = (WORLD_STAGES as Record<number, WorldStageInfo>)[nextStageNum] || WORLD_STAGES[6];

  // Calculate days progress to next stage
  const currentDays = streak.currentStreak;
  const stageMin = stage.minStreakDays;
  const nextMin = nextStage.minStreakDays;
  const progressRatio =
    streak.worldStage === 6
      ? 1
      : Math.min(1, Math.max(0, (currentDays - stageMin) / Math.max(1, nextMin - stageMin)));
  const progressPercent = Math.round(progressRatio * 100);

  const mode = streak.presentationMode; // 'flourishing' | 'stable' | 'resting'

  // Visual filter & glow based on mode
  const modeFilter =
    mode === 'flourishing'
      ? 'saturate-125 contrast-105 brightness-105'
      : mode === 'resting'
      ? 'saturate-85 contrast-95 brightness-90'
      : 'saturate-100 contrast-100 brightness-100';

  const crystalGlowColor =
    streak.worldStage >= 5
      ? '#F5C96A'
      : streak.worldStage >= 3
      ? '#68BCFF'
      : streak.worldStage >= 2
      ? '#8B7CFF'
      : '#5B518F';

  return (
    <div className="relative rounded-3xl overflow-hidden bg-surface-main border border-theme shadow-2xl transition-all duration-500">
      {/* Header bar overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 lg:p-6 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-primary-violet/20 border border-primary-violet/40 text-primary-violet font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-violet animate-pulse" />
            <span>Stage {streak.worldStage} of 6</span>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              mode === 'flourishing'
                ? 'bg-mint-green/15 border-mint-green/40 text-mint-green'
                : mode === 'resting'
                ? 'bg-indigo-950/60 border-indigo-400/30 text-indigo-300'
                : 'bg-surface-elevated/70 border-theme text-theme-muted'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                mode === 'flourishing'
                  ? 'bg-mint-green animate-ping'
                  : mode === 'resting'
                  ? 'bg-indigo-400'
                  : 'bg-primary-violet'
              }`}
            />
            <span className="capitalize">{mode} Realm</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playButtonClick();
              setActiveModal('world_inspect');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-md"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Explore Realm</span>
          </button>
        </div>
      </div>

      {/* SVG Living Kingdom Artwork Canvas */}
      <div className={`relative w-full h-[280px] sm:h-[340px] md:h-[400px] overflow-hidden ${modeFilter}`}>
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-cover transition-transform duration-700 select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Sky Gradients based on stage */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              {streak.worldStage >= 5 ? (
                <>
                  <stop offset="0%" stopColor="#120B2E" />
                  <stop offset="45%" stopColor="#2E1854" />
                  <stop offset="80%" stopColor="#4A2574" />
                  <stop offset="100%" stopColor="#7B3A9B" />
                </>
              ) : streak.worldStage >= 3 ? (
                <>
                  <stop offset="0%" stopColor="#0B132B" />
                  <stop offset="50%" stopColor="#1C2541" />
                  <stop offset="85%" stopColor="#3A506B" />
                  <stop offset="100%" stopColor="#5B7089" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#080911" />
                  <stop offset="50%" stopColor="#111322" />
                  <stop offset="85%" stopColor="#1B1E32" />
                  <stop offset="100%" stopColor="#292D46" />
                </>
              )}
            </linearGradient>

            {/* River Gradient */}
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.8" />
              <stop offset="50%" stopColor={streak.worldStage >= 3 ? '#38BDF8' : '#2A4365'} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.7" />
            </linearGradient>

            {/* Crystal Core Gradient */}
            <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor={crystalGlowColor} />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>

            {/* Mountain Fill */}
            <linearGradient id="mountainBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="mountainFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#312E81" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>

            {/* Hill Gradient */}
            <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              {streak.worldStage >= 3 ? (
                <>
                  <stop offset="0%" stopColor="#15803D" />
                  <stop offset="60%" stopColor="#14532D" />
                  <stop offset="100%" stopColor="#052E16" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#2E3440" />
                  <stop offset="60%" stopColor="#1F232D" />
                  <stop offset="100%" stopColor="#14171F" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* 1. SKY */}
          <rect x="0" y="0" width="1000" height="500" fill="url(#skyGrad)" />

          {/* Celestial Stars & Aurora Ribbons */}
          <g opacity={streak.worldStage >= 3 ? '0.9' : '0.4'}>
            <circle cx="120" cy="60" r="1.5" fill="#FFFFFF" />
            <circle cx="280" cy="40" r="2" fill="#E0E7FF" />
            <circle cx="450" cy="75" r="1.5" fill="#FFFFFF" />
            <circle cx="680" cy="35" r="2" fill="#BAE6FD" />
            <circle cx="820" cy="80" r="1.5" fill="#FDE68A" />
            <circle cx="910" cy="45" r="2" fill="#FFFFFF" />
            <circle cx="340" cy="110" r="1.2" fill="#FFFFFF" />
            <circle cx="760" cy="95" r="1.5" fill="#FFFFFF" />
          </g>

          {/* Aurora Waves (Stage 5 and 6) */}
          {streak.worldStage >= 5 && (
            <path
              d="M0,120 Q250,50 500,100 T1000,70 L1000,160 Q750,110 500,150 T0,140 Z"
              fill="url(#riverGrad)"
              opacity="0.35"
              className="animate-pulse"
              style={{ animationDuration: '6s' }}
            />
          )}

          {/* Giant Moon / Sun in distance */}
          <circle
            cx="850"
            cy="110"
            r={streak.worldStage >= 4 ? '45' : '35'}
            fill={streak.worldStage >= 5 ? '#FDE68A' : '#E2E8F0'}
            opacity={streak.worldStage >= 2 ? '0.85' : '0.4'}
            filter="drop-shadow(0px 0px 18px rgba(253, 230, 138, 0.4))"
          />

          {/* 2. DISTANT MOUNTAINS */}
          <polygon points="-50,340 180,180 380,340" fill="url(#mountainBack)" opacity="0.8" />
          <polygon points="260,340 480,140 720,340" fill="url(#mountainBack)" opacity="0.9" />
          <polygon points="620,340 820,170 1050,340" fill="url(#mountainBack)" opacity="0.85" />

          {/* Snow peaks for stages >= 3 */}
          {streak.worldStage >= 3 && (
            <>
              <polygon points="480,140 450,185 510,185" fill="#E2E8F0" opacity="0.6" />
              <polygon points="820,170 795,205 845,205" fill="#E2E8F0" opacity="0.5" />
            </>
          )}

          {/* 3. ROLLING HILLS */}
          <path
            d="M-50,370 Q200,280 500,340 T1050,330 L1050,500 L-50,500 Z"
            fill="url(#mountainFront)"
          />
          <path
            d="M-50,400 Q300,320 600,380 T1050,380 L1050,500 L-50,500 Z"
            fill="url(#hillGrad)"
          />

          {/* 4. WINDING SANCTUARY RIVER */}
          <path
            d="M480,350 Q520,390 440,430 T600,500 L480,500 Q360,440 450,400 T440,350 Z"
            fill="url(#riverGrad)"
            opacity="0.9"
          />

          {/* Stone Bridge across river (Stage >= 3) */}
          {streak.worldStage >= 3 && (
            <g
              className="cursor-pointer group"
              onClick={() => setInspectedLandmark('Stone Bridge of Focus')}
            >
              <rect x="420" y="405" width="70" height="14" rx="4" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
              <rect x="430" y="419" width="10" height="15" fill="#334155" />
              <rect x="470" y="419" width="10" height="15" fill="#334155" />
            </g>
          )}

          {/* 5. FORESTS & PINE TREES */}
          <g fill={streak.worldStage >= 3 ? '#064E3B' : '#1E293B'} opacity="0.85">
            {/* Left Pine Cluster */}
            <polygon points="80,380 90,340 100,380" />
            <polygon points="95,385 108,335 120,385" />
            <polygon points="110,390 125,345 140,390" />
            <polygon points="135,395 148,350 160,395" />

            {/* Right Pine Cluster */}
            <polygon points="840,375 852,330 865,375" />
            <polygon points="860,380 875,325 890,380" />
            <polygon points="885,385 898,340 910,385" />
          </g>

          {/* 6. KINGDOM STRUCTURES ACCORDING TO WORLD STAGE */}

          {/* Stage 1: The Outpost Tent & Embers */}
          {streak.worldStage === 1 && (
            <g
              transform="translate(260, 340)"
              className="cursor-pointer"
              onClick={() => setInspectedLandmark('Forgotten Outpost Tent')}
            >
              {/* Weathered tent */}
              <polygon points="40,50 65,10 90,50" fill="#334155" stroke="#475569" strokeWidth="1.5" />
              <polygon points="40,50 65,10 65,50" fill="#1E293B" />
              {/* Campfire embers */}
              <circle cx="110" cy="46" r="4" fill="#EA580C" opacity="0.8" />
              <circle cx="110" cy="46" r="2" fill="#FDE047" />
            </g>
          )}

          {/* Stage 2: First Sparks (Stone hearth, torch posts, small cottage) */}
          {streak.worldStage >= 2 && (
            <g
              transform="translate(240, 325)"
              className="cursor-pointer"
              onClick={() => setInspectedLandmark('Wayfarer Cottage & Hearth')}
            >
              {/* Stone cottage */}
              <rect x="30" y="30" width="55" height="35" rx="3" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
              <polygon points="25,30 57,5 90,30" fill="#7C2D12" stroke="#9A3412" strokeWidth="1" />
              {/* Glowing window */}
              <rect x="42" y="40" width="12" height="14" rx="2" fill="#FEF08A" opacity="0.9" />
              {/* Lantern post */}
              <line x1="100" y1="35" x2="100" y2="65" stroke="#64748B" strokeWidth="2" />
              <circle cx="100" cy="35" r="4" fill="#F59E0B" filter="drop-shadow(0 0 6px #F59E0B)" />
            </g>
          )}

          {/* Stage 3+: Watchtower & Mill */}
          {streak.worldStage >= 3 && (
            <g
              transform="translate(140, 290)"
              className="cursor-pointer"
              onClick={() => setInspectedLandmark('Observatory Watchtower')}
            >
              {/* Tall stone watchtower */}
              <rect x="40" y="35" width="30" height="75" fill="#475569" stroke="#64748B" strokeWidth="1.5" />
              <polygon points="35,35 55,10 75,35" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1" />
              {/* Slit windows with warm yellow glow */}
              <rect x="52" y="50" width="6" height="12" rx="1" fill="#FDE047" />
              <rect x="52" y="75" width="6" height="12" rx="1" fill="#FDE047" />
            </g>
          )}

          {/* Stage 4+: Fortified Castle Keep & Ramparts */}
          {streak.worldStage >= 4 && (
            <g
              transform="translate(670, 270)"
              className="cursor-pointer"
              onClick={() => setInspectedLandmark('Fortified Grand Citadel Keep')}
            >
              {/* Left tower */}
              <rect x="30" y="40" width="28" height="85" fill="#334155" stroke="#475569" strokeWidth="1.5" />
              <polygon points="26,40 44,15 62,40" fill="#6D28D9" />
              {/* Main keep center */}
              <rect x="58" y="55" width="55" height="70" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
              {/* Battlement crenellations */}
              <rect x="58" y="50" width="10" height="8" fill="#334155" />
              <rect x="73" y="50" width="10" height="8" fill="#334155" />
              <rect x="88" y="50" width="10" height="8" fill="#334155" />
              <rect x="103" y="50" width="10" height="8" fill="#334155" />
              {/* Right tower */}
              <rect x="113" y="40" width="28" height="85" fill="#334155" stroke="#475569" strokeWidth="1.5" />
              <polygon points="109,40 127,15 145,40" fill="#6D28D9" />
              {/* Kingdom banner */}
              <rect x="82" y="70" width="8" height="24" fill="#8B7CFF" />
            </g>
          )}

          {/* Stage 5 & 6: Floating Arcane Monoliths & Celestial Spire */}
          {streak.worldStage >= 5 && (
            <g transform="translate(480, 180)" className="animate-float">
              {/* Floating monolith left */}
              <polygon
                points="-90,40 -80,10 -70,40 -80,70"
                fill="#C084FC"
                opacity="0.9"
                filter="drop-shadow(0 0 10px #C084FC)"
              />
              {/* Floating monolith right */}
              <polygon
                points="90,30 100,0 110,30 100,60"
                fill="#FDE047"
                opacity="0.9"
                filter="drop-shadow(0 0 10px #FDE047)"
              />
            </g>
          )}

          {/* 7. THE CENTRAL HEART CRYSTAL (Signature Centerpiece) */}
          <g
            transform="translate(470, 310)"
            className="cursor-pointer group"
            onClick={() => setInspectedLandmark('Central Heart Crystal')}
          >
            {/* Glowing radial aura pulses */}
            <circle
              cx="30"
              cy="40"
              r={streak.worldStage >= 4 ? '50' : '35'}
              fill={crystalGlowColor}
              opacity={mode === 'flourishing' ? '0.35' : '0.18'}
              className="animate-pulse"
            />
            {/* Stone plinth pedestal */}
            <polygon points="10,85 50,85 45,70 15,70" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
            <polygon points="15,70 45,70 40,60 20,60" fill="#334155" />

            {/* Faceted Crystal Shape */}
            <polygon
              points="30,10 50,40 42,70 18,70 10,40"
              fill="url(#crystalGrad)"
              stroke="#FFFFFF"
              strokeWidth={streak.worldStage >= 3 ? '1.5' : '0.8'}
              filter={`drop-shadow(0px 0px ${streak.worldStage * 5}px ${crystalGlowColor})`}
              className="transition-all duration-500 group-hover:scale-105"
            />
            {/* Facet reflections */}
            <polygon points="30,10 30,70 18,70 10,40" fill="#FFFFFF" opacity="0.3" />
            <polygon points="30,10 50,40 42,70" fill="#000000" opacity="0.15" />
          </g>

          {/* Floating animated sparkles for flourishing mode */}
          {mode === 'flourishing' && (
            <g className="animate-pulse">
              <circle cx="460" cy="280" r="2" fill="#FDE047" />
              <circle cx="530" cy="295" r="2.5" fill="#67E8F9" />
              <circle cx="490" cy="240" r="1.5" fill="#FFFFFF" />
              <circle cx="380" cy="360" r="2" fill="#F472B6" />
              <circle cx="620" cy="340" r="2" fill="#A7F3D0" />
            </g>
          )}
        </svg>

        {/* Inspected landmark badge popup */}
        {inspectedLandmark && (
          <div className="absolute top-20 left-6 z-30 p-3 rounded-2xl bg-surface-elevated/95 border border-primary-violet/50 backdrop-blur-xl shadow-xl max-w-xs animate-float">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary-violet">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{inspectedLandmark}</span>
              </div>
              <button
                onClick={() => setInspectedLandmark(null)}
                className="text-theme-muted hover:text-theme-main text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-theme-muted leading-relaxed">
              Resonates with your focus consistency. Unlocked as you progress through stages of personal discipline.
            </p>
          </div>
        )}
      </div>

      {/* World Progress Footer Info Bar */}
      <div className="p-4 lg:p-6 bg-surface-main/95 border-t border-theme">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* World Lore Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg lg:text-xl text-theme-main tracking-tight">
                {stage.title}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-elevated text-theme-muted border border-theme">
                {streak.currentStreak} Day Habit Streak
              </span>
            </div>
            <p className="text-xs text-theme-muted max-w-xl leading-relaxed">
              {stage.description}
            </p>
          </div>

          {/* Next Evolution Milestone */}
          <div className="min-w-[260px] p-3 rounded-2xl bg-surface-elevated/60 border border-theme flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-theme-muted">Next Evolution</span>
              <span className="font-bold text-primary-violet">
                {streak.worldStage === 6 ? 'Pinnacle Reached' : `${nextStage.title}`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-theme-muted">
              <span>{stage.nextMilestoneDesc}</span>
              <span className="font-bold text-theme-main">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

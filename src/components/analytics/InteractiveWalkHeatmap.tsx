'use client';

import React, { useState, useMemo } from 'react';
import { MoreVertical, Info, Sparkles, TrendingUp, Calendar, Clock } from 'lucide-react';
import { sound } from '@/common/SoundService';

export interface HeatmapCell {
  id: string;
  xDate: string; // e.g. '2023-06'
  yLevel: number; // e.g. 4, 6, 8, 10, 12, 14
  intensity: number; // 1 to 26
  hours: number;
  tasksCompleted: number;
  notes: string;
}

export function InteractiveWalkHeatmap() {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [activeMetric, setActiveMetric] = useState<'study' | 'volume'>('study');

  // Exact color scale matching the user's reference image:
  // Purple (1) -> Lavender -> White -> Soft Green -> Emerald Green (26)
  const getCellColor = (val: number) => {
    // 1 to 26 mapping
    if (val <= 4) return 'bg-[#3B0764] border-[#4C0E82] text-purple-200'; // Deep Dark Purple
    if (val <= 8) return 'bg-[#7E22CE] border-[#9333EA] text-purple-100'; // Royal Purple
    if (val <= 12) return 'bg-[#C084FC] border-[#D8B4FE] text-purple-900'; // Lavender
    if (val <= 16) return 'bg-[#F5F3FF] border-[#EDE9FE] text-zinc-900'; // Off-White / Cream
    if (val <= 21) return 'bg-[#86EFAC] border-[#4ADE80] text-emerald-950'; // Bright Mint Green
    return 'bg-[#15803D] border-[#166534] text-emerald-100'; // Deep Emerald Green (26)
  };

  // Generate realistic random walk data matching the visual shape of the user's screenshot
  const walkColumns = useMemo(() => {
    const months = [
      { id: '2023-05', label: '2023-05', base: 6, values: [6, 7] },
      { id: '2023-06', label: '2023-06', base: 7, values: [5, 6, 7, 8] },
      { id: '2023-07', label: '', base: 5, values: [4, 5, 6] },
      { id: '2023-08', label: '2023-08', base: 9, values: [7, 8, 9, 10] },
      { id: '2023-09', label: '', base: 11, values: [10, 11] },
      { id: '2023-10', label: '2023-10', base: 12, values: [10, 11, 12] },
      { id: '2023-11', label: '', base: 13, values: [11, 12, 13] },
      { id: '2023-12', label: '2023-12', base: 14, values: [12, 13, 14] },
      { id: '2024-01', label: '', base: 13, values: [11, 12, 13] },
      { id: '2024-02', label: '2024-02', base: 9, values: [8, 9, 10] },
      { id: '2024-03', label: '', base: 7, values: [6, 7, 8] },
      { id: '2024-04', label: '2024-04', base: 5, values: [5, 6] },
    ];

    // Seed deterministic intensities matching the reference image's purple/green rhythm
    const intensities = [
      [3, 19],
      [2, 23, 7, 14],
      [5, 18, 15],
      [1, 10, 19, 4],
      [22, 14],
      [14, 16, 2],
      [12, 15, 3],
      [17, 20, 14],
      [10, 14, 18],
      [11, 2, 8],
      [4, 19, 12],
      [6, 15],
    ];

    return months.map((m, colIdx) => {
      const colCells: HeatmapCell[] = m.values.map((level, rowIdx) => {
        const intensity = intensities[colIdx]?.[rowIdx] || (colIdx * 2 + rowIdx) % 26 + 1;
        return {
          id: `${m.id}-lvl-${level}`,
          xDate: m.id,
          yLevel: level,
          intensity,
          hours: Math.round(level * 0.9 * 10) / 10,
          tasksCompleted: Math.max(1, Math.round(intensity / 4)),
          notes:
            intensity > 18
              ? 'Peak Flow Sprint: Raft consensus lab & algorithms proof'
              : intensity > 10
              ? 'Steady Sprint: Lecture checkpoints & problem sets'
              : 'Maintenance Sprint: Revision & active recall flashcards',
        };
      });

      return {
        ...m,
        cells: colCells,
      };
    });
  }, []);

  const yLevels = [14, 12, 10, 8, 6, 4];

  const handleSelect = (cell: HeatmapCell) => {
    sound.playButtonClick();
    setSelectedCell((prev) => (prev?.id === cell.id ? null : cell));
  };

  return (
    <div className="w-full rounded-2xl bg-[#0D0F14] border border-white/[0.08] p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-xl">
      {/* 1. Header with clean typography (No AI Slop) */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#86EFAC] animate-pulse" />
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              <span>Random Walk (over time)</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Bi-directional momentum heatmap • Velocity tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06] text-[10px] font-medium text-zinc-400">
            <button
              onClick={() => setActiveMetric('study')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activeMetric === 'study' ? 'bg-white/10 text-white font-semibold' : 'hover:text-zinc-200'
              }`}
            >
              Study Focus
            </button>
            <button
              onClick={() => setActiveMetric('volume')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activeMetric === 'volume' ? 'bg-white/10 text-white font-semibold' : 'hover:text-zinc-200'
              }`}
            >
              Kilometers
            </button>
          </div>

          <button
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Heatmap options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Heatmap Matrix Grid */}
      <div className="relative my-4 overflow-x-auto no-scrollbar">
        <div className="min-w-[440px] flex">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between pr-3 text-right text-[11px] font-mono text-zinc-500 shrink-0 select-none py-1">
            {yLevels.map((lvl) => (
              <span key={lvl} className="h-6 flex items-center justify-end">
                {lvl} {activeMetric === 'study' ? 'hrs' : 'km'}
              </span>
            ))}
          </div>

          {/* Matrix Columns with dashed guides */}
          <div className="flex-1 relative border-l border-white/[0.06] pl-2">
            {/* Horizontal Guide Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              {yLevels.map((lvl) => (
                <div key={lvl} className="w-full border-b border-dashed border-zinc-700/60 h-6" />
              ))}
            </div>

            {/* Stepped Columns */}
            <div className="relative z-10 grid grid-cols-12 gap-1.5 h-[168px] items-end">
              {walkColumns.map((col) => {
                return (
                  <div key={col.id} className="h-full flex flex-col justify-end gap-1 relative">
                    {/* Render cells positioned by their yLevel */}
                    {col.cells.map((cell) => {
                      const isSelected = selectedCell?.id === cell.id;
                      const bottomOffset = ((cell.yLevel - 4) / 10) * 135;

                      return (
                        <button
                          key={cell.id}
                          onClick={() => handleSelect(cell)}
                          style={{
                            bottom: `${Math.max(0, Math.min(135, bottomOffset))}px`,
                          }}
                          className={`absolute w-full h-[22px] rounded-[3px] border transition-all duration-150 ${getCellColor(
                            cell.intensity
                          )} ${
                            isSelected
                              ? 'ring-2 ring-white scale-110 z-20 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                              : 'hover:scale-105 hover:z-10 opacity-90 hover:opacity-100'
                          }`}
                          title={`${cell.xDate}: ${cell.hours} hrs, Intensity: ${cell.intensity}`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* X-Axis Timeline Month Labels */}
            <div className="grid grid-cols-12 gap-1.5 pt-3 text-[10px] font-mono text-zinc-500 select-none">
              {walkColumns.map((col) => (
                <div key={col.id} className="text-center truncate">
                  {col.label ? col.label.replace('202', "'2") : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Heatmap Continuous Color Gradient Legend Bar (Exact match to uploaded image) */}
      <div className="pt-2 flex flex-col gap-1.5 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span className="font-semibold text-purple-300">1</span>
          <span className="text-zinc-500 text-[9px] uppercase tracking-wider">
            Density Gradient (Purple → Cream → Emerald)
          </span>
          <span className="font-semibold text-emerald-300">26</span>
        </div>

        {/* Continuous gradient bar */}
        <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#3B0764] via-[#7E22CE] via-[#EDE9FE] via-[#86EFAC] to-[#15803D] shadow-inner" />
      </div>

      {/* 4. Cell Inspection Sheet (Opens on Click) */}
      {selectedCell && (
        <div className="mt-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs space-y-1.5 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono font-bold text-white">{selectedCell.xDate}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                LVL: {selectedCell.yLevel} {activeMetric === 'study' ? 'hrs' : 'km'}
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[#86EFAC] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intensity {selectedCell.intensity} / 26</span>
            </div>
          </div>

          <p className="text-zinc-300 text-[11px]">{selectedCell.notes}</p>
        </div>
      )}
    </div>
  );
}

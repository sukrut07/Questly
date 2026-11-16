'use client';

import React, { useState, useMemo } from 'react';
import { useQuestly } from '@/lib/store';
import { MoreVertical, Info, Sparkles, TrendingUp, Calendar, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { sound } from '@/common/SoundService';

export interface HeatmapCell {
  id: string;
  xDate: string;
  yLevel: number;
  intensity: number; // 1 to 26
  hours: number;
  tasksCompleted: number;
  notes: string;
  isSimulated?: boolean;
}

export function InteractiveWalkHeatmap() {
  const { focusSessions, quests, addFocusSession, addXp } = useQuestly();
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [quickLogMins, setQuickLogMins] = useState<number>(45);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // Exact color scale matching the user's reference image:
  // Purple (1) -> Lavender -> White -> Soft Green -> Emerald Green (26)
  const getCellColor = (val: number) => {
    if (val <= 4) return 'bg-[#3B0764] border-[#4C0E82] text-purple-200'; // Deep Dark Purple
    if (val <= 8) return 'bg-[#7E22CE] border-[#9333EA] text-purple-100'; // Royal Purple
    if (val <= 12) return 'bg-[#C084FC] border-[#D8B4FE] text-purple-900'; // Lavender
    if (val <= 16) return 'bg-[#F5F3FF] border-[#EDE9FE] text-zinc-900'; // Off-White / Cream
    if (val <= 21) return 'bg-[#86EFAC] border-[#4ADE80] text-emerald-950'; // Bright Mint Green
    return 'bg-[#15803D] border-[#166534] text-emerald-100'; // Deep Emerald Green (26)
  };

  // Derive real columns from user focus sessions and completed quests
  const realWalkColumns = useMemo(() => {
    // Group activity by ISO week or month
    const now = new Date();
    const columns: {
      id: string;
      label: string;
      cells: HeatmapCell[];
    }[] = [];

    // Create 8 dynamic time slots (e.g. past 8 weeks up to today)
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * 7);
      const weekLabel = `Wk ${Math.ceil(d.getDate() / 7)} (${d.toLocaleString('default', { month: 'short' })})`;
      const weekStartMs = new Date(d).setDate(d.getDate() - 6);
      const weekEndMs = d.getTime();

      // Find user sessions in this window
      const sessionsInWindow = focusSessions.filter(
        (s) => s.startedAt >= weekStartMs && s.startedAt <= weekEndMs
      );
      const totalSecs = sessionsInWindow.reduce((acc, s) => acc + s.elapsedSeconds, 0);
      const totalHours = Math.round((totalSecs / 3600) * 10) / 10;

      // Find user completed quests in this window
      const completedQuests = quests.filter((q) => q.status === 'COMPLETED');
      const tasksCount = completedQuests.length;

      // Map to y-levels: 4, 6, 8, 10, 12, 14
      // Determine base level from user effort
      const baseLevel = Math.min(14, Math.max(4, Math.round(4 + totalHours * 1.5)));
      const intensity = Math.min(26, Math.max(1, Math.round(totalHours * 3 + tasksCount * 2) || 1));

      // Build 1 to 3 vertically stacked blocks for the random walk effect
      const levels = [baseLevel];
      if (totalHours > 2) levels.push(Math.min(14, baseLevel + 2));
      if (totalHours > 5) levels.push(Math.max(4, baseLevel - 2));

      const cells: HeatmapCell[] = levels.map((lvl) => ({
        id: `real-${weekLabel}-${lvl}`,
        xDate: weekLabel,
        yLevel: lvl,
        intensity: intensity,
        hours: totalHours,
        tasksCompleted: tasksCount,
        notes:
          totalHours > 0
            ? `${totalHours} hrs logged • ${sessionsInWindow.length} focus sprints`
            : 'No activity recorded in this period',
        isSimulated: false,
      }));

      columns.push({
        id: `col-${i}`,
        label: i % 2 === 0 ? d.toLocaleString('default', { month: 'short', day: 'numeric' }) : '',
        cells: totalHours > 0 || tasksCount > 0 ? cells : [],
      });
    }

    return columns;
  }, [focusSessions, quests]);

  // Demo Simulation matching the user's reference screenshot pattern
  const demoWalkColumns = useMemo(() => {
    const months = [
      { id: '2024-05', label: '2024-05', values: [6, 7], intensities: [3, 19] },
      { id: '2024-06', label: '2024-06', values: [5, 6, 7, 8], intensities: [2, 23, 7, 14] },
      { id: '2024-07', label: '', values: [4, 5, 6], intensities: [5, 18, 15] },
      { id: '2024-08', label: '2024-08', values: [7, 8, 9, 10], intensities: [1, 10, 19, 4] },
      { id: '2024-09', label: '', values: [10, 11], intensities: [22, 14] },
      { id: '2024-10', label: '2024-10', values: [10, 11, 12], intensities: [14, 16, 2] },
      { id: '2024-11', label: '', values: [11, 12, 13], intensities: [12, 15, 3] },
      { id: '2024-12', label: '2024-12', values: [12, 13, 14], intensities: [17, 20, 14] },
    ];

    return months.map((m) => {
      const colCells: HeatmapCell[] = m.values.map((level, rowIdx) => {
        const intensity = m.intensities[rowIdx] || 12;
        return {
          id: `demo-${m.id}-lvl-${level}`,
          xDate: m.id,
          yLevel: level,
          intensity,
          hours: Math.round(level * 0.8 * 10) / 10,
          tasksCompleted: Math.max(1, Math.round(intensity / 4)),
          notes:
            intensity > 18
              ? 'Peak Flow Sprint: Coursework and proofs'
              : intensity > 10
              ? 'Steady Sprint: Problem sets'
              : 'Active recall and flashcards',
          isSimulated: true,
        };
      });

      return {
        id: m.id,
        label: m.label,
        cells: colCells,
      };
    });
  }, []);

  const hasRealActivity = realWalkColumns.some((col) => col.cells.length > 0);
  const activeColumns = previewMode || !hasRealActivity ? (previewMode ? demoWalkColumns : realWalkColumns) : realWalkColumns;

  const yLevels = [14, 12, 10, 8, 6, 4];

  const handleSelect = (cell: HeatmapCell) => {
    sound.playButtonClick();
    setSelectedCell((prev) => (prev?.id === cell.id ? null : cell));
  };

  // Quick log focus session directly from heatmap
  const handleQuickLog = () => {
    sound.playButtonClick();
    const durationSec = quickLogMins * 60;
    addFocusSession({
      subjectId: 'general',
      topic: 'Momentum Study Sprint',
      sessionType: 'focus',
      scheduledMinutes: quickLogMins,
      elapsedSeconds: durationSec,
      completedEarly: false,
      xpEarned: Math.round(quickLogMins * 1.5),
      distractionsLogged: 0,
    });
    addXp(Math.round(quickLogMins * 1.5), `Logged ${quickLogMins}m Focus Session`);
    setShowLogModal(false);
  };

  return (
    <div className="w-full rounded-2xl bg-[#0D0F14] border border-white/[0.08] p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-xl space-y-4">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#86EFAC]" />
          <h3 className="text-sm font-bold text-zinc-100 tracking-tight font-display">
            Random Walk (over time)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <button
            onClick={() => {
              sound.playButtonClick();
              setPreviewMode(!previewMode);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors ${
              previewMode
                ? 'bg-purple-950/60 text-purple-200 border-purple-800'
                : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-zinc-200'
            }`}
          >
            {previewMode ? 'Simulation View' : 'Live User Data'}
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              setShowLogModal(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#86EFAC]/15 hover:bg-[#86EFAC]/25 border border-[#86EFAC]/30 text-[#86EFAC] text-[10px] font-mono font-bold transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Log Sprint</span>
          </button>
        </div>
      </div>

      {/* 2. Zero State when live user data has no sessions yet */}
      {!hasRealActivity && !previewMode ? (
        <div className="p-8 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] mx-auto flex items-center justify-center text-zinc-400">
            <TrendingUp className="w-5 h-5 text-[#86EFAC]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-200">Start Your Momentum Random Walk</h4>
            <p className="text-[11px] text-zinc-500 font-mono mt-1 max-w-xs mx-auto">
              Your walk trajectory plots automatically as you complete study sprints and finish tasks.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                sound.playButtonClick();
                setShowLogModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#86EFAC] text-[#090A0D] font-black text-xs font-display uppercase tracking-wider hover:bg-[#4ADE80] transition-colors"
            >
              + Log 45m Focus Session
            </button>
            <button
              onClick={() => {
                sound.playButtonClick();
                setPreviewMode(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] text-zinc-300 font-mono text-xs hover:bg-white/[0.1] transition-colors"
            >
              Preview Sample Walk
            </button>
          </div>
        </div>
      ) : (
        /* 3. Heatmap Chart Grid */
        <div className="relative w-full overflow-x-auto pb-1 select-none">
          <div className="min-w-[340px] flex gap-2">
            {/* Y-Axis scale (km / hours) */}
            <div className="flex flex-col justify-between py-1 text-[11px] font-mono text-zinc-500 text-right pr-2 shrink-0 border-r border-white/[0.06]">
              {yLevels.map((lvl) => (
                <div key={lvl} className="h-6 flex items-center justify-end">
                  {lvl} h
                </div>
              ))}
            </div>

            {/* Matrix Columns */}
            <div className="flex-1 flex justify-between gap-1 sm:gap-2">
              {activeColumns.map((col, colIdx) => (
                <div key={col.id || colIdx} className="flex-1 flex flex-col items-center">
                  {/* Vertical Column with 6 Y-Level Slots */}
                  <div className="w-full flex flex-col justify-between h-[150px] relative py-1">
                    {/* Horizontal background guideline */}
                    <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-white/[0.04] pointer-events-none" />

                    {yLevels.map((level) => {
                      const cell = col.cells.find((c) => c.yLevel === level);
                      const isSelected = selectedCell?.id === cell?.id;

                      if (!cell) {
                        return (
                          <div
                            key={level}
                            className="w-full h-5 rounded-sm border border-transparent"
                          />
                        );
                      }

                      return (
                        <button
                          key={cell.id}
                          onClick={() => handleSelect(cell)}
                          className={`w-full h-5 rounded-sm border transition-all duration-150 transform hover:scale-110 relative ${getCellColor(
                            cell.intensity
                          )} ${
                            isSelected
                              ? 'ring-2 ring-white scale-110 z-20 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                              : 'opacity-90 hover:opacity-100'
                          }`}
                          aria-label={`Date: ${cell.xDate}, Level: ${cell.yLevel}, Intensity: ${cell.intensity}`}
                        >
                          <span className="sr-only">Cell {cell.intensity}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* X-Axis Month / Date Label */}
                  <div className="h-5 mt-1 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                      {col.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Color Scale Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] font-mono text-zinc-400">
        <span className="text-zinc-500">1 (Base)</span>

        {/* Gradient Spectrum Bar matching the screenshot */}
        <div className="flex-1 mx-3 h-2 rounded-full overflow-hidden bg-gradient-to-r from-[#3B0764] via-[#C084FC] via-[#F5F3FF] via-[#86EFAC] to-[#15803D] opacity-90 shadow-inner" />

        <span className="text-zinc-400 font-bold">26 (Peak)</span>
      </div>

      {/* 5. Selected Cell Detail Drawer / Card */}
      {selectedCell && (
        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-mono space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#86EFAC]" />
              <span className="font-bold text-zinc-200">Session Checkpoint</span>
              {selectedCell.isSimulated && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/50 text-purple-200 border border-purple-700">
                  Preview
                </span>
              )}
            </div>
            <span className="text-zinc-400">{selectedCell.xDate}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 text-[11px]">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06]">
              <span className="text-zinc-500 block text-[9px]">FOCUS TIME</span>
              <strong className="text-zinc-200 font-bold">{selectedCell.hours} hrs</strong>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06]">
              <span className="text-zinc-500 block text-[9px]">TASKS DONE</span>
              <strong className="text-[#86EFAC] font-bold">{selectedCell.tasksCompleted}</strong>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06]">
              <span className="text-zinc-500 block text-[9px]">INTENSITY</span>
              <strong className="text-[#C084FC] font-bold">{selectedCell.intensity}/26</strong>
            </div>
          </div>

          <p className="text-[11px] text-zinc-300 leading-snug">{selectedCell.notes}</p>
        </div>
      )}

      {/* 6. Quick Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-2xl bg-[#111319] border border-white/[0.12] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-display">
                Log Focus Session
              </h4>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Duration (Minutes)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 45, 90].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setQuickLogMins(mins)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                        quickLogMins === mins
                          ? 'bg-[#86EFAC] text-[#090A0D] border-[#86EFAC]'
                          : 'bg-white/[0.04] text-zinc-300 border-white/[0.08]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-xs font-mono text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickLog}
                  className="px-4 py-1.5 rounded-xl bg-[#86EFAC] hover:bg-[#4ADE80] text-[#090A0D] text-xs font-black font-display uppercase tracking-wider"
                >
                  Confirm & Plot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { DashboardWidgetConfig, DashboardWidgetId } from '@/lib/types';
import { INITIAL_WIDGETS } from '@/lib/initialData';
import { X, ArrowUp, ArrowDown, Eye, EyeOff, LayoutGrid, RotateCcw } from 'lucide-react';
import { sound } from '@/common/SoundService';

export function WidgetManagerModal() {
  const { activeModal, setActiveModal, widgets, toggleWidget, reorderWidgets, showToast } =
    useQuestly();

  if (activeModal !== 'widgets' && activeModal !== 'widget_manager') {
    return null;
  }

  const sortedWidgets = [...widgets].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleToggle = (id: DashboardWidgetId) => {
    sound.playButtonClick();
    toggleWidget(id);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    sound.playButtonClick();
    const updated = [...sortedWidgets];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;

    // Re-assign order indices
    const normalized = updated.map((w, idx) => ({ ...w, orderIndex: idx }));
    reorderWidgets(normalized);
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedWidgets.length - 1) return;
    sound.playButtonClick();
    const updated = [...sortedWidgets];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;

    const normalized = updated.map((w, idx) => ({ ...w, orderIndex: idx }));
    reorderWidgets(normalized);
  };

  const handleResetDefaults = () => {
    sound.playButtonClick();
    reorderWidgets(INITIAL_WIDGETS);
    showToast({
      title: 'Widgets Reset',
      subtitle: 'Restored default dashboard widget layout',
      type: 'info',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="w-full max-w-lg bg-[#171717] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#383838] bg-[#1E1E1E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B5FF55] text-[#101010] flex items-center justify-center font-black">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F5F5F0] tracking-tight">Dashboard Widgets</h3>
              <p className="text-[11px] text-[#A1A1A1] font-mono">Toggle visibility and reorder workspace modules</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#252525] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Widget List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {sortedWidgets.map((widget, index) => {
            return (
              <div
                key={widget.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  widget.isEnabled
                    ? 'bg-[#1E1E1E] border-[#383838]'
                    : 'bg-[#141414] border-[#2A2A2A] opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded bg-[#252525] text-[11px] font-mono font-bold text-[#A1A1A1] flex items-center justify-center border border-[#383838]">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#F5F5F0] truncate">{widget.title}</h4>
                    <p className="text-[11px] text-[#A1A1A1] line-clamp-1">{widget.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Reorder Up */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#252525] disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sortedWidgets.length - 1}
                    className="p-1.5 rounded-lg text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#252525] disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    onClick={() => handleToggle(widget.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 border transition-all ${
                      widget.isEnabled
                        ? 'bg-[#B5FF55]/15 text-[#B5FF55] border-[#B5FF55]/40 hover:bg-[#B5FF55]/25'
                        : 'bg-[#252525] text-[#A1A1A1] border-[#383838] hover:text-[#F5F5F0]'
                    }`}
                  >
                    {widget.isEnabled ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#383838] bg-[#1E1E1E] flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1A1] hover:text-[#F5F5F0] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>

          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#101010] text-xs font-black transition-all brutal-shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

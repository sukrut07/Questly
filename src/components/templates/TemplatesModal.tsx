'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { Sparkles, X, Check, BookOpen, Clock, Calendar } from 'lucide-react';

export function TemplatesModal() {
  const { activeModal, setActiveModal, templates, subjects, instantiateTemplate } = useQuestly();
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [targetSubjectId, setTargetSubjectId] = useState(subjects[0]?.id || '');

  if (activeModal !== 'templates') return null;

  const currentTpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleApply = () => {
    if (currentTpl && targetSubjectId) {
      instantiateTemplate(currentTpl.id, targetSubjectId);
      setActiveModal(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-extrabold text-zinc-100">Academic Templates</h3>
              <p className="text-xs text-zinc-400">Prebuilt coursework & revision roadmaps</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 2 Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          {/* Templates List */}
          <div className="p-4 space-y-2 bg-zinc-950">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Available Templates</div>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTemplateId === tpl.id
                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <div className="text-xs font-bold">{tpl.title}</div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                  <span>{tpl.totalTasks} Tasks</span>
                  <span>•</span>
                  <span>{tpl.estimatedWeeks} wks</span>
                </div>
              </button>
            ))}
          </div>

          {/* Template Details & Target Subject */}
          <div className="md:col-span-2 p-6 space-y-5 bg-zinc-900/20">
            {currentTpl && (
              <>
                <div>
                  <h4 className="text-lg font-bold text-zinc-100">{currentTpl.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{currentTpl.description}</p>
                </div>

                {/* Target Subject Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-lime-400" />
                    Target Subject for Imported Tasks
                  </label>
                  <select
                    value={targetSubjectId}
                    onChange={(e) => setTargetSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tasks Preview */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Tasks Included ({currentTpl.tasks.length})
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentTpl.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-200">{task.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {task.estimatedMinutes}m
                          </span>
                        </div>
                        {task.subtasks.length > 0 && (
                          <div className="text-[11px] text-zinc-400 pl-2 border-l border-zinc-800 space-y-0.5">
                            {task.subtasks.map((st, sidx) => (
                              <div key={sidx}>• {st}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Imports {currentTpl?.tasks.length} actionable tasks with checklist subitems.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 text-xs font-extrabold shadow-md transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Apply Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

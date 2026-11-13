'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import {
  Inbox,
  Plus,
  ArrowRight,
  Trash2,
  ExternalLink,
  BookOpen,
  FileText,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

export function AcademicInboxView() {
  const {
    inbox,
    subjects,
    addInboxItem,
    deleteInboxItem,
    convertInboxItemToTask,
  } = useQuestly();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [type, setType] = useState<'task' | 'note' | 'reference' | 'deadline'>('task');
  const [suggestedSubjectId, setSuggestedSubjectId] = useState(subjects[0]?.id || '');

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addInboxItem({
      title: title.trim(),
      notes: notes.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      type,
      suggestedSubjectId: suggestedSubjectId || undefined,
    });

    setTitle('');
    setNotes('');
    setSourceUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-zinc-100 tracking-tight">Academic Inbox</h2>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
              {inbox.length} Items
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Frictionless staging queue for lecture instructions, quick problem notes, and reference links.
          </p>
        </div>
      </div>

      {/* Quick Capture Input Form */}
      <form
        onSubmit={handleCapture}
        className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300">Quick Academic Capture</span>
          <div className="flex items-center gap-1.5">
            {(['task', 'note', 'reference'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-md transition-colors ${
                  type === t
                    ? 'bg-lime-400 text-zinc-950 font-extrabold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Capture thought, paper title, or homework instruction..."
            className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lime-400"
          />

          <select
            value={suggestedSubjectId}
            onChange={(e) => setSuggestedSubjectId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional context, lecture slide number, or theorem formula..."
            className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://course-portal.edu/... (optional)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-zinc-950 text-xs font-extrabold shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Capture
            </button>
          </div>
        </div>
      </form>

      {/* Inbox Items Queue */}
      <div className="space-y-3">
        {inbox.length > 0 ? (
          inbox.map((item) => {
            const subject = subjects.find((s) => s.id === item.suggestedSubjectId);

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {item.type}
                    </span>
                    {subject && (
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: `${subject.colorHex}15`,
                          borderColor: `${subject.colorHex}40`,
                          color: subject.colorHex,
                        }}
                      >
                        {subject.code}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-500">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-100">{item.title}</h4>

                  {item.notes && <p className="text-xs text-zinc-400 leading-relaxed">{item.notes}</p>}

                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-lime-400 hover:underline pt-0.5"
                    >
                      <span>{item.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Triage Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => convertInboxItemToTask(item.id, item.suggestedSubjectId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400 text-lime-400 hover:text-zinc-950 border border-lime-400/30 text-xs font-bold transition-all"
                  >
                    <span>Triage to Task</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteInboxItem(item.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                    title="Dismiss"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-lime-400 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-200">Your Academic Inbox is empty</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Use the capture bar above or tap `Cmd+K` during lectures to stage thoughts, notes, and homework instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

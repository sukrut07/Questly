'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { Download, Upload, X, FileJson, FileSpreadsheet, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function DataBackupModal() {
  const {
    activeModal,
    setActiveModal,
    exportDataJson,
    exportTasksCsv,
    importDataJson,
    showToast,
  } = useQuestly();

  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  if (activeModal !== 'data_backup') return null;

  const handleDownloadJson = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questly_academic_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: 'JSON Backup Downloaded',
      subtitle: 'Complete academic snapshot saved',
      type: 'success',
    });
  };

  const handleDownloadCsv = () => {
    const csvStr = exportTasksCsv();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questly_academic_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: 'Tasks CSV Exported',
      subtitle: 'Tabular task records saved',
      type: 'success',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importDataJson(content);
        setImportStatus(res);
        if (res.success) {
          showToast({
            title: 'Backup Restored',
            subtitle: res.message,
            type: 'success',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-lime-400" />
            <div>
              <h3 className="text-base font-extrabold text-zinc-100">Data Backup & Export</h3>
              <p className="text-xs text-zinc-400">Export student records or restore verified backups</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Export Academic Data</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadJson}
                className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-lime-400/50 hover:bg-zinc-850 transition-all text-left"
              >
                <FileJson className="w-6 h-6 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-zinc-100">Complete JSON Backup</div>
                  <div className="text-[11px] text-zinc-400 mt-1">Full state: subjects, tasks, focus logs, and XP.</div>
                </div>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-400/50 hover:bg-zinc-850 transition-all text-left"
              >
                <FileSpreadsheet className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-zinc-100">Tasks CSV Spreadsheet</div>
                  <div className="text-[11px] text-zinc-400 mt-1">Tabular export for Excel, Notion, or Sheets.</div>
                </div>
              </button>
            </div>
          </div>

          {/* Import / Restore Section */}
          <div className="space-y-3 pt-4 border-t border-zinc-800/80">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Restore From Backup</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload a valid Questly JSON backup file. All structures will be validated before restoring.
            </p>

            <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-zinc-800 hover:border-lime-400/40 bg-zinc-900/30 cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-zinc-500 mb-2" />
              <span className="text-xs font-bold text-zinc-300">Choose JSON Backup File</span>
              <span className="text-[11px] text-zinc-500 mt-0.5">Supports .json exports</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            {importStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  importStatus.success
                    ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {importStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-900/40 border-t border-zinc-800 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


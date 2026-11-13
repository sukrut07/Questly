'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { AcademicWorkspace } from '@/lib/types';
import {
  FolderKanban,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function WorkspaceTrackerView() {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    deleteWorkspace,
    subjects,
    quests,
    deadlines,
    setActiveModal,
    setSelectedQuest,
    completeQuest,
    setCurrentTab,
  } = useQuestly();

  const [selectedViewId, setSelectedViewId] = useState<string | null>(
    activeWorkspaceId || (workspaces[0]?.id ?? null)
  );

  const selectedWorkspace = workspaces.find((w) => w.id === selectedViewId) || workspaces[0];

  const handleCreateWorkspace = () => {
    sound.playButtonClick();
    setActiveModal('new_workspace');
  };

  const handleSetActive = (id: string) => {
    sound.playButtonClick();
    setActiveWorkspaceId(id);
    setSelectedViewId(id);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Neon Accent */}
      <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutal-shadow relative overflow-hidden bg-graph-grid">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#42DFFF]/10 border border-[#42DFFF]/40 flex items-center justify-center text-[#42DFFF]">
              <FolderKanban className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-[#F5F5F0] tracking-tight font-display uppercase">
              Academic Workspaces
            </h1>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#42DFFF]/10 text-[#42DFFF] border border-[#42DFFF]/30">
              {workspaces.length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] font-mono max-w-xl">
            Isolate your courses, research projects, and exam sprints into dedicated operational environments.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleCreateWorkspace}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#42DFFF] hover:bg-[#35C5E3] text-[#090A0D] text-xs font-black transition-all brutal-shadow font-display uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Workspace</span>
          </button>
        </div>
      </div>

      {/* 2. Workspace Cards Slider / Grid */}
      {workspaces.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#171A21] border border-dashed border-[#303642] text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#42DFFF]/10 border border-[#42DFFF]/30 flex items-center justify-center text-[#42DFFF] mb-4">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#F5F5F0] mb-1 font-display uppercase">
            No Academic Workspaces Created Yet
          </h3>
          <p className="text-xs text-[#A1A1A1] font-mono max-w-md mb-6">
            Create your first workspace to organize related subjects, track project milestones, and maintain context across study sprints.
          </p>
          <button
            onClick={handleCreateWorkspace}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#42DFFF] text-[#090A0D] text-xs font-black brutal-shadow font-display uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create First Workspace</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => {
            const isCurrentActive = ws.id === activeWorkspaceId;
            const isSelected = ws.id === (selectedWorkspace?.id ?? '');
            const linkedSubjects = subjects.filter((s) => ws.subjectIds.includes(s.id));
            const linkedQuests = quests.filter((q) =>
              q.subjectId ? ws.subjectIds.includes(q.subjectId) : false
            );
            const completedCount = linkedQuests.filter((q) => q.status === 'COMPLETED').length;
            const progress = linkedQuests.length > 0
              ? Math.round((completedCount / linkedQuests.length) * 100)
              : 0;

            return (
              <div
                key={ws.id}
                onClick={() => setSelectedViewId(ws.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#1C2029] border-[#42DFFF] shadow-[0_0_20px_rgba(66,223,255,0.15)]'
                    : 'bg-[#171A21] border-[#303642] hover:border-[#42DFFF]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm text-[#090A0D] brutal-shadow shrink-0"
                      style={{ backgroundColor: ws.colorHex || '#42DFFF' }}
                    >
                      {ws.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#F5F5F0] tracking-tight font-display">
                        {ws.name}
                      </h3>
                      <p className="text-[11px] text-[#A1A1A1] font-mono truncate max-w-[160px]">
                        {ws.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  {isCurrentActive ? (
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-[#B5FF55]/10 text-[#B5FF55] border border-[#B5FF55]/40 shrink-0">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetActive(ws.id);
                      }}
                      className="text-[10px] font-mono font-bold text-[#A1A1A1] hover:text-[#42DFFF] px-2 py-0.5 rounded border border-[#303642] hover:border-[#42DFFF]/40 transition-colors shrink-0"
                    >
                      Select
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[10px] font-mono text-[#A1A1A1]">
                    <span>Task Completion</span>
                    <span className="font-bold text-[#F5F5F0]">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#090A0D] rounded-full overflow-hidden border border-[#303642]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: ws.colorHex || '#42DFFF',
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#303642] text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#A1A1A1]">
                    <BookOpen className="w-3.5 h-3.5 text-[#A879FF]" />
                    <span>{linkedSubjects.length} Subjects</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#A1A1A1]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF55]" />
                    <span>{completedCount}/{linkedQuests.length} Tasks</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Detailed Workspace View */}
      {selectedWorkspace && (
        <div className="p-6 rounded-2xl bg-[#171A21] border border-[#303642] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#303642]">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-lg text-[#090A0D] brutal-shadow shrink-0"
                style={{ backgroundColor: selectedWorkspace.colorHex || '#42DFFF' }}
              >
                {selectedWorkspace.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-[#F5F5F0] font-display">
                    {selectedWorkspace.name}
                  </h2>
                  {selectedWorkspace.id === activeWorkspaceId && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#B5FF55]/10 text-[#B5FF55] border border-[#B5FF55]/40">
                      PRIMARY WORKSPACE
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#A1A1A1] font-mono mt-0.5">
                  {selectedWorkspace.description || 'Configured academic track'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedWorkspace.id !== activeWorkspaceId && (
                <button
                  onClick={() => handleSetActive(selectedWorkspace.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#42DFFF]/10 border border-[#42DFFF]/40 text-[#42DFFF] text-xs font-mono font-bold hover:bg-[#42DFFF]/20 transition-all"
                >
                  Set as Active
                </button>
              )}
              {workspaces.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Delete workspace "${selectedWorkspace.name}"?`)) {
                      sound.playButtonClick();
                      deleteWorkspace(selectedWorkspace.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-[#1E1E1E] border border-[#383838] text-[#A1A1A1] hover:text-[#FF806B] hover:border-[#FF806B]/40 transition-colors"
                  title="Delete Workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Linked Subjects Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#A879FF]" />
                <span>Enrolled Subjects ({subjects.filter((s) => selectedWorkspace.subjectIds.includes(s.id)).length})</span>
              </h3>
              <button
                onClick={() => setCurrentTab('subjects')}
                className="text-[11px] font-mono text-[#A879FF] hover:underline flex items-center gap-1"
              >
                <span>Manage Subjects</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {subjects.filter((s) => selectedWorkspace.subjectIds.includes(s.id)).length === 0 ? (
              <div className="p-4 rounded-xl bg-[#111319] border border-[#303642] text-xs font-mono text-[#A1A1A1] text-center">
                No subjects assigned to this workspace yet. Link your course subjects in the workspace settings.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subjects
                  .filter((s) => selectedWorkspace.subjectIds.includes(s.id))
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl bg-[#111319] border border-[#303642] hover:border-[#A879FF]/50 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sub.colorHex || '#A879FF' }}
                        />
                        <span className="text-xs font-mono font-bold text-[#F5F5F0] truncate">
                          {sub.code} - {sub.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-[#A1A1A1]">
                        <span>Syllabus: {sub.syllabusProgress}%</span>
                        <span>{sub.credits} Credits</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Workspace Active Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF55]" />
                <span>Workspace Tasks</span>
              </h3>
              <button
                onClick={() => {
                  sound.playButtonClick();
                  setSelectedQuest(null);
                  setActiveModal('new_task');
                }}
                className="text-[11px] font-mono text-[#B5FF55] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {quests.filter((q) =>
              q.subjectId ? selectedWorkspace.subjectIds.includes(q.subjectId) : false
            ).length === 0 ? (
              <div className="p-4 rounded-xl bg-[#111319] border border-[#303642] text-xs font-mono text-[#A1A1A1] text-center">
                No active tasks linked to this workspace. Add a task to jumpstart this study track.
              </div>
            ) : (
              <div className="space-y-2">
                {quests
                  .filter((q) =>
                    q.subjectId ? selectedWorkspace.subjectIds.includes(q.subjectId) : false
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl bg-[#111319] border border-[#303642] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => completeQuest(task.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            task.status === 'COMPLETED'
                              ? 'bg-[#B5FF55] border-[#B5FF55] text-[#090A0D]'
                              : 'border-[#303642] hover:border-[#B5FF55]'
                          }`}
                        >
                          {task.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <span
                          className={`text-xs font-mono ${
                            task.status === 'COMPLETED'
                              ? 'text-[#A1A1A1] line-through'
                              : 'text-[#F5F5F0]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171A21] border border-[#303642] text-[#B5FF55]">
                        +{task.xpReward} XP
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


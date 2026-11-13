'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { AcademicSubject } from '@/lib/types';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export function SubjectsView() {
  const { subjects, toggleTopicChecklist, setSelectedSubject, selectedSubject } = useQuestly();
  const [expandedSubjectId, setExpandedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [expandedModuleId, setExpandedModuleId] = useState<string>(subjects[0]?.modules[0]?.id || '');

  const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
  const averageSyllabus = Math.round(
    subjects.reduce((acc, s) => acc + s.syllabusProgress, 0) / Math.max(1, subjects.length)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-lime-400" />
            <h2 className="text-xl font-black text-zinc-100 tracking-tight">Coursework & Syllabus</h2>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30">
              Semester 3
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {subjects.length} Enrolled Courses • {totalCredits} Credits Total • {averageSyllabus}% Average Syllabus Completed
          </p>
        </div>

        {/* Aggregate Progress Pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
          <GraduationCap className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-xs font-black text-zinc-200">Syllabus Mastery</div>
            <div className="text-[11px] text-zinc-400 font-mono">{averageSyllabus}% on track</div>
          </div>
        </div>
      </div>

      {/* Courses Accordion List */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const isExpanded = expandedSubjectId === subject.id;

          return (
            <div
              key={subject.id}
              className={`rounded-2xl border transition-all ${
                isExpanded ? 'bg-zinc-950 border-zinc-700 shadow-md' : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Subject Summary Header */}
              <button
                onClick={() => setExpandedSubjectId(isExpanded ? '' : subject.id)}
                className="w-full p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 sm:mt-0"
                    style={{ backgroundColor: subject.colorHex }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold" style={{ color: subject.colorHex }}>
                        {subject.code}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {subject.credits} Credits
                      </span>
                      {subject.targetGrade && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300">
                          Target: {subject.targetGrade}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mt-0.5">{subject.name}</h3>
                    {subject.instructorName && (
                      <p className="text-xs text-zinc-500 mt-0.5">{subject.instructorName}</p>
                    )}
                  </div>
                </div>

                {/* Right Progress & Toggle */}
                <div className="flex items-center gap-5 shrink-0">
                  <div className="w-36 text-right">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-1">
                      <span>Syllabus</span>
                      <span>{subject.syllabusProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${subject.syllabusProgress}%`,
                          backgroundColor: subject.colorHex,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-1 rounded-lg bg-zinc-900 text-zinc-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Expanded Modules & Topics View */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-zinc-800/80 space-y-4">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-4">
                    Syllabus Breakdown ({subject.modules.length} Modules)
                  </div>

                  <div className="space-y-3">
                    {subject.modules.map((mod) => {
                      const isModOpen = expandedModuleId === mod.id;

                      return (
                        <div key={mod.id} className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                          <button
                            onClick={() => setExpandedModuleId(isModOpen ? '' : mod.id)}
                            className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-zinc-200 hover:bg-zinc-850"
                          >
                            <span>{mod.title}</span>
                            <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-2">
                              <span>{mod.topics.filter((t) => t.isCompleted).length} / {mod.topics.length} Topics</span>
                              {isModOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </span>
                          </button>

                          {isModOpen && (
                            <div className="p-4 pt-1 space-y-3 border-t border-zinc-800/60">
                              {mod.topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {topic.isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-lime-400" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-zinc-600" />
                                      )}
                                      <span
                                        className={`text-xs font-bold ${
                                          topic.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-200'
                                        }`}
                                      >
                                        {topic.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                                        {topic.difficulty}
                                      </span>
                                      <span className="text-[10px] font-mono text-zinc-500">
                                        {topic.estimatedMinutes}m
                                      </span>
                                    </div>
                                  </div>

                                  {/* Interactive Checklists */}
                                  {topic.checklists.length > 0 && (
                                    <div className="pl-6 space-y-1.5 border-l border-zinc-850 ml-2">
                                      {topic.checklists.map((chk) => (
                                        <button
                                          key={chk.id}
                                          onClick={() =>
                                            toggleTopicChecklist(subject.id, mod.id, topic.id, chk.id)
                                          }
                                          className="w-full flex items-center gap-2 text-left text-xs group"
                                        >
                                          {chk.isCompleted ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                                          ) : (
                                            <Circle className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
                                          )}
                                          <span
                                            className={`${
                                              chk.isCompleted
                                                ? 'text-zinc-500 line-through'
                                                : 'text-zinc-300 group-hover:text-zinc-100'
                                            }`}
                                          >
                                            {chk.title}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

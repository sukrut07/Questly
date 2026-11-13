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
  Trash2,
  Edit2,
  GraduationCap,
  Sparkles,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { sound } from '@/common/SoundService';

export function SubjectsView() {
  const {
    subjects,
    setActiveModal,
    setSelectedSubject,
    deleteSubject,
    addModule,
    deleteModule,
    addTopic,
    deleteTopic,
    addChecklistItem,
    toggleTopicChecklist,
    showToast,
  } = useQuestly();

  const [expandedSubjectId, setExpandedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [expandedModuleId, setExpandedModuleId] = useState<string>(subjects[0]?.modules[0]?.id || '');

  // Inline creation states
  const [newModuleTitle, setNewModuleTitle] = useState<{ [subjectId: string]: string }>({});
  const [newTopicTitle, setNewTopicTitle] = useState<{ [modId: string]: string }>({});
  const [newChecklistTitle, setNewChecklistTitle] = useState<{ [topicId: string]: string }>({});

  const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
  const averageSyllabus = Math.round(
    subjects.reduce((acc, s) => acc + s.syllabusProgress, 0) / Math.max(1, subjects.length)
  );

  const handleAddModule = (subjectId: string) => {
    const title = (newModuleTitle[subjectId] || '').trim();
    if (!title) return;
    sound.playButtonClick();
    addModule(subjectId, title);
    setNewModuleTitle({ ...newModuleTitle, [subjectId]: '' });
    showToast({
      title: 'Module Added',
      subtitle: title,
      type: 'success',
    });
  };

  const handleAddTopic = (subjectId: string, moduleId: string) => {
    const title = (newTopicTitle[moduleId] || '').trim();
    if (!title) return;
    sound.playButtonClick();
    addTopic(subjectId, moduleId, {
      title,
      difficulty: 'intermediate',
      estimatedMinutes: 60,
    });
    setNewTopicTitle({ ...newTopicTitle, [moduleId]: '' });
    showToast({
      title: 'Topic Added',
      subtitle: title,
      type: 'success',
    });
  };

  const handleAddChecklist = (subjectId: string, moduleId: string, topicId: string) => {
    const title = (newChecklistTitle[topicId] || '').trim();
    if (!title) return;
    sound.playButtonClick();
    addChecklistItem(subjectId, moduleId, topicId, title);
    setNewChecklistTitle({ ...newChecklistTitle, [topicId]: '' });
  };

  const handleDeleteSubject = (e: React.MouseEvent, subject: AcademicSubject) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${subject.code}: ${subject.name}?`)) {
      sound.playButtonClick();
      deleteSubject(subject.id);
      showToast({
        title: 'Course Removed',
        subtitle: `${subject.code} deleted`,
        type: 'info',
      });
    }
  };

  const handleEditSubject = (e: React.MouseEvent, subject: AcademicSubject) => {
    e.stopPropagation();
    setSelectedSubject(subject);
    setActiveModal('edit_subject');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#171717] border border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutal-shadow relative overflow-hidden bg-graph-grid">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <BookOpen className="w-5 h-5 text-[#B5FF55]" />
            <h2 className="text-xl font-black text-[#F5F5F0] tracking-tight">Coursework & Syllabus</h2>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#B5FF55]/10 text-[#B5FF55] border border-[#B5FF55]/30">
              Curriculum OS
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] font-mono">
            {subjects.length} Enrolled Courses • {totalCredits} Credits Total • {averageSyllabus}% Average Syllabus Completed
          </p>
        </div>

        {/* Action Button & Progress Pill */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveModal('new_subject')}
            className="px-4 py-2 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#101010] text-xs font-black transition-all brutal-shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Enroll Course</span>
          </button>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#1E1E1E] border border-[#383838]">
            <GraduationCap className="w-4 h-4 text-[#B9A3FF]" />
            <div className="text-xs font-mono font-bold text-[#F5F5F0]">
              {averageSyllabus}% <span className="text-[10px] text-[#A1A1A1]">Mastery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Accordion List */}
      <div className="space-y-4">
        {subjects.length > 0 ? (
          subjects.map((subject) => {
            const isExpanded = expandedSubjectId === subject.id;

            return (
              <div
                key={subject.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'bg-[#171717] border-[#4A4A4A] brutal-shadow'
                    : 'bg-[#171717]/80 border-[#383838] hover:border-[#4A4A4A]'
                }`}
              >
                {/* Subject Summary Header */}
                <div
                  onClick={() => setExpandedSubjectId(isExpanded ? '' : subject.id)}
                  className="w-full p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 sm:mt-0"
                      style={{ backgroundColor: subject.colorHex }}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-black" style={{ color: subject.colorHex }}>
                          {subject.code}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.2 rounded bg-[#1E1E1E] text-[#A1A1A1] border border-[#383838]">
                          {subject.credits} Credits
                        </span>
                        {subject.targetGrade && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1E1E1E] text-[#F5F5F0]">
                            Target: {subject.targetGrade}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#F5F5F0] mt-0.5">{subject.name}</h3>
                      {subject.instructorName && (
                        <p className="text-xs text-[#A1A1A1] mt-0.5">{subject.instructorName}</p>
                      )}
                    </div>
                  </div>

                  {/* Right Progress, Actions & Toggle */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-32 text-right">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#F5F5F0] mb-1">
                        <span>Syllabus</span>
                        <span>{subject.syllabusProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#1E1E1E] border border-[#383838] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${subject.syllabusProgress}%`,
                            backgroundColor: subject.colorHex,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleEditSubject(e, subject)}
                        className="p-1.5 rounded-lg text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#1E1E1E] transition-colors"
                        title="Edit Course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSubject(e, subject)}
                        className="p-1.5 rounded-lg text-[#A1A1A1] hover:text-[#FF806B] hover:bg-[#1E1E1E] transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-1.5 rounded-lg bg-[#1E1E1E] text-[#A1A1A1] border border-[#383838]">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Modules & Topics View */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-[#383838] space-y-4">
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-[11px] font-mono font-bold text-[#A1A1A1] uppercase tracking-wider">
                        Syllabus Breakdown ({subject.modules.length} Modules)
                      </div>
                    </div>

                    {/* Add Module Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newModuleTitle[subject.id] || ''}
                        onChange={(e) =>
                          setNewModuleTitle({ ...newModuleTitle, [subject.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddModule(subject.id);
                        }}
                        placeholder="Add module (e.g. Module 1: Trees & Graphs)..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs text-[#F5F5F0] placeholder-[#737373] focus:outline-none focus:border-[#B5FF55]"
                      />
                      <button
                        onClick={() => handleAddModule(subject.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#252525] hover:bg-[#2E2E2E] text-[#F5F5F0] border border-[#383838] text-xs font-mono transition-colors"
                      >
                        + Add Module
                      </button>
                    </div>

                    <div className="space-y-3">
                      {subject.modules.map((mod) => {
                        const isModOpen = expandedModuleId === mod.id;

                        return (
                          <div key={mod.id} className="rounded-xl bg-[#1E1E1E] border border-[#383838] overflow-hidden">
                            <div className="p-3.5 flex items-center justify-between gap-3 text-xs font-bold text-[#F5F5F0] hover:bg-[#252525]">
                              <button
                                onClick={() => setExpandedModuleId(isModOpen ? '' : mod.id)}
                                className="flex-1 text-left flex items-center justify-between gap-3"
                              >
                                <span>{mod.title}</span>
                                <span className="text-[11px] text-[#A1A1A1] font-mono flex items-center gap-2">
                                  <span>
                                    {mod.topics.filter((t) => t.isCompleted).length} / {mod.topics.length} Topics
                                  </span>
                                  {isModOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </span>
                              </button>

                              <button
                                onClick={() => deleteModule(subject.id, mod.id)}
                                className="p-1 rounded text-[#737373] hover:text-[#FF806B] hover:bg-[#1E1E1E]"
                                title="Delete Module"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {isModOpen && (
                              <div className="p-4 pt-1 space-y-3 border-t border-[#383838]">
                                {/* Add Topic Input */}
                                <div className="flex items-center gap-2 pt-2">
                                  <input
                                    type="text"
                                    value={newTopicTitle[mod.id] || ''}
                                    onChange={(e) =>
                                      setNewTopicTitle({ ...newTopicTitle, [mod.id]: e.target.value })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddTopic(subject.id, mod.id);
                                    }}
                                    placeholder="Add topic (e.g. AVL Tree Rotations)..."
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#383838] text-xs text-[#F5F5F0] placeholder-[#737373] focus:outline-none focus:border-[#B5FF55]"
                                  />
                                  <button
                                    onClick={() => handleAddTopic(subject.id, mod.id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#252525] hover:bg-[#2E2E2E] text-[#B5FF55] border border-[#383838] text-xs font-mono transition-colors"
                                  >
                                    + Add Topic
                                  </button>
                                </div>

                                {mod.topics.map((topic) => (
                                  <div
                                    key={topic.id}
                                    className="p-3.5 rounded-xl bg-[#141414] border border-[#383838] space-y-2.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {topic.isCompleted ? (
                                          <CheckCircle2 className="w-4 h-4 text-[#B5FF55]" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-[#737373]" />
                                        )}
                                        <span
                                          className={`text-xs font-bold ${
                                            topic.isCompleted ? 'text-[#737373] line-through' : 'text-[#F5F5F0]'
                                          }`}
                                        >
                                          {topic.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1E1E] text-[#A1A1A1] border border-[#383838]">
                                          {topic.difficulty}
                                        </span>
                                        <span className="text-[10px] font-mono text-[#737373]">
                                          {topic.estimatedMinutes}m
                                        </span>
                                        <button
                                          onClick={() => deleteTopic(subject.id, mod.id, topic.id)}
                                          className="p-1 rounded text-[#737373] hover:text-[#FF806B]"
                                          title="Delete Topic"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Interactive Checklists */}
                                    <div className="pl-6 space-y-2 border-l border-[#2E2E2E] ml-2">
                                      {topic.checklists.map((chk) => (
                                        <button
                                          key={chk.id}
                                          onClick={() =>
                                            toggleTopicChecklist(subject.id, mod.id, topic.id, chk.id)
                                          }
                                          className="w-full flex items-center gap-2 text-left text-xs group"
                                        >
                                          {chk.isCompleted ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF55] shrink-0" />
                                          ) : (
                                            <Circle className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#A1A1A1] shrink-0" />
                                          )}
                                          <span
                                            className={`${
                                              chk.isCompleted
                                                ? 'text-[#737373] line-through'
                                                : 'text-[#D4D4D4] group-hover:text-[#F5F5F0]'
                                            }`}
                                          >
                                            {chk.title}
                                          </span>
                                        </button>
                                      ))}

                                      {/* Add Checklist Input */}
                                      <div className="flex items-center gap-2 pt-1">
                                        <input
                                          type="text"
                                          value={newChecklistTitle[topic.id] || ''}
                                          onChange={(e) =>
                                            setNewChecklistTitle({
                                              ...newChecklistTitle,
                                              [topic.id]: e.target.value,
                                            })
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter')
                                              handleAddChecklist(subject.id, mod.id, topic.id);
                                          }}
                                          placeholder="+ Add checklist item..."
                                          className="flex-1 px-2.5 py-1 rounded bg-[#1E1E1E] border border-[#383838] text-[11px] text-[#F5F5F0] placeholder-[#737373] focus:outline-none focus:border-[#B5FF55]"
                                        />
                                        <button
                                          onClick={() =>
                                            handleAddChecklist(subject.id, mod.id, topic.id)
                                          }
                                          className="px-2 py-1 rounded bg-[#252525] text-[10px] font-mono text-[#B5FF55] border border-[#383838]"
                                        >
                                          + Add
                                        </button>
                                      </div>
                                    </div>
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
          })
        ) : (
          <div className="p-12 text-center bg-[#171717] rounded-2xl border border-[#383838] space-y-4 brutal-shadow bg-graph-grid">
            <div className="w-14 h-14 rounded-2xl bg-[#B5FF55]/10 border border-[#B5FF55]/30 text-[#B5FF55] flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F5F5F0]">No courses enrolled yet</h3>
              <p className="text-xs text-[#A1A1A1] mt-1 max-w-md mx-auto">
                Set up your academic subjects, syllabus modules, and topics to start tracking completion, or import prebuilt academic templates.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal('new_subject')}
                className="px-5 py-2.5 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#101010] text-xs font-black transition-all brutal-shadow"
              >
                + Enroll First Course
              </button>
              <button
                onClick={() => setActiveModal('templates')}
                className="px-5 py-2.5 rounded-xl bg-[#1E1E1E] hover:bg-[#252525] text-[#F5F5F0] border border-[#383838] text-xs font-mono transition-colors"
              >
                Browse Templates
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuestly } from '@/lib/store';
import { TaskType, QuestDifficulty, QuestPriority } from '@/lib/types';
import { Sparkles, X, Check, BookOpen, Clock, Calendar } from 'lucide-react';
import { sound } from '@/common/SoundService';

interface AcademicTemplateTask {
  title: string;
  description: string;
  taskType: TaskType;
  difficulty: QuestDifficulty;
  priority: QuestPriority;
  estimatedMinutes: number;
  subtasks: string[];
}

interface AcademicTemplate {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  tasks: AcademicTemplateTask[];
}

const PREBUILT_TEMPLATES: AcademicTemplate[] = [
  {
    id: 'dsa_bootcamp',
    title: 'Data Structures & Algorithms Sprint',
    description: 'Core algorithmic patterns: trees, graph traversals, and dynamic programming.',
    estimatedWeeks: 4,
    tasks: [
      {
        title: 'Binary Search & Two-Pointer Patterns',
        description: 'Implement binary search bounds and solve 4 classic array problems.',
        taskType: 'problem_solving',
        difficulty: 'MEDIUM',
        priority: 'HIGH',
        estimatedMinutes: 60,
        subtasks: [
          'Review lower_bound and upper_bound binary search invariants',
          'Solve 3 two-pointer partition problems',
          'Document time and auxiliary space complexities',
        ],
      },
      {
        title: 'Binary Search Trees & AVL Rotations',
        description: 'Understand height balance factors and self-balancing rotations.',
        taskType: 'coding',
        difficulty: 'HARD',
        priority: 'HIGH',
        estimatedMinutes: 75,
        subtasks: [
          'Implement Left and Right AVL tree rotations',
          'Verify O(log N) worst-case search and insertion guarantees',
          'Write unit tests for edge-case node removals',
        ],
      },
      {
        title: 'Graph Shortest Paths: Dijkstra & Bellman-Ford',
        description: 'Priority queue implementation and handling of negative cycle detection.',
        taskType: 'coding',
        difficulty: 'HARD',
        priority: 'MEDIUM',
        estimatedMinutes: 90,
        subtasks: [
          'Code min-heap Dijkstra using adjacency list',
          'Implement Bellman-Ford algorithm for negative edge weights',
          'Trace runtime complexity comparisons',
        ],
      },
      {
        title: 'Dynamic Programming: Knapsack & Subsequences',
        description: 'State transitions, memoization tables, and space-optimized tabulation.',
        taskType: 'problem_solving',
        difficulty: 'HARD',
        priority: 'HIGH',
        estimatedMinutes: 90,
        subtasks: [
          'Derive recurrence relation for 0/1 Knapsack problem',
          'Convert recursive memoization to 1D iterative array',
          'Solve Longest Common Subsequence problem',
        ],
      },
    ],
  },
  {
    id: 'exam_crunch',
    title: '14-Day Examination Crunch',
    description: 'Structured spaced revision and timed past papers for high-stakes exams.',
    estimatedWeeks: 2,
    tasks: [
      {
        title: 'Syllabus Coverage Audit & Flash Synthesis',
        description: 'Condense lecture slide decks and textbook chapters into 2-page summary sheets.',
        taskType: 'revision',
        difficulty: 'MEDIUM',
        priority: 'HIGH',
        estimatedMinutes: 60,
        subtasks: [
          'Catalog all required midterm examinable modules',
          'Create formula and theorem summary cheat-sheet',
          'Identify top 3 weakest topic areas',
        ],
      },
      {
        title: 'Timed Past Examination Paper 1',
        description: 'Complete full previous year examination under strict exam conditions.',
        taskType: 'problem_solving',
        difficulty: 'HARD',
        priority: 'URGENT',
        estimatedMinutes: 90,
        subtasks: [
          'Set a 90-minute uninterrupted countdown timer',
          'Complete all sections without reference materials',
          'Mark against official rubric and record error log',
        ],
      },
      {
        title: 'Mistake Analysis & Weakness Remediation',
        description: 'Targeted drill on every question missed in timed practice.',
        taskType: 'problem_solving',
        difficulty: 'MEDIUM',
        priority: 'HIGH',
        estimatedMinutes: 45,
        subtasks: [
          'Re-solve every missed problem from scratch',
          'Write explanatory notes on foundational misunderstandings',
        ],
      },
      {
        title: 'Final Pre-Exam Rapid Recall Drill',
        description: 'Fast active recall review of definitions, theorems, and edge cases.',
        taskType: 'revision',
        difficulty: 'EASY',
        priority: 'URGENT',
        estimatedMinutes: 30,
        subtasks: [
          'Review all formula derivations',
          'Confirm exam hall equipment, calculators, and pencils',
        ],
      },
    ],
  },
  {
    id: 'research_paper',
    title: 'Research Paper & Thesis Deliverable',
    description: 'End-to-end milestone workflow from literature review to camera-ready LaTeX.',
    estimatedWeeks: 6,
    tasks: [
      {
        title: 'Literature Review & Annotated Bibliography',
        description: 'Survey 8 key academic papers in the problem domain.',
        taskType: 'reading',
        difficulty: 'HARD',
        priority: 'MEDIUM',
        estimatedMinutes: 90,
        subtasks: [
          'Extract primary contribution and baseline metrics from 8 papers',
          'Synthesize comparative matrix of existing methodologies',
          'Highlight unsolved limitations our paper addresses',
        ],
      },
      {
        title: 'Methodology & Algorithmic Formulation',
        description: 'Formalize mathematical model and pseudocode specification.',
        taskType: 'writing',
        difficulty: 'HARD',
        priority: 'HIGH',
        estimatedMinutes: 90,
        subtasks: [
          'Write formal problem statement and notation table',
          'Author LaTeX algorithm environment with clear inputs and outputs',
        ],
      },
      {
        title: 'Empirical Benchmarking & Results Plotting',
        description: 'Execute evaluation test harness and generate publication-quality figures.',
        taskType: 'coding',
        difficulty: 'HARD',
        priority: 'HIGH',
        estimatedMinutes: 120,
        subtasks: [
          'Run automated benchmark suite across 5 seeds',
          'Generate SVG/PDF comparison charts with error bars',
          'Tabulate p-values and statistical significance tests',
        ],
      },
      {
        title: 'Proofreading & LaTeX Camera-Ready Formatting',
        description: 'Format according to ACM/IEEE conference guidelines and proofread prose.',
        taskType: 'writing',
        difficulty: 'MEDIUM',
        priority: 'URGENT',
        estimatedMinutes: 60,
        subtasks: [
          'Verify bibliography BibTeX entries for missing DOIs or venues',
          'Check page budget and caption alignments',
          'Perform spellcheck and style check pass',
        ],
      },
    ],
  },
  {
    id: 'semester_launch',
    title: 'New Semester Setup & Syllabus Onboarding',
    description: 'Map courses, professors, lecture locations, and grade weightings.',
    estimatedWeeks: 1,
    tasks: [
      {
        title: 'Course Syllabus & Grading Weights Audit',
        description: 'Extract attendance policies, midterms, quizzes, and project weights.',
        taskType: 'reading',
        difficulty: 'EASY',
        priority: 'HIGH',
        estimatedMinutes: 30,
        subtasks: [
          'Record target grade and credit hours for all courses',
          'Identify major assignment deliverables and exam dates',
        ],
      },
      {
        title: 'Weekly Lecture & Lab Timetable Entry',
        description: 'Configure class schedule, rooms, and professors.',
        taskType: 'revision',
        difficulty: 'EASY',
        priority: 'MEDIUM',
        estimatedMinutes: 30,
        subtasks: [
          'Add lecture rooms and office hour slots into calendar',
          'Set up recurring weekly study blocks',
        ],
      },
    ],
  },
];

export function TemplatesModal() {
  const { activeModal, setActiveModal, subjects, createQuest, showToast } = useQuestly();
  const [selectedTemplateId, setSelectedTemplateId] = useState(PREBUILT_TEMPLATES[0].id);
  const [targetSubjectId, setTargetSubjectId] = useState(subjects[0]?.id || '');

  if (activeModal !== 'templates') return null;

  const currentTpl =
    PREBUILT_TEMPLATES.find((t) => t.id === selectedTemplateId) || PREBUILT_TEMPLATES[0];

  const handleApply = () => {
    sound.playQuestComplete();

    const matchedSubject = subjects.find((s) => s.id === targetSubjectId);

    // Instantiate all tasks from the template
    currentTpl.tasks.forEach((t) => {
      createQuest({
        title: t.title,
        description: t.description,
        subjectId: matchedSubject ? matchedSubject.id : undefined,
        subjectCode: matchedSubject ? matchedSubject.code : undefined,
        subjectColorHex: matchedSubject ? matchedSubject.colorHex : undefined,
        taskType: t.taskType,
        difficulty: t.difficulty,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'NOT_STARTED',
        xpReward: t.difficulty === 'HARD' ? 50 : t.difficulty === 'MEDIUM' ? 30 : 20,
        isRecurring: false,
        subtasks: t.subtasks.map((st, idx) => ({
          id: `st_${Date.now()}_${idx}`,
          title: st,
          isCompleted: false,
        })),
      });
    });

    showToast({
      title: 'Template Applied!',
      subtitle: `Imported ${currentTpl.tasks.length} tasks from ${currentTpl.title}`,
      type: 'success',
    });

    setActiveModal(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="w-full max-w-3xl bg-[#171717] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#383838] bg-[#1E1E1E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B9A3FF] text-[#101010] flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F5F5F0] tracking-tight">Academic Templates</h3>
              <p className="text-xs text-[#A1A1A1] font-mono">Prebuilt coursework & revision roadmaps</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#252525] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 2 Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#383838]">
          {/* Templates List */}
          <div className="p-4 space-y-2 bg-[#141414]">
            <div className="text-[11px] font-mono font-bold text-[#737373] uppercase tracking-wider mb-2">
              Available Roadmaps
            </div>
            {PREBUILT_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTemplateId === tpl.id
                    ? 'bg-[#B9A3FF]/15 border-[#B9A3FF]/50 text-[#B9A3FF]'
                    : 'bg-[#1E1E1E]/60 border-[#383838] text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#1E1E1E]'
                }`}
              >
                <div className="text-xs font-bold text-[#F5F5F0]">{tpl.title}</div>
                <div className="text-[11px] text-[#A1A1A1] mt-1 font-mono flex items-center gap-2">
                  <span>{tpl.tasks.length} Tasks</span>
                  <span>•</span>
                  <span>{tpl.estimatedWeeks} wks</span>
                </div>
              </button>
            ))}
          </div>

          {/* Template Details & Target Subject */}
          <div className="md:col-span-2 p-6 space-y-5 bg-[#171717]">
            {currentTpl && (
              <>
                <div>
                  <h4 className="text-lg font-black text-[#F5F5F0]">{currentTpl.title}</h4>
                  <p className="text-xs text-[#A1A1A1] mt-1 leading-relaxed">{currentTpl.description}</p>
                </div>

                {/* Target Subject Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F5F5F0] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#B5FF55]" />
                    Target Subject for Imported Tasks
                  </label>
                  <select
                    value={targetSubjectId}
                    onChange={(e) => setTargetSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#383838] text-xs font-mono text-[#F5F5F0] focus:outline-none focus:border-[#B5FF55]"
                  >
                    <option value="">General / Independent Study</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tasks Preview */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider">
                    Tasks Included ({currentTpl.tasks.length})
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentTpl.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#1E1E1E] border border-[#383838] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#F5F5F0]">{task.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#252525] text-[#A1A1A1]">
                            {task.estimatedMinutes}m
                          </span>
                        </div>
                        {task.subtasks.length > 0 && (
                          <div className="text-[11px] text-[#A1A1A1] pl-2 border-l border-[#383838] space-y-0.5">
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
        <div className="px-6 py-4 bg-[#1E1E1E] border-t border-[#383838] flex items-center justify-between">
          <span className="text-xs font-mono text-[#A1A1A1]">
            Imports {currentTpl?.tasks.length} actionable tasks with checklist subitems.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-[#A1A1A1] hover:text-[#F5F5F0] hover:bg-[#252525] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-[#B5FF55] hover:bg-[#A3F040] text-[#101010] text-xs font-black transition-all brutal-shadow flex items-center gap-1.5"
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

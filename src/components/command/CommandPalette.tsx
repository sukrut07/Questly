'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuestly, AppTab } from '@/lib/store';
import {
  Search,
  CheckSquare,
  BookOpen,
  Calendar,
  Inbox,
  Hourglass,
  BarChart3,
  User,
  Plus,
  Sparkles,
  Download,
  RotateCcw,
  Sun,
  Moon,
  ArrowRight,
  Command,
} from 'lucide-react';

export function CommandPalette() {
  const {
    setMode,
    commandPaletteOpen,
    setCommandPaletteOpen,
    setCurrentTab,
    setActiveModal,
    subjects,
    quests,
    deadlines,
    settings,
    updateSettings,
    setSelectedQuest,
    setSelectedSubject,
  } = useQuestly();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Build searchable items
  interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    category: 'Navigation' | 'Actions' | 'Subjects' | 'Tasks' | 'Deadlines';
    icon: React.ReactNode;
    action: () => void;
  }

  const items: CommandItem[] = [
    // Navigation
    {
      id: 'nav_home',
      title: 'Go to Command Center (Home)',
      category: 'Navigation',
      icon: <Command className="w-4 h-4 text-lime-400" />,
      action: () => setCurrentTab('home'),
    },
    {
      id: 'nav_planner',
      title: 'Go to Planner & Timetable',
      category: 'Navigation',
      icon: <Calendar className="w-4 h-4 text-purple-400" />,
      action: () => setCurrentTab('planner'),
    },
    {
      id: 'nav_subjects',
      title: 'Go to Subjects & Syllabus',
      category: 'Navigation',
      icon: <BookOpen className="w-4 h-4 text-blue-400" />,
      action: () => setCurrentTab('subjects'),
    },
    {
      id: 'nav_inbox',
      title: 'Go to Academic Inbox',
      category: 'Navigation',
      icon: <Inbox className="w-4 h-4 text-amber-400" />,
      action: () => setCurrentTab('inbox'),
    },
    {
      id: 'nav_focus',
      title: 'Go to Focus Chamber',
      category: 'Navigation',
      icon: <Hourglass className="w-4 h-4 text-rose-400" />,
      action: () => setCurrentTab('focus'),
    },
    {
      id: 'nav_insights',
      title: 'Go to Insights & Analytics',
      category: 'Navigation',
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
      action: () => setCurrentTab('analytics'),
    },

    // Actions
    {
      id: 'act_new_task',
      title: 'Create New Academic Task',
      subtitle: 'Add a problem set, reading, or lab task',
      category: 'Actions',
      icon: <Plus className="w-4 h-4 text-lime-400" />,
      action: () => {
        setSelectedQuest(null);
        setActiveModal('new_task');
      },
    },
    {
      id: 'act_new_subject',
      title: 'Enroll New Academic Course',
      subtitle: 'Add a subject, syllabus modules, and credit weight',
      category: 'Actions',
      icon: <BookOpen className="w-4 h-4 text-blue-400" />,
      action: () => setActiveModal('new_subject'),
    },
    {
      id: 'act_new_deadline',
      title: 'Add Academic Deadline',
      subtitle: 'Schedule an exam, assignment, or project deadline',
      category: 'Actions',
      icon: <Calendar className="w-4 h-4 text-purple-400" />,
      action: () => setActiveModal('new_deadline'),
    },
    {
      id: 'act_widgets',
      title: 'Customize Dashboard Widgets',
      subtitle: 'Reorder and toggle workspace widgets',
      category: 'Actions',
      icon: <Command className="w-4 h-4 text-lime-400" />,
      action: () => setActiveModal('widgets'),
    },
    {
      id: 'act_landing',
      title: 'Return to Public Landing Page',
      subtitle: 'View product overview and features',
      category: 'Actions',
      icon: <ArrowRight className="w-4 h-4 text-zinc-400" />,
      action: () => setMode('landing'),
    },
    {
      id: 'act_templates',
      title: 'Explore Academic Templates',
      subtitle: 'DSA Prep, 14-Day Exam Crunch, Research Paper',
      category: 'Actions',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      action: () => setActiveModal('templates'),
    },
    {
      id: 'act_weekly_review',
      title: 'Launch Guided Weekly Review',
      subtitle: 'Review completed work and align next week',
      category: 'Actions',
      icon: <RotateCcw className="w-4 h-4 text-blue-400" />,
      action: () => setActiveModal('weekly_review'),
    },
    {
      id: 'act_backup',
      title: 'Data Backup & Export (JSON / CSV)',
      subtitle: 'Download your full academic records',
      category: 'Actions',
      icon: <Download className="w-4 h-4 text-zinc-300" />,
      action: () => setActiveModal('data_backup'),
    },
    {
      id: 'act_toggle_theme',
      title: `Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Actions',
      icon: settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />,
      action: () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' }),
    },

    // Subjects
    ...subjects.map((s) => ({
      id: `subj_${s.id}`,
      title: `${s.code}: ${s.name}`,
      subtitle: `${s.syllabusProgress}% syllabus covered • ${s.credits} credits`,
      category: 'Subjects' as const,
      icon: <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: s.colorHex }} />,
      action: () => {
        setSelectedSubject(s);
        setCurrentTab('subjects');
      },
    })),

    // Active Tasks
    ...quests
      .filter((q) => q.status !== 'COMPLETED')
      .slice(0, 8)
      .map((q) => ({
        id: `quest_${q.id}`,
        title: q.title,
        subtitle: `${q.subjectCode || 'General'} • ${q.estimatedMinutes}m • ${q.priority} priority`,
        category: 'Tasks' as const,
        icon: <CheckSquare className="w-4 h-4 text-zinc-400" />,
        action: () => {
          setSelectedQuest(q);
          setActiveModal('new_task');
        },
      })),

    // Deadlines
    ...deadlines
      .filter((d) => !d.isCompleted)
      .map((d) => ({
        id: `dead_${d.id}`,
        title: d.title,
        subtitle: `${d.subjectCode} • ${d.type.toUpperCase()} • Weight: ${d.weightagePercentage}%`,
        category: 'Deadlines' as const,
        icon: <Calendar className="w-4 h-4 text-amber-400" />,
        action: () => setCurrentTab('planner'),
      })),
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-zinc-900/60">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search subjects, tasks, and deadlines..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-zinc-900">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                      : 'text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-lime-400" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs font-medium">
              No matching commands or academic records found.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">↵</kbd> to select
            </span>
          </div>
          <span>Questly Academic Palette</span>
        </div>
      </div>
    </div>
  );
}


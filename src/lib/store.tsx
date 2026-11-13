'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserProfile,
  StreakInfo,
  Quest,
  AcademicSubject,
  AcademicDeadline,
  TimetableSlot,
  AcademicInboxItem,
  AcademicTemplate,
  FocusSession,
  DailyActivity,
  Achievement,
  AppSettings,
  AcademicRank,
} from './types';
import {
  INITIAL_USER,
  INITIAL_STREAK,
  INITIAL_SETTINGS,
  INITIAL_SUBJECTS,
  INITIAL_QUESTS,
  INITIAL_DEADLINES,
  INITIAL_TIMETABLE,
  INITIAL_INBOX,
  INITIAL_TEMPLATES,
  INITIAL_FOCUS_SESSIONS,
  INITIAL_ACTIVITY_HISTORY,
  INITIAL_ACHIEVEMENTS,
} from './initialData';
import {
  calculateLevelFromTotalXp,
  calculateAcademicRank,
  getTodayDateString,
  getRelativeDateString,
  calculateWorkloadBalance,
  WorkloadBalance,
} from './progressionEngine';
import { sound } from '@/common/SoundService';
import { fireCelebrationConfetti } from '@/common/Confetti';

export type AppTab = 'home' | 'planner' | 'subjects' | 'inbox' | 'focus' | 'analytics' | 'profile';

export interface ToastData {
  id: string;
  title: string;
  subtitle?: string;
  xp?: number;
  type?: 'success' | 'info' | 'level_up' | 'achievement';
}

interface QuestlyContextValue {
  // Navigation & UI Modals
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  selectedQuest: Quest | null;
  setSelectedQuest: (quest: Quest | null) => void;
  selectedSubject: AcademicSubject | null;
  setSelectedSubject: (subject: AcademicSubject | null) => void;
  toast: ToastData | null;
  showToast: (data: Omit<ToastData, 'id'>) => void;
  clearToast: () => void;

  // Domain State
  user: UserProfile;
  streak: StreakInfo;
  subjects: AcademicSubject[];
  quests: Quest[];
  deadlines: AcademicDeadline[];
  timetable: TimetableSlot[];
  inbox: AcademicInboxItem[];
  templates: AcademicTemplate[];
  focusSessions: FocusSession[];
  activityHistory: DailyActivity[];
  achievements: Achievement[];
  settings: AppSettings;
  isHydrated: boolean;

  // Computed Values
  workload: WorkloadBalance;

  // Task Actions
  completeQuest: (questId: string) => void;
  reopenQuest: (questId: string) => void;
  createQuest: (questData: Omit<Quest, 'id' | 'createdAt' | 'completedAt' | 'actualMinutes'>) => void;
  updateQuest: (quest: Quest) => void;
  deleteQuest: (questId: string) => void;
  toggleSubtask: (questId: string, subtaskId: string) => void;

  // Subject Actions
  toggleTopicChecklist: (subjectId: string, moduleId: string, topicId: string, checklistId: string) => void;
  addSubject: (subject: AcademicSubject) => void;
  updateSubject: (subject: AcademicSubject) => void;
  deleteSubject: (subjectId: string) => void;

  // Inbox Actions
  addInboxItem: (item: Omit<AcademicInboxItem, 'id' | 'createdAt'>) => void;
  deleteInboxItem: (id: string) => void;
  convertInboxItemToTask: (id: string, subjectId?: string, estimatedMinutes?: number) => void;

  // Deadline Actions
  toggleDeadline: (id: string) => void;
  addDeadline: (deadline: AcademicDeadline) => void;

  // Template Actions
  instantiateTemplate: (templateId: string, targetSubjectId?: string) => void;

  // Focus Actions
  recordFocusSession: (session: {
    questId: string | null;
    questTitle: string | null;
    subjectId?: string | null;
    subjectCode?: string | null;
    plannedSeconds: number;
    elapsedSeconds: number;
    isCompleted: boolean;
    notes?: string;
  }) => void;

  // Backup & Settings
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetAllData: () => void;
  exportDataJson: () => string;
  exportTasksCsv: () => string;
  importDataJson: (json: string) => { success: boolean; message: string };
}

const STORAGE_KEY = 'questly_academic_state_v3';

const QuestlyContext = createContext<QuestlyContextValue | null>(null);

export function QuestlyProvider({ children }: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Core Academic Data States
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [streak, setStreak] = useState<StreakInfo>(INITIAL_STREAK);
  const [subjects, setSubjects] = useState<AcademicSubject[]>(INITIAL_SUBJECTS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [deadlines, setDeadlines] = useState<AcademicDeadline[]>(INITIAL_DEADLINES);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [inbox, setInbox] = useState<AcademicInboxItem[]>(INITIAL_INBOX);
  const [templates] = useState<AcademicTemplate[]>(INITIAL_TEMPLATES);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(INITIAL_FOCUS_SESSIONS);
  const [activityHistory, setActivityHistory] = useState<DailyActivity[]>(INITIAL_ACTIVITY_HISTORY);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  // Sync sound settings with SoundService
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
    sound.volume = settings.soundVolume;
  }, [settings.soundEnabled, settings.soundVolume]);

  // Sync theme
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Keyboard shortcut listener for Command Palette (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        queueMicrotask(() => {
          if (parsed.user) setUser(parsed.user);
          if (parsed.streak) setStreak(parsed.streak);
          if (parsed.subjects) setSubjects(parsed.subjects);
          if (parsed.quests) setQuests(parsed.quests);
          if (parsed.deadlines) setDeadlines(parsed.deadlines);
          if (parsed.timetable) setTimetable(parsed.timetable);
          if (parsed.inbox) setInbox(parsed.inbox);
          if (parsed.focusSessions) setFocusSessions(parsed.focusSessions);
          if (parsed.activityHistory) setActivityHistory(parsed.activityHistory);
          if (parsed.achievements) setAchievements(parsed.achievements);
          if (parsed.settings) setSettings(parsed.settings);
          setIsHydrated(true);
        });
        return;
      }
    } catch (e) {
      console.warn('Failed to parse Questly storage:', e);
    }
    queueMicrotask(() => {
      setIsHydrated(true);
    });
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const payload = {
        user,
        streak,
        subjects,
        quests,
        deadlines,
        timetable,
        inbox,
        focusSessions,
        activityHistory,
        achievements,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [
    isHydrated,
    user,
    streak,
    subjects,
    quests,
    deadlines,
    timetable,
    inbox,
    focusSessions,
    activityHistory,
    achievements,
    settings,
  ]);

  // Toast handler
  const showToast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToast({ ...data, id });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  // XP Granting & Level Progression helper
  const awardXp = useCallback(
    (amount: number, reason: string) => {
      setUser((prevUser) => {
        const newTotalXp = prevUser.totalXp + amount;
        const levelData = calculateLevelFromTotalXp(newTotalXp);

        if (levelData.level > prevUser.level) {
          sound.playLevelUp();
          fireCelebrationConfetti();
          showToast({
            title: `Advanced to Level ${levelData.level}!`,
            subtitle: `You earned the academic rank: ${levelData.academicRank}`,
            xp: amount,
            type: 'level_up',
          });
        } else {
          showToast({
            title: `+${amount} XP Earned`,
            subtitle: reason,
            xp: amount,
            type: 'success',
          });
        }

        return {
          ...prevUser,
          level: levelData.level,
          currentXp: levelData.currentXp,
          nextLevelXp: levelData.nextLevelXp,
          totalXp: newTotalXp,
          academicRank: levelData.academicRank,
        };
      });

      // Update today's activity
      const todayStr = getTodayDateString();
      setActivityHistory((prev) => {
        const existingIdx = prev.findIndex((a) => a.date === todayStr);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            xpEarned: updated[existingIdx].xpEarned + amount,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              date: todayStr,
              focusMinutes: 0,
              tasksCompleted: 0,
              xpEarned: amount,
              goalMet: true,
            },
          ];
        }
      });
    },
    [showToast]
  );

  // Workload balance memo
  const workload = useMemo(() => {
    return calculateWorkloadBalance(quests, settings.dailyFocusTargetMinutes);
  }, [quests, settings.dailyFocusTargetMinutes]);

  // Task Actions
  const completeQuest = useCallback(
    (questId: string) => {
      const target = quests.find((q) => q.id === questId);
      if (!target || target.status === 'COMPLETED') return;

      sound.playQuestComplete();
      fireCelebrationConfetti();

      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId
            ? {
                ...q,
                status: 'COMPLETED' as const,
                completedAt: Date.now(),
                subtasks: q.subtasks.map((s) => ({ ...s, isCompleted: true })),
              }
            : q
        )
      );

      // Award XP
      awardXp(target.xpReward, target.title);

      // Update daily activity task counter
      const todayStr = getTodayDateString();
      setActivityHistory((prev) => {
        const existingIdx = prev.findIndex((a) => a.date === todayStr);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            tasksCompleted: updated[existingIdx].tasksCompleted + 1,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              date: todayStr,
              focusMinutes: 0,
              tasksCompleted: 1,
              xpEarned: 0,
              goalMet: true,
            },
          ];
        }
      });
    },
    [quests, awardXp]
  );

  const reopenQuest = useCallback((questId: string) => {
    sound.playButtonClick();
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? {
              ...q,
              status: 'IN_PROGRESS' as const,
              completedAt: null,
            }
          : q
      )
    );
  }, []);

  const createQuest = useCallback(
    (questData: Omit<Quest, 'id' | 'createdAt' | 'completedAt' | 'actualMinutes'>) => {
      sound.playButtonClick();
      const newQuest: Quest = {
        ...questData,
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
        completedAt: null,
        actualMinutes: 0,
      };

      setQuests((prev) => [newQuest, ...prev]);
      showToast({
        title: 'Academic Task Created',
        subtitle: newQuest.title,
        type: 'info',
      });
    },
    [showToast]
  );

  const updateQuest = useCallback((updated: Quest) => {
    sound.playButtonClick();
    setQuests((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }, []);

  const deleteQuest = useCallback((questId: string) => {
    sound.playButtonClick();
    setQuests((prev) => prev.filter((q) => q.id !== questId));
  }, []);

  const toggleSubtask = useCallback((questId: string, subtaskId: string) => {
    sound.playButtonClick();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        const updatedSubtasks = q.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        return { ...q, subtasks: updatedSubtasks };
      })
    );
  }, []);

  // Subject Actions
  const toggleTopicChecklist = useCallback(
    (subjectId: string, moduleId: string, topicId: string, checklistId: string) => {
      sound.playButtonClick();
      setSubjects((prevSubjects) => {
        return prevSubjects.map((subj) => {
          if (subj.id !== subjectId) return subj;

          let newlyCompleted = false;

          const updatedModules = subj.modules.map((mod) => {
            if (mod.id !== moduleId) return mod;

            const updatedTopics = mod.topics.map((top) => {
              if (top.id !== topicId) return top;

              const updatedChecklists = top.checklists.map((chk) => {
                if (chk.id === checklistId) {
                  const targetState = !chk.isCompleted;
                  if (targetState) newlyCompleted = true;
                  return { ...chk, isCompleted: targetState, completedAt: targetState ? Date.now() : undefined };
                }
                return chk;
              });

              // Check if all checklists in topic are complete
              const allChecklistsDone = updatedChecklists.every((c) => c.isCompleted);

              return {
                ...top,
                checklists: updatedChecklists,
                isCompleted: allChecklistsDone,
                completedAt: allChecklistsDone ? Date.now() : top.completedAt,
              };
            });

            return { ...mod, topics: updatedTopics };
          });

          // Recalculate syllabus progress
          let totalTopics = 0;
          let completedTopics = 0;
          updatedModules.forEach((m) => {
            m.topics.forEach((t) => {
              totalTopics++;
              if (t.isCompleted) completedTopics++;
            });
          });
          const newProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

          if (newlyCompleted) {
            awardXp(10, 'Topic checklist step mastered');
          }

          return {
            ...subj,
            modules: updatedModules,
            syllabusProgress: newProgress,
          };
        });
      });
    },
    [awardXp]
  );

  const addSubject = useCallback((subject: AcademicSubject) => {
    sound.playButtonClick();
    setSubjects((prev) => [...prev, subject]);
  }, []);

  const updateSubject = useCallback((updated: AcademicSubject) => {
    sound.playButtonClick();
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    sound.playButtonClick();
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  }, []);

  // Inbox Actions
  const addInboxItem = useCallback(
    (item: Omit<AcademicInboxItem, 'id' | 'createdAt'>) => {
      sound.playButtonClick();
      const newItem: AcademicInboxItem = {
        ...item,
        id: `inbox_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setInbox((prev) => [newItem, ...prev]);
      showToast({
        title: 'Saved to Academic Inbox',
        subtitle: newItem.title,
        type: 'info',
      });
    },
    [showToast]
  );

  const deleteInboxItem = useCallback((id: string) => {
    sound.playButtonClick();
    setInbox((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const convertInboxItemToTask = useCallback(
    (id: string, subjectId?: string, estimatedMinutes: number = 30) => {
      const item = inbox.find((i) => i.id === id);
      if (!item) return;

      const matchedSubject = subjects.find((s) => s.id === (subjectId || item.suggestedSubjectId));

      createQuest({
        title: item.title,
        description: item.notes || '',
        subjectId: matchedSubject?.id,
        subjectCode: matchedSubject?.code,
        subjectColorHex: matchedSubject?.colorHex || '#A3E635',
        taskType: item.type === 'note' ? 'reading' : 'problem_solving',
        difficulty: 'MEDIUM',
        priority: 'MEDIUM',
        estimatedMinutes,
        dueDate: getRelativeDateString(1),
        status: 'IN_PROGRESS',
        xpReward: 30,
        isRecurring: false,
        subtasks: [],
        resourceUrls: item.sourceUrl ? [item.sourceUrl] : [],
      });

      deleteInboxItem(id);
    },
    [inbox, subjects, createQuest, deleteInboxItem]
  );

  // Deadlines Actions
  const toggleDeadline = useCallback((id: string) => {
    sound.playButtonClick();
    setDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isCompleted: !d.isCompleted } : d))
    );
  }, []);

  const addDeadline = useCallback((deadline: AcademicDeadline) => {
    sound.playButtonClick();
    setDeadlines((prev) => [...prev, deadline]);
  }, []);

  // Template Actions
  const instantiateTemplate = useCallback(
    (templateId: string, targetSubjectId?: string) => {
      const tpl = templates.find((t) => t.id === templateId);
      if (!tpl) return;

      sound.playQuestComplete();
      const matchedSubject = subjects.find((s) => s.id === targetSubjectId) || subjects[0];

      const createdQuests: Quest[] = tpl.tasks.map((taskSpec, index) => ({
        id: `tpl_task_${Date.now()}_${index}`,
        title: taskSpec.title,
        description: `Imported from academic template: ${tpl.title}`,
        subjectId: matchedSubject.id,
        subjectCode: matchedSubject.code,
        subjectColorHex: matchedSubject.colorHex,
        taskType: taskSpec.taskType,
        difficulty: 'MEDIUM',
        priority: taskSpec.priority,
        estimatedMinutes: taskSpec.estimatedMinutes,
        actualMinutes: 0,
        dueDate: getRelativeDateString(index + 1),
        status: 'IN_PROGRESS',
        xpReward: 35,
        isRecurring: false,
        createdAt: Date.now(),
        completedAt: null,
        subtasks: taskSpec.subtasks.map((st, sidx) => ({
          id: `tpl_sub_${Date.now()}_${index}_${sidx}`,
          title: st,
          isCompleted: false,
        })),
      }));

      setQuests((prev) => [...createdQuests, ...prev]);
      showToast({
        title: `Template Applied: ${tpl.title}`,
        subtitle: `${createdQuests.length} academic tasks added to ${matchedSubject.code}`,
        type: 'success',
      });
    },
    [templates, subjects, showToast]
  );

  // Focus Session Recording
  const recordFocusSession = useCallback(
    (session: {
      questId: string | null;
      questTitle: string | null;
      subjectId?: string | null;
      subjectCode?: string | null;
      plannedSeconds: number;
      elapsedSeconds: number;
      isCompleted: boolean;
      notes?: string;
    }) => {
      const minutes = Math.floor(session.elapsedSeconds / 60);
      const earnedXp = Math.max(10, Math.floor(minutes / 25) * 15);

      const newSession: FocusSession = {
        id: `foc_${Date.now()}`,
        questId: session.questId,
        questTitle: session.questTitle,
        subjectId: session.subjectId,
        subjectCode: session.subjectCode,
        plannedSeconds: session.plannedSeconds,
        elapsedSeconds: session.elapsedSeconds,
        isCompleted: session.isCompleted,
        startedAt: Date.now() - session.elapsedSeconds * 1000,
        endedAt: Date.now(),
        xpEarned: earnedXp,
        notes: session.notes,
      };

      setFocusSessions((prev) => [newSession, ...prev]);
      awardXp(earnedXp, `Completed ${minutes}m deep focus block`);

      // Update today's focus minutes
      const todayStr = getTodayDateString();
      setActivityHistory((prev) => {
        const existingIdx = prev.findIndex((a) => a.date === todayStr);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            focusMinutes: updated[existingIdx].focusMinutes + minutes,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              date: todayStr,
              focusMinutes: minutes,
              tasksCompleted: 0,
              xpEarned: earnedXp,
              goalMet: true,
            },
          ];
        }
      });
    },
    [awardXp]
  );

  // Settings & Profile updates
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetAllData = useCallback(() => {
    setUser(INITIAL_USER);
    setStreak(INITIAL_STREAK);
    setSubjects(INITIAL_SUBJECTS);
    setQuests(INITIAL_QUESTS);
    setDeadlines(INITIAL_DEADLINES);
    setTimetable(INITIAL_TIMETABLE);
    setInbox(INITIAL_INBOX);
    setFocusSessions(INITIAL_FOCUS_SESSIONS);
    setActivityHistory(INITIAL_ACTIVITY_HISTORY);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setSettings(INITIAL_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    sound.playButtonClick();
  }, []);

  // Export / Backup
  const exportDataJson = useCallback(() => {
    const payload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      user,
      streak,
      subjects,
      quests,
      deadlines,
      timetable,
      inbox,
      focusSessions,
      activityHistory,
      achievements,
      settings,
    };
    return JSON.stringify(payload, null, 2);
  }, [
    user,
    streak,
    subjects,
    quests,
    deadlines,
    timetable,
    inbox,
    focusSessions,
    activityHistory,
    achievements,
    settings,
  ]);

  const exportTasksCsv = useCallback(() => {
    const headers = [
      'Task ID',
      'Title',
      'Subject Code',
      'Task Type',
      'Priority',
      'Difficulty',
      'Status',
      'Estimated Minutes',
      'XP Reward',
      'Due Date',
    ];

    const rows = quests.map((q) => [
      `"${q.id}"`,
      `"${q.title.replace(/"/g, '""')}"`,
      `"${q.subjectCode || ''}"`,
      `"${q.taskType}"`,
      `"${q.priority}"`,
      `"${q.difficulty}"`,
      `"${q.status}"`,
      q.estimatedMinutes,
      q.xpReward,
      `"${q.dueDate || ''}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }, [quests]);

  const importDataJson = useCallback((jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);

      // Validate schema
      if (!data.user || !data.quests || !Array.isArray(data.quests)) {
        return { success: false, message: 'Invalid backup file: missing user or task records.' };
      }

      if (data.user) setUser(data.user);
      if (data.streak) setStreak(data.streak);
      if (data.subjects && Array.isArray(data.subjects)) setSubjects(data.subjects);
      if (data.quests && Array.isArray(data.quests)) setQuests(data.quests);
      if (data.deadlines && Array.isArray(data.deadlines)) setDeadlines(data.deadlines);
      if (data.timetable && Array.isArray(data.timetable)) setTimetable(data.timetable);
      if (data.inbox && Array.isArray(data.inbox)) setInbox(data.inbox);
      if (data.focusSessions && Array.isArray(data.focusSessions)) setFocusSessions(data.focusSessions);
      if (data.activityHistory && Array.isArray(data.activityHistory)) setActivityHistory(data.activityHistory);
      if (data.achievements && Array.isArray(data.achievements)) setAchievements(data.achievements);
      if (data.settings) setSettings(data.settings);

      return { success: true, message: 'Academic backup successfully restored!' };
    } catch (e: any) {
      return { success: false, message: `Failed to parse JSON backup: ${e.message}` };
    }
  }, []);

  return (
    <QuestlyContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        activeModal,
        setActiveModal,
        commandPaletteOpen,
        setCommandPaletteOpen,
        selectedQuest,
        setSelectedQuest,
        selectedSubject,
        setSelectedSubject,
        toast,
        showToast,
        clearToast,
        user,
        streak,
        subjects,
        quests,
        deadlines,
        timetable,
        inbox,
        templates,
        focusSessions,
        activityHistory,
        achievements,
        settings,
        isHydrated,
        workload,
        completeQuest,
        reopenQuest,
        createQuest,
        updateQuest,
        deleteQuest,
        toggleSubtask,
        toggleTopicChecklist,
        addSubject,
        updateSubject,
        deleteSubject,
        addInboxItem,
        deleteInboxItem,
        convertInboxItemToTask,
        toggleDeadline,
        addDeadline,
        instantiateTemplate,
        recordFocusSession,
        updateProfile,
        updateSettings,
        resetAllData,
        exportDataJson,
        exportTasksCsv,
        importDataJson,
      }}
    >
      {children}
    </QuestlyContext.Provider>
  );
}

export function useQuestly() {
  const context = useContext(QuestlyContext);
  if (!context) {
    throw new Error('useQuestly must be used within a QuestlyProvider');
  }
  return context;
}

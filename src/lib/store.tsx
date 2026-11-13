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
  FocusSession,
  DailyActivity,
  Achievement,
  AppSettings,
  DashboardWidgetConfig,
  DashboardWidgetId,
  XpTransaction,
  XpSourceEvent,
  AcademicWorkspace,
  ArcadeGameType,
  ArcadeGameRecord,
} from './types';
import {
  INITIAL_USER,
  INITIAL_STREAK,
  INITIAL_SETTINGS,
  INITIAL_WIDGETS,
  INITIAL_SUBJECTS,
  INITIAL_QUESTS,
  INITIAL_DEADLINES,
  INITIAL_TIMETABLE,
  INITIAL_INBOX,
  INITIAL_FOCUS_SESSIONS,
  INITIAL_ACTIVITY_HISTORY,
  INITIAL_ACHIEVEMENTS,
} from './initialData';
import {
  calculateLevelFromTotalXp,
  getTodayDateString,
  getRelativeDateString,
  calculateWorkloadBalance,
  WorkloadBalance,
  XP_RULES,
} from './progressionEngine';
import { sound } from '@/common/SoundService';
import { fireCelebrationConfetti } from '@/common/Confetti';

export type AppMode = 'landing' | 'app';
export type AppTab =
  | 'home'
  | 'tasks'
  | 'subjects'
  | 'planner'
  | 'timetable'
  | 'workspaces'
  | 'arcade'
  | 'inbox'
  | 'focus'
  | 'analytics'
  | 'profile';

export interface ToastData {
  id: string;
  title: string;
  subtitle?: string;
  xp?: number;
  type?: 'success' | 'info' | 'level_up' | 'achievement';
}

interface QuestlyContextValue {
  // Mode & Navigation
  mode: AppMode;
  setMode: (mode: AppMode) => void;
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
  widgets: DashboardWidgetConfig[];
  focusSessions: FocusSession[];
  activityHistory: DailyActivity[];
  achievements: Achievement[];
  settings: AppSettings;
  workspaces: AcademicWorkspace[];
  activeWorkspaceId: string | null;
  xpTransactions: XpTransaction[];
  arcadeRecords: ArcadeGameRecord[];
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

  // Subject, Module & Topic Actions
  addSubject: (subject: Omit<AcademicSubject, 'id' | 'syllabusProgress' | 'modules'>) => void;
  updateSubject: (subject: AcademicSubject) => void;
  deleteSubject: (subjectId: string) => void;
  addModule: (subjectId: string, title: string) => void;
  deleteModule: (subjectId: string, moduleId: string) => void;
  addTopic: (subjectId: string, moduleId: string, topicData: { title: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; estimatedMinutes: number }) => void;
  deleteTopic: (subjectId: string, moduleId: string, topicId: string) => void;
  addChecklistItem: (subjectId: string, moduleId: string, topicId: string, title: string) => void;
  toggleTopicChecklist: (subjectId: string, moduleId: string, topicId: string, checklistId: string) => void;

  // Inbox Actions
  addInboxItem: (item: Omit<AcademicInboxItem, 'id' | 'createdAt'>) => void;
  deleteInboxItem: (id: string) => void;
  convertInboxItemToTask: (id: string, subjectId?: string, estimatedMinutes?: number) => void;

  // Deadline Actions
  toggleDeadline: (id: string) => void;
  addDeadline: (deadline: Omit<AcademicDeadline, 'id' | 'isCompleted'>) => void;
  deleteDeadline: (id: string) => void;

  // Timetable Actions
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (slot: TimetableSlot) => void;
  deleteTimetableSlot: (id: string) => void;

  // Workspace Actions
  createWorkspace: (ws: Omit<AcademicWorkspace, 'id' | 'createdAt'>) => void;
  updateWorkspace: (ws: AcademicWorkspace) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspaceId: (id: string | null) => void;

  // XP & Gamification Actions
  awardXp: (
    sourceEventOrAmount: XpSourceEvent | number,
    idOrReason: string,
    activityTitleOpt?: string,
    amountOpt?: number
  ) => boolean;

  // Arcade Actions
  recordArcadeScore: (
    gameType: ArcadeGameType,
    score: number
  ) => { xpAwarded: number; isHighScore: boolean };

  // Widget Manager Actions
  toggleWidget: (id: DashboardWidgetId) => void;
  reorderWidgets: (newWidgets: DashboardWidgetConfig[]) => void;

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

  // Profile & Settings
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetAllData: () => void;
  exportDataJson: () => string;
  exportTasksCsv: () => string;
  importDataJson: (json: string) => { success: boolean; message: string };
}

const STORAGE_KEY = 'questly_user_workspace_v4';

const QuestlyContext = createContext<QuestlyContextValue | null>(null);

export function QuestlyProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>('landing');
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Core User Data States
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [streak, setStreak] = useState<StreakInfo>(INITIAL_STREAK);
  const [subjects, setSubjects] = useState<AcademicSubject[]>(INITIAL_SUBJECTS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [deadlines, setDeadlines] = useState<AcademicDeadline[]>(INITIAL_DEADLINES);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [inbox, setInbox] = useState<AcademicInboxItem[]>(INITIAL_INBOX);
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(INITIAL_WIDGETS);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(INITIAL_FOCUS_SESSIONS);
  const [activityHistory, setActivityHistory] = useState<DailyActivity[]>(INITIAL_ACTIVITY_HISTORY);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [workspaces, setWorkspaces] = useState<AcademicWorkspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>([]);
  const [arcadeRecords, setArcadeRecords] = useState<ArcadeGameRecord[]>([]);

  // Sync sound settings
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

  // Command palette hotkey listener (Cmd+K / Ctrl+K)
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
          if (parsed.mode) setMode(parsed.mode);
          if (parsed.user) setUser(parsed.user);
          if (parsed.streak) setStreak(parsed.streak);
          if (parsed.subjects) setSubjects(parsed.subjects);
          if (parsed.quests) setQuests(parsed.quests);
          if (parsed.deadlines) setDeadlines(parsed.deadlines);
          if (parsed.timetable) setTimetable(parsed.timetable);
          if (parsed.inbox) setInbox(parsed.inbox);
          if (parsed.widgets) setWidgets(parsed.widgets);
          if (parsed.focusSessions) setFocusSessions(parsed.focusSessions);
          if (parsed.activityHistory) setActivityHistory(parsed.activityHistory);
          if (parsed.achievements) setAchievements(parsed.achievements);
          if (parsed.settings) setSettings(parsed.settings);
          if (parsed.workspaces) setWorkspaces(parsed.workspaces);
          if (parsed.activeWorkspaceId) setActiveWorkspaceId(parsed.activeWorkspaceId);
          if (parsed.xpTransactions) setXpTransactions(parsed.xpTransactions);
          if (parsed.arcadeRecords) setArcadeRecords(parsed.arcadeRecords);
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

  // Persist state to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const payload = {
        mode,
        user,
        streak,
        subjects,
        quests,
        deadlines,
        timetable,
        inbox,
        widgets,
        focusSessions,
        activityHistory,
        achievements,
        settings,
        workspaces,
        activeWorkspaceId,
        xpTransactions,
        arcadeRecords,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [
    isHydrated,
    mode,
    user,
    streak,
    subjects,
    quests,
    deadlines,
    timetable,
    inbox,
    widgets,
    focusSessions,
    activityHistory,
    achievements,
    settings,
    workspaces,
    activeWorkspaceId,
    xpTransactions,
    arcadeRecords,
  ]);

  const showToast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToast({ ...data, id });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  // Idempotent XP Granting & Level Progression
  const awardXp = useCallback(
    (
      sourceEventOrAmount: XpSourceEvent | number,
      idOrReason: string,
      activityTitleOpt?: string,
      amountOpt?: number
    ): boolean => {
      let sourceEvent: XpSourceEvent = 'task_completed';
      let activityId = '';
      let activityTitle = '';
      let amount = 0;

      if (typeof sourceEventOrAmount === 'number') {
        amount = sourceEventOrAmount;
        activityTitle = idOrReason;
        activityId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      } else {
        sourceEvent = sourceEventOrAmount;
        activityId = idOrReason;
        activityTitle = activityTitleOpt || '';
        amount = amountOpt || 0;

        // Idempotency check: verify this activity hasn't been rewarded already
        const alreadyAwarded = xpTransactions.some(
          (tx) => tx.sourceEvent === sourceEvent && tx.activityId === activityId
        );
        if (alreadyAwarded) {
          return false;
        }
      }

      // Arcade daily cap guard
      if (sourceEvent === 'arcade_challenge') {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const arcadeXpToday = xpTransactions
          .filter((tx) => tx.sourceEvent === 'arcade_challenge' && tx.timestamp >= todayStart)
          .reduce((sum, tx) => sum + tx.xpAmount, 0);

        if (arcadeXpToday >= XP_RULES.DAILY_ARCADE_CAP) {
          showToast({
            title: 'Daily Arcade Cap Reached',
            subtitle: `Max ${XP_RULES.DAILY_ARCADE_CAP} XP per day from games. Study tasks earn more!`,
            type: 'info',
          });
          return false;
        }
        amount = Math.min(amount, XP_RULES.DAILY_ARCADE_CAP - arcadeXpToday);
      }

      if (amount <= 0) return false;

      const tx: XpTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sourceEvent,
        activityId,
        activityTitle,
        xpAmount: amount,
        timestamp: Date.now(),
      };

      setXpTransactions((prev) => [tx, ...prev]);

      setUser((prevUser) => {
        const newTotalXp = prevUser.totalXp + amount;
        const levelData = calculateLevelFromTotalXp(newTotalXp);

        if (levelData.level > prevUser.level) {
          sound.playLevelUp();
          fireCelebrationConfetti();
          showToast({
            title: `Advanced to Level ${levelData.level}!`,
            subtitle: `Academic Rank: ${levelData.academicRank}`,
            xp: amount,
            type: 'level_up',
          });
        } else {
          showToast({
            title: `+${amount} XP Earned`,
            subtitle: activityTitle,
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
            tasksCompleted:
              sourceEvent === 'task_completed'
                ? updated[existingIdx].tasksCompleted + 1
                : updated[existingIdx].tasksCompleted,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              date: todayStr,
              focusMinutes: 0,
              tasksCompleted: sourceEvent === 'task_completed' ? 1 : 0,
              xpEarned: amount,
              goalMet: true,
            },
          ];
        }
      });

      return true;
    },
    [xpTransactions, showToast]
  );

  // Workload balance computation
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

      awardXp('task_completed', target.id, target.title, target.xpReward);
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
        title: 'Task Created',
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
  const addSubject = useCallback(
    (subjectData: Omit<AcademicSubject, 'id' | 'syllabusProgress' | 'modules'>) => {
      sound.playButtonClick();
      const newSubject: AcademicSubject = {
        ...subjectData,
        id: `sub_${Date.now()}`,
        syllabusProgress: 0,
        modules: [],
      };
      setSubjects((prev) => [...prev, newSubject]);
      showToast({
        title: 'Subject Added',
        subtitle: `${newSubject.code}: ${newSubject.name}`,
        type: 'success',
      });
    },
    [showToast]
  );

  const updateSubject = useCallback((updated: AcademicSubject) => {
    sound.playButtonClick();
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    sound.playButtonClick();
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  }, []);

  const addModule = useCallback((subjectId: string, title: string) => {
    sound.playButtonClick();
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const newMod = {
          id: `mod_${Date.now()}`,
          title,
          orderIndex: s.modules.length + 1,
          topics: [],
        };
        return { ...s, modules: [...s.modules, newMod] };
      })
    );
  }, []);

  const deleteModule = useCallback((subjectId: string, moduleId: string) => {
    sound.playButtonClick();
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return { ...s, modules: s.modules.filter((m) => m.id !== moduleId) };
      })
    );
  }, []);

  const addTopic = useCallback(
    (
      subjectId: string,
      moduleId: string,
      topicData: { title: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; estimatedMinutes: number }
    ) => {
      sound.playButtonClick();
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s;
          const updatedModules = s.modules.map((m) => {
            if (m.id !== moduleId) return m;
            const newTopic = {
              id: `top_${Date.now()}`,
              title: topicData.title,
              difficulty: topicData.difficulty,
              estimatedMinutes: topicData.estimatedMinutes,
              isCompleted: false,
              revisionCount: 0,
              checklists: [],
            };
            return { ...m, topics: [...m.topics, newTopic] };
          });
          return { ...s, modules: updatedModules };
        })
      );
    },
    []
  );

  const deleteTopic = useCallback((subjectId: string, moduleId: string, topicId: string) => {
    sound.playButtonClick();
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const updatedModules = s.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return { ...m, topics: m.topics.filter((t) => t.id !== topicId) };
        });
        return { ...s, modules: updatedModules };
      })
    );
  }, []);

  const addChecklistItem = useCallback(
    (subjectId: string, moduleId: string, topicId: string, title: string) => {
      sound.playButtonClick();
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s;
          const updatedModules = s.modules.map((m) => {
            if (m.id !== moduleId) return m;
            const updatedTopics = m.topics.map((t) => {
              if (t.id !== topicId) return t;
              const newChk = {
                id: `chk_${Date.now()}`,
                title,
                isCompleted: false,
              };
              return { ...t, checklists: [...t.checklists, newChk] };
            });
            return { ...m, topics: updatedTopics };
          });
          return { ...s, modules: updatedModules };
        })
      );
    },
    []
  );

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

              const allChecklistsDone = updatedChecklists.length > 0 && updatedChecklists.every((c) => c.isCompleted);

              return {
                ...top,
                checklists: updatedChecklists,
                isCompleted: allChecklistsDone,
                completedAt: allChecklistsDone ? Date.now() : top.completedAt,
              };
            });

            return { ...mod, topics: updatedTopics };
          });

          // Recalculate syllabus percentage
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
            awardXp(10, 'Checklist item mastered');
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
        title: 'Saved to Inbox',
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
        subjectColorHex: matchedSubject?.colorHex || '#B5FF55',
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

  // Deadline Actions
  const toggleDeadline = useCallback((id: string) => {
    sound.playButtonClick();
    setDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isCompleted: !d.isCompleted } : d))
    );
  }, []);

  const addDeadline = useCallback((deadlineData: Omit<AcademicDeadline, 'id' | 'isCompleted'>) => {
    sound.playButtonClick();
    const newDeadline: AcademicDeadline = {
      ...deadlineData,
      id: `dead_${Date.now()}`,
      isCompleted: false,
    };
    setDeadlines((prev) => [...prev, newDeadline]);
  }, []);

  const deleteDeadline = useCallback((id: string) => {
    sound.playButtonClick();
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Widget Manager Actions
  const toggleWidget = useCallback((id: DashboardWidgetId) => {
    sound.playButtonClick();
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isEnabled: !w.isEnabled } : w))
    );
  }, []);

  const reorderWidgets = useCallback((newWidgets: DashboardWidgetConfig[]) => {
    setWidgets(newWidgets);
  }, []);

  // Timetable Actions
  const addTimetableSlot = useCallback(
    (slotData: Omit<TimetableSlot, 'id'>) => {
      sound.playButtonClick();
      const newSlot: TimetableSlot = {
        ...slotData,
        id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      setTimetable((prev) => [...prev, newSlot]);
      showToast({
        title: 'Session Added',
        subtitle: `${newSlot.subjectCode} (${newSlot.startTime} - ${newSlot.endTime})`,
        type: 'success',
      });
    },
    [showToast]
  );

  const updateTimetableSlot = useCallback((slot: TimetableSlot) => {
    sound.playButtonClick();
    setTimetable((prev) => prev.map((s) => (s.id === slot.id ? slot : s)));
  }, []);

  const deleteTimetableSlot = useCallback((id: string) => {
    sound.playButtonClick();
    setTimetable((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Workspace Actions
  const createWorkspace = useCallback(
    (wsData: Omit<AcademicWorkspace, 'id' | 'createdAt'>) => {
      sound.playButtonClick();
      const newWs: AcademicWorkspace = {
        ...wsData,
        id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setWorkspaces((prev) => [...prev, newWs]);
      showToast({
        title: 'Workspace Created',
        subtitle: newWs.name,
        type: 'success',
      });
    },
    [showToast]
  );

  const updateWorkspace = useCallback((ws: AcademicWorkspace) => {
    sound.playButtonClick();
    setWorkspaces((prev) => prev.map((w) => (w.id === ws.id ? ws : w)));
  }, []);

  const deleteWorkspace = useCallback(
    (id: string) => {
      sound.playButtonClick();
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      if (activeWorkspaceId === id) setActiveWorkspaceId(null);
    },
    [activeWorkspaceId]
  );

  // Arcade Scoring & Challenges
  const recordArcadeScore = useCallback(
    (gameType: ArcadeGameType, score: number) => {
      sound.playButtonClick();
      let isHighScore = false;
      let xpAwarded = 0;

      const challengeId = `arcade_${gameType}_${Date.now()}`;
      const awarded = awardXp(
        'arcade_challenge',
        challengeId,
        `${gameType.replace('_', ' ').toUpperCase()} challenge`,
        10
      );
      if (awarded) {
        xpAwarded = 10;
      }

      setArcadeRecords((prev) => {
        const existing = prev.find((r) => r.gameType === gameType);
        if (!existing) {
          isHighScore = true;
          return [
            ...prev,
            {
              gameType,
              highScore: score,
              gamesPlayed: 1,
              lastPlayedAt: Date.now(),
              xpEarnedToday: xpAwarded,
            },
          ];
        }

        if (score > existing.highScore) isHighScore = true;

        return prev.map((r) =>
          r.gameType === gameType
            ? {
                ...r,
                highScore: Math.max(r.highScore, score),
                gamesPlayed: r.gamesPlayed + 1,
                lastPlayedAt: Date.now(),
                xpEarnedToday: r.xpEarnedToday + xpAwarded,
              }
            : r
        );
      });

      return { xpAwarded, isHighScore };
    },
    [awardXp]
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
      awardXp(earnedXp, `Completed ${minutes}m focus session`);

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

  // Profile & Settings updates
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
    setWidgets(INITIAL_WIDGETS);
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
      widgets,
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
    widgets,
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

      if (!data.user || !data.quests || !Array.isArray(data.quests)) {
        return { success: false, message: 'Invalid backup file: missing required records.' };
      }

      if (data.user) setUser(data.user);
      if (data.streak) setStreak(data.streak);
      if (data.subjects && Array.isArray(data.subjects)) setSubjects(data.subjects);
      if (data.quests && Array.isArray(data.quests)) setQuests(data.quests);
      if (data.deadlines && Array.isArray(data.deadlines)) setDeadlines(data.deadlines);
      if (data.timetable && Array.isArray(data.timetable)) setTimetable(data.timetable);
      if (data.inbox && Array.isArray(data.inbox)) setInbox(data.inbox);
      if (data.widgets && Array.isArray(data.widgets)) setWidgets(data.widgets);
      if (data.focusSessions && Array.isArray(data.focusSessions)) setFocusSessions(data.focusSessions);
      if (data.activityHistory && Array.isArray(data.activityHistory)) setActivityHistory(data.activityHistory);
      if (data.achievements && Array.isArray(data.achievements)) setAchievements(data.achievements);
      if (data.settings) setSettings(data.settings);

      return { success: true, message: 'Workspace data successfully restored!' };
    } catch (e: any) {
      return { success: false, message: `Failed to parse JSON backup: ${e.message}` };
    }
  }, []);

  return (
    <QuestlyContext.Provider
      value={{
        mode,
        setMode,
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
        widgets,
        focusSessions,
        activityHistory,
        achievements,
        settings,
        workspaces,
        activeWorkspaceId,
        xpTransactions,
        arcadeRecords,
        isHydrated,
        workload,
        completeQuest,
        reopenQuest,
        createQuest,
        updateQuest,
        deleteQuest,
        toggleSubtask,
        addSubject,
        updateSubject,
        deleteSubject,
        addModule,
        deleteModule,
        addTopic,
        deleteTopic,
        addChecklistItem,
        toggleTopicChecklist,
        addInboxItem,
        deleteInboxItem,
        convertInboxItemToTask,
        toggleDeadline,
        addDeadline,
        deleteDeadline,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        setActiveWorkspaceId,
        awardXp,
        recordArcadeScore,
        toggleWidget,
        reorderWidgets,
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

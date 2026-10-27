'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserProfile,
  StreakInfo,
  Quest,
  AdventureLevel,
  Achievement,
  FocusSession,
  DailyActivity,
  GameRecord,
  AppSettings,
  GameType,
} from './types';
import {
  INITIAL_USER,
  INITIAL_STREAK,
  INITIAL_SETTINGS,
  INITIAL_QUESTS,
  INITIAL_ADVENTURE_LEVELS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_ACTIVITY_HISTORY,
  INITIAL_FOCUS_SESSIONS,
  INITIAL_GAME_RECORDS,
} from './initialData';
import {
  calculateLevelFromTotalXp,
  calculateWorldStage,
  calculatePresentationMode,
  getTodayDateString,
  WORLD_STAGES,
} from './progressionEngine';
import { sound } from '@/common/SoundService';
import { fireCelebrationConfetti } from '@/common/Confetti';

export type AppTab = 'home' | 'quests' | 'map' | 'focus' | 'arcade' | 'analytics' | 'profile';

export interface ToastData {
  id: string;
  title: string;
  subtitle?: string;
  xp?: number;
  type?: 'success' | 'info' | 'level_up' | 'achievement';
}

interface QuestlyContextValue {
  // Navigation & UI
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  selectedQuest: Quest | null;
  setSelectedQuest: (quest: Quest | null) => void;
  selectedLevel: AdventureLevel | null;
  setSelectedLevel: (level: AdventureLevel | null) => void;
  toast: ToastData | null;
  showToast: (data: Omit<ToastData, 'id'>) => void;
  clearToast: () => void;

  // Domain State
  user: UserProfile;
  streak: StreakInfo;
  quests: Quest[];
  adventureLevels: AdventureLevel[];
  achievements: Achievement[];
  focusSessions: FocusSession[];
  activityHistory: DailyActivity[];
  gameRecords: GameRecord[];
  settings: AppSettings;
  isHydrated: boolean;

  // Actions
  completeQuest: (questId: string) => void;
  reopenQuest: (questId: string) => void;
  createQuest: (questData: Omit<Quest, 'id' | 'createdAt' | 'completedAt' | 'actualMinutes'>) => void;
  updateQuest: (quest: Quest) => void;
  deleteQuest: (questId: string) => void;
  toggleSubtask: (questId: string, subtaskId: string) => void;
  recordFocusSession: (session: {
    questId: string | null;
    questTitle: string | null;
    plannedSeconds: number;
    elapsedSeconds: number;
    isCompleted: boolean;
    notes?: string;
  }) => void;
  completeAdventureLevel: (levelId: number, starsEarned: number) => void;
  recordGameScore: (gameType: GameType, score: number, levelReached: number, durationSeconds: number) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetAllData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
}

const STORAGE_KEY = 'questly_state_v2';

const QuestlyContext = createContext<QuestlyContextValue | null>(null);

export function QuestlyProvider({ children }: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<AdventureLevel | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Core Data States
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [streak, setStreak] = useState<StreakInfo>(INITIAL_STREAK);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [adventureLevels, setAdventureLevels] = useState<AdventureLevel[]>(INITIAL_ADVENTURE_LEVELS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(INITIAL_FOCUS_SESSIONS);
  const [activityHistory, setActivityHistory] = useState<DailyActivity[]>(INITIAL_ACTIVITY_HISTORY);
  const [gameRecords, setGameRecords] = useState<GameRecord[]>(INITIAL_GAME_RECORDS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  // Sync sound settings with SoundService
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
    sound.volume = settings.soundVolume;
  }, [settings.soundEnabled, settings.soundVolume]);

  // Sync theme with document element
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
      // system
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

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) setUser(parsed.user);
        if (parsed.streak) setStreak(parsed.streak);
        if (parsed.quests) setQuests(parsed.quests);
        if (parsed.adventureLevels) setAdventureLevels(parsed.adventureLevels);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.focusSessions) setFocusSessions(parsed.focusSessions);
        if (parsed.activityHistory) setActivityHistory(parsed.activityHistory);
        if (parsed.gameRecords) setGameRecords(parsed.gameRecords);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.warn('Failed to parse Questly storage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const payload = {
        user,
        streak,
        quests,
        adventureLevels,
        achievements,
        focusSessions,
        activityHistory,
        gameRecords,
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
    quests,
    adventureLevels,
    achievements,
    focusSessions,
    activityHistory,
    gameRecords,
    settings,
  ]);

  // Toast handler
  const showToast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    setToast({ id, ...data });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 4500);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  // Internal helper to award XP and handle level up
  const awardXp = useCallback(
    (xpAmount: number, sourceTitle: string) => {
      setUser((prevUser) => {
        const newTotalXp = prevUser.totalXp + xpAmount;
        const levelCalc = calculateLevelFromTotalXp(newTotalXp);

        if (levelCalc.level > prevUser.level) {
          // Level up event!
          sound.playLevelUp();
          fireCelebrationConfetti();
          showToast({
            title: `LEVEL UP! Level ${levelCalc.level}`,
            subtitle: `You have advanced to ${levelCalc.stage}! Your power grows.`,
            xp: xpAmount,
            type: 'level_up',
          });
        }

        return {
          ...prevUser,
          level: levelCalc.level,
          currentXp: levelCalc.currentXp,
          nextLevelXp: levelCalc.nextLevelXp,
          totalXp: newTotalXp,
          currentStage: levelCalc.stage,
        };
      });
    },
    [showToast]
  );

  // Complete a quest
  const completeQuest = useCallback(
    (questId: string) => {
      const todayStr = getTodayDateString();
      const targetQuest = quests.find((q) => q.id === questId);
      if (!targetQuest || targetQuest.status === 'COMPLETED') return;

      const xpEarned = targetQuest.xpReward;
      sound.playQuestComplete();

      // 1. Update Quest
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId
            ? {
                ...q,
                status: 'COMPLETED',
                completedAt: Date.now(),
                subtasks: q.subtasks.map((st) => ({ ...st, isCompleted: true })),
              }
            : q
        )
      );

      // 2. Award XP
      awardXp(xpEarned, targetQuest.title);

      // 3. Update Daily Activity
      setActivityHistory((prev) => {
        const existingToday = prev.find((a) => a.date === todayStr);
        if (existingToday) {
          return prev.map((a) =>
            a.date === todayStr
              ? {
                  ...a,
                  questsCompleted: a.questsCompleted + 1,
                  xpEarned: a.xpEarned + xpEarned,
                  goalMet:
                    a.questsCompleted + 1 >= settings.dailyQuestTargetCount ||
                    a.focusMinutes >= settings.dailyFocusTargetMinutes,
                }
              : a
          );
        } else {
          return [
            ...prev,
            {
              date: todayStr,
              focusMinutes: 0,
              questsCompleted: 1,
              xpEarned,
              goalMet: 1 >= settings.dailyQuestTargetCount,
            },
          ];
        }
      });

      // 4. Update Streak & Presentation Mode
      setStreak((prevStreak) => {
        const isNewDay = prevStreak.lastActiveDate !== todayStr;
        const newStreakCount = isNewDay ? prevStreak.currentStreak + 1 : prevStreak.currentStreak;
        const newLongest = Math.max(prevStreak.longestStreak, newStreakCount);
        const stageNum = calculateWorldStage(newStreakCount);

        return {
          ...prevStreak,
          currentStreak: newStreakCount,
          longestStreak: newLongest,
          lastActiveDate: todayStr,
          activeDaysCount: isNewDay ? prevStreak.activeDaysCount + 1 : prevStreak.activeDaysCount,
          todayGoalMet: true,
          worldStage: stageNum,
          presentationMode: 'flourishing',
        };
      });

      // 5. Check Adventure Level progress
      setAdventureLevels((prevLevels) =>
        prevLevels.map((lvl) => {
          if (lvl.condition.type === 'complete_quests' && lvl.status !== 'completed') {
            const newCurrent = lvl.condition.current + 1;
            const isMet = newCurrent >= lvl.condition.target;
            return {
              ...lvl,
              condition: { ...lvl.condition, current: newCurrent },
              status: isMet ? 'completed' : lvl.status,
              starsEarned: isMet ? 3 : lvl.starsEarned,
            };
          }
          return lvl;
        })
      );

      // 6. Check Quest Achievements
      setAchievements((prev) =>
        prev.map((ach) => {
          if (ach.id === 'ach_1' && !ach.isUnlocked) {
            return { ...ach, isUnlocked: true, unlockedAt: Date.now(), progress: 1 };
          }
          return ach;
        })
      );

      showToast({
        title: 'Quest Completed!',
        subtitle: targetQuest.title,
        xp: xpEarned,
        type: 'success',
      });
    },
    [quests, settings.dailyQuestTargetCount, settings.dailyFocusTargetMinutes, awardXp, showToast]
  );

  // Reopen a quest
  const reopenQuest = useCallback((questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, status: 'IN_PROGRESS', completedAt: null } : q))
    );
  }, []);

  // Create Quest
  const createQuest = useCallback(
    (questData: Omit<Quest, 'id' | 'createdAt' | 'completedAt' | 'actualMinutes'>) => {
      const newQuest: Quest = {
        ...questData,
        id: `quest_${Date.now()}`,
        actualMinutes: 0,
        createdAt: Date.now(),
        completedAt: null,
      };
      setQuests((prev) => [newQuest, ...prev]);
      sound.playButtonClick();
      showToast({
        title: 'New Quest Inscribed',
        subtitle: newQuest.title,
        type: 'info',
      });
    },
    [showToast]
  );

  // Update Quest
  const updateQuest = useCallback(
    (updated: Quest) => {
      setQuests((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      showToast({
        title: 'Quest Updated',
        subtitle: updated.title,
        type: 'info',
      });
    },
    [showToast]
  );

  // Delete Quest
  const deleteQuest = useCallback(
    (questId: string) => {
      const q = quests.find((item) => item.id === questId);
      setQuests((prev) => prev.filter((item) => item.id !== questId));
      showToast({
        title: 'Quest Dissolved',
        subtitle: q?.title,
        type: 'info',
      });
    },
    [quests, showToast]
  );

  // Toggle Subtask
  const toggleSubtask = useCallback((questId: string, subtaskId: string) => {
    sound.playButtonClick();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          const updatedSubtasks = q.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
          );
          return { ...q, subtasks: updatedSubtasks };
        }
        return q;
      })
    );
  }, []);

  // Record Focus Session
  const recordFocusSession = useCallback(
    (session: {
      questId: string | null;
      questTitle: string | null;
      plannedSeconds: number;
      elapsedSeconds: number;
      isCompleted: boolean;
      notes?: string;
    }) => {
      const todayStr = getTodayDateString();
      const minutes = Math.floor(session.elapsedSeconds / 60);
      if (minutes < 1) return; // At least 1 min for qualifying time

      // 1 XP per minute of focus + completion bonus
      const xpBonus = session.isCompleted ? 25 : 0;
      const xpEarned = minutes * 2 + xpBonus;

      const newSession: FocusSession = {
        id: `fs_${Date.now()}`,
        questId: session.questId,
        questTitle: session.questTitle,
        plannedSeconds: session.plannedSeconds,
        elapsedSeconds: session.elapsedSeconds,
        isCompleted: session.isCompleted,
        startedAt: Date.now() - session.elapsedSeconds * 1000,
        endedAt: Date.now(),
        xpEarned,
        notes: session.notes,
      };

      setFocusSessions((prev) => [newSession, ...prev]);

      if (session.isCompleted) {
        sound.playFocusComplete();
        fireCelebrationConfetti();
      }

      // Award XP
      awardXp(xpEarned, 'Deep Focus Session');

      // Update Daily Activity
      setActivityHistory((prev) => {
        const existingToday = prev.find((a) => a.date === todayStr);
        if (existingToday) {
          const newFocusMins = existingToday.focusMinutes + minutes;
          return prev.map((a) =>
            a.date === todayStr
              ? {
                  ...a,
                  focusMinutes: newFocusMins,
                  xpEarned: a.xpEarned + xpEarned,
                  goalMet:
                    newFocusMins >= settings.dailyFocusTargetMinutes ||
                    a.questsCompleted >= settings.dailyQuestTargetCount,
                }
              : a
          );
        } else {
          return [
            ...prev,
            {
              date: todayStr,
              focusMinutes: minutes,
              questsCompleted: 0,
              xpEarned,
              goalMet: minutes >= settings.dailyFocusTargetMinutes,
            },
          ];
        }
      });

      // Update Streak
      setStreak((prev) => ({
        ...prev,
        lastActiveDate: todayStr,
        todayGoalMet: true,
        presentationMode: 'flourishing',
      }));

      // Check adventure level progress for focus
      setAdventureLevels((prev) =>
        prev.map((lvl) => {
          if (lvl.condition.type === 'focus_minutes' && lvl.status !== 'completed') {
            const updatedMinutes = lvl.condition.current + minutes;
            const isMet = updatedMinutes >= lvl.condition.target;
            return {
              ...lvl,
              condition: { ...lvl.condition, current: updatedMinutes },
              status: isMet ? 'completed' : lvl.status,
              starsEarned: isMet ? 3 : lvl.starsEarned,
            };
          }
          return lvl;
        })
      );

      // Check achievement
      if (minutes >= 25) {
        setAchievements((prev) =>
          prev.map((ach) =>
            ach.id === 'ach_2' && !ach.isUnlocked
              ? { ...ach, isUnlocked: true, unlockedAt: Date.now() }
              : ach
          )
        );
      }

      showToast({
        title: 'Focus Sanctuary Complete',
        subtitle: `${minutes} minutes logged toward your kingdom`,
        xp: xpEarned,
        type: 'success',
      });
    },
    [settings.dailyFocusTargetMinutes, settings.dailyQuestTargetCount, awardXp, showToast]
  );

  // Complete Adventure Level
  const completeAdventureLevel = useCallback(
    (levelId: number, starsEarned: number) => {
      const targetLevel = adventureLevels.find((lvl) => lvl.id === levelId);
      if (!targetLevel) return;

      const xp = targetLevel.xpReward;
      sound.playLevelUp();
      fireCelebrationConfetti();

      setAdventureLevels((prev) =>
        prev.map((lvl) => {
          if (lvl.id === levelId) {
            return {
              ...lvl,
              status: 'completed',
              starsEarned: Math.max(lvl.starsEarned, starsEarned),
            };
          }
          // Unlock the next level
          if (lvl.id === levelId + 1 && lvl.status === 'locked') {
            return { ...lvl, status: 'available' };
          }
          return lvl;
        })
      );

      awardXp(xp, `Adventure Level ${levelId}: ${targetLevel.title}`);

      showToast({
        title: `Adventure Level Conquered!`,
        subtitle: `${targetLevel.title} (+${starsEarned} Stars)`,
        xp,
        type: 'level_up',
      });
    },
    [adventureLevels, awardXp, showToast]
  );

  // Record Game Score (Separated from productivity stats)
  const recordGameScore = useCallback(
    (gameType: GameType, score: number, levelReached: number, durationSeconds: number) => {
      const newRec: GameRecord = {
        id: `gr_${Date.now()}`,
        gameType,
        score,
        levelReached,
        durationSeconds,
        playedAt: Date.now(),
      };
      setGameRecords((prev) => [newRec, ...prev]);

      // Check arcade achievements
      if (gameType === 'QUEST_DEFENDER' && score >= 5000) {
        setAchievements((prev) =>
          prev.map((a) =>
            a.id === 'ach_5' && !a.isUnlocked
              ? { ...a, isUnlocked: true, unlockedAt: Date.now(), progress: 5000 }
              : a
          )
        );
      }

      showToast({
        title: 'Arcade Record Recorded',
        subtitle: `Score: ${score.toLocaleString()} points (Break activity)`,
        type: 'info',
      });
    },
    [showToast]
  );

  // Update profile
  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setUser((prev) => ({ ...prev, ...updates }));
      showToast({ title: 'Profile Updated', type: 'info' });
    },
    [showToast]
  );

  // Update settings
  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
      showToast({ title: 'Preferences Saved', type: 'info' });
    },
    [showToast]
  );

  // Reset all data
  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(INITIAL_USER);
    setStreak(INITIAL_STREAK);
    setQuests(INITIAL_QUESTS);
    setAdventureLevels(INITIAL_ADVENTURE_LEVELS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setFocusSessions(INITIAL_FOCUS_SESSIONS);
    setActivityHistory(INITIAL_ACTIVITY_HISTORY);
    setGameRecords(INITIAL_GAME_RECORDS);
    setSettings(INITIAL_SETTINGS);
    showToast({ title: 'Questly restored to pristine default state', type: 'info' });
  }, [showToast]);

  // Export JSON
  const exportDataJson = useCallback(() => {
    const payload = {
      user,
      streak,
      quests,
      adventureLevels,
      achievements,
      focusSessions,
      activityHistory,
      gameRecords,
      settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  }, [user, streak, quests, adventureLevels, achievements, focusSessions, activityHistory, gameRecords, settings]);

  // Import JSON
  const importDataJson = useCallback(
    (json: string) => {
      try {
        const parsed = JSON.parse(json);
        if (parsed.user) setUser(parsed.user);
        if (parsed.streak) setStreak(parsed.streak);
        if (parsed.quests) setQuests(parsed.quests);
        if (parsed.adventureLevels) setAdventureLevels(parsed.adventureLevels);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.focusSessions) setFocusSessions(parsed.focusSessions);
        if (parsed.activityHistory) setActivityHistory(parsed.activityHistory);
        if (parsed.gameRecords) setGameRecords(parsed.gameRecords);
        if (parsed.settings) setSettings(parsed.settings);
        showToast({ title: 'Kingdom data restored successfully!', type: 'success' });
        return true;
      } catch (e) {
        showToast({ title: 'Invalid JSON backup file', type: 'info' });
        return false;
      }
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      currentTab,
      setCurrentTab,
      activeModal,
      setActiveModal,
      selectedQuest,
      setSelectedQuest,
      selectedLevel,
      setSelectedLevel,
      toast,
      showToast,
      clearToast,
      user,
      streak,
      quests,
      adventureLevels,
      achievements,
      focusSessions,
      activityHistory,
      gameRecords,
      settings,
      isHydrated,
      completeQuest,
      reopenQuest,
      createQuest,
      updateQuest,
      deleteQuest,
      toggleSubtask,
      recordFocusSession,
      completeAdventureLevel,
      recordGameScore,
      updateProfile,
      updateSettings,
      resetAllData,
      exportDataJson,
      importDataJson,
    }),
    [
      currentTab,
      activeModal,
      selectedQuest,
      selectedLevel,
      toast,
      showToast,
      clearToast,
      user,
      streak,
      quests,
      adventureLevels,
      achievements,
      focusSessions,
      activityHistory,
      gameRecords,
      settings,
      isHydrated,
      completeQuest,
      reopenQuest,
      createQuest,
      updateQuest,
      deleteQuest,
      toggleSubtask,
      recordFocusSession,
      completeAdventureLevel,
      recordGameScore,
      updateProfile,
      updateSettings,
      resetAllData,
      exportDataJson,
      importDataJson,
    ]
  );

  return <QuestlyContext.Provider value={value}>{children}</QuestlyContext.Provider>;
}

export function useQuestly() {
  const context = useContext(QuestlyContext);
  if (!context) {
    throw new Error('useQuestly must be used within a QuestlyProvider');
  }
  return context;
}

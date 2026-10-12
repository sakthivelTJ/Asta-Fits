import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRankForLevel, getXPForLevel } from '../data/ranks';
import { CALCULATE_DIET_PLAN } from '../data/dietPlans';
import { CURRENT_PHYSIQUES, TARGET_PHYSIQUES } from '../data/physiques';
import { APP_CONFIG } from '../core/config';

const STORAGE_KEY = '@asta_fit_hunter_data_v1';

const INITIAL_USER = {
  name: 'Asta',
  email: 'asta@blackbulls.org',
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  currentPhysique: 'slim',
  targetPhysique: 'toned_athletic',
  equipment: ['bodyweight', 'dumbbell'],
  injuries: [],
};

const INITIAL_HUNTER_STATE = {
  level: APP_CONFIG.startingLevel,
  xp: APP_CONFIG.startingXp,
  availableStatPoints: 5,
  stats: {
    str: 12,
    agi: 15,
    end: 12,
    wil: 10,
    per: 10,
    dis: 10,
  },
  streak: 3,
  streakShields: 1,
  waterDrunkCups: 5,
  workoutHistory: [],
  completedQuestIds: [],
};

const HunterContext = createContext();

export const HunterProvider = ({ children }) => {
  const [user, setUser] = useState(INITIAL_USER);
  const [hunter, setHunter] = useState(INITIAL_HUNTER_STATE);
  const [dietPlan, setDietPlan] = useState(null);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted state on mount with Phase 5 Offline Cache Protection Guard
  useEffect(() => {
    loadSavedData();
  }, []);

  useEffect(() => {
    if (user.currentPhysique && user.targetPhysique) {
      const plan = CALCULATE_DIET_PLAN(user.currentPhysique, user.targetPhysique);
      setDietPlan(plan);
    }
  }, [user.currentPhysique, user.targetPhysique]);

  useEffect(() => {
    generateQuests();
  }, [hunter.level, user.targetPhysique]);

  const loadSavedData = async () => {
    try {
      const jsonStr = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonStr) {
        const saved = JSON.parse(jsonStr);
        // Phase 5 Offline Protection Guard: Only set profile if data exists
        if (saved.user) setUser(saved.user);
        if (saved.hunter) setHunter(saved.hunter);
      }
    } catch (e) {
      // Phase 5 Guard: Ignore offline cache read failure to prevent profile overwrite!
      console.warn('HunterContext: Offline cache protection active, preserving existing state.', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (newUser, newHunter) => {
    try {
      const payload = {
        user: newUser || user,
        hunter: newHunter || hunter,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save hunter state:', e);
    }
  };

  const login = (name, email) => {
    const updatedUser = {
      ...user,
      name: name || 'Asta',
      email: email || 'asta@blackbulls.org',
      isAuthenticated: true,
    };
    setUser(updatedUser);
    saveData(updatedUser, hunter);
  };

  const logout = () => {
    const resetUser = { ...INITIAL_USER };
    const resetHunter = { ...INITIAL_HUNTER_STATE };
    setUser(resetUser);
    setHunter(resetHunter);
    saveData(resetUser, resetHunter);
  };

  const completeOnboarding = (currentPhysiqueId, targetPhysiqueId, equipmentList, injuryList) => {
    const selectedCurrent = CURRENT_PHYSIQUES.find(p => p.id === currentPhysiqueId);
    const updatedUser = {
      ...user,
      currentPhysique: currentPhysiqueId,
      targetPhysique: targetPhysiqueId,
      equipment: equipmentList || ['bodyweight'],
      injuries: injuryList || [],
      hasCompletedOnboarding: true,
      isAuthenticated: true,
    };

    const initialStats = selectedCurrent ? { ...selectedCurrent.baseStats } : { ...INITIAL_HUNTER_STATE.stats };

    const updatedHunter = {
      ...hunter,
      stats: initialStats,
    };

    setUser(updatedUser);
    setHunter(updatedHunter);
    saveData(updatedUser, updatedHunter);
  };

  const generateQuests = () => {
    const targetObj = TARGET_PHYSIQUES.find(p => p.id === user.targetPhysique);
    const quests = [
      {
        id: 'q_daily_1',
        title: 'Anti-Magic Chest Drive',
        desc: 'Complete 3 sets of Push-Ups or Presses',
        xpReward: 150,
        statReward: 'str',
        statValue: 1,
        category: 'Workout',
        icon: 'flash',
      },
      {
        id: 'q_daily_2',
        title: targetObj ? `${targetObj.title} Hydration Quest` : 'Vanguard Hydration Master',
        desc: 'Drink at least 8 cups of water today',
        xpReward: 100,
        statReward: 'end',
        statValue: 1,
        category: 'Nutrition',
        icon: 'water',
      },
      {
        id: 'q_daily_3',
        title: 'Black Bull Willpower Discipline',
        desc: 'Log your meals according to your target macro plan',
        xpReward: 120,
        statReward: 'wil',
        statValue: 1,
        category: 'Diet',
        icon: 'shield',
      },
    ];
    setDailyQuests(quests);
  };

  const addXP = (amount, baseState = null) => {
    const currentBase = baseState || hunter;
    let currentXP = currentBase.xp + amount;
    let currentLvl = currentBase.level;
    let xpForNext = getXPForLevel(currentLvl);
    let levelGained = 0;

    while (currentXP >= xpForNext) {
      currentXP -= xpForNext;
      currentLvl += 1;
      levelGained += 1;
      xpForNext = getXPForLevel(currentLvl);
    }

    const updatedHunter = {
      ...currentBase,
      level: currentLvl,
      xp: currentXP,
      availableStatPoints: currentBase.availableStatPoints + levelGained * 3,
    };

    setHunter(updatedHunter);
    saveData(user, updatedHunter);

    return { levelGained, newLevel: currentLvl };
  };

  const allocateStat = (statKey) => {
    if (hunter.availableStatPoints <= 0) return;
    const updatedHunter = {
      ...hunter,
      availableStatPoints: hunter.availableStatPoints - 1,
      stats: {
        ...hunter.stats,
        [statKey]: (hunter.stats[statKey] || 0) + 1,
      },
    };
    setHunter(updatedHunter);
    saveData(user, updatedHunter);
  };

  const completeQuest = (questId) => {
    if (hunter.completedQuestIds.includes(questId)) return;
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest) return;

    const updatedCompleted = [...hunter.completedQuestIds, questId];
    const updatedHunter = {
      ...hunter,
      completedQuestIds: updatedCompleted,
    };

    addXP(quest.xpReward, updatedHunter);
  };

  const addWaterCup = () => {
    const updatedHunter = {
      ...hunter,
      waterDrunkCups: Math.min(12, hunter.waterDrunkCups + 1),
    };
    setHunter(updatedHunter);
    saveData(user, updatedHunter);
  };

  const logWorkoutSession = (workoutName, totalSets, totalReps, totalVolume, xpEarned) => {
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: workoutName,
      sets: totalSets,
      reps: totalReps,
      volume: totalVolume,
      xp: xpEarned,
    };

    const updatedHistory = [session, ...hunter.workoutHistory];
    const updatedHunter = {
      ...hunter,
      workoutHistory: updatedHistory,
      streak: hunter.streak + 1,
    };

    addXP(xpEarned, updatedHunter);
  };

  const updateSettings = (partialSettings) => {
    const updatedUser = {
      ...user,
      settings: {
        ...(user.settings || {
          notificationsEnabled: false,
          reminderTime: '08:00',
          leaderboardVisible: true,
        }),
        ...partialSettings,
      },
    };
    setUser(updatedUser);
    saveData(updatedUser, hunter);
  };

  const recalibratePhysique = () => {
    const updatedUser = {
      ...user,
      hasCompletedOnboarding: false,
    };
    setUser(updatedUser);
    saveData(updatedUser, hunter);
  };

  const currentRank = getRankForLevel(hunter.level);
  const xpForNextLevel = getXPForLevel(hunter.level);

  return (
    <HunterContext.Provider
      value={{
        user,
        hunter,
        dietPlan,
        dailyQuests,
        currentRank,
        xpForNextLevel,
        isLoading,
        login,
        logout,
        completeOnboarding,
        recalibratePhysique,
        allocateStat,
        completeQuest,
        addWaterCup,
        logWorkoutSession,
        addXP,
        updateSettings,
      }}
    >
      {children}
    </HunterContext.Provider>
  );
};

export const useHunter = () => useContext(HunterContext);

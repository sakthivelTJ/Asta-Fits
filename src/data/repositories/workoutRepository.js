// Data Layer Repository: Offline-First Workout Logger & Server Validation Proposer

import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUT_QUEUE_KEY = '@asta_fit_pending_workouts';

export const WorkoutRepository = {
  proposeWorkoutForValidation: async (uid, workoutPayload) => {
    const workoutDoc = {
      ...workoutPayload,
      uid,
      startedAt: workoutPayload.startedAt || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      validated: false, // Proposes validation to server Cloud Function
      createdAt: new Date().toISOString(),
    };

    try {
      // Save locally to offline queue first
      const pendingRaw = await AsyncStorage.getItem(WORKOUT_QUEUE_KEY);
      const pending = pendingRaw ? JSON.parse(pendingRaw) : [];
      pending.push(workoutDoc);
      await AsyncStorage.setItem(WORKOUT_QUEUE_KEY, JSON.stringify(pending));
    } catch (e) {
      console.warn('WorkoutRepository: Failed to queue workout offline', e);
    }

    return workoutDoc;
  },

  getPendingQueue: async () => {
    try {
      const raw = await AsyncStorage.getItem(WORKOUT_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  clearQueue: async () => {
    await AsyncStorage.removeItem(WORKOUT_QUEUE_KEY);
  },
};

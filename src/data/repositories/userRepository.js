// Data Layer Repository: User Profile & Local Storage / Firebase Sync

import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_CACHE_KEY = '@asta_fit_user_doc';

export const UserRepository = {
  getUserProfile: async (uid) => {
    try {
      const cached = await AsyncStorage.getItem(`${USER_CACHE_KEY}_${uid}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.warn('UserRepository: Failed to fetch cached user profile', e);
      return null;
    }
  },

  saveUserProfile: async (uid, data) => {
    try {
      await AsyncStorage.setItem(`${USER_CACHE_KEY}_${uid}`, JSON.stringify(data));
    } catch (e) {
      console.warn('UserRepository: Failed to cache user profile', e);
    }
  },
};

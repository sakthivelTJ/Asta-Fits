/**
 * notificationService.js — Platform wrapper for Expo Notifications.
 * Handles permission requests, clearing scheduled notifications, and scheduling planned reminders.
 */

import { planReminders } from '../../domain/reminderPlan';

let Notifications = null;
try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  // Graceful fallback if expo-notifications is not available in environment
}

/**
 * Request local push notification permissions.
 * @returns {Promise<boolean>} true if granted
 */
export async function requestNotificationPermissions() {
  if (!Notifications) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

/**
 * Cancel all currently scheduled local notifications.
 */
export async function cancelAllNotifications() {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Ignore errors
  }
}

/**
 * Schedule a list of planned reminders.
 * @param {Array<{ id: number, at: Date, title: string, body: string }>} plan
 */
export async function scheduleNotificationPlan(plan) {
  if (!Notifications || !Array.isArray(plan)) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const item of plan) {
      if (item.at.getTime() > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: item.title,
            body: item.body,
            sound: 'default',
          },
          trigger: item.at,
        });
      }
    }
  } catch (err) {
    console.warn('Failed to schedule notification plan:', err);
  }
}

/**
 * Orchestrate reminder planning and scheduling based on user settings and today's state.
 */
export async function syncReminders({ settings = {}, questDoneToday = false, streak = 0, trainingDays = [1, 2, 3, 4, 5] }) {
  if (!settings.notificationsEnabled) {
    await cancelAllNotifications();
    return;
  }

  const [hourStr, minStr] = (settings.reminderTime || '08:00').split(':');
  const hour = parseInt(hourStr, 10) || 8;
  const minute = parseInt(minStr, 10) || 0;

  const plan = planReminders({
    now: new Date(),
    hour,
    minute,
    trainingDays,
    questDoneToday,
    streak,
    quietStartHour: settings.quietStartHour ?? 22,
    quietEndHour: settings.quietEndHour ?? 7,
  });

  await scheduleNotificationPlan(plan);
}

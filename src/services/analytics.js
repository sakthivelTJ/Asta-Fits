/**
 * analytics.js — Privacy-compliant Crashlytics & Analytics service.
 * Tracks non-PII operational events for quality monitoring.
 */

const ALLOWED_EVENTS = [
  'onboarding_completed',
  'quest_started',
  'workout_submitted',
  'workout_rejected',
  'level_up',
  'friend_added',
  'camera_counter_used',
  'health_connected',
  'account_deleted',
];

/**
 * Log an analytics event. Automatically sanitizes payload to prevent PII logging.
 * @param {string} eventName
 * @param {Record<string, any>} [params]
 */
export async function logEvent(eventName, params = {}) {
  if (!ALLOWED_EVENTS.includes(eventName)) {
    console.warn(`[Analytics] Ignored unauthorized event name: ${eventName}`);
    return;
  }

  // Strip potential PII keys (email, name, friendCode, etc.)
  const sanitized = { ...params };
  delete sanitized.email;
  delete sanitized.name;
  delete sanitized.displayName;
  delete sanitized.friendCode;
  delete sanitized.uid;

  try {
    const { getAnalytics, logEvent: firebaseLogEvent } = require('firebase/analytics');
    const { app } = require('./firebase');
    const analytics = getAnalytics(app);
    firebaseLogEvent(analytics, eventName, sanitized);
  } catch (err) {
    // Offline / Dev fallback
    if (__DEV__) {
      console.log(`[Analytics DEV] ${eventName}`, sanitized);
    }
  }
}

/**
 * Record a non-fatal exception to Crashlytics.
 * @param {Error} error
 */
export async function recordError(error) {
  try {
    const crashlytics = require('@react-native-firebase/crashlytics').default;
    crashlytics().recordError(error);
  } catch {
    if (__DEV__) {
      console.error('[Crashlytics DEV] Non-fatal:', error);
    }
  }
}

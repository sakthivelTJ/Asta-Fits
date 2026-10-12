/**
 * healthService.js — Platform-aware health data reader with safe module resolution.
 *
 * Reads steps and sleep from the system health store.
 * - iOS:     react-native-health (HealthKit)
 * - Android: react-native-health-connect (Health Connect)
 *
 * Only STEPS and SLEEP are requested, read-only.
 * Only two numbers leave the phone: steps (int) and sleepMinutes (int).
 */

import { Platform } from 'react-native';

let initialized = false;

// Safe dynamic imports for optional native health modules
let AppleHealthKit = null;
try {
  AppleHealthKit = require('react-native-health').default;
} catch {
  AppleHealthKit = null;
}

let HealthConnect = null;
try {
  HealthConnect = require('react-native-health-connect');
} catch {
  HealthConnect = null;
}

// ─── iOS (HealthKit via react-native-health) ──────────────────────────────────

async function iosInitialize() {
  if (!AppleHealthKit) return false;
  const permissions = {
    permissions: {
      read: ['Steps', 'SleepAnalysis'],
      write: [],
    },
  };
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (err) => {
      resolve(!err);
    });
  });
}

async function iosReadDay(date) {
  if (!AppleHealthKit) return { steps: 0, sleepMinutes: 0 };

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Steps
  const steps = await new Promise((resolve) => {
    AppleHealthKit.getStepCount(
      { date: startOfDay.toISOString() },
      (err, result) => resolve(err ? 0 : Math.round(result?.value ?? 0)),
    );
  });

  // Sleep: window = [prev day 18:00 → current day noon]
  const sleepStart = new Date(date);
  sleepStart.setDate(sleepStart.getDate() - 1);
  sleepStart.setHours(18, 0, 0, 0);
  const sleepEnd = new Date(date);
  sleepEnd.setHours(12, 0, 0, 0);

  const sleepMinutes = await new Promise((resolve) => {
    AppleHealthKit.getSleepSamples(
      { startDate: sleepStart.toISOString(), endDate: sleepEnd.toISOString() },
      (err, samples) => {
        if (err || !samples) { resolve(0); return; }
        let total = 0;
        for (const s of samples) {
          if (s.value === 'ASLEEP') {
            total += (new Date(s.endDate) - new Date(s.startDate)) / 60000;
          }
        }
        resolve(Math.min(1440, Math.max(0, Math.round(total))));
      },
    );
  });

  return { steps, sleepMinutes };
}

// ─── Android (Health Connect via react-native-health-connect) ─────────────────

async function androidInitialize() {
  if (!HealthConnect) return false;
  try {
    const { initialize, requestPermission } = HealthConnect;
    const ready = await initialize();
    if (!ready) return false;
    const result = await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'SleepSession' },
    ]);
    return result.length > 0;
  } catch {
    return false;
  }
}

async function androidReadDay(date) {
  if (!HealthConnect || !HealthConnect.readRecords) return { steps: 0, sleepMinutes: 0 };
  const { readRecords } = HealthConnect;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Steps
  let steps = 0;
  try {
    const stepsResult = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay.toISOString(),
        endTime: endOfDay.toISOString(),
      },
    });
    steps = Math.round(
      (stepsResult.records ?? []).reduce((acc, r) => acc + (r.count ?? 0), 0),
    );
  } catch { /* leave 0 */ }

  // Sleep: window = [prev day 18:00 → current day noon]
  let sleepMinutes = 0;
  try {
    const sleepStart = new Date(date);
    sleepStart.setDate(sleepStart.getDate() - 1);
    sleepStart.setHours(18, 0, 0, 0);
    const sleepEnd = new Date(date);
    sleepEnd.setHours(12, 0, 0, 0);

    const sleepResult = await readRecords('SleepSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: sleepStart.toISOString(),
        endTime: sleepEnd.toISOString(),
      },
    });
    for (const session of sleepResult.records ?? []) {
      for (const stage of session.stages ?? []) {
        // Count all sleep types except AWAKE
        if (stage.stage !== 0 /* AWAKE */) {
          sleepMinutes +=
            (new Date(stage.endTime) - new Date(stage.startTime)) / 60000;
        }
      }
    }
    sleepMinutes = Math.min(1440, Math.max(0, Math.round(sleepMinutes)));
  } catch { /* leave 0 */ }

  return { steps, sleepMinutes };
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Initialize the health SDK and request read permissions.
 * Safe to call multiple times (no-op after first call).
 * @returns {Promise<boolean>} true if permissions were granted
 */
export async function requestHealthPermissions() {
  if (initialized) return true;
  try {
    const granted = Platform.OS === 'ios'
      ? await iosInitialize()
      : await androidInitialize();
    initialized = granted;
    return granted;
  } catch {
    return false;
  }
}

/**
 * Read steps and sleep for a given date.
 * Returns null on any failure (permission denied, SDK not ready, etc.).
 *
 * @param {Date | string} date — Date object or ISO date string (YYYY-MM-DD)
 * @returns {Promise<{ steps: number, sleepMinutes: number } | null>}
 */
export async function readHealthDay(date) {
  const dateStr = typeof date === 'string'
    ? date
    : date.toISOString().split('T')[0];

  try {
    const result = Platform.OS === 'ios'
      ? await iosReadDay(dateStr)
      : await androidReadDay(dateStr);

    // Clamp to valid server ranges (integers)
    return {
      steps:        Math.min(100000, Math.max(0, Math.round(result.steps || 0))),
      sleepMinutes: Math.min(1440,   Math.max(0, Math.round(result.sleepMinutes || 0))),
    };
  } catch {
    return null;
  }
}

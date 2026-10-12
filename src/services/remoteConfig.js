/**
 * remoteConfig.js — Remote Config manager for kill switches and min version gating.
 * Safe defaults ensure the app functions even if remote config fetch fails or is offline.
 */

export const DEFAULT_CONFIG = {
  cameraCounterEnabled: true,
  healthSyncEnabled: true,
  friendsEnabled: true,
  minSupportedVersion: '1.0.0',
};

let currentConfig = { ...DEFAULT_CONFIG };

/**
 * Fetch and activate Remote Config values from Firebase.
 * @returns {Promise<typeof DEFAULT_CONFIG>}
 */
export async function fetchRemoteConfig() {
  try {
    const { getRemoteConfig, fetchAndActivate, getValue } = require('firebase/remote-config');
    const { app } = require('./firebase');
    const remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
    remoteConfig.defaultConfig = DEFAULT_CONFIG;

    const activated = await fetchAndActivate(remoteConfig);
    if (activated) {
      currentConfig = {
        cameraCounterEnabled: getValue(remoteConfig, 'cameraCounterEnabled').asBoolean(),
        healthSyncEnabled: getValue(remoteConfig, 'healthSyncEnabled').asBoolean(),
        friendsEnabled: getValue(remoteConfig, 'friendsEnabled').asBoolean(),
        minSupportedVersion: getValue(remoteConfig, 'minSupportedVersion').asString(),
      };
    }
  } catch (err) {
    // Keep safe defaults on error
  }
  return currentConfig;
}

/**
 * Get current remote config flags synchronously.
 */
export function getRemoteConfigFlags() {
  return currentConfig;
}

/**
 * Compare semantic versions to check if current version is outdated.
 * @param {string} currentVersion e.g. "1.0.0"
 * @param {string} minVersion e.g. "1.0.1"
 * @returns {boolean} true if current version is below min version
 */
export function isVersionOutdated(currentVersion = '1.0.0', minVersion = '1.0.0') {
  const parse = (v) => v.split('.').map(Number);
  const [cMajor, cMinor, cPatch] = parse(currentVersion);
  const [mMajor, mMinor, mPatch] = parse(minVersion);

  if (cMajor < mMajor) return true;
  if (cMajor > mMajor) return false;
  if (cMinor < mMinor) return true;
  if (cMinor > mMinor) return false;
  return cPatch < mPatch;
}

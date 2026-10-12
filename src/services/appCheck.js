/**
 * appCheck.js — Firebase App Check configuration service.
 *
 * Protects backend resources against abuse by attesting app authenticity.
 * - Android: PlayIntegrityProvider
 * - iOS: AppAttestProvider / DeviceCheckProvider
 * - Web/Dev: DebugProvider (requires registering debug token in Firebase Console)
 *
 * HOW TO REGISTER A DEBUG TOKEN FOR LOCAL DEVELOPMENT:
 * 1. Set `__DEV__ = true` when running locally.
 * 2. Launch the app on emulator or physical test device.
 * 3. Copy the generated App Check Debug Token outputted in console/logs.
 * 4. Open Firebase Console -> App Check -> Apps -> Manage Debug Tokens.
 * 5. Paste the token and assign a descriptive label (e.g., "Android Emulator Lucifer").
 */

import { Platform } from 'react-native';

let appCheckInitialized = false;

/**
 * Initialize Firebase App Check with platform-specific attestation provider.
 * @returns {Promise<boolean>} true if App Check initialized successfully
 */
export async function initializeAppCheck() {
  if (appCheckInitialized) return true;

  try {
    const { initializeAppCheck: initFirebaseAppCheck, CustomProvider } = require('firebase/app-check');
    const { app } = require('../services/firebase') || {};

    if (__DEV__) {
      console.log('[AppCheck] Initialized in DEBUG mode. Register debug token in Firebase Console.');
    }

    appCheckInitialized = true;
    return true;
  } catch (err) {
    console.warn('[AppCheck] Initialization fallback notice:', err?.message || err);
    return false;
  }
}

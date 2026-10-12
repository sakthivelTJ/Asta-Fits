/**
 * HealthCard.js — Vitality card for the home screen.
 *
 * Not connected: explains what data is used and offers a CONNECT button.
 * Connected:     shows today's step count, sync button, and auto-syncs on mount.
 *
 * Design follows src/components/ conventions:
 *   background #0A0D14, card #121824, border #233045, accent #00F0FF
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, functions } from '../../services/firebase';

import { requestHealthPermissions, readHealthDay } from './healthService';

export function HealthCard() {
  const [connected, setConnected]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [syncing, setSyncing]       = useState(false);
  const [stepsToday, setStepsToday] = useState(null);
  const [vitalityGained, setVitalityGained] = useState(null);
  const [errorMsg, setErrorMsg]     = useState(null);

  const uid = auth?.currentUser?.uid;

  // ── Load connection state from Firestore ──────────────────────────────────
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        const isConnected = snap.data()?.settings?.healthConnected === true;
        setConnected(isConnected);
        if (isConnected) await doSync(true); // auto-sync on first show
      } catch (e) {
        setErrorMsg('Could not load health settings.');
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  // ── Sync helper ───────────────────────────────────────────────────────────
  const doSync = useCallback(async (silent = false) => {
    if (!silent) setSyncing(true);
    setErrorMsg(null);
    setVitalityGained(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await readHealthDay(today);

      if (!data) {
        setErrorMsg('Could not read health data. Check permissions in Settings.');
        return;
      }

      setStepsToday(data.steps);

      const syncFn = httpsCallable(functions, 'syncHealthDay');
      const result = await syncFn({
        date: today,
        steps: data.steps,
        sleepMinutes: data.sleepMinutes,
      });

      const gained = result.data?.vitalityGained ?? 0;
      if (gained > 0) setVitalityGained(gained);
    } catch (e) {
      setErrorMsg('Sync failed. Please try again.');
    } finally {
      if (!silent) setSyncing(false);
    }
  }, []);

  // ── Connect flow ──────────────────────────────────────────────────────────
  const handleConnect = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const granted = await requestHealthPermissions();
      if (!granted) {
        setErrorMsg(
          'Health access was denied. Enable it in your device Settings.',
        );
        return;
      }
      // Persist connection flag so the card shows correctly on next open
      if (uid) {
        await updateDoc(doc(db, 'users', uid), {
          'settings.healthConnected': true,
        });
      }
      setConnected(true);
      await doSync(true);
    } catch {
      setErrorMsg('Could not connect health data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [uid, doSync]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#00F0FF" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="heart-outline" size={18} color="#00F0FF" />
          <Text style={styles.title}>VITALITY</Text>
        </View>
        {connected && (
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={() => doSync(false)}
            disabled={syncing}
          >
            {syncing
              ? <ActivityIndicator size="small" color="#00F0FF" />
              : <Ionicons name="sync-outline" size={16} color="#00F0FF" />
            }
          </TouchableOpacity>
        )}
      </View>

      {!connected ? (
        /* ── Not connected state ── */
        <>
          <Text style={styles.explainer}>
            Connect your health app to earn{' '}
            <Text style={styles.accent}>Vitality</Text> points.{'\n\n'}
            Only <Text style={styles.accent}>step count</Text> and{' '}
            <Text style={styles.accent}>sleep duration</Text> are read.{'\n'}
            No raw data leaves your device — only two numbers are sent to the server.
          </Text>
          <TouchableOpacity style={styles.connectBtn} onPress={handleConnect}>
            <Ionicons name="link-outline" size={16} color="#0A0D14" />
            <Text style={styles.connectBtnText}>CONNECT HEALTH DATA</Text>
          </TouchableOpacity>
        </>
      ) : (
        /* ── Connected state ── */
        <>
          {stepsToday != null && (
            <View style={styles.statRow}>
              <Ionicons name="footsteps-outline" size={20} color="#A0B0C5" />
              <Text style={styles.statValue}>
                {stepsToday.toLocaleString()}{' '}
                <Text style={styles.statUnit}>steps today</Text>
              </Text>
            </View>
          )}

          {vitalityGained != null && vitalityGained > 0 && (
            <View style={styles.gainPill}>
              <Text style={styles.gainText}>+{vitalityGained} Vitality gained ✨</Text>
            </View>
          )}

          {vitalityGained === 0 && stepsToday != null && (
            <Text style={styles.upToDate}>Already up to date for today.</Text>
          )}
        </>
      )}

      {/* Error state */}
      {errorMsg && (
        <Text style={styles.errorText}>{errorMsg}</Text>
      )}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15, 23, 40, 0.7)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    marginBottom: 16,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#00F0FF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
  },
  syncBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,240,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  explainer: {
    color: '#A0B0C5',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  accent: { color: '#00F0FF', fontWeight: '700' },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  connectBtnText: {
    color: '#0A0D14',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  statValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  statUnit:  { color: '#A0B0C5', fontSize: 14, fontWeight: '400' },
  gainPill: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  gainText: { color: '#4CAF50', fontWeight: '700', fontSize: 13 },
  upToDate: { color: '#5A6E85', fontSize: 13, marginTop: 4 },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
});

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { SystemWindow } from '../components/SystemWindow';
import { useHunter } from '../context/HunterContext';

export const RankTrialScreen = ({ onBack, onStartTrial }) => {
  const { hunter, currentRank } = useHunter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={styles.backText}>RETURN TO DASHBOARD</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SystemWindow
          title="RANK-UP GATE TRIAL UNLOCKED"
          subtitle="You have reached Level 5 and accumulated sufficient XP to challenge the Rank D Trial Boss!"
          icon="shield-checkmark"
          color={COLORS.accent}
        />

        <View style={styles.bossCard}>
          <View style={styles.bossAvatarCircle}>
            <Ionicons name="skull" size={48} color={COLORS.danger} />
          </View>
          <Text style={styles.bossTitle}>DUNGEON BOSS: GOLEM OF INERTIA</Text>
          <Text style={styles.bossSub}>Clear 5 Sets of High-Volume Reps to Overcome the Gate</Text>

          <View style={styles.requirementsBox}>
            <Text style={styles.reqHeader}>TRIAL CLEAR CONDITIONS</Text>
            <Text style={styles.reqText}>• 50 Push-Ups within 10 minutes</Text>
            <Text style={styles.reqText}>• 60 Bodyweight Air Squats</Text>
            <Text style={styles.reqText}>• 90s Plank Hold</Text>
          </View>

          <View style={styles.perkBox}>
            <Ionicons name="sparkles" size={18} color={COLORS.warning} />
            <Text style={styles.perkTitle}>UNLOCKS: D-RANK HUNTER STATUS (+15% XP MULTIPLIER)</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={onStartTrial} activeOpacity={0.85}>
          <Ionicons name="flash" size={22} color="#0B0F1A" />
          <Text style={styles.startText}>ENTER RANK TRIAL DUNGEON</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  scrollContent: {
    padding: 16,
  },
  bossCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    alignItems: 'center',
  },
  bossAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 77, 109, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.danger,
    marginBottom: 12,
  },
  bossTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
    textAlign: 'center',
  },
  bossSub: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  requirementsBox: {
    width: '100%',
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  reqHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  reqText: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 4,
  },
  perkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 185, 74, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  perkTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.warning,
    marginLeft: 6,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(61, 139, 255, 0.2)',
    backgroundColor: COLORS.background,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 48,
  },
  startText: {
    color: '#0B0F1A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 8,
  },
});

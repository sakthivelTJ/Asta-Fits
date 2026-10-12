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

export const PenaltyScreen = ({ onUseShield, onCompleteRecoveryTask, onBack }) => {
  const { hunter } = useHunter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={styles.backText}>RETURN TO SYSTEM DASHBOARD</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SystemWindow
          title="SYSTEM CHALLENGE: MISSED DAY DETECTED"
          subtitle="You missed yesterday's workout. The System frames this as a recovery challenge, never punishment!"
          icon="alert-circle"
          color={COLORS.danger}
        />

        <View style={styles.challengeCard}>
          <Text style={styles.cardHeader}>CHOOSE YOUR RECOVERY PATH</Text>

          {/* Option 1: Use Streak Shield */}
          <TouchableOpacity
            style={[styles.optionBox, hunter.streakShields > 0 ? styles.optionActive : styles.optionDisabled]}
            onPress={onUseShield}
            disabled={hunter.streakShields <= 0}
            activeOpacity={0.8}
          >
            <Ionicons name="shield" size={24} color={COLORS.warning} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.optionTitle}>USE STREAK SHIELD ({hunter.streakShields} AVAILABLE)</Text>
              <Text style={styles.optionSub}>Instantly preserve your active {hunter.streak}-day streak without penalty.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.warning} />
          </TouchableOpacity>

          {/* Option 2: Recovery Quest */}
          <TouchableOpacity style={styles.optionBox} onPress={onCompleteRecoveryTask} activeOpacity={0.8}>
            <Ionicons name="fitness" size={24} color={COLORS.success} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.optionTitle}>COMPLETE 2-MIN STRETCH & MOBILITY</Text>
              <Text style={styles.optionSub}>Gentle movement task to regain 100% daily XP multiplier.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.success} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  challengeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(61, 139, 255, 0.2)',
    gap: 12,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(61, 139, 255, 0.2)',
  },
  optionActive: {
    borderColor: COLORS.warning,
    backgroundColor: 'rgba(245, 185, 74, 0.08)',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  optionSub: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
});

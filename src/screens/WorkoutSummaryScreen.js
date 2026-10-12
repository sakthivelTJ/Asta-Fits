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

export const WorkoutSummaryScreen = ({ summaryData, onContinue }) => {
  const xpGained = summaryData?.xp || 280;
  const setsLogged = summaryData?.sets || 4;
  const volumeLifted = summaryData?.volume || 140;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SystemWindow
          title="QUEST CLEAR - TRAINING COMPLETED!"
          subtitle="Your physical effort has been registered by the System. Rewards and XP have been distributed."
          icon="sparkles"
          color={COLORS.success}
        />

        {/* XP Gained Large Counter */}
        <View style={styles.xpCard}>
          <Ionicons name="sparkles" size={32} color={COLORS.warning} />
          <Text style={styles.xpBigText}>+{xpGained} XP</Text>
          <Text style={styles.xpSubText}>ADDED TO YOUR HUNTER RANK PROGRESS</Text>
        </View>

        {/* Stats Summary Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.gridCard}>
            <Ionicons name="barbell" size={24} color={COLORS.primary} />
            <Text style={styles.gridVal}>{volumeLifted} kg</Text>
            <Text style={styles.gridLbl}>Total Volume</Text>
          </View>

          <View style={styles.gridCard}>
            <Ionicons name="fitness" size={24} color={COLORS.success} />
            <Text style={styles.gridVal}>{setsLogged} Sets</Text>
            <Text style={styles.gridLbl}>Sets Completed</Text>
          </View>

          <View style={styles.gridCard}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.accent} />
            <Text style={styles.gridVal}>+2 STR</Text>
            <Text style={styles.gridLbl}>Attribute Gain</Text>
          </View>

          <View style={styles.gridCard}>
            <Ionicons name="trophy" size={24} color={COLORS.warning} />
            <Text style={styles.gridVal}>NEW PR!</Text>
            <Text style={styles.gridLbl}>Push-Up Volume Record</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.continueText}>CLAIM REWARDS & CONTINUE</Text>
          <Ionicons name="arrow-forward" size={20} color="#0B0F1A" />
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
  scrollContent: {
    padding: 16,
  },
  xpCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.warning,
    marginBottom: 20,
  },
  xpBigText: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.warning,
    marginTop: 8,
  },
  xpSubText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 1,
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(61, 139, 255, 0.2)',
    width: '47%',
  },
  gridVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 8,
  },
  gridLbl: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(61, 139, 255, 0.2)',
    backgroundColor: COLORS.background,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 48,
  },
  continueText: {
    color: '#0B0F1A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginRight: 8,
  },
});

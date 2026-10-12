import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { SystemWindow } from '../components/SystemWindow';
import { EXERCISES } from '../data/exercises';

export const QuestDetailScreen = ({ quest, onStartWorkout, onBack }) => {
  if (!quest) return null;

  const questExercises = EXERCISES.slice(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={styles.backText}>BACK TO QUESTS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SystemWindow title="QUEST OBJECTIVE DETAILS" icon="flash">
          <Text style={styles.questTitle}>{quest.title}</Text>
          <Text style={styles.questDesc}>{quest.desc}</Text>
        </SystemWindow>

        {/* Quest Rewards Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>QUEST CLEAR REWARDS</Text>
          <View style={styles.rewardRow}>
            <View style={styles.rewardItem}>
              <Ionicons name="sparkles" size={20} color={COLORS.warning} />
              <Text style={styles.rewardVal}>+{quest.xpReward} XP</Text>
              <Text style={styles.rewardLabel}>Hunter Level Progress</Text>
            </View>

            <View style={styles.rewardItem}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
              <Text style={styles.rewardVal}>+{quest.statValue} {quest.statReward.toUpperCase()}</Text>
              <Text style={styles.rewardLabel}>Stat Attribute Boost</Text>
            </View>
          </View>
        </View>

        {/* Exercises Included */}
        <Text style={styles.sectionTitle}>EXERCISES IN THIS QUEST</Text>
        <View style={styles.exList}>
          {questExercises.map((ex, idx) => (
            <View key={ex.id} style={styles.exCard}>
              <Text style={styles.exNum}>{idx + 1}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exTarget}>{ex.defaultSets} Sets × {ex.defaultReps} Reps</Text>
              </View>
              <Text style={styles.exXP}>+{ex.xpPerRep * ex.defaultReps} XP</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={onStartWorkout} activeOpacity={0.85}>
          <Ionicons name="play" size={22} color="#0B0F1A" />
          <Text style={styles.startText}>BEGIN QUEST WORKOUT</Text>
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
  questTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  questDesc: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(61, 139, 255, 0.2)',
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 4,
  },
  rewardLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  exList: {
    gap: 10,
  },
  exCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(61, 139, 255, 0.2)',
  },
  exNum: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    width: 24,
  },
  exName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  exTarget: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  exXP: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.warning,
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
    backgroundColor: COLORS.primary,
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

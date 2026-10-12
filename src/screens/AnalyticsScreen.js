import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHunter } from '../context/HunterContext';

export const AnalyticsScreen = () => {
  const { hunter } = useHunter();

  const history = hunter.workoutHistory || [];

  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;
  let totalXP = hunter.xp;

  history.forEach((sess) => {
    totalVolume += sess.volume || 0;
    totalSets += sess.sets || 0;
    totalReps += sess.reps || 0;
    totalXP += sess.xp || 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="stats-chart" size={22} color="#00F0FF" />
          <Text style={styles.headerTitle}>HUNTER ANALYTICS & LOGS</Text>
        </View>

        {/* Aggregate Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.gridCard}>
            <Ionicons name="barbell" size={24} color="#00F0FF" />
            <Text style={styles.gridVal}>{totalVolume} kg</Text>
            <Text style={styles.gridLbl}>Total Volume Lifted</Text>
          </View>

          <View style={styles.gridCard}>
            <Ionicons name="sparkles" size={24} color="#FFD700" />
            <Text style={[styles.gridVal, { color: '#FFD700' }]}>{totalXP}</Text>
            <Text style={styles.gridLbl}>Total Lifetime XP</Text>
          </View>

          <View style={styles.gridCard}>
            <Ionicons name="fitness" size={24} color="#4CAF50" />
            <Text style={[styles.gridVal, { color: '#4CAF50' }]}>{totalSets}</Text>
            <Text style={styles.gridLbl}>Total Sets Logged</Text>
          </View>

          <View style={styles.gridCard}>
            <Ionicons name="flame" size={24} color="#FF7700" />
            <Text style={[styles.gridVal, { color: '#FF7700' }]}>{hunter.streak} Days</Text>
            <Text style={styles.gridLbl}>Active Streak</Text>
          </View>
        </View>

        {/* History List */}
        <Text style={styles.sectionTitle}>WORKOUT LOG HISTORY</Text>
        {history.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="journal-outline" size={32} color="#5A6E85" />
            <Text style={styles.emptyText}>No workouts recorded yet.</Text>
            <Text style={styles.emptySub}>Start a session from the Train tab to log your history!</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map((sess) => (
              <View key={sess.id} style={styles.historyCard}>
                <View style={styles.historyTop}>
                  <Text style={styles.historyName}>{sess.name}</Text>
                  <Text style={styles.historyXP}>+{sess.xp} XP</Text>
                </View>
                <Text style={styles.historyDate}>
                  {new Date(sess.date).toLocaleDateString()} • {new Date(sess.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>

                <View style={styles.historyStatsRow}>
                  <Text style={styles.historyStatPill}>{sess.sets} Sets</Text>
                  <Text style={styles.historyStatPill}>{sess.reps} Reps</Text>
                  <Text style={styles.historyStatPill}>{sess.volume} kg Volume</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D14',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 4 : 0,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    backgroundColor: '#121824',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#233045',
    width: '47%',
  },
  gridVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 8,
  },
  gridLbl: {
    fontSize: 11,
    color: '#7A889B',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  emptyBox: {
    backgroundColor: '#121824',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#233045',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A0B0C5',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#5A6E85',
    textAlign: 'center',
    marginTop: 4,
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#121824',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#233045',
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historyXP: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFD700',
  },
  historyDate: {
    fontSize: 11,
    color: '#7A889B',
    marginTop: 2,
    marginBottom: 8,
  },
  historyStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  historyStatPill: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

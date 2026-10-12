import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHunter } from '../context/HunterContext';
import { CURRENT_PHYSIQUES, TARGET_PHYSIQUES } from '../data/physiques';

export const DietScreen = () => {
  const { user, dietPlan, hunter, addWaterCup } = useHunter();

  if (!dietPlan) return null;

  const currentObj = CURRENT_PHYSIQUES.find(p => p.id === user.currentPhysique);
  const targetObj = TARGET_PHYSIQUES.find(p => p.id === user.targetPhysique);

  const waterTargetCups = Math.round(dietPlan.waterLiters * 3.8);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="nutrition" size={24} color="#FF7700" />
          <Text style={styles.headerTitle}>HUNTER NUTRITION & DIET</Text>
        </View>

        {/* Transition Summary Banner */}
        <View style={styles.transitionBanner}>
          <Text style={styles.transitionLabel}>PHYSIQUE TRANSITION GOAL</Text>
          <View style={styles.transitionRow}>
            <Text style={styles.physiqueCurrent}>{currentObj?.title || 'Starting Frame'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#00F0FF" />
            <Text style={styles.physiqueTarget}>{targetObj?.title || 'Target Physique'}</Text>
          </View>
          <Text style={styles.goalStrategy}>{dietPlan.dietGoalName}</Text>
        </View>

        {/* Daily Macro Breakdown Card */}
        <View style={styles.macroCard}>
          <Text style={styles.macroCardTitle}>DAILY TARGET NUTRITION</Text>

          <View style={styles.calorieRow}>
            <View>
              <Text style={styles.calNumber}>{dietPlan.targetCalories}</Text>
              <Text style={styles.calLabel}>KCAL / DAY TARGET</Text>
            </View>
            <View style={styles.bmrPill}>
              <Text style={styles.bmrText}>Maintenance: {dietPlan.maintenanceCalories} kcal</Text>
            </View>
          </View>

          {/* Macro Bars */}
          <View style={styles.macroBarsContainer}>
            {/* Protein */}
            <View style={styles.macroBarItem}>
              <View style={styles.macroBarHeader}>
                <Text style={[styles.macroName, { color: '#00F0FF' }]}>PROTEIN</Text>
                <Text style={styles.macroValText}>{dietPlan.macros.protein}g ({dietPlan.macroRatios.proteinPct}%)</Text>
              </View>
              <View style={styles.macroTrackBg}>
                <View style={[styles.macroTrackFill, { width: `${dietPlan.macroRatios.proteinPct}%`, backgroundColor: '#00F0FF' }]} />
              </View>
            </View>

            {/* Carbs */}
            <View style={styles.macroBarItem}>
              <View style={styles.macroBarHeader}>
                <Text style={[styles.macroName, { color: '#FFD700' }]}>CARBOHYDRATES</Text>
                <Text style={styles.macroValText}>{dietPlan.macros.carbs}g ({dietPlan.macroRatios.carbsPct}%)</Text>
              </View>
              <View style={styles.macroTrackBg}>
                <View style={[styles.macroTrackFill, { width: `${dietPlan.macroRatios.carbsPct}%`, backgroundColor: '#FFD700' }]} />
              </View>
            </View>

            {/* Fats */}
            <View style={styles.macroBarItem}>
              <View style={styles.macroBarHeader}>
                <Text style={[styles.macroName, { color: '#FF4D4D' }]}>HEALTHY FATS</Text>
                <Text style={styles.macroValText}>{dietPlan.macros.fat}g ({dietPlan.macroRatios.fatPct}%)</Text>
              </View>
              <View style={styles.macroTrackBg}>
                <View style={[styles.macroTrackFill, { width: `${dietPlan.macroRatios.fatPct}%`, backgroundColor: '#FF4D4D' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Water Hydration Tracker */}
        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <Ionicons name="water" size={22} color="#00F0FF" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.waterTitle}>VANGUARD HYDRATION TRACKER</Text>
              <Text style={styles.waterSub}>Target: {dietPlan.waterLiters} Liters ({waterTargetCups} Cups)</Text>
            </View>
            <TouchableOpacity style={styles.addWaterBtn} onPress={addWaterCup} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color="#0A0D14" />
              <Text style={styles.addWaterText}>DRINK CUP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cupsRow}>
            {Array.from({ length: waterTargetCups }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.cupIconBox,
                  idx < hunter.waterDrunkCups && styles.cupIconBoxActive,
                ]}
              >
                <Ionicons
                  name="cafe"
                  size={16}
                  color={idx < hunter.waterDrunkCups ? '#00F0FF' : '#2A3A52'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recommended Meal Plan */}
        <Text style={styles.sectionHeaderTitle}>RECOMMENDED HUNTER MEAL PLAN</Text>
        <View style={styles.mealList}>
          {dietPlan.mealPlan.map((meal, idx) => (
            <View key={idx} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Ionicons name={meal.icon} size={20} color="#FF7700" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.mealTime}>{meal.mealTime} • {meal.time}</Text>
                  <Text style={styles.mealTitle}>{meal.title}</Text>
                </View>
                <Text style={styles.mealCal}>{meal.calories} kcal</Text>
              </View>

              <Text style={styles.mealDesc}>{meal.description}</Text>

              <View style={styles.mealFooterRow}>
                <Text style={styles.mealMacroPill}>{meal.protein}g Protein | {meal.carbs}g Carbs</Text>
                <Text style={styles.hunterPerkText}>{meal.hunterPerk}</Text>
              </View>
            </View>
          ))}
        </View>
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
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  transitionBanner: {
    backgroundColor: '#121824',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00F0FF30',
    marginBottom: 16,
  },
  transitionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  transitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  physiqueCurrent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A0B0C5',
  },
  physiqueTarget: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFD700',
  },
  goalStrategy: {
    fontSize: 12,
    color: '#7A889B',
    marginTop: 2,
  },
  macroCard: {
    backgroundColor: 'rgba(15, 23, 40, 0.72)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  macroCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7A889B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  calLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1,
  },
  bmrPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bmrText: {
    fontSize: 11,
    color: '#7A889B',
  },
  macroBarsContainer: {
    gap: 12,
  },
  macroBarItem: {},
  macroBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  macroName: {
    fontSize: 11,
    fontWeight: '800',
  },
  macroValText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  macroTrackBg: {
    height: 6,
    backgroundColor: '#0A0D14',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroTrackFill: {
    height: '100%',
    borderRadius: 3,
  },
  waterCard: {
    backgroundColor: 'rgba(12, 22, 40, 0.7)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.28)',
    marginBottom: 20,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  waterTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1,
  },
  waterSub: {
    fontSize: 11,
    color: '#7A889B',
  },
  addWaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 'auto',
  },
  addWaterText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0A0D14',
    marginLeft: 2,
  },
  cupsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cupIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cupIconBoxActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: '#00F0FF',
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  mealList: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: 'rgba(15, 23, 40, 0.65)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealTime: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7700',
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  mealCal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFD700',
  },
  mealDesc: {
    fontSize: 12,
    color: '#A0B0C5',
    lineHeight: 17,
    marginBottom: 10,
  },
  mealFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1A2333',
    paddingTop: 8,
  },
  mealMacroPill: {
    fontSize: 11,
    color: '#00F0FF',
    fontWeight: '700',
  },
  hunterPerkText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '700',
  },
});

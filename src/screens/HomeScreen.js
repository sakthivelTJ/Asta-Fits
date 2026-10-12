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
import { TARGET_PHYSIQUES } from '../data/physiques';
import { HealthCard } from '../features/health/HealthCard';

export const HomeScreen = ({ onNavigateTab, onOpenSocial }) => {
  const {
    user,
    hunter,
    currentRank,
    xpForNextLevel,
    dailyQuests,
    completeQuest,
    dietPlan,
  } = useHunter();

  const xpProgress = Math.min(100, Math.round((hunter.xp / xpForNextLevel) * 100));
  const targetObj = TARGET_PHYSIQUES.find(p => p.id === user.targetPhysique);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" translucent={false} />

      {/* Ambient background glow orbs for glassmorphism depth */}
      <View style={styles.ambientOrbTop} pointerEvents="none" />
      <View style={styles.ambientOrbMid} pointerEvents="none" />
      <View style={styles.ambientOrbBottom} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header App Branding Bar */}
        <View style={styles.topHeaderBar}>
          <View style={styles.appBrandingRow}>
            <Ionicons name="shield-checkmark" size={20} color="#00F0FF" />
            <Text style={styles.appBrandingTitle}>ASTA'S FIT</Text>
            <View style={styles.systemBadge}>
              <View style={styles.systemBadgeDot} />
              <Text style={styles.appBrandingBadge}>SYSTEM ONLINE</Text>
            </View>
          </View>
        </View>

        {/* Hunter Status Header */}
        <View style={[styles.rankCard, { borderColor: currentRank.color }]}>
          <View style={styles.rankTopRow}>
            <View style={[styles.rankBadgeCircle, { backgroundColor: currentRank.color }]}>
              <Text style={styles.rankBadgeText}>{currentRank.rank}</Text>
            </View>

            <View style={styles.rankInfo}>
              <Text style={styles.hunterName}>{user.name}</Text>
              <Text style={[styles.rankTitle, { color: currentRank.color }]}>{currentRank.title}</Text>
            </View>

            <TouchableOpacity style={styles.socialHeaderButton} onPress={onOpenSocial}>
              <Ionicons name="people" size={18} color="#00F0FF" />
            </TouchableOpacity>

            <View style={styles.streakPill}>
              <Ionicons name="flame" size={16} color="#FF7700" />
              <Text style={styles.streakText}>{hunter.streak}d Streak</Text>
            </View>
          </View>

          {/* Level & XP Progress */}
          <View style={styles.xpSection}>
            <View style={styles.xpTextRow}>
              <Text style={styles.levelText}>Level {hunter.level}</Text>
              <Text style={styles.xpRatio}>
                {hunter.xp} / {xpForNextLevel} XP ({xpProgress}%)
              </Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${xpProgress}%`, backgroundColor: currentRank.color }]} />
            </View>
          </View>
        </View>

        {/* Quick Action Start Workout */}
        <TouchableOpacity
          style={styles.startWorkoutBanner}
          onPress={() => onNavigateTab('workout')}
          activeOpacity={0.85}
        >
          <View style={styles.startWorkoutLeft}>
            <Ionicons name="play-circle" size={32} color="#FFFFFF" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.startWorkoutTitle}>START TODAY'S HUNTER WORKOUT</Text>
              <Text style={styles.startWorkoutSub}>Targeting: {targetObj?.title || 'Body Transformation'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Daily Quests Section */}
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="flash" size={18} color="#00F0FF" />
          <Text style={styles.sectionHeaderTitle}>SYSTEM DAILY QUESTS</Text>
          <Text style={styles.sectionHeaderBadge}>RESET IN 14H</Text>
        </View>

        <View style={styles.questList}>
          {dailyQuests.map((quest) => {
            const isCompleted = hunter.completedQuestIds.includes(quest.id);
            return (
              <View
                key={quest.id}
                style={[styles.questCard, isCompleted && styles.questCardCompleted]}
              >
                <View style={styles.questLeftIcon}>
                  <Ionicons
                    name={isCompleted ? 'checkmark-circle' : quest.icon}
                    size={24}
                    color={isCompleted ? '#4CAF50' : '#00F0FF'}
                  />
                </View>

                <View style={styles.questContent}>
                  <Text style={[styles.questTitle, isCompleted && styles.questTitleCompleted]}>
                    {quest.title}
                  </Text>
                  <Text style={styles.questDesc}>{quest.desc}</Text>
                  <View style={styles.questRewards}>
                    <Text style={styles.rewardPill}>+{quest.xpReward} XP</Text>
                    <Text style={styles.rewardStatPill}>+{quest.statValue} {quest.statReward.toUpperCase()}</Text>
                  </View>
                </View>

                {!isCompleted ? (
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => completeQuest(quest.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.claimButtonText}>CLAIM</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.doneBadge}>
                    <Text style={styles.doneText}>DONE</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Vitality / Health Card */}
        <HealthCard />

        {/* Diet Quick Overview Card */}
        {dietPlan && (
          <TouchableOpacity
            style={styles.dietSummaryCard}
            onPress={() => onNavigateTab('diet')}
            activeOpacity={0.85}
          >
            <View style={styles.dietCardHeader}>
              <Ionicons name="nutrition" size={20} color="#FF7700" />
              <Text style={styles.dietCardTitle}>ADAPTIVE HUNTER DIET TARGET</Text>
              <Ionicons name="arrow-forward" size={16} color="#FF7700" style={{ marginLeft: 'auto' }} />
            </View>
            <Text style={styles.dietGoalName}>{dietPlan.dietGoalName}</Text>

            <View style={styles.macroPillsRow}>
              <View style={styles.macroMiniPill}>
                <Text style={styles.macroVal}>{dietPlan.targetCalories}</Text>
                <Text style={styles.macroLbl}>Calories</Text>
              </View>
              <View style={styles.macroMiniPill}>
                <Text style={[styles.macroVal, { color: '#00F0FF' }]}>{dietPlan.macros.protein}g</Text>
                <Text style={styles.macroLbl}>Protein</Text>
              </View>
              <View style={styles.macroMiniPill}>
                <Text style={[styles.macroVal, { color: '#FFD700' }]}>{dietPlan.macros.carbs}g</Text>
                <Text style={styles.macroLbl}>Carbs</Text>
              </View>
              <View style={styles.macroMiniPill}>
                <Text style={[styles.macroVal, { color: '#FF4D4D' }]}>{dietPlan.macros.fat}g</Text>
                <Text style={styles.macroLbl}>Fats</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 4 : 0,
  },
  ambientOrbTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0, 240, 255, 0.09)',
    shadowColor: '#00F0FF',
    shadowRadius: 50,
    shadowOpacity: 0.6,
  },
  ambientOrbMid: {
    position: 'absolute',
    top: 280,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    shadowColor: '#8B5CF6',
    shadowRadius: 60,
    shadowOpacity: 0.5,
  },
  ambientOrbBottom: {
    position: 'absolute',
    bottom: 40,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 20, 71, 0.07)',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  appBrandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appBrandingTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    marginLeft: 6,
    gap: 4,
  },
  systemBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F0FF',
  },
  appBrandingBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1,
  },
  rankCard: {
    backgroundColor: 'rgba(15, 22, 38, 0.74)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  rankTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadgeCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadgeText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A0D14',
  },
  rankInfo: {
    flex: 1,
  },
  hunterName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rankTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 119, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF770040',
  },
  streakText: {
    color: '#FF7700',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  xpSection: {
    marginTop: 14,
  },
  xpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  xpRatio: {
    fontSize: 12,
    color: '#7A889B',
  },
  xpBarBg: {
    height: 8,
    backgroundColor: '#0A0D14',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  startWorkoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E40AF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.65)',
    shadowColor: '#1E3A8A',
    shadowRadius: 10,
    shadowOpacity: 0.45,
    elevation: 6,
  },
  startWorkoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  startWorkoutTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  startWorkoutSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '700',
    marginTop: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  sectionHeaderBadge: {
    fontSize: 10,
    color: '#5A6E85',
    fontWeight: '700',
    marginLeft: 'auto',
  },
  questList: {
    gap: 12,
    marginBottom: 20,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 40, 0.68)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  questCardCompleted: {
    backgroundColor: 'rgba(10, 15, 26, 0.52)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.65,
  },
  questLeftIcon: {
    marginRight: 12,
  },
  questContent: {
    flex: 1,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  questTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#7A889B',
  },
  questDesc: {
    fontSize: 12,
    color: '#7A889B',
    marginTop: 2,
  },
  questRewards: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  rewardPill: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rewardStatPill: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF7700',
    backgroundColor: 'rgba(255, 119, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  claimButton: {
    backgroundColor: '#1E40AF',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  claimButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  doneBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  doneText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4CAF50',
  },
  dietSummaryCard: {
    backgroundColor: 'rgba(20, 26, 44, 0.72)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 119, 0, 0.35)',
    shadowColor: '#FF7700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  dietCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dietCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF7700',
    letterSpacing: 1,
    marginLeft: 6,
  },
  dietGoalName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  macroPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroMiniPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: '22%',
  },
  macroVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  macroLbl: {
    fontSize: 10,
    color: '#7A889B',
    marginTop: 2,
  },
  socialHeaderButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.35)',
  },
});

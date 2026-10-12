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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHunter } from '../context/HunterContext';
import { STAT_DESCRIPTIONS } from '../data/ranks';
import { CURRENT_PHYSIQUES, TARGET_PHYSIQUES } from '../data/physiques';

export const StatusScreen = () => {
  const { user, hunter, currentRank, xpForNextLevel, allocateStat, logout, recalibratePhysique } = useHunter();

  const currentObj = CURRENT_PHYSIQUES.find(p => p.id === user.currentPhysique) || CURRENT_PHYSIQUES[0];
  const targetObj = TARGET_PHYSIQUES.find(p => p.id === user.targetPhysique) || TARGET_PHYSIQUES[0];
  const xpPct = Math.min(100, Math.round((hunter.xp / xpForNextLevel) * 100));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D14" translucent={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Bar */}
        <View style={styles.topHeaderBar}>
          <Ionicons name="person-circle-outline" size={20} color="#00F0FF" />
          <Text style={styles.topHeaderTitle}>HUNTER PROFILE & STATS</Text>
        </View>

        {/* Hunter Status Identity Card */}
        <View style={[styles.identityCard, { borderColor: currentRank.color }]}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatarCircle, { borderColor: currentRank.color }]}>
              <Ionicons name="person-sharp" size={44} color={currentRank.color} />
              <View style={[styles.rankMiniBadge, { backgroundColor: currentRank.color }]}>
                <Text style={styles.rankMiniBadgeText}>{currentRank.rank}</Text>
              </View>
            </View>

            <View style={styles.identityDetails}>
              <Text style={styles.hunterNameText}>{user.name}</Text>
              <Text style={[styles.hunterRankTitle, { color: currentRank.color }]}>{currentRank.title}</Text>
              <Text style={styles.hunterGoalText}>Goal: {targetObj?.title || 'Apex Physique'}</Text>
            </View>
          </View>

          {/* Level & XP */}
          <View style={styles.levelRow}>
            <Text style={styles.levelBig}>LEVEL {hunter.level}</Text>
            <Text style={styles.xpText}>{hunter.xp} / {xpForNextLevel} XP ({xpPct}%)</Text>
          </View>
          <View style={styles.xpBg}>
            <View style={[styles.xpFill, { width: `${xpPct}%`, backgroundColor: currentRank.color }]} />
          </View>
        </View>

        {/* Active Physique Transformation Goal Card */}
        <View style={styles.transformationGoalCard}>
          <View style={styles.transHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="body" size={16} color="#00F0FF" />
              <Text style={styles.transHeaderTitle}>PHYSIQUE TRANSFORMATION GOAL</Text>
            </View>
            <TouchableOpacity style={styles.changeGoalBtn} onPress={recalibratePhysique}>
              <Ionicons name="pencil" size={12} color="#00F0FF" />
              <Text style={styles.changeGoalBtnText}>RE-SELECT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transBodyRow}>
            <View style={styles.transFigureCol}>
              <View style={styles.transSketchBox}>
                <Image source={currentObj.image} style={styles.transSketchImg} resizeMode="contain" />
              </View>
              <Text style={styles.transFigLabel}>STARTING FRAME</Text>
              <Text style={styles.transFigTitle}>{currentObj.title}</Text>
            </View>

            <View style={styles.transArrowCol}>
              <Ionicons name="arrow-forward" size={24} color="#00F0FF" />
              <Text style={styles.transArrowText}>TARGET</Text>
            </View>

            <View style={styles.transFigureCol}>
              <View style={[styles.transSketchBox, { borderColor: '#00F0FF' }]}>
                <Image source={targetObj.image} style={styles.transSketchImg} resizeMode="contain" />
              </View>
              <Text style={[styles.transFigLabel, { color: '#00F0FF' }]}>DREAM BODY</Text>
              <Text style={[styles.transFigTitle, { color: '#00F0FF' }]}>{targetObj.title}</Text>
            </View>
          </View>

          <Text style={styles.transDietHint}>
            Focus: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{targetObj.primaryStat}</Text> • {targetObj.dietType}
          </Text>
        </View>

        {/* Unallocated Stat Points Alert Banner */}
        {hunter.availableStatPoints > 0 && (
          <View style={styles.statAlertBanner}>
            <Ionicons name="sparkles" size={20} color="#FFD700" />
            <Text style={styles.statAlertText}>
              YOU HAVE {hunter.availableStatPoints} STAT POINT(S) TO ALLOCATE!
            </Text>
          </View>
        )}

        {/* RPG Stat Allocation Table */}
        <Text style={styles.sectionTitle}>HUNTER ATTRIBUTES & STATS</Text>
        <View style={styles.statsCard}>
          {Object.keys(STAT_DESCRIPTIONS).map((statKey) => {
            const statInfo = STAT_DESCRIPTIONS[statKey];
            const currentVal = hunter.stats[statKey] || 10;
            return (
              <View key={statKey} style={styles.statRow}>
                <View style={[styles.statIconBox, { backgroundColor: `${statInfo.color}20` }]}>
                  <Ionicons name={statInfo.icon} size={20} color={statInfo.color} />
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={styles.statHeaderRow}>
                    <Text style={styles.statName}>{statInfo.name}</Text>
                    <Text style={[styles.statVal, { color: statInfo.color }]}>{currentVal}</Text>
                  </View>
                  <Text style={styles.statDesc}>{statInfo.description}</Text>
                </View>

                {hunter.availableStatPoints > 0 && (
                  <TouchableOpacity
                    style={[styles.addStatBtn, { backgroundColor: statInfo.color }]}
                    onPress={() => allocateStat(statKey)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color="#0A0D14" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Rank Perks Unlocked */}
        <Text style={styles.sectionTitle}>UNLOCKED RANK PERKS</Text>
        <View style={styles.perksCard}>
          {currentRank.perks.map((perk, idx) => (
            <View key={idx} style={styles.perkRow}>
              <Ionicons name="checkmark-circle" size={18} color={currentRank.color} />
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        {/* Reset / Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#FF4D4D" />
          <Text style={styles.logoutText}>RE-AWAKEN (RESET HUNTER PROGRESS)</Text>
        </TouchableOpacity>
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
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
    paddingHorizontal: 2,
  },
  topHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 2,
  },
  identityCard: {
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
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#0D121B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 14,
    position: 'relative',
  },
  rankMiniBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankMiniBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A0D14',
  },
  identityDetails: {
    flex: 1,
  },
  hunterNameText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  hunterRankTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  hunterGoalText: {
    fontSize: 11,
    color: '#7A889B',
    marginTop: 2,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  levelBig: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  xpText: {
    fontSize: 11,
    color: '#7A889B',
  },
  xpBg: {
    height: 8,
    backgroundColor: '#0A0D14',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  transformationGoalCard: {
    backgroundColor: 'rgba(15, 23, 40, 0.7)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.28)',
    marginBottom: 16,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  transHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1.5,
  },
  changeGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeGoalBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
  },
  transBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  transFigureCol: {
    alignItems: 'center',
    flex: 1,
  },
  transSketchBox: {
    width: 60,
    height: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  transSketchImg: {
    width: '100%',
    height: '100%',
  },
  transFigLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#7A889B',
    letterSpacing: 0.5,
  },
  transFigTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    textAlign: 'center',
  },
  transArrowCol: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  transArrowText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1,
    marginTop: 2,
  },
  transDietHint: {
    fontSize: 11,
    color: '#7A889B',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1A2333',
    paddingTop: 8,
    textAlign: 'center',
  },
  statAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginBottom: 16,
  },
  statAlertText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  statsCard: {
    backgroundColor: 'rgba(15, 22, 38, 0.72)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 20,
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '900',
  },
  statDesc: {
    fontSize: 11,
    color: '#7A889B',
    marginTop: 2,
  },
  addStatBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  perksCard: {
    backgroundColor: 'rgba(15, 22, 38, 0.65)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perkText: {
    fontSize: 13,
    color: '#A0B0C5',
    marginLeft: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FF4D4D40',
  },
  logoutText: {
    color: '#FF4D4D',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
});

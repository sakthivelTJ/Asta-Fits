import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const BottomNav = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'quests', label: 'Quests', icon: 'flash' },
    { id: 'workout', label: 'Train', icon: 'barbell', isCenter: true },
    { id: 'progress', label: 'Progress', icon: 'stats-chart' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <View style={styles.container}>
      {/* Top subtle highlight reflection line */}
      <View style={styles.glassHighlightLine} />

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.centerTrainBtn}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.85}
            >
              <View style={styles.centerTrainInner}>
                <Ionicons name="barbell" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.centerTrainText}>TRAIN</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline`}
              size={20}
              color={isActive ? '#3B82F6' : 'rgba(255, 255, 255, 0.45)'}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 16, 30, 0.92)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(37, 99, 235, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 76 : 64,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  glassHighlightLine: {
    position: 'absolute',
    top: 0,
    left: '12%',
    right: '12%',
    height: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  activeTabButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  tabLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
    fontWeight: '700',
  },
  activeTabLabel: {
    color: '#3B82F6',
    fontWeight: '900',
  },
  centerTrainBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  centerTrainInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E40AF', // Deep rich Navy Blue
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.65)',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  centerTrainText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#3B82F6',
    marginTop: 3,
    letterSpacing: 1.2,
  },
});

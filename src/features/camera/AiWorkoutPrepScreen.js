import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

/**
 * AiWorkoutPrepScreen
 *
 * Preparation and positioning guidance before opening the live camera.
 */
export const AiWorkoutPrepScreen = ({
  exerciseName = 'Standard Push-Up',
  targetReps = 12,
  onStart,
  onClose,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D14" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI POSE SETUP</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.badgeGlow}>
            <Ionicons name="scan-circle" size={44} color="#60A5FA" />
          </View>
          <Text style={styles.exerciseTitle}>{exerciseName.toUpperCase()}</Text>
          <Text style={styles.exerciseSub}>TARGET: {targetReps} REPS • REAL-TIME SKELETON TRACKING</Text>
        </View>

        {/* How It Works Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="hardware-chip-outline" size={18} color="#60A5FA" />
            <Text style={styles.cardHeaderTitle}>HOW AI TRACKING WORKS</Text>
          </View>
          <Text style={styles.infoDesc}>
            Asta’s Fit uses on-device computer vision to detect your joint positions (shoulders, elbows, wrists, hips, and ankles) in real time. It automatically measures your elbow angles and plank alignment to count every valid repetition.
          </Text>
        </View>

        {/* Camera Positioning Checklist */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="videocam-outline" size={18} color="#34D399" />
            <Text style={styles.cardHeaderTitle}>CAMERA POSITIONING GUIDE</Text>
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkIconBox}>
              <Ionicons name="phone-portrait-outline" size={18} color="#34D399" />
            </View>
            <View style={styles.checkTextBox}>
              <Text style={styles.checkTitle}>Place Phone Securely</Text>
              <Text style={styles.checkDesc}>
                Prop your phone against a wall, water bottle, or stand approximately 1.5 to 2 meters (5–7 feet) away.
              </Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkIconBox}>
              <Ionicons name="body-outline" size={18} color="#60A5FA" />
            </View>
            <View style={styles.checkTextBox}>
              <Text style={styles.checkTitle}>Side-View Angle (Profile)</Text>
              <Text style={styles.checkDesc}>
                Position the camera at ground or knee level from the side so your shoulder, elbow, hip, and ankles are clearly visible.
              </Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkIconBox}>
              <Ionicons name="sunny-outline" size={18} color="#FBBF24" />
            </View>
            <View style={styles.checkTextBox}>
              <Text style={styles.checkTitle}>Good Lighting & Space</Text>
              <Text style={styles.checkDesc}>
                Ensure the room is well lit and your full upper body remains inside the camera view throughout the movement.
              </Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkIconBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
            </View>
            <View style={styles.checkTextBox}>
              <Text style={styles.checkTitle}>100% On-Device Privacy</Text>
              <Text style={styles.checkDesc}>
                Camera frames are analyzed locally in memory. No video or photos are ever saved or uploaded.
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.startBtnText}>START CAMERA TRACKING</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  bannerCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.45)',
    marginBottom: 16,
    shadowColor: '#1E40AF',
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  badgeGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  exerciseSub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 1,
    marginTop: 6,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(12, 18, 34, 0.7)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: 1.2,
    marginLeft: 8,
  },
  infoDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkTextBox: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 3,
  },
  checkDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#1E40AF',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  startBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
});

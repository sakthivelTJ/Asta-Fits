import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INTRO_SEEN_STORAGE_KEY } from './IntroVideoScreen';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useHunter } from '../context/HunterContext';
import {
  requestNotificationPermissions,
  syncReminders,
  cancelAllNotifications,
} from '../features/notifications/notificationService';
import { deleteMyAccount } from '../features/social/socialService';

const TIME_OPTIONS = [
  { label: '07:00 AM', value: '07:00' },
  { label: '08:00 AM (Default)', value: '08:00' },
  { label: '09:00 AM', value: '09:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '05:00 PM', value: '17:00' },
  { label: '06:00 PM', value: '18:00' },
  { label: '08:00 PM', value: '20:00' },
  { label: '10:30 PM (Quiet Hour Warning)', value: '22:30' },
];

export const SettingsScreen = ({ onBack, onPreviewPreloader }) => {
  const { user, hunter, logout, updateSettings } = useHunter();

  const userSettings = user.settings || {};
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    userSettings.notificationsEnabled ?? false
  );
  const [reminderTime, setReminderTime] = useState(
    userSettings.reminderTime || '08:00'
  );
  const [leaderboardVisible, setLeaderboardVisible] = useState(
    userSettings.leaderboardVisible ?? true
  );

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleNotifications = async (val) => {
    if (val) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Denied',
          'Notification permission was denied. Please enable notifications in your phone\'s System Settings to receive quest reminders.',
          [{ text: 'OK' }]
        );
        setNotificationsEnabled(false);
        updateSettings({ notificationsEnabled: false });
        return;
      }
    } else {
      await cancelAllNotifications();
    }

    setNotificationsEnabled(val);
    updateSettings({ notificationsEnabled: val });
    syncReminders({
      settings: { ...userSettings, notificationsEnabled: val, reminderTime },
      streak: hunter.streak,
    });
  };

  const handleSelectTime = (timeVal) => {
    setTimePickerVisible(false);
    setReminderTime(timeVal);
    updateSettings({ reminderTime: timeVal });

    const hour = parseInt(timeVal.split(':')[0], 10);
    if (hour >= 22 || hour < 7) {
      Alert.alert(
        'Quiet Hours Warning',
        'The selected time falls within quiet hours (10 PM – 7 AM). Main quest reminders will be suppressed during quiet hours.'
      );
    }

    if (notificationsEnabled) {
      syncReminders({
        settings: { ...userSettings, notificationsEnabled: true, reminderTime: timeVal },
        streak: hunter.streak,
      });
    }
  };

  const handleToggleLeaderboard = (val) => {
    setLeaderboardVisible(val);
    updateSettings({ leaderboardVisible: val });
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await cancelAllNotifications();
          logout();
        },
      },
    ]);
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmInput.trim() !== 'DELETE') {
      Alert.alert('Confirmation Required', 'You must type DELETE in all caps to confirm.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMyAccount('DELETE');
      await cancelAllNotifications();
      setDeleteModalVisible(false);
      logout();
    } catch (err) {
      Alert.alert('Deletion Failed', err.message || 'Could not delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          <Text style={styles.backText}>BACK TO PROFILE</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Daily Quest Reminders */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>QUEST REMINDERS</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Daily Push Reminders</Text>
              <Text style={styles.settingSub}>Quest alerts and streak-at-risk warnings</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ true: COLORS.primary, false: COLORS.surface }}
            />
          </View>

          {notificationsEnabled && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setTimePickerVisible(true)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Reminder Time</Text>
                <Text style={styles.settingSub}>Scheduled daily workout notification time</Text>
              </View>
              <View style={styles.timeValuePill}>
                <Text style={styles.timeValueText}>
                  {TIME_OPTIONS.find((t) => t.value === reminderTime)?.label.split(' ')[0] || reminderTime}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Section 2: Squad & Leaderboard Privacy */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>SQUAD & PRIVACY</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Weekly Leaderboard Visibility</Text>
              <Text style={styles.settingSub}>
                When off, your level, rank, and weekly XP are hidden from friends' leaderboards.
              </Text>
            </View>
            <Switch
              value={leaderboardVisible}
              onValueChange={handleToggleLeaderboard}
              trackColor={{ true: COLORS.primary, false: COLORS.surface }}
            />
          </View>
        </View>

        {/* Section: Cinematics & Preloader Testing */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles-outline" size={20} color="#00F0FF" />
            <Text style={[styles.cardTitle, { color: '#00F0FF' }]}>CINEMATICS & PRELOADER</Text>
          </View>

          {onPreviewPreloader && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={onPreviewPreloader}
              activeOpacity={0.7}
            >
              <Ionicons name="play-circle-outline" size={20} color="#00F0FF" />
              <Text style={[styles.actionText, { color: '#00F0FF' }]}>
                Preview Preloader Animation
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionRow}
            onPress={async () => {
              try {
                await AsyncStorage.removeItem(INTRO_SEEN_STORAGE_KEY);
                Alert.alert(
                  'Intro Video Reset',
                  'The awakening intro video will play next time you restart or reload the app.',
                  [{ text: 'OK' }]
                );
              } catch (e) {
                Alert.alert('Error', 'Failed to reset intro video flag.');
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="videocam-outline" size={20} color="#FFD700" />
            <Text style={[styles.actionText, { color: '#FFD700' }]}>
              Re-enable Intro Video On Next Launch
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Account Actions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>ACCOUNT ACTIONS</Text>
          </View>

          <TouchableOpacity style={styles.actionRow} onPress={handleSignOut} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.warning} />
            <Text style={[styles.actionText, { color: COLORS.warning }]}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              setDeleteConfirmInput('');
              setDeleteModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete Account & Data</Text>
          </TouchableOpacity>
        </View>

        {/* Section 4: Disclaimers Footer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerRow}>
            <Ionicons name="medical-outline" size={18} color={COLORS.warning} />
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Medical Disclaimer: </Text>
              Consult a qualified physician before starting any workout program. Asta's Fit provides progression guidelines for healthy adults.
            </Text>
          </View>

          <View style={[styles.disclaimerRow, { marginTop: 12 }]}>
            <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Camera & AI Privacy: </Text>
              Camera rep counting runs 100% on-device. No camera frames, images, or video are ever stored or transmitted off your device.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal: Time Picker */}
      <Modal
        visible={timePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SELECT REMINDER TIME</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {TIME_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.timeOptionRow,
                    reminderTime === opt.value && styles.timeOptionSelected,
                  ]}
                  onPress={() => handleSelectTime(opt.value)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      reminderTime === opt.value && styles.timeOptionSelectedText,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {reminderTime === opt.value && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setTimePickerVisible(false)}
            >
              <Text style={styles.modalCloseText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Account Deletion Confirmation */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={36} color={COLORS.danger} style={{ alignSelf: 'center' }} />
            <Text style={styles.deleteModalTitle}>DELETE ACCOUNT PERMANENTLY</Text>
            <Text style={styles.deleteModalSub}>
              This action is permanent and cannot be undone. All your workouts, XP, rank progress, and friend relationships will be completely deleted.
            </Text>
            <Text style={styles.deletePromptText}>Type "DELETE" below to confirm:</Text>
            <TextInput
              style={styles.deleteInput}
              placeholder="DELETE"
              placeholderTextColor={COLORS.textMuted}
              value={deleteConfirmInput}
              onChangeText={setDeleteConfirmInput}
              autoCapitalize="characters"
            />
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelDeleteBtn}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelDeleteText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmDeleteBtn,
                  deleteConfirmInput.trim() !== 'DELETE' && styles.disabledDeleteBtn,
                ]}
                onPress={handleConfirmDeleteAccount}
                disabled={deleteConfirmInput.trim() !== 'DELETE' || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmDeleteText}>DELETE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginLeft: 6,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  timeValuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  timeValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 4,
  },
  disclaimerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 4,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginLeft: 8,
    flex: 1,
  },
  disclaimerBold: {
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 20,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: 14,
    textAlign: 'center',
  },
  timeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: COLORS.surface,
  },
  timeOptionSelected: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  timeOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  timeOptionSelectedText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  modalCloseBtn: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  deleteModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.danger,
    letterSpacing: 1,
    marginTop: 10,
    textAlign: 'center',
  },
  deleteModalSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    textAlign: 'center',
    marginVertical: 12,
  },
  deletePromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  deleteInput: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.danger,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.danger,
    letterSpacing: 2,
    marginBottom: 16,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelDeleteBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelDeleteText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledDeleteBtn: {
    opacity: 0.4,
  },
  confirmDeleteText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

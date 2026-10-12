import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const MinVersionScreen = ({ minVersion }) => {
  const handleUpdatePress = () => {
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/astas-fit'
      : 'https://play.google.com/store/apps/details?id=com.astasfit.app';

    Linking.openURL(storeUrl).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="arrow-up-circle-outline" size={60} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>UPDATE REQUIRED</Text>
        <Text style={styles.subtitle}>
          A new version of Asta's Fit (v{minVersion}) is required to continue training and syncing your progress.
        </Text>

        <TouchableOpacity style={styles.updateBtn} onPress={handleUpdatePress} activeOpacity={0.85}>
          <Text style={styles.updateBtnText}>UPDATE NOW</Text>
          <Ionicons name="open-outline" size={18} color={COLORS.background} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  updateBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.background,
    letterSpacing: 1.5,
  },
});

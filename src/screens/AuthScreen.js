import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useHunter } from '../context/HunterContext';

export const AuthScreen = () => {
  const { login } = useHunter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSignIn = () => {
    login(name || 'Asta', email || 'asta@blackbulls.org');
  };

  const handleDemoMode = () => {
    login('Black Bull Trainee', 'demo@asta.fit');
  };

  return (
    <ImageBackground
      source={require('../../assets/background.jpg')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      {/* Dark tint overlay for high contrast readability */}
      <View style={styles.bgOverlay} />

      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Branding */}
          <View style={styles.header}>
            <View style={styles.badgeGlow}>
              <Ionicons name="flame" size={38} color="#FF1447" />
            </View>
            <Text style={styles.title}>ASTA'S FIT</Text>
            <Text style={styles.subtitle}>SURPASS YOUR LIMITS • BLACK BULL RPG</Text>
            <View style={styles.divider} />
          </View>

          {/* Hero Quote Card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>"My Magic is Never Giving Up!"</Text>
            <Text style={styles.heroText}>
              Train your physical body like Asta. Complete daily anti-magic workouts, earn XP, unlock Black Bull ranks, and forge your dream physique.
            </Text>
          </View>

          {/* Input Form Card with Glassmorphic styling */}
          <View style={styles.formCard}>
            <Text style={styles.formHeader}>BLACK BULL MAGIC KNIGHT SIGN-IN</Text>

            <View style={styles.inputGroup}>
              <Ionicons name="person-outline" size={20} color="#3B82F6" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Magic Knight Name (e.g. Asta)"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Ionicons name="mail-outline" size={20} color="#3B82F6" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Squad Email Address"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn} activeOpacity={0.85}>
              <Ionicons name="flash" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>AWAKEN & SIGN IN</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.appleButton}
                onPress={() => login('Apple Knight', 'apple.user@asta.fit')}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={styles.appleButtonText}>SIGN IN WITH APPLE</Text>
              </TouchableOpacity>
            )}

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR QUICK TEST</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.demoButton} onPress={handleDemoMode} activeOpacity={0.85}>
              <Ionicons name="play" size={18} color="#60A5FA" />
              <Text style={styles.demoButtonText}>ENTER AS GUEST TRAINEE</Text>
            </TouchableOpacity>
          </View>

          {/* Feature Pills */}
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="body" size={24} color="#3B82F6" />
              <Text style={styles.featureTitle}>Asta Body Archetypes</Text>
              <Text style={styles.featureDesc}>Select starting build & target goal</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="restaurant" size={24} color="#FFD700" />
              <Text style={styles.featureTitle}>Magic Knight Diet</Text>
              <Text style={styles.featureDesc}>Adaptive calories & macro target plan</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="shield" size={24} color="#FF1447" />
              <Text style={styles.featureTitle}>Anti-Magic Workouts</Text>
              <Text style={styles.featureDesc}>Rest timer with chimes & haptics</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 16, 0.78)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  badgeGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 20, 71, 0.18)',
    borderWidth: 2,
    borderColor: '#FF1447',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF1447',
    shadowRadius: 15,
    shadowOpacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(37, 99, 235, 0.7)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#2563EB',
    marginTop: 10,
    borderRadius: 2,
  },
  heroCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 22, 38, 0.68)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.32)',
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  heroText: {
    fontSize: 13,
    color: '#A0B0C5',
    lineHeight: 18,
  },
  formCard: {
    width: '100%',
    backgroundColor: 'rgba(12, 18, 34, 0.74)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    marginBottom: 20,
    shadowColor: '#1E40AF',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
  },
  formHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#60A5FA',
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 10, 20, 0.65)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#1E3A8A',
    shadowRadius: 10,
    shadowOpacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 8,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  orText: {
    color: '#7A889B',
    fontSize: 11,
    marginHorizontal: 10,
    fontWeight: '700',
  },
  demoButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  demoButtonText: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  featureGrid: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    backgroundColor: 'rgba(14, 20, 36, 0.64)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  featureDesc: {
    fontSize: 12,
    color: '#7A889B',
    marginTop: 2,
    textAlign: 'center',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  appleButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginLeft: 8,
  },
});

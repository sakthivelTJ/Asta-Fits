import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  G,
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LOADING_MESSAGES = [
  'AWAKENING ANTI-MAGIC SYSTEM...',
  'CALIBRATING DEMON-SLAYER SWORD...',
  'UNSEALING 5-LEAF GRIMOIRE...',
  'SURPASSING PHYSICAL LIMITS...',
  'INITIALIZING BLACK BULL SQUAD...',
  'FORGING HUNTER STAT MATRIX...',
];

export const ThemedPreloader = ({
  message = null,
  fullScreen = true,
  showProgress = true,
  onComplete = null,
  duration = 2400, // optional auto-complete time for previews
}) => {
  // Animation drivers
  const spinValue = useRef(new Animated.Value(0)).current;
  const reverseSpinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.92)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;

  const [messageIndex, setMessageIndex] = useState(0);
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    // 1. Clockwise outer ring spin
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Counter-clockwise inner rune ring spin
    Animated.loop(
      Animated.timing(reverseSpinValue, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Central demon crest heart pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.92,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Glow aura flicker
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.95,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.35,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Progress bar animation if showProgress is true
    if (showProgress) {
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && onComplete) {
          onComplete();
        }
      });

      const listenerId = progressAnim.addListener(({ value }) => {
        setDisplayPercent(Math.min(100, Math.floor(value)));
      });

      return () => {
        progressAnim.removeListener(listenerId);
      };
    }
  }, []);

  // Cycle loading messages periodically
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseSpin = reverseSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      {/* Background ambient dark glow */}
      <View style={styles.ambientGlow} />

      {/* Main Animated Icon Container */}
      <View style={styles.iconWrapper}>
        {/* Outer Rotating Arcane Circle */}
        <Animated.View
          style={[
            styles.absoluteCircle,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <Svg height="220" width="220" viewBox="0 0 220 220">
            <Defs>
              <SvgLinearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
                <Stop offset="50%" stopColor="#FF1447" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#8A2BE2" stopOpacity="0.85" />
              </SvgLinearGradient>
            </Defs>
            {/* Outer segmented arcane ring */}
            <Circle
              cx="110"
              cy="110"
              r="96"
              stroke="url(#outerGrad)"
              strokeWidth="2.5"
              strokeDasharray="18 10 32 14 8 18"
              fill="none"
            />
            {/* Cardinal cardinal point notches */}
            <Circle cx="110" cy="14" r="3.5" fill="#00F0FF" />
            <Circle cx="110" cy="206" r="3.5" fill="#FF1447" />
            <Circle cx="14" cy="110" r="3.5" fill="#8A2BE2" />
            <Circle cx="206" cy="110" r="3.5" fill="#00F0FF" />
          </Svg>
        </Animated.View>

        {/* Inner Counter-Rotating Demon Rune Ring */}
        <Animated.View
          style={[
            styles.absoluteCircle,
            { transform: [{ rotate: reverseSpin }] },
          ]}
        >
          <Svg height="170" width="170" viewBox="0 0 170 170">
            <Defs>
              <SvgLinearGradient id="innerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FF1447" stopOpacity="0.85" />
                <Stop offset="100%" stopColor="#00F0FF" stopOpacity="0.7" />
              </SvgLinearGradient>
            </Defs>
            <Circle
              cx="85"
              cy="85"
              r="72"
              stroke="url(#innerGrad)"
              strokeWidth="2"
              strokeDasharray="10 8 4 6 18 10"
              fill="none"
            />
            {/* Secondary rune marks */}
            <Circle cx="85" cy="13" r="2.5" fill="#FF1447" />
            <Circle cx="85" cy="157" r="2.5" fill="#00F0FF" />
          </Svg>
        </Animated.View>

        {/* Demon Aura Glow Behind Emblem */}
        <Animated.View
          style={[
            styles.demonAura,
            {
              opacity: glowOpacity,
              transform: [{ scale: pulseValue }],
            },
          ]}
        />

        {/* Central Core Emblem: Crossed Demon Swords & Five-Leaf Black Clover */}
        <Animated.View
          style={[
            styles.emblemContainer,
            { transform: [{ scale: pulseValue }] },
          ]}
        >
          <Svg height="110" width="110" viewBox="0 0 110 110">
            <Defs>
              <RadialGradient id="coreAura" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FF1447" stopOpacity="0.45" />
                <Stop offset="70%" stopColor="#0B0F1A" stopOpacity="0.9" />
                <Stop offset="100%" stopColor="#0B0F1A" stopOpacity="0" />
              </RadialGradient>
              <SvgLinearGradient id="swordBladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="40%" stopColor="#00F0FF" />
                <Stop offset="70%" stopColor="#121824" />
                <Stop offset="100%" stopColor="#FF1447" />
              </SvgLinearGradient>
              <SvgLinearGradient id="crestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FF2A55" />
                <Stop offset="100%" stopColor="#8A0020" />
              </SvgLinearGradient>
            </Defs>

            {/* Core Dark Aura Circle */}
            <Circle cx="55" cy="55" r="46" fill="url(#coreAura)" />

            {/* Sword 1: Demon-Slayer Greatsword (Diagonal Left to Right) */}
            <G transform="rotate(45, 55, 55)">
              {/* Blade */}
              <Path
                d="M 53 18 L 57 18 L 56.5 75 L 53.5 75 Z"
                fill="url(#swordBladeGrad)"
              />
              {/* Pointed Tip */}
              <Path d="M 53 18 L 55 12 L 57 18 Z" fill="#00F0FF" />
              {/* Crossguard */}
              <Rect x="49" y="75" width="12" height="3" rx="1" fill="#FF1447" />
              {/* Hilt */}
              <Rect x="54" y="78" width="2" height="11" fill="#FFFFFF" />
              {/* Pommel */}
              <Circle cx="55" cy="90" r="2.5" fill="#00F0FF" />
            </G>

            {/* Sword 2: Demon-Dweller Sword (Diagonal Right to Left) */}
            <G transform="rotate(-45, 55, 55)">
              {/* Blade */}
              <Path
                d="M 53 18 L 57 18 L 56.5 75 L 53.5 75 Z"
                fill="url(#swordBladeGrad)"
              />
              {/* Pointed Tip */}
              <Path d="M 53 18 L 55 12 L 57 18 Z" fill="#FF1447" />
              {/* Crossguard */}
              <Rect x="49" y="75" width="12" height="3" rx="1" fill="#00F0FF" />
              {/* Hilt */}
              <Rect x="54" y="78" width="2" height="11" fill="#FFFFFF" />
              {/* Pommel */}
              <Circle cx="55" cy="90" r="2.5" fill="#FF1447" />
            </G>

            {/* 5-Leaf Black Clover / Anti-Magic Center Jewel */}
            <Circle cx="55" cy="55" r="10" fill="#0A0E17" stroke="#FF1447" strokeWidth="2" />
            {/* Center Demon Spark */}
            <Path
              d="M 55 48 L 57 53 L 62 55 L 57 57 L 55 62 L 53 57 L 48 55 L 53 53 Z"
              fill="#00F0FF"
            />
          </Svg>
        </Animated.View>
      </View>

      {/* Title & Slogan */}
      <View style={styles.brandingBox}>
        <Text style={styles.appTitle}>ASTA'S FIT</Text>
        <Text style={styles.subBrand}>⚡ BLACK BULL ANTI-MAGIC RPG</Text>
      </View>

      {/* HUD Loading Status Box */}
      <View style={styles.hudStatusBox}>
        <Animated.Text style={[styles.loadingStatusText, { opacity: textFadeAnim }]}>
          {message || LOADING_MESSAGES[messageIndex]}
        </Animated.Text>

        {/* Progress Bar Container */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { width: progressBarWidth },
                ]}
              />
            </View>
            <View style={styles.progressMetaRow}>
              <Text style={styles.rankStatus}>RANK AWAKENING</Text>
              <Text style={styles.percentText}>{displayPercent}%</Text>
            </View>
          </View>
        )}
      </View>

      {/* Decorative Bottom Corner HUD Bracket */}
      <View style={styles.hudBracketsRow}>
        <Text style={styles.hudBracketText}>[ ANTI-MAGIC PROTOCOL: ACTIVE ]</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#070A12',
    padding: 24,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
  ambientGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 20, 71, 0.08)',
    shadowColor: '#00F0FF',
    shadowRadius: 80,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
  },
  iconWrapper: {
    width: 230,
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
  },
  absoluteCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demonAura: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 20, 71, 0.28)',
    shadowColor: '#FF1447',
    shadowRadius: 28,
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
  },
  emblemContainer: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 240, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subBrand: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 2,
    marginTop: 4,
  },
  hudStatusBox: {
    width: Math.min(SCREEN_WIDTH * 0.84, 320),
    alignItems: 'center',
  },
  loadingStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A0B0C5',
    letterSpacing: 1.5,
    marginBottom: 14,
    textAlign: 'center',
    minHeight: 18,
  },
  progressContainer: {
    width: '100%',
  },
  progressBarTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowRadius: 8,
    shadowOpacity: 0.8,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rankStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 20, 71, 0.85)',
    letterSpacing: 1,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00F0FF',
    fontVariant: ['tabular-nums'],
  },
  hudBracketsRow: {
    marginTop: 36,
  },
  hudBracketText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(122, 136, 155, 0.6)',
    letterSpacing: 2,
  },
});

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LOADING_MESSAGES = [
  'UNSEALING 5-LEAF GRIMOIRE...',
  'THE 5TH LEAF CONTAINS A DEMON...',
  'AWAKENING ANTI-MAGIC MANA...',
  'SURPASSING PHYSICAL LIMITS...',
  'CALIBRATING DEMON-SLAYER POWER...',
  'BLACK BULL HUNTER MATRIX ONLINE...',
];

export const ThemedPreloader = ({
  message = null,
  fullScreen = true,
  showProgress = true,
  onComplete = null,
  duration = 1500, // standard 1.5s delay
}) => {
  // Animation drivers
  const spinValue = useRef(new Animated.Value(0)).current;
  const reverseSpinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.94)).current;
  const auraGlowValue = useRef(new Animated.Value(0.4)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;

  const [messageIndex, setMessageIndex] = useState(0);
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    // 1. Clockwise outer arcane rune circle
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Counter-clockwise inner demon rune circle
    Animated.loop(
      Animated.timing(reverseSpinValue, {
        toValue: 1,
        duration: 5500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Heartbeat demonic pulse on the 5-leaf clover
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.08,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.94,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Anti-magic aura glow flicker
    Animated.loop(
      Animated.sequence([
        Animated.timing(auraGlowValue, {
          toValue: 0.95,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auraGlowValue, {
          toValue: 0.35,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Progress bar animation
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
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1600);

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

  // Single Petal Path relative to (80, 80) center
  // Heart-shaped clover leaf contour
  const petalPathD = 'M 80 80 C 68 58, 54 44, 62 28 C 69 14, 78 12, 80 22 C 82 12, 91 14, 98 28 C 106 44, 92 58, 80 80 Z';

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      {/* Background ambient crimson aura */}
      <View style={styles.ambientGlow} />

      {/* ── Centerpiece: The 5-Leaf Clover & Arcane Circle ── */}
      <View style={styles.cloverWrapper}>
        {/* Outer Rotating Arcane Circle */}
        <Animated.View
          style={[
            styles.absoluteCircle,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <Svg height="240" width="240" viewBox="0 0 240 240">
            <Defs>
              <SvgLinearGradient id="outerRuneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FF1447" stopOpacity="0.85" />
                <Stop offset="50%" stopColor="#8A0020" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#FF003C" stopOpacity="0.9" />
              </SvgLinearGradient>
            </Defs>
            {/* Outer segmented magic ring */}
            <Circle
              cx="120"
              cy="120"
              r="108"
              stroke="url(#outerRuneGrad)"
              strokeWidth="2.5"
              strokeDasharray="24 12 40 16 10 24"
              fill="none"
            />
            {/* Cardinal cardinal point flame gems */}
            <Circle cx="120" cy="12" r="3.5" fill="#FF1447" />
            <Circle cx="120" cy="228" r="3.5" fill="#FF003C" />
            <Circle cx="12" cy="120" r="3.5" fill="#FF2A55" />
            <Circle cx="228" cy="120" r="3.5" fill="#FF1447" />
          </Svg>
        </Animated.View>

        {/* Inner Counter-Rotating Demon Rune Circle */}
        <Animated.View
          style={[
            styles.absoluteCircle,
            { transform: [{ rotate: reverseSpin }] },
          ]}
        >
          <Svg height="190" width="190" viewBox="0 0 190 190">
            <Defs>
              <SvgLinearGradient id="innerRuneGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FF003C" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.5" />
              </SvgLinearGradient>
            </Defs>
            <Circle
              cx="95"
              cy="95"
              r="82"
              stroke="url(#innerRuneGrad)"
              strokeWidth="1.8"
              strokeDasharray="14 10 6 8 20 12"
              fill="none"
            />
            <Circle cx="95" cy="13" r="2.5" fill="#FF1447" />
            <Circle cx="95" cy="177" r="2.5" fill="#FF003C" />
          </Svg>
        </Animated.View>

        {/* Pulsating Demon Aura Glow Behind the Clover */}
        <Animated.View
          style={[
            styles.demonAura,
            {
              opacity: auraGlowValue,
              transform: [{ scale: pulseValue }],
            },
          ]}
        />

        {/* ── THE 5-LEAF CLOVER EMBLEM ── */}
        <Animated.View
          style={[
            styles.cloverContainer,
            { transform: [{ scale: pulseValue }] },
          ]}
        >
          <Svg height="160" width="160" viewBox="0 0 160 160">
            <Defs>
              {/* Petal Obsidian to Dark Crimson Gradient */}
              <SvgLinearGradient id="petalDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#2E040D" stopOpacity="1" />
                <Stop offset="50%" stopColor="#140206" stopOpacity="1" />
                <Stop offset="100%" stopColor="#080002" stopOpacity="1" />
              </SvgLinearGradient>

              {/* Demonic 5th Leaf Glowing Gradient */}
              <SvgLinearGradient id="demonLeafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#4A0514" stopOpacity="1" />
                <Stop offset="60%" stopColor="#1F0106" stopOpacity="1" />
                <Stop offset="100%" stopColor="#0B0002" stopOpacity="1" />
              </SvgLinearGradient>

              {/* Core Demon Pulse Glow */}
              <RadialGradient id="cloverCoreGrad" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FF1447" stopOpacity="0.95" />
                <Stop offset="60%" stopColor="#8A0020" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#080002" stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* LEAF 1: Top (Faith) - 0° */}
            <G transform="rotate(0, 80, 80)">
              <Path
                d={petalPathD}
                fill="url(#petalDarkGrad)"
                stroke="#FF1447"
                strokeWidth="2.2"
              />
              <Path d="M 80 75 Q 80 44 80 24" stroke="#FF4D6D" strokeWidth="1.5" strokeLinecap="round" />
            </G>

            {/* LEAF 2: Top-Right (Hope) - 72° */}
            <G transform="rotate(72, 80, 80)">
              <Path
                d={petalPathD}
                fill="url(#petalDarkGrad)"
                stroke="#FF1447"
                strokeWidth="2.2"
              />
              <Path d="M 80 75 Q 80 44 80 24" stroke="#FF4D6D" strokeWidth="1.5" strokeLinecap="round" />
            </G>

            {/* LEAF 3: Bottom-Right (Love) - 144° */}
            <G transform="rotate(144, 80, 80)">
              <Path
                d={petalPathD}
                fill="url(#petalDarkGrad)"
                stroke="#FF1447"
                strokeWidth="2.2"
              />
              <Path d="M 80 75 Q 80 44 80 24" stroke="#FF4D6D" strokeWidth="1.5" strokeLinecap="round" />
            </G>

            {/* LEAF 4: Bottom-Left (Good Fortune) - 216° */}
            <G transform="rotate(216, 80, 80)">
              <Path
                d={petalPathD}
                fill="url(#petalDarkGrad)"
                stroke="#FF1447"
                strokeWidth="2.2"
              />
              <Path d="M 80 75 Q 80 44 80 24" stroke="#FF4D6D" strokeWidth="1.5" strokeLinecap="round" />
            </G>

            {/* LEAF 5: Top-Left (THE 5TH DEMON LEAF) - 288° */}
            <G transform="rotate(288, 80, 80)">
              <Path
                d={petalPathD}
                fill="url(#demonLeafGrad)"
                stroke="#FF003C"
                strokeWidth="2.6"
              />
              {/* Demonic lightning vein on 5th leaf */}
              <Path d="M 80 75 L 79 52 L 82 42 L 80 24" stroke="#FF1447" strokeWidth="1.8" strokeLinecap="round" />
            </G>

            {/* Central Demon Core Heart Jewel */}
            <Circle cx="80" cy="80" r="14" fill="#0C0003" stroke="#FF1447" strokeWidth="2.4" />
            <Circle cx="80" cy="80" r="8" fill="url(#cloverCoreGrad)" />
            {/* 4-Point Anti-Magic Star in center */}
            <Path
              d="M 80 70 L 82.5 77.5 L 90 80 L 82.5 82.5 L 80 90 L 77.5 82.5 L 70 80 L 77.5 77.5 Z"
              fill="#FFFFFF"
              opacity="0.9"
            />
          </Svg>
        </Animated.View>
      </View>

      {/* ── App Branding ── */}
      <View style={styles.brandingBox}>
        <Text style={styles.appTitle}>ASTA'S FIT</Text>
        <Text style={styles.subBrand}>⚡ 5-LEAF ANTI-MAGIC SYSTEM</Text>
      </View>

      {/* ── Sleek Loading Design Below the Clover ── */}
      <View style={styles.loadingBox}>
        <Animated.Text style={[styles.loadingStatusText, { opacity: textFadeAnim }]}>
          {message || LOADING_MESSAGES[messageIndex]}
        </Animated.Text>

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
              <Text style={styles.metaLabel}>GRIMOIRE SYNC</Text>
              <Text style={styles.percentText}>{displayPercent}%</Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Sub-Indicator */}
      <View style={styles.bottomTagRow}>
        <Text style={styles.bottomTagText}>[ LIMIT BREAKER PROTOCOL ]</Text>
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
    backgroundColor: 'rgba(255, 20, 71, 0.09)',
    shadowColor: '#FF1447',
    shadowRadius: 90,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
  },
  cloverWrapper: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  absoluteCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demonAura: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 20, 71, 0.32)',
    shadowColor: '#FF1447',
    shadowRadius: 36,
    shadowOpacity: 0.95,
    shadowOffset: { width: 0, height: 0 },
  },
  cloverContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(255, 20, 71, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  subBrand: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF1447',
    letterSpacing: 2,
    marginTop: 4,
  },
  loadingBox: {
    width: Math.min(SCREEN_WIDTH * 0.84, 320),
    alignItems: 'center',
  },
  loadingStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A0B0C5',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
    minHeight: 18,
  },
  progressContainer: {
    width: '100%',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 20, 71, 0.35)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF1447',
    shadowColor: '#FF1447',
    shadowRadius: 10,
    shadowOpacity: 0.9,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 20, 71, 0.85)',
    letterSpacing: 1,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF4D6D',
    fontVariant: ['tabular-nums'],
  },
  bottomTagRow: {
    marginTop: 32,
  },
  bottomTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(122, 136, 155, 0.6)',
    letterSpacing: 2,
  },
});

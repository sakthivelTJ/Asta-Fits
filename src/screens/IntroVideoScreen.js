import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const INTRO_SEEN_STORAGE_KEY = '@asta_fit_has_seen_intro_v2';

export const IntroVideoScreen = ({ onFinish }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(INTRO_SEEN_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save intro seen state:', e);
    }
    if (onFinish) {
      onFinish();
    }
  };

  const handlePlaybackUpdate = (status) => {
    if (!status.isLoaded) return;

    if (status.durationMillis && status.durationMillis > 0) {
      setPlaybackProgress(status.positionMillis / status.durationMillis);
    }

    if (status.didJustFinish) {
      handleComplete();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Full-Screen Video Background */}
      <Video
        ref={videoRef}
        source={require('../../assets/PreloaderVideo.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={false}
        isMuted={isMuted}
        onPlaybackStatusUpdate={handlePlaybackUpdate}
        onError={(error) => {
          console.warn('Intro video error:', error);
          handleComplete(); // Don't block user if video fails
        }}
      />

      {/* Top Controls Overlay */}
      <SafeAreaView style={styles.topBar}>
        {/* Mute / Unmute Button */}
        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => setIsMuted((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.pillButtonText}>{isMuted ? 'UNMUTE' : 'MUTE'}</Text>
        </TouchableOpacity>

        {/* Skip Intro Button */}
        <TouchableOpacity
          style={[styles.pillButton, styles.skipButton]}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>SKIP INTRO</Text>
          <Ionicons name="play-forward" size={16} color="#0B0F1A" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Subtle Progress Tracker */}
      <View style={styles.bottomBar}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(0, playbackProgress * 100))}%` },
            ]}
          />
        </View>
        <Text style={styles.introCaption}>⚡ ASTA'S AWAKENING • PROLOGUE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 26, 0.72)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  pillButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  skipButton: {
    backgroundColor: '#00F0FF',
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowRadius: 10,
    shadowOpacity: 0.7,
  },
  skipButtonText: {
    color: '#0B0F1A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 24,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  progressBarBg: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00F0FF',
  },
  introCaption: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

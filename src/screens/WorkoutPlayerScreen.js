import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { EXERCISES } from '../data/exercises';
import { useHunter } from '../context/HunterContext';
import { repConfigFor } from '../domain/repCounter';
import { CameraCounterScreen } from '../features/camera/CameraCounterScreen';

export const WorkoutPlayerScreen = ({ onFinishWorkout }) => {
  const { user, logWorkoutSession } = useHunter();
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [repsInput, setRepsInput] = useState('12');
  const [weightInput, setWeightInput] = useState('0');

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lastXPGained, setLastXPGained] = useState(null);

  // Camera rep counting
  const [cameraVisible, setCameraVisible] = useState(false);

  // Active exercises filtered by user equipment & injury safety, prioritized by target dream body
  const availableExercises = EXERCISES.filter((ex) => {
    if (user.injuries && user.injuries.some(inj => ex.injuryTags.includes(inj))) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    // Prioritize exercises that target the user's dream physique
    if (user.targetPhysique === 'titan') {
      const isAHeavy = a.muscle === 'Chest' || a.muscle === 'Deltoids' || a.muscle === 'Quadriceps';
      const isBHeavy = b.muscle === 'Chest' || b.muscle === 'Deltoids' || b.muscle === 'Quadriceps';
      if (isAHeavy && !isBHeavy) return -1;
      if (!isAHeavy && isBHeavy) return 1;
    } else if (user.targetPhysique === 'toned_athletic') {
      const isACut = a.category.includes('Chest') || a.muscle === 'Core' || a.muscle === 'Lats';
      const isBCut = b.category.includes('Chest') || b.muscle === 'Core' || b.muscle === 'Lats';
      if (isACut && !isBCut) return -1;
      if (!isACut && isBCut) return 1;
    }
    return 0;
  }).slice(0, 8);

  const currentExercise = availableExercises[selectedExerciseIndex] || EXERCISES[0];

  useEffect(() => {
    let timer = null;
    if (isTimerRunning && restSeconds > 0) {
      timer = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      triggerHapticAlert();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, restSeconds]);

  const triggerHapticAlert = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Fallback
    }
  };

  const startRestTimer = (seconds = 45) => {
    setRestSeconds(seconds);
    setIsTimerRunning(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
  };

  const adjustTimer = (delta) => {
    setRestSeconds((prev) => Math.max(0, prev + delta));
  };

  const handleLogSet = () => {
    const reps = parseInt(repsInput) || currentExercise.defaultReps;
    const weight = parseFloat(weightInput) || 0;
    const xpGained = reps * currentExercise.xpPerRep + (weight > 0 ? weight * 2 : 0);

    const currentExSets = completedSets[currentExercise.id] || [];
    const newSetObj = {
      setNum: currentExSets.length + 1,
      reps,
      weight,
      xp: xpGained,
    };

    setCompletedSets({
      ...completedSets,
      [currentExercise.id]: [...currentExSets, newSetObj],
    });

    setLastXPGained(xpGained);
    setTimeout(() => setLastXPGained(null), 2500);

    // Auto start rest timer
    startRestTimer(45);
  };

  const handleFinish = () => {
    let totalSetsLogged = 0;
    let totalRepsLogged = 0;
    let totalVolumeLogged = 0;
    let totalXPEarned = 0;

    Object.keys(completedSets).forEach((exId) => {
      const sets = completedSets[exId];
      sets.forEach((s) => {
        totalSetsLogged += 1;
        totalRepsLogged += s.reps;
        totalVolumeLogged += s.reps * (s.weight || 1);
        totalXPEarned += s.xp;
      });
    });

    if (totalSetsLogged > 0) {
      logWorkoutSession('Daily Hunter Training Session', totalSetsLogged, totalRepsLogged, totalVolumeLogged, totalXPEarned);
    }
    if (onFinishWorkout) onFinishWorkout();
  };

  const currentExLoggedSets = completedSets[currentExercise.id] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <View style={styles.topTitleBox}>
          <Ionicons name="barbell" size={20} color="#00F0FF" />
          <Text style={styles.topTitle}>HUNTER WORKOUT PLAYER</Text>
        </View>
        <TouchableOpacity style={styles.finishTopButton} onPress={handleFinish}>
          <Text style={styles.finishTopText}>FINISH</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Transformation Protocol Banner */}
        <View style={styles.protocolBanner}>
          <Ionicons name="sparkles" size={14} color="#00F0FF" />
          <Text style={styles.protocolText}>
            AI PROTOCOL: FORGING {user.targetPhysique?.toUpperCase()} BUILD
          </Text>
        </View>

        {/* Exercise Carousel Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {availableExercises.map((ex, idx) => {
            const isSelected = idx === selectedExerciseIndex;
            const exSetsCount = (completedSets[ex.id] || []).length;
            return (
              <TouchableOpacity
                key={ex.id}
                style={[styles.carouselCard, isSelected && styles.activeCarouselCard]}
                onPress={() => setSelectedExerciseIndex(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.carouselNum, isSelected && { color: '#00F0FF' }]}>
                  EX {idx + 1}
                </Text>
                <Text style={styles.carouselName} numberOfLines={1}>{ex.name}</Text>
                {exSetsCount > 0 && (
                  <View style={styles.completedSetsBadge}>
                    <Text style={styles.completedSetsBadgeText}>{exSetsCount} Sets Logged</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Current Active Exercise Info */}
        <View style={styles.exerciseCard}>
          <View style={styles.exHeaderRow}>
            <View>
              <Text style={styles.exCategory}>{currentExercise.category.toUpperCase()}</Text>
              <Text style={styles.exName}>{currentExercise.name}</Text>
            </View>
            <View style={styles.statGainBadge}>
              <Ionicons name="flash" size={14} color="#FF7700" />
              <Text style={styles.statGainText}>+{currentExercise.xpPerRep} XP/rep</Text>
            </View>
          </View>

          <Text style={styles.instructionsText}>{currentExercise.instructions}</Text>

          {/* XP Floater Popup Notification */}
          {lastXPGained && (
            <View style={styles.xpFloater}>
              <Ionicons name="sparkles" size={16} color="#FFD700" />
              <Text style={styles.xpFloaterText}>+{lastXPGained} XP EARNED!</Text>
            </View>
          )}

          {/* Count with Camera button — only for supported exercises */}
          {repConfigFor(currentExercise.id) && (
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => setCameraVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={18} color="#60A5FA" />
              <Text style={styles.cameraBtnText}>COUNT WITH CAMERA (AI)</Text>
            </TouchableOpacity>
          )}

          {/* Set Logger Inputs */}
          <View style={styles.loggerRow}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>REPS</Text>
              <TextInput
                style={styles.loggerInput}
                keyboardType="numeric"
                value={repsInput}
                onChangeText={setRepsInput}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
              <TextInput
                style={styles.loggerInput}
                keyboardType="numeric"
                value={weightInput}
                onChangeText={setWeightInput}
              />
            </View>

            <TouchableOpacity style={styles.logSetButton} onPress={handleLogSet} activeOpacity={0.8}>
              <Ionicons name="add" size={24} color="#0A0D14" />
              <Text style={styles.logSetText}>LOG SET</Text>
            </TouchableOpacity>
          </View>
        </View>

          {/* Camera Counter Modal */}
          <Modal
            visible={cameraVisible}
            animationType="slide"
            statusBarTranslucent
            onRequestClose={() => setCameraVisible(false)}
          >
            <CameraCounterScreen
              exerciseTitle={currentExercise.name}
              exerciseId={currentExercise.id}
              targetReps={currentExercise.defaultReps}
              onDone={({ reps, formScore }) => {
                if (reps > 0) {
                  setRepsInput(String(reps));
                  const xpGained = reps * currentExercise.xpPerRep;
                  const currentExSets = completedSets[currentExercise.id] || [];
                  const newSetObj = {
                    setNum: currentExSets.length + 1,
                    reps,
                    weight: parseFloat(weightInput) || 0,
                    xp: xpGained,
                    formScore: formScore || 100,
                  };
                  setCompletedSets({
                    ...completedSets,
                    [currentExercise.id]: [...currentExSets, newSetObj],
                  });
                  setLastXPGained(xpGained);
                  setTimeout(() => setLastXPGained(null), 2500);
                  startRestTimer(45);
                }
                setCameraVisible(false);
              }}
              onClose={() => setCameraVisible(false)}
            />
          </Modal>

        {/* Rest Timer HUD */}
        <View style={styles.timerCard}>
          <View style={styles.timerHeaderRow}>
            <Ionicons name="timer-outline" size={20} color="#00F0FF" />
            <Text style={styles.timerHeaderTitle}>ACTIVE REST TIMER</Text>
          </View>

          <View style={styles.timerDisplayRow}>
            <Text style={styles.timerCountdown}>
              {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, '0')}
            </Text>
            <View style={styles.timerControlsRow}>
              <TouchableOpacity style={styles.timerBtn} onPress={() => adjustTimer(-10)}>
                <Text style={styles.timerBtnText}>-10s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timerBtn} onPress={() => adjustTimer(30)}>
                <Text style={styles.timerBtnText}>+30s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timerBtn, isTimerRunning ? styles.pauseBtn : styles.startBtn]}
                onPress={() => setIsTimerRunning(!isTimerRunning)}
              >
                <Ionicons name={isTimerRunning ? 'pause' : 'play'} size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recorded Sets Table */}
        <View style={styles.setsTableCard}>
          <Text style={styles.setsTableTitle}>COMPLETED SETS FOR THIS EXERCISE</Text>
          {currentExLoggedSets.length === 0 ? (
            <Text style={styles.noSetsText}>No sets logged yet. Enter reps above and tap LOG SET.</Text>
          ) : (
            currentExLoggedSets.map((s, idx) => (
              <View key={idx} style={styles.setRow}>
                <Text style={styles.setNumText}>Set {s.setNum}</Text>
                <Text style={styles.setDetailText}>{s.reps} reps @ {s.weight} kg</Text>
                <Text style={styles.setXPText}>+{s.xp} XP</Text>
              </View>
            ))
          )}
        </View>
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
  protocolBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#00F0FF30',
    gap: 6,
  },
  protocolText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
  },
  topTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  finishTopButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  finishTopText: {
    color: '#0A0D14',
    fontSize: 12,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
  },
  carousel: {
    marginBottom: 16,
  },
  carouselCard: {
    backgroundColor: '#121824',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    width: 140,
    borderWidth: 1,
    borderColor: '#233045',
  },
  activeCarouselCard: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  carouselNum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7A889B',
    marginBottom: 4,
  },
  carouselName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  completedSetsBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  completedSetsBadgeText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '700',
  },
  exerciseCard: {
    backgroundColor: '#121824',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#233045',
    marginBottom: 16,
  },
  exHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1,
  },
  exName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statGainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 119, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statGainText: {
    fontSize: 11,
    color: '#FF7700',
    fontWeight: '800',
    marginLeft: 4,
  },
  instructionsText: {
    fontSize: 13,
    color: '#A0B0C5',
    lineHeight: 18,
    marginBottom: 14,
  },
  xpFloater: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  xpFloaterText: {
    color: '#0A0D14',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 6,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 11,
    marginBottom: 12,
    gap: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  cameraBtnText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  loggerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  inputBox: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7A889B',
    marginBottom: 4,
  },
  loggerInput: {
    backgroundColor: '#0A0D14',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#233045',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    height: 44,
  },
  logSetButton: {
    flexDirection: 'row',
    backgroundColor: '#00F0FF',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logSetText: {
    color: '#0A0D14',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 4,
  },
  timerCard: {
    backgroundColor: '#161D2B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00F0FF40',
    marginBottom: 16,
  },
  timerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  timerDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerCountdown: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  timerControlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timerBtn: {
    backgroundColor: '#0D121B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#28364F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerBtnText: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '800',
  },
  startBtn: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  pauseBtn: {
    backgroundColor: '#FF4D4D',
    borderColor: '#FF4D4D',
  },
  setsTableCard: {
    backgroundColor: '#121824',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#233045',
  },
  setsTableTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7A889B',
    letterSpacing: 1,
    marginBottom: 10,
  },
  noSetsText: {
    fontSize: 12,
    color: '#5A6E85',
    fontStyle: 'italic',
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
  },
  setNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  setDetailText: {
    fontSize: 13,
    color: '#A0B0C5',
  },
  setXPText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFD700',
  },
});

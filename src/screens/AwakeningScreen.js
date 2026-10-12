/**
 * AwakeningScreen.js — Visual Hunter Awakening & Onboarding Ceremony
 * Features visual outer sketch contours for Current & Dream Body selection,
 * AI-generated workout routines via OpenAI, and equipment/injury customization.
 */

import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { CURRENT_PHYSIQUES, TARGET_PHYSIQUES } from '../data/physiques';
import { useHunter } from '../context/HunterContext';
import { getTransformationPlan } from '../domain/transformationPlan';

export const AwakeningScreen = () => {
  const { completeOnboarding } = useHunter();

  const [step, setStep] = useState(1); // 1 = Current, 2 = Dream Body, 3 = AI Roadmap, 4 = Equipment, 5 = Awakening Reveal
  const [selectedCurrent, setSelectedCurrent] = useState('slim');
  const [selectedTarget, setSelectedTarget] = useState('toned_athletic');
  const [equipment, setEquipment] = useState(['bodyweight', 'dumbbell']);
  const [limitations, setLimitations] = useState([]);

  // AI Roadmap State
  const [transformationData, setTransformationData] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Hardware Back button support: go to previous step if step > 1
  useEffect(() => {
    const handleBack = () => {
      if (step > 1) {
        setStep((prev) => prev - 1);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => sub.remove();
  }, [step]);

  const currentObj = CURRENT_PHYSIQUES.find((p) => p.id === selectedCurrent) || CURRENT_PHYSIQUES[0];
  const targetObj = TARGET_PHYSIQUES.find((p) => p.id === selectedTarget) || TARGET_PHYSIQUES[0];

  useEffect(() => {
    // Calibrate AI roadmap when moving to Step 3
    if (step === 3) {
      loadAiRoadmap();
    }
  }, [step, selectedCurrent, selectedTarget]);

  const loadAiRoadmap = async () => {
    setIsGeneratingAi(true);
    try {
      const plan = await getTransformationPlan(selectedCurrent, selectedTarget, equipment, limitations);
      setTransformationData(plan);
    } catch (e) {
      console.warn('Failed to load roadmap:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const toggleEquipment = (id) => {
    if (equipment.includes(id)) {
      if (equipment.length > 1) setEquipment(equipment.filter((i) => i !== id));
    } else {
      setEquipment([...equipment, id]);
    }
  };

  const toggleLimitation = (id) => {
    if (limitations.includes(id)) {
      setLimitations(limitations.filter((i) => i !== id));
    } else {
      setLimitations([...limitations, id]);
    }
  };

  const handleFinishOnboarding = () => {
    completeOnboarding(selectedCurrent, selectedTarget, equipment, limitations);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D14" translucent={false} />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleRow}>
          {step > 1 && (
            <TouchableOpacity
              onPress={() => setStep((prev) => prev - 1)}
              style={{ marginRight: 8, padding: 2 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#00F0FF" />
            </TouchableOpacity>
          )}
          <Ionicons name="shield-checkmark" size={16} color="#00F0FF" />
          <Text style={styles.headerTag}>SYSTEM AWAKENING CEREMONY</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          STEP {step} OF 5: {
            step === 1 ? 'CURRENT FRAME' :
            step === 2 ? 'DREAM BODY' :
            step === 3 ? 'AI PROTOCOL' :
            step === 4 ? 'SAFETY & GEAR' : 'AWAKENING REVEAL'
          }
        </Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── STEP 1: CURRENT BODY SELECTION ── */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Select Your Current Physique</Text>
            <Text style={styles.stepSub}>
              Choose the outer silhouette contour that reflects your physical body right now.
            </Text>

            <View style={styles.cardsContainer}>
              {CURRENT_PHYSIQUES.map((p) => {
                const isSelected = selectedCurrent === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    onPress={() => setSelectedCurrent(p.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.sketchBox}>
                      <Image source={p.image} style={styles.sketchImage} resizeMode="contain" />
                    </View>

                    <View style={styles.cardDetails}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.cardTitle}>{p.title}</Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color="#00F0FF" />
                        )}
                      </View>
                      <Text style={[styles.cardSubText, { color: p.color }]}>{p.subtitle}</Text>
                      <Text style={styles.cardDescText}>{p.description}</Text>

                      <View style={styles.badgePill}>
                        <Text style={styles.badgePillText}>Initial Focus: {p.defaultFocus}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 2: DREAM TARGET BODY SELECTION ── */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Choose Your Target Dream Body</Text>
            <Text style={styles.stepSub}>
              What physique silhouette do you want to build? The System will dynamically generate your training regimen.
            </Text>

            <View style={styles.cardsContainer}>
              {TARGET_PHYSIQUES.map((p) => {
                const isSelected = selectedTarget === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    onPress={() => setSelectedTarget(p.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.sketchBox}>
                      <Image source={p.image} style={styles.sketchImage} resizeMode="contain" />
                    </View>

                    <View style={styles.cardDetails}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.cardTitle}>{p.title}</Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color="#00F0FF" />
                        )}
                      </View>
                      <Text style={[styles.cardSubText, { color: p.color }]}>{p.subtitle}</Text>
                      <Text style={styles.cardDescText}>{p.description}</Text>

                      <View style={styles.dietPreviewBox}>
                        <Ionicons name="nutrition-outline" size={14} color="#00F0FF" />
                        <Text style={styles.dietPreviewText}>{p.primaryStat}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 3: AI TRANSFORMATION ROADMAP ── */}
        {step === 3 && (
          <View>
            <View style={styles.aiHeaderTagRow}>
              <Ionicons name="sparkles" size={16} color="#00F0FF" />
              <Text style={styles.aiHeaderTag}>CHARMY AI PROTOCOL (OPENAI GPT-4O) 🍖</Text>
            </View>
            <Text style={styles.stepTitle}>Your Custom Transformation Path</Text>
            <Text style={styles.stepSub}>
              Comparing your starting silhouette to your dream build with personalized AI exercises.
            </Text>

            {/* Visual Transformation Comparison */}
            <View style={styles.transformationHeroCard}>
              <View style={styles.heroPhysiqueCol}>
                <View style={styles.heroSketchWrapper}>
                  <Image source={currentObj.image} style={styles.heroSketchImage} resizeMode="contain" />
                </View>
                <Text style={styles.heroPhysiqueTag}>CURRENT FRAME</Text>
                <Text style={styles.heroPhysiqueName}>{currentObj.title}</Text>
              </View>

              <View style={styles.heroArrowCol}>
                <Ionicons name="arrow-forward" size={26} color="#00F0FF" />
                <Text style={styles.heroArrowText}>TRANSFORM</Text>
              </View>

              <View style={styles.heroPhysiqueCol}>
                <View style={[styles.heroSketchWrapper, { borderColor: '#00F0FF' }]}>
                  <Image source={targetObj.image} style={styles.heroSketchImage} resizeMode="contain" />
                </View>
                <Text style={[styles.heroPhysiqueTag, { color: '#00F0FF' }]}>DREAM BODY</Text>
                <Text style={[styles.heroPhysiqueName, { color: '#00F0FF' }]}>{targetObj.title}</Text>
              </View>
            </View>

            {/* Protocol Banner */}
            <View style={styles.protocolBanner}>
              <Ionicons name="flash" size={18} color="#FFD700" />
              <Text style={styles.protocolTitle}>
                {transformationData?.protocolTitle || 'HYPERTROPHY & RECOMP PROTOCOL'}
              </Text>
            </View>

            {/* AI Generated Exercises */}
            <View style={styles.exercisesHeaderRow}>
              <Text style={styles.exercisesSectionTitle}>AI-CALIBRATED EXERCISES</Text>
              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={loadAiRoadmap}
                disabled={isGeneratingAi}
              >
                {isGeneratingAi ? (
                  <ActivityIndicator size="small" color="#00F0FF" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={14} color="#00F0FF" />
                    <Text style={styles.regenerateBtnText}>ASK CHARMY</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {isGeneratingAi ? (
              <View style={styles.aiLoadingBox}>
                <ActivityIndicator size="large" color="#00F0FF" />
                <Text style={styles.aiLoadingText}>Charmy AI is cooking up exercises via OpenAI...</Text>
              </View>
            ) : (
              <View style={styles.aiExercisesList}>
                {(transformationData?.recommendedExercises || []).map((ex, idx) => (
                  <View key={idx} style={styles.exerciseCard}>
                    <View style={styles.exTopRow}>
                      <View style={styles.exNumBadge}>
                        <Text style={styles.exNumText}>0{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.exName}>{ex.name}</Text>
                        <Text style={styles.exTarget}>{ex.targetMuscle}</Text>
                      </View>
                      <View style={styles.exSetsPill}>
                        <Text style={styles.exSetsText}>{ex.sets} sets × {ex.reps}</Text>
                      </View>
                    </View>
                    <Text style={styles.exFocus}>{ex.focus}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── STEP 4: EQUIPMENT & SAFETY ── */}
        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Equipment & Joint Safety</Text>
            <Text style={styles.stepSub}>
              Ensure exercises safely calibrate to what gear you own and any injuries to avoid.
            </Text>

            <Text style={styles.subSectionTitle}>AVAILABLE EQUIPMENT</Text>
            <View style={styles.pillGrid}>
              {[
                { id: 'bodyweight', label: 'Bodyweight Only', icon: 'body' },
                { id: 'dumbbell', label: 'Dumbbells', icon: 'barbell' },
                { id: 'pullup_bar', label: 'Pull-Up Bar', icon: 'remove' },
                { id: 'full_gym', label: 'Full Gym / Barbell', icon: 'fitness' },
              ].map((item) => {
                const isSelected = equipment.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.pill, isSelected && styles.activePill]}
                    onPress={() => toggleEquipment(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={item.icon} size={18} color={isSelected ? '#00F0FF' : '#7A889B'} />
                    <Text style={[styles.pillText, isSelected && styles.activePillText]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.subSectionTitle, { marginTop: 22 }]}>INJURY / JOINT SAFETY (OPTIONAL)</Text>
            <View style={styles.pillGrid}>
              {[
                { id: 'knee', label: 'Sensitive Knees' },
                { id: 'lower_back', label: 'Lower Back Care' },
                { id: 'shoulder', label: 'Shoulder Protection' },
                { id: 'wrist', label: 'Wrist Support' },
              ].map((item) => {
                const isSelected = limitations.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.pill, isSelected && styles.activeDangerPill]}
                    onPress={() => toggleLimitation(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="medical" size={16} color={isSelected ? '#FF4D4D' : '#7A889B'} />
                    <Text style={[styles.pillText, isSelected && { color: '#FF4D4D', fontWeight: '700' }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 5: AWAKENING CEREMONY REVEAL ── */}
        {step === 5 && (
          <View style={styles.rankRevealBox}>
            <Text style={styles.systemWindowTag}>[ SYSTEM AWAKENING CEREMONY ]</Text>
            <Text style={styles.rankRevealHeading}>YOU HAVE AWAKENED!</Text>

            <View style={styles.rankBadgeLarge}>
              <Text style={styles.rankLetter}>E</Text>
            </View>

            <Text style={styles.assignedRankTitle}>E-RANK NOVICE HUNTER</Text>
            <Text style={styles.assignedRankDesc}>
              The System has calibrated your transformation from <Text style={{ color: '#00F0FF', fontWeight: '700' }}>{currentObj.title}</Text> to <Text style={{ color: '#FFD700', fontWeight: '700' }}>{targetObj.title}</Text>. Your daily system quests and adaptive workouts are ready.
            </Text>

            <View style={styles.awakeningStatsSummary}>
              <View style={styles.statMiniCard}>
                <Text style={styles.statMiniVal}>Level 1</Text>
                <Text style={styles.statMiniLbl}>Status</Text>
              </View>
              <View style={styles.statMiniCard}>
                <Text style={[styles.statMiniVal, { color: '#00F0FF' }]}>+5 Points</Text>
                <Text style={styles.statMiniLbl}>Available</Text>
              </View>
              <View style={styles.statMiniCard}>
                <Text style={[styles.statMiniVal, { color: '#4CAF50' }]}>AI Sync</Text>
                <Text style={styles.statMiniLbl}>Ready</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footerNav}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={18} color="#00F0FF" />
            <Text style={styles.backBtnText}>BACK</Text>
          </TouchableOpacity>
        ) : <View />}

        {step < 5 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}>
            <Text style={styles.nextBtnText}>CONTINUE</Text>
            <Ionicons name="arrow-forward" size={18} color="#0A0D14" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinishOnboarding}>
            <Ionicons name="flash" size={20} color="#0A0D14" />
            <Text style={styles.finishBtnText}>ENTER SYSTEM</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D14',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 4 : 0,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
    backgroundColor: '#0A0D14',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  progressBg: {
    height: 4,
    backgroundColor: '#161D2B',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00F0FF',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 13,
    color: '#7A889B',
    marginBottom: 16,
    lineHeight: 18,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#121824',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#233045',
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  sketchBox: {
    width: 76,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sketchImage: {
    width: '100%',
    height: '100%',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardSubText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  cardDescText: {
    fontSize: 11,
    color: '#8A99AD',
    marginTop: 4,
    lineHeight: 15,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  badgePillText: {
    fontSize: 10,
    color: '#00F0FF',
    fontWeight: '600',
  },
  dietPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  dietPreviewText: {
    fontSize: 11,
    color: '#00F0FF',
    fontWeight: '700',
  },
  aiHeaderTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiHeaderTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1.5,
  },
  transformationHeroCard: {
    flexDirection: 'row',
    backgroundColor: '#121824',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#00F0FF40',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroPhysiqueCol: {
    alignItems: 'center',
    flex: 1,
  },
  heroSketchWrapper: {
    width: 68,
    height: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  heroSketchImage: {
    width: '100%',
    height: '100%',
  },
  heroPhysiqueTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#7A889B',
    letterSpacing: 1,
  },
  heroPhysiqueName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
    textAlign: 'center',
  },
  heroArrowCol: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  heroArrowText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1,
    marginTop: 2,
  },
  protocolBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 8,
    marginBottom: 16,
  },
  protocolTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 0.5,
    flex: 1,
  },
  exercisesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  exercisesSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1.5,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  regenerateBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
  },
  aiLoadingBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#121824',
    borderRadius: 14,
    gap: 10,
  },
  aiLoadingText: {
    fontSize: 12,
    color: '#7A889B',
    fontStyle: 'italic',
  },
  aiExercisesList: {
    gap: 10,
  },
  exerciseCard: {
    backgroundColor: '#121824',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#233045',
  },
  exTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exNumText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00F0FF',
  },
  exName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  exTarget: {
    fontSize: 11,
    color: '#7A889B',
    marginTop: 1,
  },
  exSetsPill: {
    backgroundColor: 'rgba(255, 119, 0, 0.12)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  exSetsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7700',
  },
  exFocus: {
    fontSize: 11,
    color: '#A0B0C5',
    lineHeight: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1A2333',
    paddingTop: 6,
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121824',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#233045',
    minWidth: '45%',
  },
  activePill: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  activeDangerPill: {
    borderColor: '#FF4D4D',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
  },
  pillText: {
    fontSize: 13,
    color: '#7A889B',
    marginLeft: 8,
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rankRevealBox: {
    alignItems: 'center',
    backgroundColor: '#121824',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#00F0FF',
    marginVertical: 10,
  },
  systemWindowTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 2,
  },
  rankRevealHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 18,
  },
  rankBadgeLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#4A5568',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#718096',
  },
  rankLetter: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  assignedRankTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  assignedRankDesc: {
    fontSize: 13,
    color: '#A0B0C5',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  awakeningStatsSummary: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
    justifyContent: 'center',
  },
  statMiniCard: {
    alignItems: 'center',
    backgroundColor: '#0D121B',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#233045',
    minWidth: '28%',
  },
  statMiniVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statMiniLbl: {
    fontSize: 10,
    color: '#7A889B',
    marginTop: 2,
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A2333',
    backgroundColor: '#0A0D14',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  backBtnText: {
    color: '#00F0FF',
    fontWeight: '800',
    fontSize: 13,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 'auto',
    gap: 6,
  },
  nextBtnText: {
    color: '#0A0D14',
    fontWeight: '900',
    fontSize: 14,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 'auto',
    gap: 6,
  },
  finishBtnText: {
    color: '#0A0D14',
    fontWeight: '900',
    fontSize: 14,
  },
});

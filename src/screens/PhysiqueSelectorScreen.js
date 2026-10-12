import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  ImageBackground,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CURRENT_PHYSIQUES, TARGET_PHYSIQUES } from '../data/physiques';
import { useHunter } from '../context/HunterContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * 1.7;

export const PhysiqueSelectorScreen = () => {
  const { completeOnboarding } = useHunter();
  const [step, setStep] = useState(1); // 1 = Current, 2 = Target, 3 = Equipment & Injury
  const [selectedCurrent, setSelectedCurrent] = useState('slim');
  const [selectedTarget, setSelectedTarget] = useState('toned_athletic');
  const [selectedEquipment, setSelectedEquipment] = useState(['bodyweight', 'dumbbell']);
  const [selectedInjuries, setSelectedInjuries] = useState([]);

  const toggleEquipment = (id) => {
    if (selectedEquipment.includes(id)) {
      if (selectedEquipment.length > 1) {
        setSelectedEquipment(selectedEquipment.filter(item => item !== id));
      }
    } else {
      setSelectedEquipment([...selectedEquipment, id]);
    }
  };

  const toggleInjury = (id) => {
    if (selectedInjuries.includes(id)) {
      setSelectedInjuries(selectedInjuries.filter(item => item !== id));
    } else {
      setSelectedInjuries([...selectedInjuries, id]);
    }
  };

  const handleFinish = () => {
    completeOnboarding(selectedCurrent, selectedTarget, selectedEquipment, selectedInjuries);
  };

  const currentObj = CURRENT_PHYSIQUES.find(p => p.id === selectedCurrent);
  const targetObj = TARGET_PHYSIQUES.find(p => p.id === selectedTarget);

  const renderPhysiqueCard = ({ item, isTarget = false }) => {
    const isSelected = isTarget
      ? selectedTarget === item.id
      : selectedCurrent === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.physiqueCard,
          isSelected && { borderColor: item.color, borderWidth: 2.5 },
        ]}
        onPress={() => isTarget ? setSelectedTarget(item.id) : setSelectedCurrent(item.id)}
        activeOpacity={0.85}
      >
        {/* Character Image */}
        <Image
          source={item.image}
          style={styles.physiqueImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)', '#000000']}
          style={styles.cardGradient}
        />

        {/* Selected Glow Border Overlay */}
        {isSelected && (
          <View style={[styles.selectedGlow, { borderColor: item.color, shadowColor: item.color }]} />
        )}

        {/* Selection Checkmark */}
        {isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: item.color }]}>
            <Ionicons name="checkmark" size={12} color="#000" />
          </View>
        )}

        {/* Card Labels */}
        <View style={styles.cardLabels}>
          <Text style={[styles.cardTitle, isSelected && { color: item.color }]}>
            {item.subtitle || item.title}
          </Text>
          <Text style={styles.cardSmallDesc} numberOfLines={2}>
            {item.subtitle === item.title ? item.description.split('.')[0] : item.description.split('—')[1]?.trim().split('.')[0] || item.description.split('.')[0]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/app_background.jpg')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      {/* Dark overlay for readability */}
      <View style={styles.bgOverlay} />

      <SafeAreaView style={styles.container}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>⚡ HUNTER AWAKENING CEREMONY</Text>
          <Text style={styles.stepSubtitle}>
            STEP {step} OF 3:{' '}
            {step === 1 ? 'CURRENT BUILD' : step === 2 ? 'TARGET PHYSIQUE' : 'EQUIPMENT & SAFETY'}
          </Text>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#00F0FF', '#8A2BE2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` }]}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ─── STEP 1: CURRENT PHYSIQUE ─── */}
          {step === 1 && (
            <View>
              <Text style={styles.sectionHeader}>Select Your Current Physique</Text>
              <Text style={styles.sectionSub}>
                The System will calculate your baseline stats and starting XP multiplier.
              </Text>

              {/* Physique Cards Grid */}
              <View style={styles.cardGrid}>
                {CURRENT_PHYSIQUES.map((item) => (
                  <View key={item.id}>
                    {renderPhysiqueCard({ item, isTarget: false })}
                  </View>
                ))}
              </View>

              {/* Selected Preview Panel */}
              {currentObj && (
                <View style={[styles.selectionPanel, { borderColor: `${currentObj.color}40` }]}>
                  <LinearGradient
                    colors={[`${currentObj.color}18`, 'rgba(0,0,0,0.6)']}
                    style={styles.selectionPanelGrad}
                  >
                    <View style={styles.selectionPanelRow}>
                      <Image source={currentObj.image} style={styles.selectionThumb} resizeMode="cover" />
                      <View style={styles.selectionInfo}>
                        <Text style={[styles.selectionTitle, { color: currentObj.color }]}>
                          {currentObj.title}
                        </Text>
                        <Text style={styles.selectionSub}>{currentObj.subtitle}</Text>
                        <Text style={styles.selectionDesc}>{currentObj.description}</Text>
                        <View style={styles.focusBadge}>
                          <Ionicons name="flash" size={12} color={currentObj.color} />
                          <Text style={[styles.focusText, { color: currentObj.color }]}>
                            {currentObj.defaultFocus}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}
            </View>
          )}

          {/* ─── STEP 2: TARGET / DREAM PHYSIQUE ─── */}
          {step === 2 && (
            <View>
              <Text style={styles.sectionHeader}>Select Your Dream Physique</Text>
              <Text style={styles.sectionSub}>
                What body build do you want to forge? Daily quests & diet will be tailored to your goal.
              </Text>

              {/* Dream Physique Cards Grid */}
              <View style={styles.cardGrid}>
                {TARGET_PHYSIQUES.map((item) => (
                  <View key={item.id}>
                    {renderPhysiqueCard({ item, isTarget: true })}
                  </View>
                ))}
              </View>

              {/* Selected Dream Preview Panel */}
              {targetObj && (
                <View style={[styles.selectionPanel, { borderColor: `${targetObj.color}40` }]}>
                  <LinearGradient
                    colors={[`${targetObj.color}18`, 'rgba(0,0,0,0.6)']}
                    style={styles.selectionPanelGrad}
                  >
                    <View style={styles.selectionPanelRow}>
                      <Image source={targetObj.image} style={styles.selectionThumb} resizeMode="cover" />
                      <View style={styles.selectionInfo}>
                        <Text style={[styles.selectionTitle, { color: targetObj.color }]}>
                          {targetObj.title}
                        </Text>
                        <Text style={styles.selectionSub}>{targetObj.subtitle}</Text>
                        <Text style={styles.selectionDesc}>{targetObj.description}</Text>
                        <View style={styles.dietBox}>
                          <Ionicons name="restaurant-outline" size={12} color="#00F0FF" />
                          <Text style={styles.dietText}>{targetObj.dietType}</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}
            </View>
          )}

          {/* ─── STEP 3: EQUIPMENT & SAFETY ─── */}
          {step === 3 && (
            <View>
              <Text style={styles.sectionHeader}>Equipment & Injury Flags</Text>
              <Text style={styles.sectionSub}>
                Configure your available equipment and flag past injuries so exercises safely adapt.
              </Text>

              {/* Equipment Selection */}
              <Text style={styles.subSectionTitle}>AVAILABLE EQUIPMENT</Text>
              <View style={styles.pillGrid}>
                {[
                  { id: 'bodyweight', label: 'Bodyweight Only', icon: 'body' },
                  { id: 'dumbbell', label: 'Dumbbells', icon: 'barbell' },
                  { id: 'pullup_bar', label: 'Pull-Up Bar', icon: 'remove' },
                  { id: 'full_gym', label: 'Full Gym / Barbell', icon: 'fitness' },
                ].map((item) => {
                  const isSelected = selectedEquipment.includes(item.id);
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

              {/* Injury Flags */}
              <Text style={[styles.subSectionTitle, { marginTop: 20 }]}>
                INJURY / JOINT SAFETY FLAGS (OPTIONAL)
              </Text>
              <View style={styles.pillGrid}>
                {[
                  { id: 'knee', label: 'Sensitive Knees' },
                  { id: 'lower_back', label: 'Lower Back Care' },
                  { id: 'shoulder', label: 'Shoulder Protection' },
                  { id: 'wrist', label: 'Wrist Support' },
                ].map((item) => {
                  const isSelected = selectedInjuries.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.pill, isSelected && styles.activeDangerPill]}
                      onPress={() => toggleInjury(item.id)}
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

              {/* Summary Box */}
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>⚡ RECOMMENDATION SUMMARY</Text>
                <View style={styles.summaryRow}>
                  <Image source={currentObj?.image} style={styles.summaryThumb} resizeMode="cover" />
                  <Ionicons name="arrow-forward" size={16} color="#7A889B" style={{ marginHorizontal: 8 }} />
                  <Image source={targetObj?.image} style={styles.summaryThumb} resizeMode="cover" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.summaryText}>
                      <Text style={{ color: '#00F0FF', fontWeight: '700' }}>{currentObj?.title}</Text>
                      {' → '}
                      <Text style={{ color: '#FFD700', fontWeight: '700' }}>{targetObj?.title}</Text>
                    </Text>
                    <Text style={styles.summaryText}>
                      Diet: <Text style={{ color: '#00F0FF' }}>{targetObj?.dietType?.split('(')[0]?.trim()}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Navigation Footer */}
        <View style={styles.footerNav}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
              <Ionicons name="arrow-back" size={20} color="#00F0FF" />
              <Text style={styles.backButtonText}>BACK</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {step < 3 ? (
            <TouchableOpacity style={styles.nextButton} onPress={() => setStep(step + 1)}>
              <Text style={styles.nextButtonText}>CONTINUE</Text>
              <Ionicons name="arrow-forward" size={20} color="#0A0D14" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <Ionicons name="flash" size={20} color="#0A0D14" />
              <Text style={styles.finishButtonText}>AWAKEN SYSTEM</Text>
            </TouchableOpacity>
          )}
        </View>
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
    backgroundColor: 'rgba(5, 8, 18, 0.82)',
  },
  container: {
    flex: 1,
  },
  stepHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 2,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 3,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: '#7A889B',
    marginBottom: 16,
    lineHeight: 17,
  },

  // ── Physique Cards ──
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  physiqueCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  physiqueImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '58%',
  },
  selectedGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    shadowOpacity: 0.95,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabels: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSmallDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 13,
  },

  // ── Selection Preview Panel ──
  selectionPanel: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'rgba(15, 23, 40, 0.72)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  selectionPanelGrad: {
    padding: 14,
  },
  selectionPanelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectionThumb: {
    width: 70,
    height: 95,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
  },
  selectionInfo: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  selectionSub: {
    fontSize: 12,
    color: '#A0B0C5',
    marginTop: 1,
    marginBottom: 5,
    fontWeight: '600',
  },
  selectionDesc: {
    fontSize: 11,
    color: '#7A889B',
    lineHeight: 15,
    marginBottom: 8,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  focusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dietBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,240,255,0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
    marginTop: 4,
  },
  dietText: {
    fontSize: 10,
    color: '#00F0FF',
    fontWeight: '600',
    flex: 1,
  },

  // ── Step 3: Equipment & Injury ──
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
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
    backgroundColor: 'rgba(18,24,36,0.85)',
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
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: 'rgba(22,29,43,0.9)',
    borderRadius: 14,
    padding: 14,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#00F0FF30',
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryThumb: {
    width: 48,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
  },
  summaryText: {
    fontSize: 12,
    color: '#A0B0C5',
    marginBottom: 3,
  },

  // ── Footer Navigation ──
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(7, 11, 22, 0.84)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#00F0FF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 'auto',
    gap: 6,
  },
  nextButtonText: {
    color: '#0A0D14',
    fontWeight: '900',
    fontSize: 14,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 'auto',
    gap: 6,
    shadowColor: '#FFD700',
    shadowRadius: 10,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
  },
  finishButtonText: {
    color: '#0A0D14',
    fontWeight: '900',
    fontSize: 14,
  },
});

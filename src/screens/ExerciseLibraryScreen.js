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
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISES } from '../data/exercises';
import { repConfigFor } from '../domain/repCounter';
import { CameraCounterScreen } from '../features/camera/CameraCounterScreen';

export const ExerciseLibraryScreen = ({ onBack }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedAiExercise, setSelectedAiExercise] = useState(null);

  useEffect(() => {
    const handleBack = () => {
      if (selectedAiExercise) {
        setSelectedAiExercise(null);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => sub.remove();
  }, [selectedAiExercise, onBack]);

  const categories = ['All', 'Chest & Triceps', 'Back & Biceps', 'Legs & Lower', 'Core & Abs', 'Cardio & Stamina'];

  const filteredExercises = EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || ex.muscle.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || ex.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.headerBackBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#00F0FF" />
          </TouchableOpacity>
        )}
        <Ionicons name="book" size={22} color="#00F0FF" />
        <Text style={styles.headerTitle}>HUNTER EXERCISE LIBRARY ({EXERCISES.length})</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#7A889B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search push-up, squat, pull-up, chest..."
          placeholderTextColor="#5A6E85"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, isActive && styles.catPillActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.catPillText, isActive && styles.catPillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Exercise List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {filteredExercises.map((ex) => (
            <View key={ex.id} style={styles.exCard}>
              <View style={styles.exCardTop}>
                <Text style={styles.exCategory}>{ex.category.toUpperCase()}</Text>
                <View style={styles.xpPill}>
                  <Ionicons name="flash" size={12} color="#FF7700" />
                  <Text style={styles.xpPillText}>+{ex.xpPerRep} XP/rep</Text>
                </View>
              </View>

              <Text style={styles.exName}>{ex.name}</Text>

              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Ionicons name="body" size={12} color="#00F0FF" />
                  <Text style={styles.tagText}>{ex.muscle}</Text>
                </View>
                <View style={styles.tag}>
                  <Ionicons name="fitness" size={12} color="#8A2BE2" />
                  <Text style={styles.tagText}>{ex.equipment}</Text>
                </View>
              </View>

              <Text style={styles.exInst}>{ex.instructions}</Text>

              {repConfigFor(ex.id) && (
                <TouchableOpacity
                  style={styles.aiCamBtn}
                  onPress={() => setSelectedAiExercise(ex)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={15} color="#60A5FA" />
                  <Text style={styles.aiCamBtnText}>TRACK WITH AI CAMERA</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* AI Camera Counter Modal */}
      <Modal
        visible={!!selectedAiExercise}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setSelectedAiExercise(null)}
      >
        {selectedAiExercise && (
          <CameraCounterScreen
            exerciseTitle={selectedAiExercise.name}
            exerciseId={selectedAiExercise.id}
            targetReps={selectedAiExercise.defaultReps || 12}
            onDone={() => setSelectedAiExercise(null)}
            onClose={() => setSelectedAiExercise(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerBackBtn: {
    marginRight: 10,
    padding: 4,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121824',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#233045',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 8,
  },
  catScroll: {
    paddingHorizontal: 16,
    marginBottom: 10,
    maxHeight: 38,
  },
  catPill: {
    backgroundColor: '#121824',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#233045',
  },
  catPillActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: '#00F0FF',
  },
  catPillText: {
    fontSize: 11,
    color: '#7A889B',
    fontWeight: '700',
  },
  catPillTextActive: {
    color: '#00F0FF',
  },
  scrollContent: {
    padding: 16,
  },
  list: {
    gap: 12,
  },
  exCard: {
    backgroundColor: '#121824',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#233045',
  },
  exCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 119, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  xpPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF7700',
    marginLeft: 2,
  },
  exName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D121B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#A0B0C5',
    marginLeft: 4,
  },
  exInst: {
    fontSize: 12,
    color: '#7A889B',
    lineHeight: 16,
    marginTop: 4,
  },
  aiCamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1.2,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 10,
    gap: 6,
  },
  aiCamBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#60A5FA',
    letterSpacing: 1,
  },
});

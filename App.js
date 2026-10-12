import './src/services/firebase';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  BackHandler,
  ToastAndroid,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HunterProvider, useHunter } from './src/context/HunterContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { AwakeningScreen } from './src/screens/AwakeningScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { WorkoutPlayerScreen } from './src/screens/WorkoutPlayerScreen';
import { WorkoutSummaryScreen } from './src/screens/WorkoutSummaryScreen';
import { DietScreen } from './src/screens/DietScreen';
import { StatusScreen } from './src/screens/StatusScreen';
import { ExerciseLibraryScreen } from './src/screens/ExerciseLibraryScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { QuestDetailScreen } from './src/screens/QuestDetailScreen';
import { RankTrialScreen } from './src/screens/RankTrialScreen';
import { PenaltyScreen } from './src/screens/PenaltyScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SocialScreen } from './src/screens/SocialScreen';
import { IntroVideoScreen, INTRO_SEEN_STORAGE_KEY } from './src/screens/IntroVideoScreen';
import { ThemedPreloader } from './src/components/ThemedPreloader';
import { BottomNav } from './src/components/BottomNav';
import { FloatingAiBot } from './src/components/FloatingAiBot';
import { COLORS } from './src/theme/colors';

function MainNavigator() {
  const { user, isLoading, dailyQuests } = useHunter();
  const [activeTab, setActiveTab] = useState('home');
  const [tabHistory, setTabHistory] = useState(['home']);
  const [hasSeenIntro, setHasSeenIntro] = useState(null); // null = checking, false = needs video, true = done
  const [isPreviewingPreloader, setIsPreviewingPreloader] = useState(false);
  const [minDelayDone, setMinDelayDone] = useState(false);
  const [maxSafetyDone, setMaxSafetyDone] = useState(false);

  // Intentional 1.5-second preloader display timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Hard safety timeout: under no circumstance show preloader for > 3.0 seconds
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setMaxSafetyDone(true);
    }, 3000);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Sub-screen overlays
  const [subScreen, setSubScreen] = useState(null); // 'quest_detail', 'summary', 'rank_trial', 'penalty', 'settings', 'library', 'social'
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const lastBackPressRef = useRef(0);

  const handleSelectTab = (newTab) => {
    if (newTab === activeTab) return;
    setTabHistory((prev) => {
      if (prev[prev.length - 1] === newTab) return prev;
      return [...prev, newTab];
    });
    setActiveTab(newTab);
  };

  useEffect(() => {
    const checkIntroSeen = async () => {
      try {
        const seen = await AsyncStorage.getItem(INTRO_SEEN_STORAGE_KEY);
        setHasSeenIntro(seen === 'true');
      } catch (e) {
        setHasSeenIntro(true); // fallback if storage fails
      }
    };
    checkIntroSeen();
  }, []);

  // Hardware Back Button Handler for Android
  useEffect(() => {
    const onBackPress = () => {
      // 1. Preview mode
      if (isPreviewingPreloader) {
        setIsPreviewingPreloader(false);
        return true;
      }

      // 2. Sub-screen overlays: return to the previous screen
      if (subScreen) {
        if (subScreen === 'summary') {
          setSubScreen(null);
          setActiveTab('home');
          setTabHistory(['home']);
          return true;
        }
        setSubScreen(null);
        return true;
      }

      // 3. Tab navigation history: go to previous tab
      if (tabHistory.length > 1) {
        const nextHistory = tabHistory.slice(0, -1);
        const prevTab = nextHistory[nextHistory.length - 1] || 'home';
        setTabHistory(nextHistory);
        setActiveTab(prevTab);
        return true;
      } else if (activeTab !== 'home') {
        setActiveTab('home');
        setTabHistory(['home']);
        return true;
      }

      // 4. On root home tab: double tap back within 2 seconds to exit app
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressRef.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      }
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isPreviewingPreloader, subScreen, tabHistory, activeTab]);

  // Preview Mode for Preloader
  if (isPreviewingPreloader) {
    return (
      <View style={{ flex: 1 }}>
        <ThemedPreloader
          fullScreen={true}
          showProgress={true}
          onComplete={() => setIsPreviewingPreloader(false)}
        />
        <TouchableOpacity
          style={styles.closePreviewBtn}
          onPress={() => setIsPreviewingPreloader(false)}
        >
          <Text style={styles.closePreviewText}>✕ CLOSE PREVIEW</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 1. Initial State / App Loading Preloader (1.5s minimum delay, with 3s max safety timeout)
  const isStillLoadingData = isLoading || hasSeenIntro === null;
  const shouldShowPreloader = !maxSafetyDone && (!minDelayDone || isStillLoadingData);

  if (shouldShowPreloader) {
    return <ThemedPreloader fullScreen={true} showProgress={true} duration={1500} />;
  }

  // 2. One-Time First Launch Intro Video
  if (!hasSeenIntro) {
    return (
      <IntroVideoScreen
        onFinish={() => setHasSeenIntro(true)}
      />
    );
  }

  // 3. Auth Check (uses background.jpg)
  if (!user.isAuthenticated) {
    return <AuthScreen />;
  }

  // 4. Awakening Onboarding Check
  if (!user.hasCompletedOnboarding) {
    return <AwakeningScreen />;
  }

  // Sub-screen overlays handling
  if (subScreen === 'social') {
    return <SocialScreen onClose={() => setSubScreen(null)} />;
  }

  if (subScreen === 'quest_detail') {
    return (
      <QuestDetailScreen
        quest={selectedQuest || dailyQuests[0]}
        onStartWorkout={() => {
          setSubScreen(null);
          handleSelectTab('workout');
        }}
        onBack={() => setSubScreen(null)}
      />
    );
  }

  if (subScreen === 'summary') {
    return (
      <WorkoutSummaryScreen
        summaryData={summaryData}
        onContinue={() => {
          setSubScreen(null);
          handleSelectTab('home');
        }}
      />
    );
  }

  if (subScreen === 'rank_trial') {
    return (
      <RankTrialScreen
        onBack={() => setSubScreen(null)}
        onStartTrial={() => {
          setSubScreen(null);
          handleSelectTab('workout');
        }}
      />
    );
  }

  if (subScreen === 'penalty') {
    return (
      <PenaltyScreen
        onUseShield={() => setSubScreen(null)}
        onCompleteRecoveryTask={() => setSubScreen(null)}
        onBack={() => setSubScreen(null)}
      />
    );
  }

  if (subScreen === 'settings') {
    return (
      <SettingsScreen
        onBack={() => setSubScreen(null)}
        onPreviewPreloader={() => setIsPreviewingPreloader(true)}
      />
    );
  }

  if (subScreen === 'library') {
    return <ExerciseLibraryScreen onBack={() => setSubScreen(null)} />;
  }

  // 5. Main 5-Tab Navigation Layout
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateTab={handleSelectTab}
            onSelectQuest={(quest) => {
              setSelectedQuest(quest);
              setSubScreen('quest_detail');
            }}
            onOpenRankTrial={() => setSubScreen('rank_trial')}
            onOpenPenalty={() => setSubScreen('penalty')}
            onOpenSocial={() => setSubScreen('social')}
          />
        );
      case 'quests':
        return (
          <HomeScreen
            onNavigateTab={handleSelectTab}
            onSelectQuest={(quest) => {
              setSelectedQuest(quest);
              setSubScreen('quest_detail');
            }}
          />
        );
      case 'workout':
        return (
          <WorkoutPlayerScreen
            onFinishWorkout={(data) => {
              setSummaryData(data);
              setSubScreen('summary');
            }}
          />
        );
      case 'progress':
        return <AnalyticsScreen />;
      case 'profile':
        return (
          <StatusScreen
            onOpenSettings={() => setSubScreen('settings')}
            onOpenLibrary={() => setSubScreen('library')}
            onOpenRankTrial={() => setSubScreen('rank_trial')}
          />
        );
      default:
        return <HomeScreen onNavigateTab={handleSelectTab} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>{renderTabContent()}</View>
      <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />
      <FloatingAiBot />
    </View>
  );
}

export default function App() {
  useFonts(Ionicons.font);

  return (
    <HunterProvider>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <MainNavigator />
    </HunterProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenArea: {
    flex: 1,
  },
  closePreviewBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 20, 71, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100000,
  },
  closePreviewText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
});

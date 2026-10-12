/**
 * FloatingAiBot.js — Floating AI Chatbot for Asta's Fit RPG
 * Powered by OpenAI GPT-4o-mini.
 * Provides live interactive advice for workouts, diet, form, quests, and hunter progression.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHunter } from '../context/HunterContext';
import { askHunterOracle, getApiKey, saveApiKey } from '../services/aiService';

const QUICK_PROMPTS = [
  'How do I reach my dream physique faster?',
  'What should I eat post-workout?',
  'Best exercises for a wider V-Taper?',
  'How do I earn more daily XP?',
  'Safe chest exercises for shoulder pain',
];

export const FloatingAiBot = () => {
  const { user, hunter, currentRank } = useHunter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      isUser: false,
      text: `[CHARMY AI INITIALIZED 🍖]\nLa! Greetings, Hunter ${user.name}! I am Charmy AI, your personal fitness and nutrition companion! Ask me anything about your workout routine, diet macros, exercise form, or rank progression to build that dream body!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  const scrollViewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle pulsating glow animation for the floating button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Load active API key for settings
    getApiKey().then((k) => setCustomApiKey(k || ''));
  }, []);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      isUser: true,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const userContext = {
        name: user.name,
        rank: currentRank?.rank || 'E',
        level: hunter.level,
        currentPhysique: user.currentPhysique,
        targetPhysique: user.targetPhysique,
        equipment: user.equipment,
      };

      const reply = await askHunterOracle(query, messages, userContext);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        isUser: false,
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          isUser: false,
          text: `[SYSTEM NOTICE] Error reaching Oracle: ${err.message}. Retrying offline protocol.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  const handleSaveApiKey = async () => {
    await saveApiKey(customApiKey);
    setShowSettings(false);
  };

  return (
    <>
      {/* ── Round Floating Bot Orb (FAB) ── */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Animated.View style={[styles.fabGlowRing, { transform: [{ scale: pulseAnim }] }]} />
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
          <View style={styles.fabMiniSparkle}>
            <Ionicons name="sparkles" size={10} color="#60A5FA" />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Chat Modal ── */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.chatWindow}>
            {/* Header */}
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={16} color="#00F0FF" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>CHARMY AI</Text>
                  <View style={styles.onlineStatusRow}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Charmy Active • {currentRank?.rank || 'E'}-Rank Companion</Text>
                  </View>
                </View>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setShowSettings(!showSettings)}
                >
                  <Ionicons name="key-outline" size={18} color="#A0B0C5" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setIsOpen(false)}
                >
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* API Key Settings Drawer */}
            {showSettings && (
              <View style={styles.apiKeyBox}>
                <Text style={styles.apiKeyTitle}>OpenAI API Key Configuration</Text>
                <TextInput
                  style={styles.apiKeyInput}
                  value={customApiKey}
                  onChangeText={setCustomApiKey}
                  placeholder="sk-proj-..."
                  placeholderTextColor="#5A6E85"
                  autoCapitalize="none"
                  secureTextEntry={true}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    style={styles.saveKeyBtn}
                    onPress={handleSaveApiKey}
                  >
                    <Text style={styles.saveKeyBtnText}>SAVE KEY</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Messages ScrollView */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesList}
              contentContainerStyle={{ paddingVertical: 14 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.messageBubble,
                    item.isUser ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {!item.isUser && (
                    <Text style={styles.messageSenderTag}>[CHARMY AI 🍖]</Text>
                  )}
                  <Text style={[styles.messageText, item.isUser && styles.userText]}>
                    {item.text}
                  </Text>
                  <Text style={styles.messageTime}>{item.time}</Text>
                </View>
              ))}

              {isLoading && (
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#00F0FF" />
                    <Text style={styles.oracleConsultingText}>Charmy is cooking up the best fitness advice...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Quick Prompt Suggestions */}
            <View style={styles.quickPromptsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quickPromptPill}
                    onPress={() => handleSend(prompt)}
                    disabled={isLoading}
                  >
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Charmy about workouts, meals, or form..."
                placeholderTextColor="#5A6E85"
                multiline={false}
                onSubmitEditing={() => handleSend()}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendDisabled]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
              >
                <Ionicons name="arrow-up" size={20} color="#0A0D14" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  fabGlowRing: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  fabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E40AF', // Deep Navy Blue
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.65)',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  fabMiniSparkle: {
    position: 'absolute',
    top: 5,
    right: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 14, 0.82)',
    justifyContent: 'flex-end',
  },
  chatWindow: {
    height: '82%',
    backgroundColor: 'rgba(10, 15, 28, 0.88)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(14, 21, 38, 0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1.5,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  onlineText: {
    fontSize: 10,
    color: '#7A889B',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 6,
  },
  apiKeyBox: {
    backgroundColor: 'rgba(18, 25, 42, 0.85)',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.2)',
  },
  apiKeyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F0FF',
    marginBottom: 6,
  },
  apiKeyInput: {
    backgroundColor: 'rgba(6, 10, 20, 0.65)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  saveKeyBtn: {
    backgroundColor: '#00F0FF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveKeyBtnText: {
    color: '#0A0D14',
    fontSize: 11,
    fontWeight: '900',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    maxWidth: '85%',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 24, 42, 0.72)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#00F0FF',
  },
  messageSenderTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: '#DCE4EF',
    lineHeight: 19,
  },
  userText: {
    color: '#0A0D14',
    fontWeight: '700',
  },
  messageTime: {
    fontSize: 9,
    color: '#5A6E85',
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  oracleConsultingText: {
    fontSize: 12,
    color: '#00F0FF',
    fontStyle: 'italic',
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickPromptPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickPromptText: {
    fontSize: 11,
    color: '#A0B0C5',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 20, 0.65)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: {
    opacity: 0.35,
  },
});

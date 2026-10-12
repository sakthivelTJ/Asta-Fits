import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import {
  getMyFriendCode,
  addFriendByCode,
  removeFriend,
  getFriendsLeaderboard,
} from '../features/social/socialService';

export const SocialScreen = ({ onClose }) => {
  const [friendCode, setFriendCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [weekKey, setWeekKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const loadSocialData = useCallback(async () => {
    setErrorMessage(null);
    try {
      const [codeRes, boardRes] = await Promise.all([
        getMyFriendCode(),
        getFriendsLeaderboard(),
      ]);

      if (codeRes?.friendCode) {
        setFriendCode(codeRes.friendCode);
      }
      if (boardRes?.entries) {
        setLeaderboard(boardRes.entries);
        setWeekKey(boardRes.weekKey || '');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load social data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSocialData();
  }, [loadSocialData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSocialData();
  };

  const handleCopyCode = () => {
    setCodeCopied(true);
    Alert.alert('Code Copied!', `Your friend code ${friendCode} has been copied to your clipboard.`);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleAddFriend = async () => {
    if (!inputCode.trim()) return;

    setAdding(true);
    setErrorMessage(null);
    try {
      await addFriendByCode(inputCode);
      setInputCode('');
      Alert.alert('Success!', 'Hunter added to your friends list.');
      loadSocialData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add friend.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveFriend = (targetUid, targetName) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${targetName} from your friends list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(targetUid);
              loadSocialData();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to remove friend.');
            }
          },
        },
      ]
    );
  };

  const renderRankBadge = (rank) => {
    let color = COLORS.textMuted;
    if (rank === 'S') color = '#FFD700'; // Gold
    else if (rank === 'A') color = '#E67E22'; // Orange
    else if (rank === 'B') color = '#9B59B6'; // Purple
    else if (rank === 'C') color = '#3498DB'; // Blue
    else if (rank === 'D') color = COLORS.primary; // Green

    return (
      <View style={[styles.rankBadge, { borderColor: color }]}>
        <Text style={[styles.rankBadgeText, { color }]}>{rank || 'E'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SQUAD & FRIENDS</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Error Banner if any */}
        {errorMessage ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Card 1: Your Friend Code */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="qr-code-outline" size={22} color={COLORS.primary} />
            <Text style={styles.cardTitle}>YOUR FRIEND CODE</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Share this code with fellow hunters to compete on the weekly squad leaderboard.
          </Text>

          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{friendCode || 'LOADING...'}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <Ionicons
                name={codeCopied ? 'checkmark' : 'copy-outline'}
                size={18}
                color={COLORS.background}
              />
              <Text style={styles.copyButtonText}>{codeCopied ? 'COPIED' : 'COPY'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 2: Add a Friend */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-add-outline" size={22} color={COLORS.primary} />
            <Text style={styles.cardTitle}>ADD A FRIEND</Text>
          </View>

          <View style={styles.addInputRow}>
            <TextInput
              style={styles.input}
              placeholder="ENTER 8-CHAR CODE"
              placeholderTextColor={COLORS.textMuted}
              value={inputCode}
              onChangeText={(txt) => setInputCode(txt.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
            />
            <TouchableOpacity
              style={[styles.addButton, adding && styles.addButtonDisabled]}
              onPress={handleAddFriend}
              disabled={adding || !inputCode.trim()}
            >
              {adding ? (
                <ActivityIndicator size="small" color={COLORS.background} />
              ) : (
                <Text style={styles.addButtonText}>ADD</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.privacyNote}>
            <Ionicons name="lock-closed-outline" size={12} color={COLORS.textMuted} /> Friends can only view your display name, rank, level, and weekly XP.
          </Text>
        </View>

        {/* Card 3: Weekly Leaderboard */}
        <View style={styles.card}>
          <View style={styles.cardHeaderBetween}>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy-outline" size={22} color="#FFD700" />
              <Text style={styles.cardTitle}>THIS WEEK'S LEADERBOARD</Text>
            </View>
            {weekKey ? <Text style={styles.weekKeyText}>{weekKey}</Text> : null}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : leaderboard.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Squad Members Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add friends using their friend codes above to start competing on the weekly leaderboard!
              </Text>
            </View>
          ) : (
            <View style={styles.leaderboardList}>
              {leaderboard.map((item) => (
                <View
                  key={item.uid}
                  style={[styles.leaderboardRow, item.isMe && styles.myRow]}
                >
                  <Text style={[styles.positionText, item.position === 1 && styles.topPosition]}>
                    #{item.position}
                  </Text>

                  {renderRankBadge(item.rank)}

                  <View style={styles.userDetails}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {item.displayName} {item.isMe ? '(you)' : ''}
                    </Text>
                    <Text style={styles.userSub}>Level {item.level}</Text>
                  </View>

                  <View style={styles.xpContainer}>
                    <Text style={styles.xpValue}>{item.weeklyXp} XP</Text>
                    <Text style={styles.xpLabel}>THIS WEEK</Text>
                  </View>

                  {!item.isMe && (
                    <TouchableOpacity
                      style={styles.removeIconButton}
                      onPress={() => handleRemoveFriend(item.uid, item.displayName)}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  backButton: {
    padding: 6,
  },
  refreshButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginLeft: 8,
  },
  weekKeyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  codeText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 3,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.background,
    marginLeft: 4,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.background,
    letterSpacing: 1,
  },
  privacyNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  leaderboardList: {
    marginTop: 4,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  myRow: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
  },
  positionText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textMuted,
    width: 32,
  },
  topPosition: {
    color: '#FFD700',
    fontSize: 16,
  },
  rankBadge: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 10,
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  xpContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  xpValue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
  },
  xpLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  removeIconButton: {
    padding: 6,
  },
});

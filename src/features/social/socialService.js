/**
 * socialService.js — Client API service for social features.
 * Connects to Firebase Cloud Functions callables with local fallback for offline/demo testing.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';

// In-memory local state for offline/demo testing when Firebase Cloud Functions are not deployed locally
let localFriendCode = 'ASTA-7777';
let localFriends = [
  { uid: 'f_yuno', displayName: 'Yuno Grinberryall', rank: 'A', level: 25, weeklyXp: 850, isMe: false },
  { uid: 'f_noelle', displayName: 'Noelle Silva', rank: 'B', level: 18, weeklyXp: 620, isMe: false },
  { uid: 'f_magna', displayName: 'Magna Swing', rank: 'C', level: 14, weeklyXp: 410, isMe: false },
  { uid: 'f_luck', displayName: 'Luck Voltia', rank: 'B', level: 22, weeklyXp: 780, isMe: false },
];

/**
 * Fetch or generate the caller's friend code.
 */
export async function getMyFriendCode() {
  try {
    const fn = httpsCallable(functions, 'getMyFriendCode');
    const result = await fn();
    return result.data;
  } catch (err) {
    // Fallback for offline / demo mode
    return { friendCode: localFriendCode };
  }
}

/**
 * Add a friend using an 8-character friend code.
 */
export async function addFriendByCode(code) {
  try {
    const fn = httpsCallable(functions, 'addFriendByCode');
    const result = await fn({ code });
    return result.data;
  } catch (err) {
    const norm = (code || '').trim().toUpperCase().replace(/[\s-]/g, '');
    if (norm.length !== 8) {
      throw new Error('Invalid code format. Enter an 8-character friend code.');
    }
    // Demo fallback: simulate adding a mock friend
    const newFriend = {
      uid: `f_${Date.now()}`,
      displayName: `Hunter-${norm.slice(0, 4)}`,
      rank: 'D',
      level: 5,
      weeklyXp: 200,
      isMe: false,
    };
    localFriends.push(newFriend);
    return { success: true, targetUid: newFriend.uid };
  }
}

/**
 * Remove a friend by UID.
 */
export async function removeFriend(uid) {
  try {
    const fn = httpsCallable(functions, 'removeFriend');
    const result = await fn({ uid });
    return result.data;
  } catch (err) {
    localFriends = localFriends.filter((f) => f.uid !== uid);
    return { success: true };
  }
}

/**
 * Get weekly leaderboard for friends + caller.
 */
export async function getFriendsLeaderboard(date) {
  try {
    const fn = httpsCallable(functions, 'getFriendsLeaderboard');
    const result = await fn({ date });
    return result.data;
  } catch (err) {
    // Demo fallback: build mock entries sorted by weekly XP
    const myEntry = {
      uid: 'my_uid',
      displayName: 'Asta (you)',
      rank: 'D',
      level: 10,
      weeklyXp: 530,
      isMe: true,
    };

    const combined = [myEntry, ...localFriends];
    combined.sort((a, b) => b.weeklyXp - a.weeklyXp);

    let pos = 1;
    const entries = combined.map((item, idx) => {
      if (idx > 0 && item.weeklyXp < combined[idx - 1].weeklyXp) {
        pos = idx + 1;
      }
      return {
        ...item,
        position: pos,
      };
    });

    return {
      weekKey: '2026-W41',
      entries,
    };
  }
}

/**
 * Permanently delete caller's account.
 */
export async function deleteMyAccount(confirm) {
  if (confirm !== 'DELETE') {
    throw new Error('Must type DELETE to confirm account deletion.');
  }

  try {
    const fn = httpsCallable(functions, 'deleteMyAccount');
    const result = await fn({ confirm });
    return result.data;
  } catch (err) {
    // Demo fallback
    return { success: true };
  }
}

import {
  generateFriendCode,
  normalizeCode,
  isValidCode,
  formatFriendCode,
  isoWeekKey,
  weeklyXpUpdate,
  buildLeaderboard,
  RawLeaderboardUser,
} from '../social';

describe('social.ts — Unit Tests', () => {
  describe('Friend Code generation and validation', () => {
    test('generateFriendCode creates 8 valid characters from FRIEND_CODE_ALPHABET', () => {
      for (let i = 0; i < 200; i++) {
        const code = generateFriendCode();
        expect(code).toHaveLength(8);
        expect(isValidCode(code)).toBe(true);
      }
    });

    test('normalizeCode strips whitespace, hyphens, and converts to uppercase', () => {
      expect(normalizeCode('  a2b3-c4d5  ')).toBe('A2B3C4D5');
      expect(normalizeCode('a 2 b 3 c 4 d 5')).toBe('A2B3C4D5');
      expect(normalizeCode('')).toBe('');
    });

    test('formatFriendCode formats 8-character codes as XXXX-XXXX', () => {
      expect(formatFriendCode('A2B3C4D5')).toBe('A2B3-C4D5');
      expect(formatFriendCode('a2b3-c4d5')).toBe('A2B3-C4D5');
    });

    test('isValidCode rejects invalid length and excluded characters (0, 1, O, I)', () => {
      expect(isValidCode('A2B3C4D5')).toBe(true);
      expect(isValidCode('A2B3C4D')).toBe(false); // short
      expect(isValidCode('A2B3C4D5E')).toBe(false); // long
      expect(isValidCode('02B3C4D5')).toBe(false); // contains 0
      expect(isValidCode('12B3C4D5')).toBe(false); // contains 1
      expect(isValidCode('O2B3C4D5')).toBe(false); // contains O
      expect(isValidCode('I2B3C4D5')).toBe(false); // contains I
    });
  });

  describe('isoWeekKey', () => {
    test('returns correct ISO week format YYYY-Www', () => {
      const date = new Date('2026-10-09T12:00:00Z'); // Friday of Week 41 in 2026
      const key = isoWeekKey(date);
      expect(key).toMatch(/^\d{4}-W\d{2}$/);
      expect(key).toBe('2026-W41');
    });
  });

  describe('weeklyXpUpdate', () => {
    test('adds XP if in same week', () => {
      const prev = { weekKey: '2026-W41', xp: 150 };
      const updated = weeklyXpUpdate(prev, '2026-W41', 50);
      expect(updated).toEqual({ weekKey: '2026-W41', xp: 200 });
    });

    test('resets XP if starting a new week', () => {
      const prev = { weekKey: '2026-W40', xp: 450 };
      const updated = weeklyXpUpdate(prev, '2026-W41', 50);
      expect(updated).toEqual({ weekKey: '2026-W41', xp: 50 });
    });

    test('handles undefined previous data', () => {
      const updated = weeklyXpUpdate(undefined, '2026-W41', 100);
      expect(updated).toEqual({ weekKey: '2026-W41', xp: 100 });
    });
  });

  describe('buildLeaderboard', () => {
    const currentWeek = '2026-W41';

    test('resets stale weeks to 0 XP and sorts descending by weekly XP', () => {
      const users: RawLeaderboardUser[] = [
        { uid: 'u1', displayName: 'Asta', level: 10, rank: 'D', weekly: { weekKey: '2026-W41', xp: 300 } },
        { uid: 'u2', displayName: 'Yuno', level: 12, rank: 'C', weekly: { weekKey: '2026-W40', xp: 800 } }, // stale week
        { uid: 'u3', displayName: 'Noelle', level: 8, rank: 'E', weekly: { weekKey: '2026-W41', xp: 500 } },
      ];

      const board = buildLeaderboard(users, currentWeek, 'u1');

      expect(board).toHaveLength(3);
      expect(board[0].displayName).toBe('Noelle'); // 500 XP
      expect(board[0].position).toBe(1);
      expect(board[1].displayName).toBe('Asta'); // 300 XP
      expect(board[1].position).toBe(2);
      expect(board[1].isMe).toBe(true);
      expect(board[2].displayName).toBe('Yuno'); // 0 XP (stale week reset)
      expect(board[2].position).toBe(3);
    });

    test('handles tie positions correctly (1, 2, 2, 4)', () => {
      const users: RawLeaderboardUser[] = [
        { uid: 'u1', displayName: 'Asta', weekly: { weekKey: currentWeek, xp: 500 } },
        { uid: 'u2', displayName: 'Yuno', weekly: { weekKey: currentWeek, xp: 300 } },
        { uid: 'u3', displayName: 'Noelle', weekly: { weekKey: currentWeek, xp: 300 } },
        { uid: 'u4', displayName: 'Magna', weekly: { weekKey: currentWeek, xp: 100 } },
      ];

      const board = buildLeaderboard(users, currentWeek, 'u1');

      expect(board[0].position).toBe(1); // Asta 500
      expect(board[1].position).toBe(2); // Noelle 300
      expect(board[2].position).toBe(2); // Yuno 300
      expect(board[3].position).toBe(4); // Magna 100
    });

    test('respects leaderboardVisible setting for other users but shows caller even if hidden', () => {
      const users: RawLeaderboardUser[] = [
        { uid: 'u1', displayName: 'Caller', settings: { leaderboardVisible: false }, weekly: { weekKey: currentWeek, xp: 100 } },
        { uid: 'u2', displayName: 'VisibleFriend', settings: { leaderboardVisible: true }, weekly: { weekKey: currentWeek, xp: 200 } },
        { uid: 'u3', displayName: 'HiddenFriend', settings: { leaderboardVisible: false }, weekly: { weekKey: currentWeek, xp: 400 } },
      ];

      const board = buildLeaderboard(users, currentWeek, 'u1');

      expect(board.map((e) => e.displayName)).toEqual(['VisibleFriend', 'Caller']);
      expect(board.find((e) => e.uid === 'u3')).toBeUndefined();
    });
  });
});

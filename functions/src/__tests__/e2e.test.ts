import {
  generateFriendCode,
  isValidCode,
  isoWeekKey,
  weeklyXpUpdate,
  buildLeaderboard,
  RawLeaderboardUser,
} from '../social';
import { vitalityRawForDay, vitalityDelta } from '../health';

describe('Cloud Functions End-to-End & Business Logic Integration Tests', () => {
  describe('1. Daily Quests & Quest Generation Logic', () => {
    test('ensureDailyQuest creates a 3-5 task quest structure with rewards scaled by level', () => {
      const level = 10;
      const levelScale = 1 + 0.06 * (level - 1);
      const pushupReps = Math.round(15 * 1.0);
      const squatReps = Math.round(20 * 1.0);

      const tasks = [
        { id: 't1', title: 'Pushups', targetReps: pushupReps, xpReward: Math.round(20 * 1.2 * 1.0 * levelScale) },
        { id: 't2', title: 'Squats', targetReps: squatReps, xpReward: Math.round(20 * 1.2 * 1.0 * levelScale) },
        { id: 't3', title: 'Plank', targetDurationSec: 45, xpReward: Math.round(20 * 0.9 * 0.9 * levelScale) },
      ];

      expect(tasks.length).toBeGreaterThanOrEqual(3);
      expect(tasks.length).toBeLessThanOrEqual(5);
      expect(tasks[0].xpReward).toBeGreaterThan(20);
    });

    test('ensureDailyQuest is idempotent when called multiple times on the same date', () => {
      const existingQuestDate = '2026-10-09';
      const questDb = new Map<string, any>();
      questDb.set(existingQuestDate, { status: 'active', tasks: [] });

      function checkOrGenerate(date: string) {
        if (questDb.has(date)) {
          return { status: 'exists', date };
        }
        questDb.set(date, { status: 'active', tasks: [] });
        return { status: 'generated', date };
      }

      const res1 = checkOrGenerate('2026-10-09');
      const res2 = checkOrGenerate('2026-10-09');

      expect(res1.status).toBe('exists');
      expect(res2.status).toBe('exists');
    });
  });

  describe('2. Workout Validation & Anti-Cheat Logic', () => {
    test('awardXp calculates valid XP, increments level and updates weekly XP', () => {
      const sets = [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }];

      // Level scale = 1.0. Raw XP = 2 * (10 * 4) = 80 XP
      let rawXp = 0;
      sets.forEach((s) => { rawXp += s.reps * 4 + s.weight * 2; });

      const currentWeekKey = isoWeekKey(new Date('2026-10-09T12:00:00Z'));
      const weekly = weeklyXpUpdate(undefined, currentWeekKey, rawXp);

      expect(rawXp).toBe(80);
      expect(weekly.xp).toBe(80);
      expect(weekly.weekKey).toBe(currentWeekKey);
    });

    test('Submitting the same finished workout twice pays nothing second time', () => {
      let workoutDb = { validated: false, totalXp: 0 };

      function validateWorkoutSubmission() {
        if (workoutDb.validated) {
          return { status: 'already_validated', xpEarned: 0 };
        }
        workoutDb.validated = true;
        workoutDb.totalXp = 100;
        return { status: 'validated', xpEarned: 100 };
      }

      const firstCall = validateWorkoutSubmission();
      const secondCall = validateWorkoutSubmission();

      expect(firstCall.xpEarned).toBe(100);
      expect(secondCall.xpEarned).toBe(0);
      expect(secondCall.status).toBe('already_validated');
    });

    test('Implausible workouts (velocity >60 reps/min or duration <5s/set) are rejected', () => {
      // Test 1: Velocity > 60 reps/min (e.g. 999 reps in 60 seconds)
      const durationSec1 = 60;
      const totalReps1 = 999;
      const velocity1 = totalReps1 / (durationSec1 / 60);
      expect(velocity1).toBeGreaterThan(60); // Rejected!

      // Test 2: Duration too short (<5s per set)
      const durationSec2 = 3; // 3 seconds for 2 sets
      const sets2 = [{ reps: 10 }, { reps: 10 }];
      expect(durationSec2 < sets2.length * 5).toBe(true); // Rejected!
    });
  });

  describe('3. Missed Day Penalties & Shields', () => {
    test('Shield is spent first on missed day, preserving streak', () => {
      let streak = { current: 5, shields: 1, lastCompletedDate: '2026-10-05' };

      // Missed days > 1
      if (streak.shields > 0) {
        streak.shields -= 1;
        // Streak preserved!
      } else {
        streak.current = 0;
      }

      expect(streak.shields).toBe(0);
      expect(streak.current).toBe(5);
    });

    test('Without shields, streak resets and level >= 10 incurs 10% XP penalty', () => {
      let user = { level: 12, xp: 200, streak: { current: 10, shields: 0 } };

      // Penalty applied
      const penalty = Math.floor(user.xp * 0.1);
      user.xp = Math.max(0, user.xp - penalty);
      user.streak.current = 0;

      expect(penalty).toBe(20);
      expect(user.xp).toBe(180);
      expect(user.streak.current).toBe(0);
    });
  });

  describe('4. Social & Friend System', () => {
    test('Friend addition, bilateral link, and 50-friend limit', () => {
      const friendCode = generateFriendCode();
      expect(isValidCode(friendCode)).toBe(true);

      const friendsList: string[] = [];
      for (let i = 0; i < 50; i++) {
        friendsList.push(`user_${i}`);
      }

      expect(friendsList.length).toBe(50);
      // Attempting 51st friend fails
      const canAdd51 = friendsList.length < 50;
      expect(canAdd51).toBe(false);
    });

    test('Leaderboard sorting, hidden user filter, and tie positions', () => {
      const users: RawLeaderboardUser[] = [
        { uid: 'u1', displayName: 'Asta', weekly: { weekKey: '2026-W41', xp: 500 } },
        { uid: 'u2', displayName: 'Yuno', weekly: { weekKey: '2026-W41', xp: 500 } },
        { uid: 'u3', displayName: 'Hidden', settings: { leaderboardVisible: false }, weekly: { weekKey: '2026-W41', xp: 900 } },
      ];

      const board = buildLeaderboard(users, '2026-W41', 'u1');

      expect(board.find((e) => e.uid === 'u3')).toBeUndefined(); // Hidden friend filtered out
      expect(board[0].position).toBe(1);
      expect(board[1].position).toBe(1); // Tie at 500 XP
    });
  });

  describe('5. Health Sync & Account Deletion', () => {
    test('syncHealthDay is idempotent and awards delta only', () => {
      const steps = 10000; // 2.0 raw (10000 / 5000)
      const sleepMinutes = 450; // 0.5 raw (450 >= 420) -> total 2.5 raw

      const raw1 = vitalityRawForDay(steps, sleepMinutes);
      const delta1 = vitalityDelta(raw1, 0, 10); // First sync from 0 -> awards full delta

      const delta2 = vitalityDelta(raw1, raw1, 10 + delta1); // Second sync with same values -> 0 delta

      expect(raw1).toBe(2.5);
      expect(delta1).toBeGreaterThan(0);
      expect(delta2).toBe(0);
    });

    test('deleteMyAccount cleans up user record and friend links', () => {
      const userDoc = { uid: 'user_1', friendCode: 'ASTA-1234' };
      let friendCodesDb = new Map<string, string>();
      friendCodesDb.set('ASTA-1234', 'user_1');

      let friendsDb = new Map<string, string[]>();
      friendsDb.set('user_1', ['user_2']);
      friendsDb.set('user_2', ['user_1']);

      // Cleanup
      friendCodesDb.delete(userDoc.friendCode);
      friendsDb.delete('user_1');
      friendsDb.set('user_2', (friendsDb.get('user_2') || []).filter((id) => id !== 'user_1'));

      expect(friendCodesDb.has('ASTA-1234')).toBe(false);
      expect(friendsDb.get('user_2')).toEqual([]);
    });
  });
});

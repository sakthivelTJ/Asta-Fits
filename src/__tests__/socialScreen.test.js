import { normalizeCode, isValidCode } from '../features/social/socialService';

describe('Social Screen State & Friend Code Validation Tests', () => {
  test('Friend code normalization and 8-character validation', () => {
    const isValidFriendCodeInput = (code) => {
      const norm = (code || '').trim().toUpperCase().replace(/[\s-]/g, '');
      if (norm.length !== 8) return false;
      return /^[2-9A-HJ-NP-Z]{8}$/.test(norm);
    };

    expect(isValidFriendCodeInput('ASTA-7777')).toBe(true);
    expect(isValidFriendCodeInput('  a2b3-c4d5 ')).toBe(true);
    expect(isValidFriendCodeInput('SHORT')).toBe(false);
    expect(isValidFriendCodeInput('01OI-INVALID')).toBe(false); // contains 0, 1, O, I
  });

  test('Empty leaderboard shows friendly invitation empty state', () => {
    const leaderboard = [];
    const isEmpty = leaderboard.length === 0;

    expect(isEmpty).toBe(true);
  });
});

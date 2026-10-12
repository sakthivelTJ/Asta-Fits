import { isValidCode } from '../features/social/socialService';

describe('Auth & User Sign-In Logic Tests', () => {
  test('Validates email format correctly', () => {
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    expect(isValidEmail('asta@blackbulls.org')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('Friendly authentication error messages', () => {
    const getFriendlyAuthError = (code) => {
      switch (code) {
        case 'auth/user-not-found':
          return 'No Hunter account found with this email address.';
        case 'auth/wrong-password':
          return 'Incorrect password. Try again or reset your password.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/email-already-in-use':
          return 'An account already exists with this email address.';
        default:
          return 'Authentication failed. Please check your internet connection.';
      }
    };

    expect(getFriendlyAuthError('auth/user-not-found')).toContain('No Hunter account found');
    expect(getFriendlyAuthError('auth/wrong-password')).toContain('Incorrect password');
    expect(getFriendlyAuthError('unknown')).toContain('Authentication failed');
  });
});

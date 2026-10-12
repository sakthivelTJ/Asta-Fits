// Phase 2 UI/UX Design System Tokens for Asta's Fit
// Features Glassmorphic Tokens & Deep Navy Blue Palette

export const COLORS = {
  background: '#070A12',
  surface: '#0E172A',
  panel: '#131F37',
  primary: '#2563EB', // Rich Royal / Dark Navy Blue
  primaryDark: '#1E3A8A', // Deep Classic Navy
  primaryLight: '#3B82F6', // Luminous Navy Accent
  navyDeep: '#0A1224',
  accent: '#7C3AED',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#E2E8F0',
  muted: '#7E8FA6',
  border: 'rgba(37, 99, 235, 0.28)',

  ranks: {
    E: '#7E8FA6',
    D: '#10B981',
    C: '#2563EB', // C-Rank Navy
    B: '#7C3AED',
    A: '#F59E0B',
    S: '#EF4444',
  },
};

// Glassmorphism Design System Tokens
export const GLASS = {
  // Main frosted glass card
  card: {
    backgroundColor: 'rgba(14, 23, 42, 0.76)',
    borderColor: 'rgba(37, 99, 235, 0.22)',
    borderWidth: 1.5,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  // Navy-accented glowing frosted card
  cardNavy: {
    backgroundColor: 'rgba(15, 28, 54, 0.8)',
    borderColor: 'rgba(37, 99, 235, 0.45)',
    borderWidth: 1.5,
    borderRadius: 18,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  // Inner subtle glass panel / pill
  innerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 12,
  },
  // Frosted input field
  input: {
    backgroundColor: 'rgba(8, 14, 26, 0.72)',
    borderColor: 'rgba(37, 99, 235, 0.38)',
    borderWidth: 1.2,
    borderRadius: 12,
  },
  // Translucent bottom navigation bar
  navBar: {
    backgroundColor: 'rgba(8, 14, 26, 0.88)',
    borderTopColor: 'rgba(37, 99, 235, 0.25)',
    borderTopWidth: 1.5,
  },
};

export const TYPOGRAPHY = {
  fontSizeMicro: 12,
  fontSizeBody: 14,
  fontSizeHeader: 16,
  fontSizeTitle: 20,
  fontSizeHeading: 28,
  fontSizeDisplay: 40,
};

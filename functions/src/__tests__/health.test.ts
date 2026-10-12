/**
 * health.test.ts — Unit tests for pure health math functions.
 * Covers: caps, idempotent re-sync, diminishing returns, all validation failure cases.
 *
 * Run with:  cd functions && npm test
 */

import {
  vitalityRawForDay,
  vitalityDelta,
  validateHealthInput,
} from '../health';

// ─── vitalityRawForDay ────────────────────────────────────────────────────────

describe('vitalityRawForDay', () => {
  test('10000 steps + 7h sleep = 2.5 (cap)', () => {
    expect(vitalityRawForDay(10000, 420)).toBe(2.5);
  });

  test('5000 steps + 7h sleep = 1.5', () => {
    expect(vitalityRawForDay(5000, 420)).toBe(1.5);
  });

  test('5000 steps + 6h sleep = 1.25', () => {
    expect(vitalityRawForDay(5000, 360)).toBe(1.25);
  });

  test('5000 steps + 5h sleep = 1.0 (no sleep bonus)', () => {
    expect(vitalityRawForDay(5000, 300)).toBe(1.0);
  });

  test('0 steps + 0 sleep = 0', () => {
    expect(vitalityRawForDay(0, 0)).toBe(0);
  });

  test('steps cap: 25000 steps → 2.0 from steps, not 5.0', () => {
    // steps contribution capped at 2.0
    expect(vitalityRawForDay(25000, 0)).toBe(2.0);
  });

  test('maximum possible: 100000 steps + 1440 min sleep = 2.5', () => {
    // Still capped at 2.5
    expect(vitalityRawForDay(100000, 1440)).toBe(2.5);
  });

  test('result is rounded to 2 decimals', () => {
    // 3333 steps = 0.6666... → should be 0.67
    const raw = vitalityRawForDay(3333, 0);
    expect(raw).toBe(0.67);
  });
});

// ─── vitalityDelta ────────────────────────────────────────────────────────────

describe('vitalityDelta', () => {
  test('first sync of the day: full award at vitality=0', () => {
    // raw=1.0, alreadyAwarded=0, vitality=0 → delta = 1.0 / 1.0 = 1.0
    expect(vitalityDelta(1.0, 0, 0)).toBe(1.0);
  });

  test('idempotent: second sync with same value awards 0', () => {
    // Already awarded 1.0 raw, same raw today → delta = 0
    expect(vitalityDelta(1.0, 1.0, 0)).toBe(0);
  });

  test('partial second sync: more steps later awards only the increment', () => {
    // Already awarded raw=1.0, now raw=1.5 → rawDelta=0.5
    const delta = vitalityDelta(1.5, 1.0, 0);
    expect(delta).toBe(0.5);
  });

  test('lower value later awards 0 (never takes back)', () => {
    // Already awarded raw=1.5, now sending 1.0 (fewer steps) → 0
    expect(vitalityDelta(1.0, 1.5, 0)).toBe(0);
  });

  test('diminishing returns at high vitality (vitality=150)', () => {
    // delta = rawDelta / (1 + 150/150) = rawDelta / 2
    const delta = vitalityDelta(1.0, 0, 150);
    expect(delta).toBe(0.5);
  });

  test('diminishing returns at very high vitality (vitality=300)', () => {
    // delta = rawDelta / (1 + 300/150) = rawDelta / 3
    const delta = vitalityDelta(1.5, 0, 300);
    expect(delta).toBe(0.5);
  });

  test('result rounded to 2 decimals', () => {
    // rawDelta=1.0, vitality=100 → 1.0/(1+100/150) = 1.0/1.6667 = 0.6
    const delta = vitalityDelta(1.0, 0, 100);
    expect(delta).toBe(0.6);
  });
});

// ─── validateHealthInput ──────────────────────────────────────────────────────

describe('validateHealthInput', () => {
  const today = '2026-10-09';

  test('valid input returns null', () => {
    expect(validateHealthInput(today, 8000, 450, today)).toBeNull();
  });

  test('yesterday is valid (within ±1 day)', () => {
    expect(validateHealthInput('2026-10-08', 5000, 420, today)).toBeNull();
  });

  test('tomorrow is valid (within ±1 day)', () => {
    expect(validateHealthInput('2026-10-10', 5000, 420, today)).toBeNull();
  });

  test('2 days ago returns error', () => {
    expect(validateHealthInput('2026-10-07', 5000, 420, today)).not.toBeNull();
  });

  test('invalid date format returns error', () => {
    expect(validateHealthInput('09-10-2026', 5000, 420, today)).not.toBeNull();
  });

  test('steps = -1 returns error', () => {
    expect(validateHealthInput(today, -1, 420, today)).not.toBeNull();
  });

  test('steps = 100001 returns error', () => {
    expect(validateHealthInput(today, 100001, 420, today)).not.toBeNull();
  });

  test('steps as float returns error', () => {
    expect(validateHealthInput(today, 5000.5, 420, today)).not.toBeNull();
  });

  test('sleepMinutes = -1 returns error', () => {
    expect(validateHealthInput(today, 5000, -1, today)).not.toBeNull();
  });

  test('sleepMinutes = 1441 returns error', () => {
    expect(validateHealthInput(today, 5000, 1441, today)).not.toBeNull();
  });

  test('sleepMinutes as float returns error', () => {
    expect(validateHealthInput(today, 5000, 420.9, today)).not.toBeNull();
  });

  test('steps = 0 is valid', () => {
    expect(validateHealthInput(today, 0, 0, today)).toBeNull();
  });

  test('steps = 100000 is valid', () => {
    expect(validateHealthInput(today, 100000, 1440, today)).toBeNull();
  });
});

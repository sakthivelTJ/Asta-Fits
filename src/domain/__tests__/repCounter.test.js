/**
 * repCounter.test.js — Jest unit tests for poseMath.angleAt and RepCounter.
 *
 * Uses a deterministic cosine wave generator to simulate angle readings at 30 fps.
 * No React Native / camera imports needed — pure domain logic only.
 */

import { angleAt } from '../poseMath';
import { RepCounter, repConfigFor } from '../repCounter';

// ─── WAVE GENERATOR ───────────────────────────────────────────────────────────

/**
 * Simple seeded LCG pseudo-random number generator for deterministic noise.
 * Returns values in [-1, 1].
 */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return (s / 0xffffffff) * 2 - 1; // [-1, 1]
  };
}

/**
 * Simulate angle readings for N reps at 30 fps.
 * @param {{ top: number, bottom: number, repsCount: number, repDurationMs: number,
 *           noiseMag?: number, seed?: number, pauseAtBottomMs?: number,
 *           halfRep?: boolean }} opts
 * @returns {{ angle: number, tMs: number }[]}
 */
function generateWave({
  top,
  bottom,
  repsCount,
  repDurationMs,
  noiseMag = 0,
  seed = 42,
  pauseAtBottomMs = 0,
  halfRep = false,
}) {
  const rng = makeRng(seed);
  const fps = 30;
  const frameMs = 1000 / fps;
  const frames = [];
  let tMs = 0;

  const mid = halfRep ? 125 : bottom; // stop at shallow depth 125 if halfRep

  for (let rep = 0; rep < repsCount; rep++) {
    // Descent: top → mid
    const descentFrames = Math.ceil((repDurationMs / 2) / frameMs);
    for (let i = 0; i <= descentFrames; i++) {
      const t = i / descentFrames;
      const angle = top + (mid - top) * t + noiseMag * rng();
      frames.push({ angle, tMs });
      tMs += frameMs;
    }

    // Optional pause at bottom
    if (pauseAtBottomMs > 0 && !halfRep) {
      const pauseFrames = Math.ceil(pauseAtBottomMs / frameMs);
      for (let i = 0; i < pauseFrames; i++) {
        frames.push({ angle: mid + noiseMag * rng(), tMs });
        tMs += frameMs;
      }
    }

    // Ascent: mid → top
    const ascentFrames = Math.ceil((repDurationMs / 2) / frameMs);
    for (let i = 1; i <= ascentFrames; i++) {
      const t = i / ascentFrames;
      const angle = mid + (top - mid) * t + noiseMag * rng();
      frames.push({ angle, tMs });
      tMs += frameMs;
    }
  }

  return frames;
}

/**
 * Run frames through a RepCounter and collect all RepEvents.
 */
function runCounter(config, frames, { alignAngle } = {}) {
  const counter = new RepCounter(config);
  const events = [];
  for (const { angle, tMs } of frames) {
    const ev = counter.update(angle, tMs, alignAngle != null ? { alignAngle } : {});
    if (ev !== null) events.push(ev);
  }
  return { counter, events };
}

const PUSHUP_CFG = repConfigFor('pushup');
const SQUAT_CFG = repConfigFor('bodyweight_squat');
const PULLUP_CFG = repConfigFor('pullup');

// ─── TESTS: angleAt ───────────────────────────────────────────────────────────

describe('angleAt', () => {
  test('right angle returns 90', () => {
    // b at origin, a to the right, c upward → 90°
    const a = { x: 1, y: 0, likelihood: 1 };
    const b = { x: 0, y: 0, likelihood: 1 };
    const c = { x: 0, y: 1, likelihood: 1 };
    expect(angleAt(a, b, c)).toBeCloseTo(90, 1);
  });

  test('straight line returns 180', () => {
    const a = { x: -1, y: 0, likelihood: 1 };
    const b = { x: 0, y: 0, likelihood: 1 };
    const c = { x: 1, y: 0, likelihood: 1 };
    expect(angleAt(a, b, c)).toBeCloseTo(180, 1);
  });

  test('coincident points (a === b) return NaN', () => {
    const a = { x: 0, y: 0, likelihood: 1 };
    const b = { x: 0, y: 0, likelihood: 1 };
    const c = { x: 1, y: 0, likelihood: 1 };
    expect(angleAt(a, b, c)).toBeNaN();
  });

  test('coincident points (b === c) return NaN', () => {
    const a = { x: 1, y: 0, likelihood: 1 };
    const b = { x: 0, y: 0, likelihood: 1 };
    const c = { x: 0, y: 0, likelihood: 1 };
    expect(angleAt(a, b, c)).toBeNaN();
  });
});

// ─── TESTS: repConfigFor ──────────────────────────────────────────────────────

describe('repConfigFor', () => {
  test('plank returns null', () => {
    expect(repConfigFor('plank')).toBeNull();
  });

  test('pushup variants map to pushup config', () => {
    expect(repConfigFor('pushup').key).toBe('pushup');
    expect(repConfigFor('incline_pushup').key).toBe('pushup');
    expect(repConfigFor('diamond_pushup').key).toBe('pushup');
  });

  test('squat variants map to squat configs', () => {
    expect(repConfigFor('bodyweight_squat').key).toBe('squat');
    expect(repConfigFor('goblet_squat').key).toBe('squat');
    expect(repConfigFor('chair_squat').key).toBe('chairSquat');
  });

  test('pullup and chinup map to pullup config', () => {
    expect(repConfigFor('pullup').key).toBe('pullup');
    expect(repConfigFor('chinup').key).toBe('pullup');
  });
});

// ─── TESTS: RepCounter — push-ups ────────────────────────────────────────────

describe('RepCounter — push-ups', () => {
  test('10 clean push-ups counted exactly', () => {
    const frames = generateWave({
      top: 165, bottom: 75, repsCount: 10, repDurationMs: 1200,
    });
    const { counter } = runCounter(PUSHUP_CFG, frames);
    expect(counter.count).toBe(10);
  });

  test('+/-8 degrees noise — still 10 counted', () => {
    const frames = generateWave({
      top: 165, bottom: 75, repsCount: 10, repDurationMs: 1200, noiseMag: 8, seed: 1,
    });
    const { counter } = runCounter(PUSHUP_CFG, frames);
    expect(counter.count).toBe(10);
  });

  test('+/-12 degrees noise — still 10 counted', () => {
    const frames = generateWave({
      top: 165, bottom: 75, repsCount: 10, repDurationMs: 1200, noiseMag: 12, seed: 2,
    });
    const { counter } = runCounter(PUSHUP_CFG, frames);
    expect(counter.count).toBe(10);
  });

  test('1-second pause at bottom — each rep counted once (10 total)', () => {
    const frames = generateWave({
      top: 165, bottom: 75, repsCount: 10, repDurationMs: 1200, pauseAtBottomMs: 1000,
    });
    const { counter } = runCounter(PUSHUP_CFG, frames);
    expect(counter.count).toBe(10);
  });

  test('half reps (155 → 125) counted 0, each emits Go deeper hint', () => {
    const frames = generateWave({
      top: 165, bottom: 125, repsCount: 5, repDurationMs: 1200, halfRep: true,
    });
    const { counter, events } = runCounter(PUSHUP_CFG, frames);
    expect(counter.count).toBe(0);
    // Each half-rep that descends ≥ 20° but never reaches down should emit 'Go deeper'
    const hints = events.filter(e => e.hint === 'Go deeper');
    expect(hints.length).toBeGreaterThan(0);
  });

  test('0.35 s reps counted 0 with Too fast hint', () => {
    const frames = generateWave({
      top: 165, bottom: 75, repsCount: 6, repDurationMs: 350,
    });
    const { counter, events } = runCounter(PUSHUP_CFG, frames);
    expect(counter.count).toBe(0);
    const tooFast = events.filter(e => e.hint === 'Too fast, slow down');
    expect(tooFast.length).toBeGreaterThan(0);
  });
});

// ─── TESTS: RepCounter — squats ───────────────────────────────────────────────

describe('RepCounter — squats', () => {
  test('12 noisy squats counted', () => {
    const frames = generateWave({
      top: 170, bottom: 95, repsCount: 12, repDurationMs: 1400, noiseMag: 8, seed: 3,
    });
    const { counter } = runCounter(SQUAT_CFG, frames);
    expect(counter.count).toBe(12);
  });
});

// ─── TESTS: RepCounter — pull-ups ─────────────────────────────────────────────

describe('RepCounter — pull-ups', () => {
  test('6 clean pull-ups counted', () => {
    const frames = generateWave({
      top: 165, bottom: 55, repsCount: 6, repDurationMs: 1800,
    });
    const { counter } = runCounter(PULLUP_CFG, frames);
    expect(counter.count).toBe(6);
  });
});

// ─── TESTS: RepCounter — seekTop guard ───────────────────────────────────────

describe('RepCounter — seekTop guard', () => {
  test('starting at 100° waits for top, then counts all 4 reps', () => {
    const cfg = repConfigFor('pushup'); // up=155

    // First 20 frames stuck at 100° (below up-10=145), so seekTop holds
    const preamble = [];
    for (let i = 0; i < 20; i++) {
      preamble.push({ angle: 100, tMs: i * 33 });
    }

    // Then a full rise to top
    for (let i = 0; i < 10; i++) {
      preamble.push({ angle: 100 + i * 7, tMs: (20 + i) * 33 }); // 100 → 170
    }

    const startMs = preamble[preamble.length - 1].tMs + 33;
    const repFrames = generateWave({
      top: 165, bottom: 75, repsCount: 4, repDurationMs: 1200,
    }).map(f => ({ ...f, tMs: f.tMs + startMs }));

    const allFrames = [...preamble, ...repFrames];
    const { counter } = runCounter(cfg, allFrames);
    expect(counter.count).toBe(4);
  });
});

// ─── TESTS: Form scores ───────────────────────────────────────────────────────

describe('RepCounter — form scores', () => {
  test('perfect depth + alignment → every rep formScore >= 95', () => {
    // Full depth: bottom well below ideal (up=155, ideal=80, bottom=68 → deep)
    // Perfect alignment angle = 168° (full=165, but clamped to [0,1] → 1.0)
    const frames = generateWave({
      top: 165, bottom: 68, repsCount: 5, repDurationMs: 1400,
    });
    const { events } = runCounter(PUSHUP_CFG, frames, { alignAngle: 168 });
    const counted = events.filter(e => e.counted);
    expect(counted.length).toBe(5);
    counted.forEach(e => {
      expect(e.formScore).toBeGreaterThanOrEqual(95);
    });
  });

  test('shallow depth + poor alignment → every rep formScore < 60', () => {
    // bottom=88 (crosses down=95 cleanly)
    // alignment=135° (zero=130, full=165 → score=(135-130)/(165-130)=0.143 → poor)
    const frames = generateWave({
      top: 165, bottom: 88, repsCount: 5, repDurationMs: 1400,
    });
    const { events } = runCounter(PUSHUP_CFG, frames, { alignAngle: 135 });
    const counted = events.filter(e => e.counted);
    expect(counted.length).toBe(5);
    counted.forEach(e => {
      expect(e.formScore).toBeLessThan(60);
    });
  });
});


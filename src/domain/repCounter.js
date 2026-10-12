/**
 * repCounter.js — Pure domain logic for rep counting via joint angles.
 * No React Native / camera / ML Kit imports. Fully unit-testable in Node.
 *
 * Convention: extended position = HIGH angle, flexed position = LOW angle.
 * e.g. push-up top (extended elbows) ≈ 155°, bottom (flexed) ≈ 95°.
 */

// ─── CONFIG TYPES ─────────────────────────────────────────────────────────────

/**
 * @typedef {{ joints: string[], full: number, zero: number }} AlignmentConfig
 * AlignmentConfig measures body alignment (e.g. shoulder–hip–ankle for push-up planks).
 * full = angle when perfectly aligned, zero = worst acceptable alignment angle.
 */

/**
 * @typedef {{
 *   key: string,
 *   label: string,
 *   joints: string[],      // 3 joint names; angle measured at middle one
 *   up: number,            // angle threshold for top of rep (extended)
 *   down: number,          // angle threshold for bottom of rep (flexed)
 *   ideal: number,         // ideal bottom angle for full depth scoring
 *   minRepMs: number,      // minimum rep duration in ms (anti-cheat)
 *   alpha: number,         // EMA smoothing factor (default 0.5)
 *   alignment: AlignmentConfig | null,
 *   experimental: boolean
 * }} RepCounterConfig
 */

/**
 * @typedef {{ counted: boolean, count: number, formScore: number, hint: string | null }} RepEvent
 */

// ─── EXERCISE CONFIGS ─────────────────────────────────────────────────────────

/** @type {Record<string, RepCounterConfig>} */
const CONFIGS = {
  pushup: {
    key: 'pushup',
    label: 'Push-Up',
    joints: ['shoulder', 'elbow', 'wrist'],
    up: 155,
    down: 95,
    ideal: 80,
    minRepMs: 700,
    alpha: 0.5,
    alignment: {
      joints: ['shoulder', 'hip', 'ankle'],
      full: 165,
      zero: 130,
    },
    experimental: false,
  },
  squat: {
    key: 'squat',
    label: 'Squat',
    joints: ['hip', 'knee', 'ankle'],
    up: 160,
    down: 110,
    ideal: 90,
    minRepMs: 800,
    alpha: 0.5,
    alignment: null,
    experimental: false,
  },
  chairSquat: {
    key: 'chairSquat',
    label: 'Chair Squat',
    joints: ['hip', 'knee', 'ankle'],
    up: 160,
    down: 120,
    ideal: 105,
    minRepMs: 800,
    alpha: 0.5,
    alignment: null,
    experimental: false,
  },
  pullup: {
    key: 'pullup',
    label: 'Pull-Up',
    joints: ['shoulder', 'elbow', 'wrist'],
    up: 150,
    down: 80,
    ideal: 60,
    minRepMs: 900,
    alpha: 0.5,
    alignment: null,
    experimental: false,
  },
  situp: {
    key: 'situp',
    label: 'Sit-Up',
    joints: ['shoulder', 'hip', 'knee'],
    up: 125,
    down: 90,
    ideal: 70,
    minRepMs: 900,
    alpha: 0.5,
    alignment: null,
    experimental: true,
  },
};

/**
 * Maps exercise IDs (from the quest/exercise library) to a RepCounterConfig.
 * Returns null for exercises without a supported pose config.
 *
 * @param {string} exerciseId
 * @returns {RepCounterConfig | null}
 */
export function repConfigFor(exerciseId) {
  const map = {
    pushup: 'pushup',
    pushup_std: 'pushup',
    pushup_incline: 'pushup',
    pushup_decline: 'pushup',
    pushup_diamond: 'pushup',
    incline_pushup: 'pushup',
    diamond_pushup: 'pushup',
    bodyweight_squat: 'squat',
    goblet_squat: 'squat',
    chair_squat: 'chairSquat',
    pullup: 'pullup',
    chinup: 'pullup',
    situp: 'situp',
  };
  const key = map[exerciseId];
  return key ? CONFIGS[key] : null;
}

// ─── REP COUNTER CLASS ────────────────────────────────────────────────────────

export const Stage = Object.freeze({
  seekTop: 'seekTop',
  top: 'top',
  bottom: 'bottom',
  paused: 'paused',
});

export class RepCounter {
  /**
   * @param {RepCounterConfig} config
   */
  constructor(config) {
    this.config = config;
    this.count = 0;

    // Internal state
    this._stage = Stage.seekTop;
    this._descending = false;
    this._ema = null;          // EMA of smoothed angle; null until first sample
    this._minAngle = Infinity;
    this._repStartMs = 0;
    this._alignSum = 0;
    this._alignN = 0;
    this._isPaused = false;
  }

  /** Current friendly state: 'READY' | 'UP' | 'DOWN' | 'PAUSED' */
  get state() {
    if (this._isPaused) return 'PAUSED';
    if (this._stage === Stage.seekTop) return 'READY';
    if (this._stage === Stage.bottom || this._descending) return 'DOWN';
    return 'UP';
  }

  /** Current smoothed angle */
  get currentAngle() {
    return this._ema != null ? Math.round(this._ema) : null;
  }

  /** True once the counter has seen a valid top and is actively counting. */
  get armed() {
    return this._stage !== Stage.seekTop;
  }

  pause() {
    this._isPaused = true;
  }

  resume() {
    this._isPaused = false;
  }

  reset() {
    this.count = 0;
    this._stage = Stage.seekTop;
    this._descending = false;
    this._ema = null;
    this._minAngle = Infinity;
    this._repStartMs = 0;
    this._alignSum = 0;
    this._alignN = 0;
    this._isPaused = false;
  }

  /**
   * Feed one angle sample and (optionally) an alignment angle.
   * Returns a RepEvent when something noteworthy happens, otherwise null.
   *
   * @param {number} angle       — main joint angle in degrees
   * @param {number} tMs         — current stopwatch time in ms
   * @param {{ alignAngle?: number }} [opts]
   * @returns {RepEvent | null}
   */
  update(angle, tMs, opts = {}) {
    if (this._isPaused) return null;
    const { alignAngle } = opts;
    const { up, down, ideal, minRepMs, alpha, alignment } = this.config;

    // 1. EMA smoothing
    if (this._ema === null) {
      this._ema = angle;
    } else {
      this._ema += alpha * (angle - this._ema);
    }
    const s = this._ema;

    // 2. Stage: seekTop — wait until s >= up before starting to count
    if (this._stage === Stage.seekTop) {
      if (s >= up) {
        this._stage = Stage.top;
        this._minAngle = s;
        this._descending = false;
      }
      return null;
    }

    // 3. Alignment accumulation while descending
    if (alignAngle != null && alignment != null && this._descending) {
      const { full, zero } = alignment;
      const alignScore = Math.min(1, Math.max(0, (alignAngle - zero) / (full - zero)));
      this._alignSum += alignScore;
      this._alignN += 1;
    }

    // 4. Stage: top
    if (this._stage === Stage.top) {
      if (!this._descending) {
        // Waiting to start descent
        if (s < up - 10) {
          this._descending = true;
          this._repStartMs = tMs;
          this._minAngle = s;
          this._alignSum = 0;
          this._alignN = 0;
        }
        return null;
      }

      // Descending
      if (s < this._minAngle) this._minAngle = s;

      if (s <= down) {
        // Reached the bottom threshold
        this._stage = Stage.bottom;
        return null;
      }

      if (s >= up) {
        // Came back up without reaching down = incomplete rep
        const moved = up - this._minAngle;
        this._descending = false;
        this._minAngle = s;
        if (moved >= 20) {
          return {
            counted: false,
            count: this.count,
            formScore: 0,
            hint: 'Go deeper',
          };
        }
        return null;
      }

      return null;
    }

    // 5. Stage: bottom
    if (s < this._minAngle) this._minAngle = s;

    if (s >= up) {
      // Rep complete — calculate quality metrics
      const duration = tMs - this._repStartMs;

      // Reset for next rep
      const minAngleAtBottom = this._minAngle;
      const alignN = this._alignN;
      const alignSum = this._alignSum;

      this._stage = Stage.top;
      this._descending = false;
      this._minAngle = s;
      this._alignSum = 0;
      this._alignN = 0;

      if (duration < minRepMs) {
        return {
          counted: false,
          count: this.count,
          formScore: 0,
          hint: 'Too fast, slow down',
        };
      }

      // Depth score: how close to ideal bottom angle
      const depth = Math.min(1, Math.max(0, (up - minAngleAtBottom) / (up - ideal)));
      const align = alignN === 0 ? null : alignSum / alignN;

      this.count += 1;
      const formScore = Math.round(
        100 * (align === null ? depth : 0.6 * depth + 0.4 * align)
      );

      let hint = null;
      if (depth < 0.8) {
        hint = 'Go a little deeper';
      } else if (align !== null && align < 0.8) {
        hint = 'Keep your body in a straight line';
      }

      return {
        counted: true,
        count: this.count,
        formScore,
        hint,
      };
    }

    return null;
  }
}

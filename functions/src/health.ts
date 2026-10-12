/**
 * health.ts — Pure math for health data → Vitality stat.
 * No Firebase imports. Fully unit-testable.
 *
 * Only two numbers from the phone enter the server: steps and sleepMinutes.
 * The server computes the stat gain and writes it atomically.
 */

// ─── VITALITY MATH ────────────────────────────────────────────────────────────

/**
 * Raw vitality points earned for a day's health data.
 * Maximum 2.5 per day:  2.0 from steps + 0.5 from sleep.
 *
 * @param steps        integer [0, 100_000]
 * @param sleepMinutes integer [0, 1440]
 * @returns number rounded to 2 decimals, max 2.5
 */
export function vitalityRawForDay(steps: number, sleepMinutes: number): number {
  const fromSteps = Math.min(2, steps / 5000);
  const fromSleep =
    sleepMinutes >= 420 ? 0.5 :
    sleepMinutes >= 360 ? 0.25 :
    0;
  return round2(fromSteps + fromSleep);
}

/**
 * Stat delta to apply given new raw total, already-awarded raw total,
 * and the user's current Vitality stat (for diminishing returns).
 *
 * rawDelta is never negative (idempotent — a lower later reading awards 0 extra).
 * Diminishing-returns formula: statDelta = rawDelta / (1 + vitality/150).
 *
 * @param rawToday          total raw computed for the day
 * @param alreadyAwardedRaw raw already credited for this day
 * @param currentVitality   user's current Vitality stat value
 * @returns stat points to add, rounded to 2 decimals
 */
export function vitalityDelta(
  rawToday: number,
  alreadyAwardedRaw: number,
  currentVitality: number,
): number {
  const rawDelta = Math.max(0, rawToday - alreadyAwardedRaw);
  return round2(rawDelta / (1 + currentVitality / 150));
}

// ─── INPUT VALIDATION ─────────────────────────────────────────────────────────

/**
 * Validate client-supplied health data before writing.
 * Returns an error string on failure, or null if everything is valid.
 *
 * Rules:
 * - date must be within ±1 day of serverToday (handles timezone drift)
 * - steps must be an integer in [0, 100_000]
 * - sleepMinutes must be an integer in [0, 1_440]
 *
 * @param date         ISO date string sent by client (e.g. "2026-10-09")
 * @param steps        raw step count
 * @param sleepMinutes total minutes asleep
 * @param serverToday  today's ISO date string on the server
 * @returns null if valid, error string if not
 */
export function validateHealthInput(
  date: string,
  steps: number,
  sleepMinutes: number,
  serverToday: string,
): string | null {
  // Date format check
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return 'Invalid date format; expected YYYY-MM-DD';
  }

  // Date range: within ±1 day
  const clientDay = new Date(date).getTime();
  const serverDay = new Date(serverToday).getTime();
  const dayMs = 86_400_000;
  if (Math.abs(clientDay - serverDay) > dayMs) {
    return `Date ${date} is more than 1 day from server date ${serverToday}`;
  }

  // Steps: non-negative integer, max 100_000
  if (!Number.isInteger(steps) || steps < 0 || steps > 100_000) {
    return `steps must be an integer in [0, 100000]; got ${steps}`;
  }

  // Sleep: non-negative integer, max 1_440 (24 h)
  if (!Number.isInteger(sleepMinutes) || sleepMinutes < 0 || sleepMinutes > 1_440) {
    return `sleepMinutes must be an integer in [0, 1440]; got ${sleepMinutes}`;
  }

  return null;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

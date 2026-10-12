/**
 * poseMath.js — Pure domain logic for pose angle computation.
 * No React Native / camera / ML Kit imports. Fully unit-testable in Node.
 *
 * Pt: a detected landmark point with normalised coordinates and likelihood.
 * angleAt: interior angle at vertex b formed by rays b→a and b→c, in degrees [0-180].
 *          Returns NaN if either ray has zero length (coincident points).
 */

/**
 * @typedef {{ x: number, y: number, likelihood: number }} Pt
 */

/**
 * Computes the angle (in degrees) at point b, given three points a, b, c.
 * Uses the dot-product formula:  cos θ = (ba · bc) / (|ba| * |bc|)
 * Cosine is clamped to [-1, 1] before acos to prevent floating-point domain errors.
 *
 * @param {Pt} a
 * @param {Pt} b  — vertex
 * @param {Pt} c
 * @returns {number}  angle in degrees, or NaN if either vector is zero-length
 */
export function angleAt(a, b, c) {
  if (!a || !b || !c) return NaN;
  const bax = a.x - b.x;
  const bay = a.y - b.y;
  const bcx = c.x - b.x;
  const bcy = c.y - b.y;

  const lenBA = Math.sqrt(bax * bax + bay * bay);
  const lenBC = Math.sqrt(bcx * bcx + bcy * bcy);

  if (lenBA === 0 || lenBC === 0) return NaN;

  const dot = bax * bcx + bay * bcy;
  const cosTheta = Math.min(1, Math.max(-1, dot / (lenBA * lenBC)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

/**
 * Calculates Euclidean distance between two 2D points.
 * @param {Pt} a
 * @param {Pt} b
 * @returns {number}
 */
export function distance(a, b) {
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a landmark point has sufficient confidence/visibility.
 * @param {Pt} pt
 * @param {number} [minConfidence=0.5]
 * @returns {boolean}
 */
export function isPointConfident(pt, minConfidence = 0.5) {
  if (!pt || typeof pt.x !== 'number' || typeof pt.y !== 'number') return false;
  const conf = pt.likelihood ?? pt.visibility ?? pt.presence ?? 1;
  return conf >= minConfidence;
}

/**
 * Transforms normalized coordinates (0..1) to screen viewport pixels.
 * Handles front-camera horizontal mirroring if active.
 *
 * @param {Pt} pt
 * @param {number} width
 * @param {number} height
 * @param {boolean} [mirror=false]
 * @returns {{ x: number, y: number, confident: boolean }}
 */
export function transformPoint(pt, width, height, mirror = false) {
  if (!pt) return { x: 0, y: 0, confident: false };
  const rawX = mirror ? (1 - pt.x) : pt.x;
  return {
    x: Math.round(rawX * width),
    y: Math.round(pt.y * height),
    confident: isPointConfident(pt),
  };
}

/**
 * PoseDetectionService.js
 *
 * Normalizes pose landmarks from MediaPipe / camera frame callbacks,
 * extracts key joint points, determines the most visible anatomical side,
 * and feeds calculated angles to the RepCounter and FormAnalyzer.
 */

import { angleAt, isPointConfident } from '../../domain/poseMath';

// Standard MediaPipe 33 landmark index mappings
export const LANDMARK_INDEX = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// Anatomical bone connections (index pairs)
export const SKELETON_CONNECTIONS = [
  // Upper body
  [LANDMARK_INDEX.LEFT_SHOULDER, LANDMARK_INDEX.RIGHT_SHOULDER],
  [LANDMARK_INDEX.LEFT_SHOULDER, LANDMARK_INDEX.LEFT_ELBOW],
  [LANDMARK_INDEX.LEFT_ELBOW, LANDMARK_INDEX.LEFT_WRIST],
  [LANDMARK_INDEX.RIGHT_SHOULDER, LANDMARK_INDEX.RIGHT_ELBOW],
  [LANDMARK_INDEX.RIGHT_ELBOW, LANDMARK_INDEX.RIGHT_WRIST],
  // Torso
  [LANDMARK_INDEX.LEFT_SHOULDER, LANDMARK_INDEX.LEFT_HIP],
  [LANDMARK_INDEX.RIGHT_SHOULDER, LANDMARK_INDEX.RIGHT_HIP],
  [LANDMARK_INDEX.LEFT_HIP, LANDMARK_INDEX.RIGHT_HIP],
  // Lower body
  [LANDMARK_INDEX.LEFT_HIP, LANDMARK_INDEX.LEFT_KNEE],
  [LANDMARK_INDEX.LEFT_KNEE, LANDMARK_INDEX.LEFT_ANKLE],
  [LANDMARK_INDEX.RIGHT_HIP, LANDMARK_INDEX.RIGHT_KNEE],
  [LANDMARK_INDEX.RIGHT_KNEE, LANDMARK_INDEX.RIGHT_ANKLE],
];

export class PoseDetectionService {
  /**
   * Normalizes raw landmark list into a keyed object.
   * Accepts array of 33 landmarks or keyed dictionary.
   *
   * @param {Array<{ x: number, y: number, z?: number, visibility?: number, presence?: number, likelihood?: number }>} rawLandmarks
   * @returns {Record<string, { x: number, y: number, likelihood: number }> | null}
   */
  static extractKeypoints(rawLandmarks) {
    if (!rawLandmarks || !Array.isArray(rawLandmarks) || rawLandmarks.length < 17) {
      return null;
    }

    const getPt = (idx) => {
      const p = rawLandmarks[idx];
      if (!p) return null;
      return {
        x: p.x,
        y: p.y,
        likelihood: p.likelihood ?? p.visibility ?? p.presence ?? 1,
      };
    };

    return {
      leftShoulder: getPt(LANDMARK_INDEX.LEFT_SHOULDER),
      rightShoulder: getPt(LANDMARK_INDEX.RIGHT_SHOULDER),
      leftElbow: getPt(LANDMARK_INDEX.LEFT_ELBOW),
      rightElbow: getPt(LANDMARK_INDEX.RIGHT_ELBOW),
      leftWrist: getPt(LANDMARK_INDEX.LEFT_WRIST),
      rightWrist: getPt(LANDMARK_INDEX.RIGHT_WRIST),
      leftHip: getPt(LANDMARK_INDEX.LEFT_HIP),
      rightHip: getPt(LANDMARK_INDEX.RIGHT_HIP),
      leftKnee: getPt(LANDMARK_INDEX.LEFT_KNEE),
      rightKnee: getPt(LANDMARK_INDEX.RIGHT_KNEE),
      leftAnkle: getPt(LANDMARK_INDEX.LEFT_ANKLE),
      rightAnkle: getPt(LANDMARK_INDEX.RIGHT_ANKLE),
    };
  }

  /**
   * Determines the best side (left vs right) based on total landmark confidence.
   * For push-ups viewed in profile, one side is typically closer and clearer.
   *
   * @param {ReturnType<typeof PoseDetectionService.extractKeypoints>} keypoints
   * @returns {{
   *   side: 'left' | 'right',
   *   shoulder: import('../../domain/poseMath').Pt,
   *   elbow: import('../../domain/poseMath').Pt,
   *   wrist: import('../../domain/poseMath').Pt,
   *   hip: import('../../domain/poseMath').Pt,
   *   knee: import('../../domain/poseMath').Pt,
   *   ankle: import('../../domain/poseMath').Pt,
   *   elbowAngle: number | null,
   *   alignAngle: number | null,
   * }}
   */
  static getPrimaryJoints(keypoints) {
    if (!keypoints) return null;

    const leftScore =
      (keypoints.leftShoulder?.likelihood || 0) +
      (keypoints.leftElbow?.likelihood || 0) +
      (keypoints.leftWrist?.likelihood || 0);

    const rightScore =
      (keypoints.rightShoulder?.likelihood || 0) +
      (keypoints.rightElbow?.likelihood || 0) +
      (keypoints.rightWrist?.likelihood || 0);

    const useLeft = leftScore >= rightScore;

    const shoulder = useLeft ? keypoints.leftShoulder : keypoints.rightShoulder;
    const elbow = useLeft ? keypoints.leftElbow : keypoints.rightElbow;
    const wrist = useLeft ? keypoints.leftWrist : keypoints.rightWrist;
    const hip = useLeft ? keypoints.leftHip : keypoints.rightHip;
    const knee = useLeft ? keypoints.leftKnee : keypoints.rightKnee;
    const ankle = useLeft ? keypoints.leftAnkle : keypoints.rightAnkle;

    let elbowAngle = null;
    if (isPointConfident(shoulder) && isPointConfident(elbow) && isPointConfident(wrist)) {
      const ang = angleAt(shoulder, elbow, wrist);
      if (!isNaN(ang)) elbowAngle = ang;
    }

    let alignAngle = null;
    if (isPointConfident(shoulder) && isPointConfident(hip) && isPointConfident(ankle)) {
      const ang = angleAt(shoulder, hip, ankle);
      if (!isNaN(ang)) alignAngle = ang;
    }

    return {
      side: useLeft ? 'left' : 'right',
      shoulder,
      elbow,
      wrist,
      hip,
      knee,
      ankle,
      elbowAngle,
      alignAngle,
    };
  }
}

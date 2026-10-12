/**
 * formAnalyzer.js — Pure domain logic for real-time exercise form analysis and feedback.
 * No React Native / camera dependencies. Unit-testable in Node/Jest.
 */

import { angleAt, isPointConfident } from './poseMath';

export const FORM_MESSAGES = {
  OUT_OF_FRAME: 'Move into the camera frame',
  PARTIALLY_OCCLUDED: 'Keep your shoulder, hip, and ankle visible',
  POSITION_ADJUST: 'Unable to assess form — adjust your position',
  READY_TO_START: 'Get into push-up plank position',
  TRACKING_ACTIVE: 'Tracking your movement',
  LOWER_FURTHER: 'Lower your body further',
  EXTEND_ARMS: 'Extend your arms to complete the rep',
  ALIGN_BODY: 'Keep your body in a straight line',
  GOOD_REP: 'Good repetition! Strong form!',
  PAUSED: 'Pause detected — resume when ready',
};

/**
 * ExerciseFormAnalyzer evaluates body landmarks for push-ups and general exercises.
 */
export class ExerciseFormAnalyzer {
  constructor(exerciseKey = 'pushup') {
    this.exerciseKey = exerciseKey;
    this.lastMessage = FORM_MESSAGES.READY_TO_START;
    this.lastMessageTime = 0;
    this.minDisplayDurationMs = 1200; // Stabilize messages to avoid flickering
    this.recentAngles = [];
    this.alignToleranceDeg = 25; // Planks should be within ~25 deg of 180 (straight line)
  }

  /**
   * Reset the analyzer state.
   */
  reset() {
    this.lastMessage = FORM_MESSAGES.READY_TO_START;
    this.lastMessageTime = 0;
    this.recentAngles = [];
  }

  /**
   * Evaluates current pose landmarks and returns structured form assessment.
   *
   * @param {{
   *   shoulder?: import('./poseMath').Pt,
   *   elbow?: import('./poseMath').Pt,
   *   wrist?: import('./poseMath').Pt,
   *   hip?: import('./poseMath').Pt,
   *   knee?: import('./poseMath').Pt,
   *   ankle?: import('./poseMath').Pt,
   * }} joints
   * @param {{
   *   stage: string,
   *   isPaused: boolean,
   *   elapsedMs: number,
   *   elbowAngle?: number | null,
   * }} state
   * @returns {{
   *   isTracking: boolean,
   *   feedback: string,
   *   formScore: number,
   *   isAligned: boolean,
   *   alignmentAngle: number | null,
   *   depthScore: number,
   * }}
   */
  analyze(joints, state) {
    const { stage, isPaused, elapsedMs, elbowAngle } = state;

    if (isPaused) {
      return {
        isTracking: false,
        feedback: this._stabilizedMessage(FORM_MESSAGES.PAUSED, elapsedMs),
        formScore: 100,
        isAligned: true,
        alignmentAngle: null,
        depthScore: 1,
      };
    }

    if (!joints) {
      return {
        isTracking: false,
        feedback: this._stabilizedMessage(FORM_MESSAGES.OUT_OF_FRAME, elapsedMs),
        formScore: 0,
        isAligned: false,
        alignmentAngle: null,
        depthScore: 0,
      };
    }

    const { shoulder, elbow, wrist, hip, ankle } = joints;

    // Check visibility of key upper-body points
    const upperVisible = isPointConfident(shoulder) && isPointConfident(elbow);
    if (!upperVisible) {
      return {
        isTracking: false,
        feedback: this._stabilizedMessage(FORM_MESSAGES.OUT_OF_FRAME, elapsedMs),
        formScore: 0,
        isAligned: false,
        alignmentAngle: null,
        depthScore: 0,
      };
    }

    // Check arm completeness
    const armComplete = upperVisible && isPointConfident(wrist);
    if (!armComplete) {
      return {
        isTracking: true,
        feedback: this._stabilizedMessage(FORM_MESSAGES.PARTIALLY_OCCLUDED, elapsedMs),
        formScore: 70,
        isAligned: false,
        alignmentAngle: null,
        depthScore: 0.5,
      };
    }

    // Alignment angle calculation (shoulder -> hip -> ankle)
    let alignmentAngle = null;
    let isAligned = true;
    let alignScore = 1.0;

    if (isPointConfident(shoulder) && isPointConfident(hip) && isPointConfident(ankle)) {
      alignmentAngle = angleAt(shoulder, hip, ankle);
      if (!isNaN(alignmentAngle)) {
        // Ideal straight plank is 165°–180°
        const deviation = Math.abs(180 - alignmentAngle);
        if (deviation > this.alignToleranceDeg) {
          isAligned = false;
          alignScore = Math.max(0, 1 - (deviation - this.alignToleranceDeg) / 30);
        }
      }
    }

    // Depth and movement feedback
    let feedback = FORM_MESSAGES.TRACKING_ACTIVE;
    let depthScore = 1.0;

    if (elbowAngle != null) {
      if (stage === 'READY') {
        if (elbowAngle >= 150) {
          feedback = FORM_MESSAGES.TRACKING_ACTIVE;
        } else {
          feedback = FORM_MESSAGES.EXTEND_ARMS;
        }
      } else if (stage === 'UP') {
        if (!isAligned) {
          feedback = FORM_MESSAGES.ALIGN_BODY;
        } else {
          feedback = FORM_MESSAGES.TRACKING_ACTIVE;
        }
      } else if (stage === 'DOWN') {
        if (elbowAngle > 105) {
          feedback = FORM_MESSAGES.LOWER_FURTHER;
          depthScore = 0.7;
        } else {
          depthScore = 1.0;
          feedback = !isAligned ? FORM_MESSAGES.ALIGN_BODY : FORM_MESSAGES.TRACKING_ACTIVE;
        }
      }
    }

    const overallFormScore = Math.round((0.6 * depthScore + 0.4 * alignScore) * 100);

    return {
      isTracking: true,
      feedback: this._stabilizedMessage(feedback, elapsedMs),
      formScore: overallFormScore,
      isAligned,
      alignmentAngle: alignmentAngle != null && !isNaN(alignmentAngle) ? Math.round(alignmentAngle) : null,
      depthScore,
    };
  }

  /**
   * Prevents rapid flickering of guidance messages.
   * @private
   */
  _stabilizedMessage(newMessage, nowMs) {
    if (newMessage === this.lastMessage) {
      return this.lastMessage;
    }
    // High-priority immediate messages or initial state
    if (
      this.lastMessageTime === 0 ||
      this.lastMessage === FORM_MESSAGES.READY_TO_START ||
      newMessage === FORM_MESSAGES.OUT_OF_FRAME ||
      newMessage === FORM_MESSAGES.PAUSED ||
      newMessage === FORM_MESSAGES.GOOD_REP
    ) {
      this.lastMessage = newMessage;
      this.lastMessageTime = nowMs;
      return newMessage;
    }

    if (nowMs - this.lastMessageTime > this.minDisplayDurationMs) {
      this.lastMessage = newMessage;
      this.lastMessageTime = nowMs;
      return newMessage;
    }

    return this.lastMessage;
  }
}

import { RepCounter, repConfigFor } from '../domain/repCounter';
import { ExerciseFormAnalyzer, FORM_MESSAGES } from '../domain/formAnalyzer';
import { PoseDetectionService, LANDMARK_INDEX } from '../features/camera/PoseDetectionService';

describe('AI Workout Tracking & Pose Rep Counter Tests', () => {
  const pushupConfig = repConfigFor('pushup_std');

  test('repConfigFor resolves pushup_std, pushup_incline, pushup_diamond', () => {
    expect(repConfigFor('pushup_std')).toBeDefined();
    expect(repConfigFor('pushup_incline')).toBeDefined();
    expect(repConfigFor('pushup_diamond')).toBeDefined();
    expect(repConfigFor('pushup_std').up).toBe(155);
    expect(repConfigFor('pushup_std').down).toBe(95);
  });

  describe('RepCounter Push-Up State Machine', () => {
    let counter;

    beforeEach(() => {
      counter = new RepCounter(pushupConfig);
    });

    test('starts in READY state with 0 count', () => {
      expect(counter.count).toBe(0);
      expect(counter.state).toBe('READY');
      expect(counter.armed).toBe(false);
    });

    test('arms into UP state when user extends arms at top position (>= 155 deg)', () => {
      counter.update(160, 100);
      expect(counter.armed).toBe(true);
      expect(counter.state).toBe('UP');
      expect(counter.count).toBe(0);
    });

    test('does NOT count a rep when holding arms extended at top', () => {
      counter.update(160, 100);
      counter.update(162, 200);
      counter.update(158, 300);
      counter.update(160, 400);
      expect(counter.count).toBe(0);
    });

    test('counts exactly 1 repetition on complete DOWN and UP cycle with valid duration', () => {
      let t = 100;
      // 1. Enter top position
      for (let i = 0; i < 5; i++) {
        counter.update(162, t);
        t += 50;
      }
      expect(counter.state).toBe('UP');

      // 2. Descend below 95 degrees
      const descentAngles = [150, 135, 115, 95, 80, 75];
      for (const ang of descentAngles) {
        counter.update(ang, t);
        t += 100;
      }
      expect(counter.state).toBe('DOWN');
      expect(counter.count).toBe(0);

      // 3. Ascend back to top position (> 700ms elapsed)
      const ascentAngles = [90, 110, 130, 150, 160, 165];
      let repResult = null;
      for (const ang of ascentAngles) {
        const res = counter.update(ang, t);
        if (res) repResult = res;
        t += 100;
      }

      expect(repResult).not.toBeNull();
      expect(repResult.counted).toBe(true);
      expect(counter.count).toBe(1);
      expect(counter.state).toBe('UP');
    });

    test('rejects shallow / partial repetitions that do not reach bottom threshold', () => {
      let t = 100;
      for (let i = 0; i < 5; i++) {
        counter.update(162, t);
        t += 50;
      }

      // Shallow descent: minimum angle is 125 (threshold is 95)
      const shallowAngles = [150, 140, 130, 125, 125, 135, 150, 162];
      for (const ang of shallowAngles) {
        const res = counter.update(ang, t);
        if (res) expect(res.counted).toBe(false);
        t += 100;
      }

      expect(counter.count).toBe(0); // rejected!
    });

    test('pausing prevents counting and updates state to PAUSED', () => {
      counter.update(160, 100);
      counter.pause();
      expect(counter.state).toBe('PAUSED');

      // Movement during pause is ignored
      counter.update(90, 500);
      counter.update(160, 1000);
      expect(counter.count).toBe(0);

      counter.resume();
      expect(counter.state).not.toBe('PAUSED');
    });

    test('reset zeroes out rep count and restores READY state', () => {
      let t = 100;
      for (let i = 0; i < 5; i++) { counter.update(165, t); t += 50; }
      for (const a of [140, 110, 85, 75, 75]) { counter.update(a, t); t += 100; }
      for (const a of [110, 135, 155, 165, 165]) { counter.update(a, t); t += 100; }
      expect(counter.count).toBe(1);

      counter.reset();
      expect(counter.count).toBe(0);
      expect(counter.state).toBe('READY');
      expect(counter.armed).toBe(false);
    });
  });

  describe('PoseDetectionService', () => {
    test('extractKeypoints extracts valid MediaPipe landmarks', () => {
      const raw = new Array(33).fill(null).map((_, i) => ({
        x: 0.5,
        y: 0.5,
        visibility: 0.9,
      }));

      const keypoints = PoseDetectionService.extractKeypoints(raw);
      expect(keypoints).toBeDefined();
      expect(keypoints.leftShoulder).toEqual({ x: 0.5, y: 0.5, likelihood: 0.9 });
      expect(keypoints.rightElbow).toEqual({ x: 0.5, y: 0.5, likelihood: 0.9 });
    });

    test('getPrimaryJoints calculates elbow angle and alignment angle correctly', () => {
      const raw = new Array(33).fill(null).map(() => ({ x: 0, y: 0, visibility: 0.9 }));

      // Set up right angle at left elbow: shoulder (0.3, 0.4), elbow (0.3, 0.7), wrist (0.6, 0.7)
      raw[LANDMARK_INDEX.LEFT_SHOULDER] = { x: 0.3, y: 0.4, visibility: 0.95 };
      raw[LANDMARK_INDEX.LEFT_ELBOW] = { x: 0.3, y: 0.7, visibility: 0.95 };
      raw[LANDMARK_INDEX.LEFT_WRIST] = { x: 0.6, y: 0.7, visibility: 0.95 };

      const keypoints = PoseDetectionService.extractKeypoints(raw);
      const joints = PoseDetectionService.getPrimaryJoints(keypoints);

      expect(joints).toBeDefined();
      expect(joints.side).toBe('left');
      expect(Math.round(joints.elbowAngle)).toBe(90);
    });
  });
});

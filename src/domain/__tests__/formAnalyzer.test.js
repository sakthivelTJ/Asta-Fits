import { ExerciseFormAnalyzer, FORM_MESSAGES } from '../formAnalyzer';

describe('ExerciseFormAnalyzer Tests', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new ExerciseFormAnalyzer('pushup');
  });

  test('reports OUT_OF_FRAME when joints are missing or null', () => {
    const result = analyzer.analyze(null, {
      stage: 'READY',
      isPaused: false,
      elapsedMs: 100,
    });
    expect(result.isTracking).toBe(false);
    expect(result.feedback).toBe(FORM_MESSAGES.OUT_OF_FRAME);
  });

  test('reports PAUSED when workout session is paused', () => {
    const result = analyzer.analyze(null, {
      stage: 'READY',
      isPaused: true,
      elapsedMs: 200,
    });
    expect(result.feedback).toBe(FORM_MESSAGES.PAUSED);
  });

  test('reports PARTIALLY_OCCLUDED when wrist is missing', () => {
    const joints = {
      shoulder: { x: 0.5, y: 0.3, likelihood: 0.9 },
      elbow: { x: 0.5, y: 0.5, likelihood: 0.8 },
      wrist: { x: 0.5, y: 0.7, likelihood: 0.1 }, // low confidence
    };
    const result = analyzer.analyze(joints, {
      stage: 'UP',
      isPaused: false,
      elapsedMs: 300,
      elbowAngle: 160,
    });
    expect(result.isTracking).toBe(true);
    expect(result.feedback).toBe(FORM_MESSAGES.PARTIALLY_OCCLUDED);
  });

  test('reports EXTEND_ARMS in READY state if elbow angle is bent', () => {
    const joints = {
      shoulder: { x: 0.5, y: 0.3, likelihood: 0.9 },
      elbow: { x: 0.5, y: 0.5, likelihood: 0.9 },
      wrist: { x: 0.5, y: 0.7, likelihood: 0.9 },
    };
    const result = analyzer.analyze(joints, {
      stage: 'READY',
      isPaused: false,
      elapsedMs: 400,
      elbowAngle: 120, // bent arms
    });
    expect(result.feedback).toBe(FORM_MESSAGES.EXTEND_ARMS);
  });

  test('reports LOWER_FURTHER during DOWN stage if depth is shallow', () => {
    const joints = {
      shoulder: { x: 0.5, y: 0.3, likelihood: 0.9 },
      elbow: { x: 0.5, y: 0.5, likelihood: 0.9 },
      wrist: { x: 0.5, y: 0.7, likelihood: 0.9 },
    };
    const result = analyzer.analyze(joints, {
      stage: 'DOWN',
      isPaused: false,
      elapsedMs: 2000,
      elbowAngle: 115, // shallow descent
    });
    expect(result.feedback).toBe(FORM_MESSAGES.LOWER_FURTHER);
  });

  test('evaluates body alignment when shoulder, hip, ankle are provided', () => {
    // Perfectly aligned line
    const joints = {
      shoulder: { x: 0.2, y: 0.4, likelihood: 0.9 },
      elbow: { x: 0.3, y: 0.4, likelihood: 0.9 },
      wrist: { x: 0.4, y: 0.4, likelihood: 0.9 },
      hip: { x: 0.5, y: 0.4, likelihood: 0.9 },
      ankle: { x: 0.8, y: 0.4, likelihood: 0.9 },
    };
    const result = analyzer.analyze(joints, {
      stage: 'UP',
      isPaused: false,
      elapsedMs: 3500,
      elbowAngle: 165,
    });
    expect(result.isAligned).toBe(true);
    expect(result.alignmentAngle).toBe(180);
  });
});

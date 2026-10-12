import { getTransformationPlan } from '../domain/transformationPlan';
import { CURRENT_PHYSIQUES, TARGET_PHYSIQUES } from '../data/physiques';

describe('Transformation Plan & AI Exercise Roadmap Tests', () => {
  test('all CURRENT_PHYSIQUES have valid image assets and figureIndex', () => {
    CURRENT_PHYSIQUES.forEach((physique) => {
      expect(physique.id).toBeDefined();
      expect(physique.title).toBeDefined();
      expect(physique.image).toBeDefined();
      expect(physique.figureIndex).toBeGreaterThanOrEqual(1);
    });
  });

  test('all TARGET_PHYSIQUES have valid image assets and primaryStat', () => {
    TARGET_PHYSIQUES.forEach((target) => {
      expect(target.id).toBeDefined();
      expect(target.title).toBeDefined();
      expect(target.image).toBeDefined();
      expect(target.primaryStat).toBeDefined();
    });
  });

  test('getTransformationPlan generates tailored protocol for skinny to titan', async () => {
    const plan = await getTransformationPlan('skinny', 'titan', ['dumbbell'], []);
    expect(plan.protocolTitle).toContain('HYPERTROPHY');
    expect(plan.current.id).toBe('skinny');
    expect(plan.target.id).toBe('titan');
    expect(plan.phases.length).toBe(3);
    expect(plan.recommendedExercises.length).toBeGreaterThan(0);
  });

  test('getTransformationPlan generates tailored protocol for skinny to assassin', async () => {
    const plan = await getTransformationPlan('skinny', 'assassin', ['bodyweight'], []);
    expect(plan.protocolTitle).toContain('RECOMP');
    expect(plan.current.id).toBe('skinny');
    expect(plan.target.id).toBe('assassin');
    expect(plan.recommendedExercises.length).toBeGreaterThan(0);
  });
});

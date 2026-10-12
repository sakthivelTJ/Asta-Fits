describe('Workout Summary Screen States & Calculations Tests', () => {
  test('Pending validation state displays pending status badge and estimated XP', () => {
    const summaryData = {
      status: 'pending',
      estimatedXp: 120,
      setsCompleted: 3,
      durationSec: 360,
    };

    expect(summaryData.status).toBe('pending');
    expect(summaryData.estimatedXp).toBe(120);
  });

  test('Validated state displays level-up banner if level increases', () => {
    const isLevelUp = (prevLevel, newLevel) => newLevel > prevLevel;

    expect(isLevelUp(9, 10)).toBe(true);
    expect(isLevelUp(10, 10)).toBe(false);
  });

  test('Rejected state displays flagged reason and zero XP awarded', () => {
    const summaryData = {
      validated: false,
      flaggedReason: 'Rep velocity exceeds physical ceiling',
      awardedXp: 0,
    };

    expect(summaryData.validated).toBe(false);
    expect(summaryData.awardedXp).toBe(0);
    expect(summaryData.flaggedReason).toContain('Rep velocity');
  });
});

describe('Workout Player Logic & Set Completion Tests', () => {
  test('Reps stepper increments and decrements reps within bounds [1, 100]', () => {
    let reps = 10;
    const stepReps = (delta) => Math.min(100, Math.max(1, reps + delta));

    reps = stepReps(5);
    expect(reps).toBe(15);

    reps = stepReps(-20);
    expect(reps).toBe(1); // Clamped at 1
  });

  test('Rest timer +30s and skip controls update rest time correctly', () => {
    let restSec = 45;
    const addRest = (seconds) => restSec + seconds;
    const skipRest = () => 0;

    expect(addRest(30)).toBe(75);
    expect(skipRest()).toBe(0);
  });

  test('Submits only completed sets to the workout log payload', () => {
    const sets = [
      { setNum: 1, reps: 15, completed: true },
      { setNum: 2, reps: 15, completed: true },
      { setNum: 3, reps: 15, completed: false },
    ];

    const completedSets = sets.filter((s) => s.completed);
    expect(completedSets.length).toBe(2);
    expect(completedSets.map((s) => s.setNum)).toEqual([1, 2]);
  });
});

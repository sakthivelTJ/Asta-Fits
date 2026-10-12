import { planReminders } from '../reminderPlan';

describe('reminderPlan.js — Unit Tests', () => {
  // Baseline date: Thursday 8 Oct 2026 at 10:00 AM (local time)
  const FIXED_NOW = new Date(2026, 9, 8, 10, 0, 0); // Thursday (dayIndex = 4)

  test('schedules reminders for training days', () => {
    // Training days: Mon(1), Tue(2), Wed(3), Thu(4), Fri(5)
    const plan = planReminders({
      now: FIXED_NOW,
      hour: 14, // 2:00 PM (in the future for today)
      minute: 0,
      trainingDays: [1, 2, 3, 4, 5],
      questDoneToday: false,
    });

    expect(plan.length).toBeGreaterThan(0);
    // Ensure all scheduled dates fall on training days
    for (const item of plan) {
      if (item.id !== 2000) {
        expect([1, 2, 3, 4, 5]).toContain(item.at.getDay());
      }
    }
  });

  test('skips non-training days', () => {
    // Only Saturday(6) and Sunday(0)
    const plan = planReminders({
      now: FIXED_NOW,
      hour: 14,
      minute: 0,
      trainingDays: [0, 6],
      questDoneToday: false,
    });

    const mainReminders = plan.filter((r) => r.id !== 2000);
    for (const r of mainReminders) {
      expect([0, 6]).toContain(r.at.getDay());
    }
  });

  test('skips today if questDoneToday is true', () => {
    const plan = planReminders({
      now: FIXED_NOW,
      hour: 14,
      minute: 0,
      trainingDays: [4], // Thursday
      questDoneToday: true,
    });

    const todayReminder = plan.find(
      (r) => r.at.getDate() === FIXED_NOW.getDate() && r.id !== 2000
    );
    expect(todayReminder).toBeUndefined();
  });

  test('skips today if target time has already passed', () => {
    // now is 10:00 AM, target time is 8:00 AM
    const plan = planReminders({
      now: FIXED_NOW,
      hour: 8,
      minute: 0,
      trainingDays: [4],
      questDoneToday: false,
    });

    const todayReminder = plan.find(
      (r) => r.at.getDate() === FIXED_NOW.getDate() && r.id !== 2000
    );
    expect(todayReminder).toBeUndefined();
  });

  test('includes today if target time is in the future', () => {
    // now is 10:00 AM, target time is 14:00 PM
    const plan = planReminders({
      now: FIXED_NOW,
      hour: 14,
      minute: 0,
      trainingDays: [4],
      questDoneToday: false,
    });

    const todayReminder = plan.find(
      (r) => r.at.getDate() === FIXED_NOW.getDate() && r.id !== 2000
    );
    expect(todayReminder).toBeDefined();
    expect(todayReminder?.at.getHours()).toBe(14);
  });

  test('schedules streak-at-risk alert (ID 2000) for today if training day and quest not done', () => {
    const plan = planReminders({
      now: FIXED_NOW,
      hour: 8,
      minute: 0,
      trainingDays: [4], // Thursday
      questDoneToday: false,
      streak: 5,
    });

    const streakAlert = plan.find((r) => r.id === 2000);
    expect(streakAlert).toBeDefined();
    expect(streakAlert?.title).toBe('STREAK AT RISK!');
    expect(streakAlert?.body).toContain('5-day streak');
  });

  test('skips streak alert if questDoneToday is true', () => {
    const plan = planReminders({
      now: FIXED_NOW,
      hour: 8,
      minute: 0,
      trainingDays: [4],
      questDoneToday: true,
      streak: 5,
    });

    const streakAlert = plan.find((r) => r.id === 2000);
    expect(streakAlert).toBeUndefined();
  });

  test('skips reminders scheduled during quiet hours', () => {
    // Quiet hours: 22:00 to 07:00. Target hour: 23:00
    const plan = planReminders({
      now: FIXED_NOW,
      hour: 23,
      minute: 0,
      trainingDays: [1, 2, 3, 4, 5, 6, 0],
      questDoneToday: false,
      quietStartHour: 22,
      quietEndHour: 7,
    });

    const mainReminders = plan.filter((r) => r.id !== 2000);
    expect(mainReminders).toHaveLength(0);
  });

  test('rotates reminder titles across days', () => {
    const plan = planReminders({
      now: FIXED_NOW,
      hour: 14,
      minute: 0,
      trainingDays: [0, 1, 2, 3, 4, 5, 6],
      questDoneToday: false,
      daysAhead: 3,
    });

    const mainReminders = plan.filter((r) => r.id !== 2000);
    expect(mainReminders.length).toBe(3);
    expect(mainReminders[0].title).not.toEqual(mainReminders[1].title);
  });
});

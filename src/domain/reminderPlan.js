/**
 * reminderPlan.js — Pure JS reminder scheduling logic.
 * Zero React Native or Expo imports. 100% unit-testable.
 */

const REMINDER_TITLES = [
  'Surpass your limits today!',
  'My magic is never giving up!',
  'Grimoire quest awaits!',
];

const REMINDER_BODIES = [
  'Asta is ready. Time to conquer today\'s anti-magic workout!',
  'Log your daily workout and keep your streak alive!',
  'Train hard like a Black Bull magic knight today!',
];

/**
 * Checks if a given hour falls inside quiet hours (e.g., 22:00 to 07:00).
 */
function isQuietHour(hour, quietStartHour = 22, quietEndHour = 7) {
  if (quietStartHour > quietEndHour) {
    // Overnight quiet hours (e.g. 22 to 7)
    return hour >= quietStartHour || hour < quietEndHour;
  }
  return hour >= quietStartHour && hour < quietEndHour;
}

/**
 * Plan reminders for upcoming days.
 *
 * @param {Object} options
 * @param {Date} options.now Current Date
 * @param {number} options.hour Reminder hour (0-23)
 * @param {number} options.minute Reminder minute (0-59)
 * @param {number[]} options.trainingDays Array of day indices (0=Sun, 1=Mon, ..., 6=Sat)
 * @param {boolean} [options.questDoneToday=false] Whether today's quest is completed
 * @param {number} [options.streak=0] Current streak count
 * @param {number} [options.daysAhead=7] How many days ahead to schedule
 * @param {number} [options.streakAlertHour=20] Hour for streak alert
 * @param {number} [options.streakAlertMinute=0] Minute for streak alert
 * @param {number} [options.quietStartHour=22] Start of quiet hours
 * @param {number} [options.quietEndHour=7] End of quiet hours
 * @returns {Array<{ id: number, at: Date, title: string, body: string }>}
 */
export function planReminders({
  now = new Date(),
  hour = 8,
  minute = 0,
  trainingDays = [1, 2, 3, 4, 5],
  questDoneToday = false,
  streak = 0,
  daysAhead = 7,
  streakAlertHour = 20,
  streakAlertMinute = 0,
  quietStartHour = 22,
  quietEndHour = 7,
}) {
  const plan = [];

  for (let offset = 0; offset < daysAhead; offset++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + offset);
    targetDate.setHours(hour, minute, 0, 0);

    const dayIndex = targetDate.getDay();

    // Check if this day is a training day
    if (!trainingDays.includes(dayIndex)) {
      continue;
    }

    // Today's special checks
    if (offset === 0) {
      if (questDoneToday) {
        continue; // Quest already completed today
      }
      if (targetDate.getTime() <= now.getTime()) {
        continue; // Scheduled time for today has already passed
      }
    }

    // Quiet hours check
    if (isQuietHour(targetDate.getHours(), quietStartHour, quietEndHour)) {
      continue;
    }

    const themeIndex = offset % REMINDER_TITLES.length;
    plan.push({
      id: 1000 + offset,
      at: targetDate,
      title: REMINDER_TITLES[themeIndex],
      body: REMINDER_BODIES[themeIndex],
    });
  }

  // Streak-at-risk Alert (ID 2000) for today if training day, quest not done, and before 20:00
  const todayDayIndex = now.getDay();
  if (trainingDays.includes(todayDayIndex) && !questDoneToday) {
    const streakAlertDate = new Date(now);
    streakAlertDate.setHours(streakAlertHour, streakAlertMinute, 0, 0);

    if (now.getTime() < streakAlertDate.getTime()) {
      if (!isQuietHour(streakAlertDate.getHours(), quietStartHour, quietEndHour)) {
        plan.push({
          id: 2000,
          at: streakAlertDate,
          title: 'STREAK AT RISK!',
          body: `Your ${streak}-day streak is in danger! Complete today's quest before midnight to keep your progress.`,
        });
      }
    }
  }

  return plan;
}

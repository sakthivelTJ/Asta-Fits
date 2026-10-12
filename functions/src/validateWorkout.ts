import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const MAX_REPS_PER_MINUTE: Record<string, number> = {
  pushup_std: 60,
  squat_air: 70,
  plank_std: 0, // duration-based
  shadow_boxing: 120,
  default: 80,
};

function xpToNext(level: number): number {
  return 80 + 25 * level + 2 * level * level;
}

function dailyTargetXp(level: number): number {
  return 100 + 6 * level;
}

export const validateWorkout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required.');
  }

  const uid = context.auth.uid;
  const { workoutId } = data;

  if (!workoutId) {
    throw new functions.https.HttpsError('invalid-argument', 'workoutId required.');
  }

  const db = admin.firestore();
  const userRef = db.collection('users').doc(uid);
  const workoutRef = userRef.collection('workouts').doc(workoutId);

  const [userSnap, workoutSnap] = await Promise.all([
    userRef.get(),
    workoutRef.get(),
  ]);

  if (!userSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Hunter not found.');
  }
  if (!workoutSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Workout not found.');
  }

  const user = userSnap.data()!;
  const workout = workoutSnap.data()!;

  if (workout.validated) {
    return { status: 'already-validated' };
  }

  // ----- Anti-Cheat Plausibility Checks -----
  const startMs: number = workout.startedAt?.toMillis() || 0;
  const endMs: number = workout.endedAt?.toMillis() || Date.now();
  const durationSec = (endMs - startMs) / 1000;
  const tasks: any[] = workout.tasks || [];

  let cheatFlag = false;
  let cheatReason = '';

  // 1. Minimum duration (at least 30 seconds per task-set)
  const totalSets = tasks.reduce((acc: number, t: any) => acc + (t.completedSets || 0), 0);
  if (totalSets > 0 && durationSec < totalSets * 30) {
    cheatFlag = true;
    cheatReason = `Workout too short: ${durationSec}s for ${totalSets} sets`;
  }

  // 2. Rep velocity ceiling per exercise
  for (const task of tasks) {
    const ceiling = MAX_REPS_PER_MINUTE[task.exerciseId] || MAX_REPS_PER_MINUTE.default;
    if (ceiling > 0) {
      const rpmActual = ((task.completedReps || 0) / (durationSec / 60));
      if (rpmActual > ceiling * 1.2) {
        cheatFlag = true;
        cheatReason = `Rep velocity too high on ${task.exerciseId}: ${rpmActual.toFixed(0)} rpm`;
        break;
      }
    }
  }

  if (cheatFlag) {
    await workoutRef.update({ validated: true, cheatFlag: true, cheatReason, xpAwarded: 0 });
    return { status: 'flagged', reason: cheatReason };
  }

  // ----- XP Calculation (Phase 4) -----
  const todayStr = new Date().toISOString().split('T')[0];
  const questRef = userRef.collection('dailyQuests').doc(workout.date || todayStr);
  const questSnap = await questRef.get();
  const quest = questSnap.exists ? questSnap.data()! : null;

  let totalXp = 0;
  const prExercises: string[] = [];
  const questTaskUpdates: Record<string, any> = {};

  for (const task of tasks) {
    if (task.credited) continue; // Duplicate protection

    const target = task.targetReps || 1;
    const completed = task.completedReps || 0;
    const ratio = Math.min(1.2, completed / target);

    if (ratio < 0.5) continue; // Phase 4 partial threshold

    const taskXp = Math.round(task.xpReward * ratio);
    totalXp += taskXp;

    questTaskUpdates[`tasks`] = tasks.map((t: any) =>
      t.id === task.id ? { ...t, credited: true } : t
    );

    // PR check
    const prKey = `prs.${task.exerciseId}`;
    const currentPr: number = user.prs?.[task.exerciseId] || 0;
    if (completed > currentPr) {
      prExercises.push(task.exerciseId);
      await userRef.update({ [prKey]: completed });
      totalXp += 15; // PR bonus
    }
  }

  // Warm-up + Cool-down bonus (+25%)
  if (workout.warmUpDone && workout.coolDownDone) {
    totalXp = Math.round(totalXp * 1.25);
  }

  // Streak bonus (+1% per streak day, max +30%)
  const streak: number = user.streak?.current || 0;
  const streakMult = 1 + Math.min(0.3, streak * 0.01);
  totalXp = Math.round(totalXp * streakMult);

  // Daily XP cap: 1.5 × dailyTarget
  const dailyCap = Math.round(1.5 * dailyTargetXp(user.level || 1));
  const xpEarnedToday: number = user.xpEarnedToday || 0;
  const xpAvailable = Math.max(0, dailyCap - xpEarnedToday);
  const xpAwarded = Math.min(totalXp, xpAvailable);

  // ----- Level up check -----
  let newXp = (user.xp || 0) + xpAwarded;
  let newLevel = user.level || 1;
  let levelsGained = 0;

  while (newXp >= xpToNext(newLevel) && newLevel < 100) {
    newXp -= xpToNext(newLevel);
    newLevel++;
    levelsGained++;
  }

  // ----- Stat gains -----
  const statGains: Record<string, number> = {};
  for (const task of tasks) {
    const ratio = Math.min(1.2, (task.completedReps || 0) / (task.targetReps || 1));
    if (ratio < 0.5) continue;
    if (['pushup_std', 'dumbbell_press'].includes(task.exerciseId)) {
      statGains.strength = (statGains.strength || 0) + Math.round(3 * ratio * (1 / (1 + 0.01 * (user.stats?.strength || 0))));
    }
    if (['squat_air', 'lunge'].includes(task.exerciseId)) {
      statGains.endurance = (statGains.endurance || 0) + Math.round(3 * ratio * (1 / (1 + 0.01 * (user.stats?.endurance || 0))));
    }
    if (['plank_std'].includes(task.exerciseId)) {
      statGains.core = (statGains.core || 0) + Math.round(3 * ratio * (1 / (1 + 0.01 * (user.stats?.core || 0))));
    }
  }

  // ----- Streak update -----
  const lastDate: string = user.streak?.lastCompletedDate || '';
  const isConsecutive = lastDate === (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  const newStreak = isConsecutive ? streak + 1 : 1;

  // ----- Batch write -----
  const batch = db.batch();

  const statUpdatePaths: Record<string, admin.firestore.FieldValue | number> = {};
  for (const [stat, gain] of Object.entries(statGains)) {
    statUpdatePaths[`stats.${stat}`] = admin.firestore.FieldValue.increment(gain);
  }

  batch.update(userRef, {
    xp: newXp,
    level: newLevel,
    xpEarnedToday: xpEarnedToday + xpAwarded,
    'streak.current': newStreak,
    'streak.lastCompletedDate': todayStr,
    totalWorkouts: admin.firestore.FieldValue.increment(1),
    ...statUpdatePaths,
  });

  batch.update(workoutRef, {
    validated: true,
    xpAwarded,
    levelsGained,
    statGains,
    prExercises,
    validatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (questSnap.exists) {
    batch.update(questRef, {
      status: xpAwarded > 0 ? 'completed' : 'partial',
      tasks: questTaskUpdates.tasks || quest?.tasks,
    });
  }

  await batch.commit();

  return {
    status: 'validated',
    xpAwarded,
    levelsGained,
    newLevel,
    newStreak,
    statGains,
    prExercises,
  };
});

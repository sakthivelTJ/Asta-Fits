import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const ensureDailyQuest = functions.runWith({ maxInstances: 10 }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const todayStr = new Date().toISOString().split('T')[0];

  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Hunter profile not found.');
  }

  const user = userSnap.data()!;

  // --- Settle missed days first ---
  const lastCompleted: string = user.streak?.lastCompletedDate || todayStr;
  const lastDate = new Date(lastCompleted);
  const today = new Date(todayStr);
  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);

  if (daysDiff >= 2) {
    const restDays: number[] = user.settings?.restDays || [];
    const shields: number = user.streak?.shields || 0;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDay = yesterday.getDay();

    if (!restDays.includes(yesterdayDay)) {
      if (shields > 0) {
        await userRef.update({ 'streak.shields': admin.firestore.FieldValue.increment(-1) });
      } else if (user.level >= 10) {
        // Phase 4 mild penalty: lose 10% of current-level XP progress
        const currentXp: number = user.xp || 0;
        const penalty = Math.floor(currentXp * 0.1);
        await userRef.update({
          xp: Math.max(0, currentXp - penalty),
          'streak.current': 0,
        });
      } else {
        // Beginner protection: only reset streak, no XP loss
        await userRef.update({ 'streak.current': 0 });
      }
    }
  }

  // --- Check if today's quest already exists ---
  const questRef = userRef.collection('dailyQuests').doc(todayStr);
  const questSnap = await questRef.get();
  if (questSnap.exists) {
    return { status: 'exists', date: todayStr };
  }

  // --- Generate today's quest ---
  const level: number = user.level || 1;
  const trainingDays: number[] = user.trainingDays || [1, 2, 3, 4];
  const todayDayIndex = new Date().getDay();
  const isTrainingDay = trainingDays.includes(todayDayIndex);

  // Deload check (every 4th week)
  const weekNumber = Math.ceil((Math.floor((Date.now() - new Date('2026-01-01').getTime()) / 86400000)) / 7);
  const isDeload = weekNumber % 4 === 0;
  const volumeMult = isDeload ? 0.7 : 1.0;

  const pushupReps = Math.round((level > 5 ? 15 : 10) * volumeMult);
  const squatReps = Math.round((level > 5 ? 20 : 12) * volumeMult);
  const levelScale = 1 + 0.06 * (level - 1);

  const tasks = isTrainingDay ? [
    {
      id: `t1_${todayStr}`,
      exerciseId: 'pushup_std',
      title: 'Anti-Magic Compound Push',
      type: 'compound',
      typeMult: 1.2,
      difficulty: 3,
      targetSets: 3,
      targetReps: pushupReps,
      completedReps: 0,
      credited: false,
      xpReward: Math.round(20 * 1.2 * 1.0 * levelScale),
    },
    {
      id: `t2_${todayStr}`,
      exerciseId: 'squat_air',
      title: 'Black Bull Leg Surge',
      type: 'compound',
      typeMult: 1.2,
      difficulty: 3,
      targetSets: 3,
      targetReps: squatReps,
      completedReps: 0,
      credited: false,
      xpReward: Math.round(20 * 1.2 * 1.0 * levelScale),
    },
    {
      id: `t3_${todayStr}`,
      exerciseId: 'plank_std',
      title: 'Willpower Core Hold',
      type: 'core',
      typeMult: 0.9,
      difficulty: 2,
      targetSets: 3,
      targetDurationSec: 45,
      completedDurationSec: 0,
      credited: false,
      xpReward: Math.round(20 * 0.9 * 0.9 * levelScale),
    },
  ] : [
    {
      id: `rec_${todayStr}`,
      exerciseId: 'shadow_boxing',
      title: 'Recovery Mobility Session',
      type: 'mobility',
      typeMult: 0.6,
      difficulty: 1,
      targetSets: 2,
      targetReps: 10,
      completedReps: 0,
      credited: false,
      xpReward: Math.round(20 * 0.6 * 0.8 * levelScale),
    },
  ];

  await questRef.set({
    date: todayStr,
    status: 'active',
    isTrainingDay,
    isDeloadWeek: isDeload,
    warmUpDone: false,
    coolDownDone: false,
    bonusClaimed: false,
    tasks,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { status: 'generated', date: todayStr };
});

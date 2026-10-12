import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const applyPenalties = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const usersSnap = await db.collection('users').get();

    for (const doc of usersSnap.docs) {
      const userData = doc.data();
      const settings = userData.settings || {};
      const restDays = settings.restDays || [];
      const currentDayOfWeek = yesterday.getDay(); // 0 = Sun, 1 = Mon...

      // Skip penalty if yesterday was a planned rest day
      if (restDays.includes(currentDayOfWeek)) {
        continue;
      }

      const questSnap = await db
        .collection('users')
        .doc(doc.id)
        .collection('dailyQuests')
        .doc(yesterdayStr)
        .get();

      if (questSnap.exists) {
        const questData = questSnap.data() || {};
        if (questData.status === 'active') {
          // Missed day detected
          const shields = userData.streak?.shields || 0;
          if (shields > 0) {
            // Spend a streak shield
            await doc.ref.update({
              'streak.shields': admin.firestore.FieldValue.increment(-1),
            });
            await questSnap.ref.update({ status: 'missed_shielded' });
          } else {
            // Apply gentle penalty
            await doc.ref.update({
              'streak.current': 0,
            });
            await questSnap.ref.update({ status: 'missed' });
          }
        }
      }
    }
    return null;
  });

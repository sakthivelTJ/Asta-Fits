"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyQuests = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
exports.generateDailyQuests = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
    const db = admin.firestore();
    const dateStr = new Date().toISOString().split('T')[0];
    const usersSnap = await db.collection('users').get();
    const batch = db.batch();
    usersSnap.docs.forEach((doc) => {
        const userData = doc.data();
        const level = userData.level || 1;
        const questRef = db.collection('users').doc(doc.id).collection('dailyQuests').doc(dateStr);
        const questData = {
            date: dateStr,
            status: 'active',
            bonusClaimed: false,
            tasks: [
                {
                    id: `q_1_${dateStr}`,
                    exerciseId: 'pushup_std',
                    type: 'reps',
                    targetSets: 3,
                    targetReps: level > 5 ? 15 : 10,
                    completed: false,
                    xpReward: 150,
                },
                {
                    id: `q_2_${dateStr}`,
                    exerciseId: 'plank_std',
                    type: 'duration',
                    targetSets: 3,
                    targetDurationSec: 60,
                    completed: false,
                    xpReward: 120,
                },
            ],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        batch.set(questRef, questData, { merge: true });
    });
    await batch.commit();
    console.log(`Generated daily quests for ${usersSnap.size} users for date ${dateStr}`);
    return null;
});
//# sourceMappingURL=generateDailyQuests.js.map
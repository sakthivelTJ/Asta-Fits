"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncHealthDay = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const health_1 = require("./health");
/**
 * syncHealthDay — Callable Cloud Function
 *
 * Accepts { date, steps, sleepMinutes } from the client.
 * Validates input, then uses a Firestore transaction to:
 *   1. Read the user doc and the healthDays/{date} doc.
 *   2. Compute the raw vitality for the day.
 *   3. Award only the increment above what's already been credited (idempotent).
 *   4. A lower value sent later in the day never takes points back.
 *   5. Write healthDays/{date} and update stats.vitality atomically.
 *
 * Only two numbers leave the phone from health data: steps and sleepMinutes.
 */
exports.syncHealthDay = functions.runWith({ maxInstances: 10 }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required.');
    }
    const uid = context.auth.uid;
    const { date, steps, sleepMinutes } = data;
    // Server-side date (UTC)
    const serverToday = new Date().toISOString().split('T')[0];
    // Validate inputs
    const validationError = (0, health_1.validateHealthInput)(date, steps, sleepMinutes, serverToday);
    if (validationError) {
        throw new functions.https.HttpsError('invalid-argument', validationError);
    }
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const healthDayRef = userRef.collection('healthDays').doc(date);
    let vitalityGained = 0;
    await db.runTransaction(async (tx) => {
        const [userSnap, healthDaySnap] = await Promise.all([
            tx.get(userRef),
            tx.get(healthDayRef),
        ]);
        if (!userSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Hunter profile not found.');
        }
        const user = userSnap.data();
        const currentVitality = user.stats?.vitality ?? 0;
        // How much raw has already been awarded for this day?
        const alreadyAwardedRaw = healthDaySnap.exists
            ? (healthDaySnap.data().awardedRaw ?? 0)
            : 0;
        // Compute today's raw and the delta
        const rawToday = (0, health_1.vitalityRawForDay)(steps, sleepMinutes);
        const delta = (0, health_1.vitalityDelta)(rawToday, alreadyAwardedRaw, currentVitality);
        vitalityGained = delta;
        const newAwardedRaw = alreadyAwardedRaw + Math.max(0, rawToday - alreadyAwardedRaw);
        const newVitality = Math.round((currentVitality + delta) * 100) / 100;
        // Write healthDays doc
        tx.set(healthDayRef, {
            date,
            steps,
            sleepMinutes,
            awardedRaw: newAwardedRaw,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Only update vitality if there's something to add
        if (delta > 0) {
            tx.update(userRef, {
                'stats.vitality': newVitality,
                'settings.healthConnected': true,
            });
        }
    });
    return { vitalityGained };
});
//# sourceMappingURL=syncHealthDay.js.map
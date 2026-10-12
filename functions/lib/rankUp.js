"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankUpTrial = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
exports.rankUpTrial = functions.firestore
    .document('users/{uid}/trials/{trialId}')
    .onCreate(async (snapshot, context) => {
    const trialData = snapshot.data();
    const { uid } = context.params;
    if (!trialData || trialData.status !== 'completed_proposal') {
        return null;
    }
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    // Verify trial conditions and advance rank
    const targetRank = trialData.targetRank || 'D';
    await userRef.update({
        rank: targetRank,
        title: `${targetRank}-Rank Magic Knight`,
        lastRankUpAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return snapshot.ref.update({
        status: 'verified',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
});
//# sourceMappingURL=rankUp.js.map
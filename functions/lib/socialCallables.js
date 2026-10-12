"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMyAccount = exports.getFriendsLeaderboard = exports.removeFriend = exports.addFriendByCode = exports.getMyFriendCode = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const social_1 = require("./social");
const runtimeOpts = {
    maxInstances: 10,
};
/**
 * getMyFriendCode — Callable Cloud Function
 * Generates (if needed) and returns caller's friend code.
 */
exports.getMyFriendCode = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required.');
    }
    const uid = context.auth.uid;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const existingCode = userSnap.data()?.friendCode;
    if (existingCode) {
        return { friendCode: existingCode };
    }
    // Generate code with up to 8 retries on collision
    let assignedCode = null;
    for (let attempt = 0; attempt < 8; attempt++) {
        const candidate = (0, social_1.generateFriendCode)();
        const codeRef = db.collection('friendCodes').doc(candidate);
        try {
            await db.runTransaction(async (tx) => {
                const codeSnap = await tx.get(codeRef);
                if (codeSnap.exists) {
                    throw new Error('COLLISION');
                }
                tx.set(codeRef, {
                    uid,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                tx.update(userRef, { friendCode: candidate });
            });
            assignedCode = candidate;
            break;
        }
        catch (err) {
            if (err.message === 'COLLISION') {
                continue; // Retry with a new random code
            }
            throw err;
        }
    }
    if (!assignedCode) {
        throw new functions.https.HttpsError('resource-exhausted', 'Failed to generate unique friend code after multiple retries.');
    }
    return { friendCode: assignedCode };
});
/**
 * addFriendByCode — Callable Cloud Function
 * Adds a friend by code, creating bilateral friend records.
 */
exports.addFriendByCode = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required.');
    }
    const callerUid = context.auth.uid;
    const rawCode = data?.code || '';
    const code = (0, social_1.normalizeCode)(rawCode);
    if (!(0, social_1.isValidCode)(code)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid friend code format.');
    }
    const db = admin.firestore();
    // 1. Look up code in friendCodes/{code}
    const codeSnap = await db.collection('friendCodes').doc(code).get();
    if (!codeSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Friend code not found.');
    }
    const targetUid = codeSnap.data()?.uid;
    if (!targetUid) {
        throw new functions.https.HttpsError('not-found', 'Friend code user not found.');
    }
    if (targetUid === callerUid) {
        throw new functions.https.HttpsError('invalid-argument', 'Cannot add yourself as a friend.');
    }
    // 2. Check caller's friend count limit
    const callerFriendsRef = db.collection('users').doc(callerUid).collection('friends');
    const callerFriendsSnap = await callerFriendsRef.get();
    if (callerFriendsSnap.size >= social_1.MAX_FRIENDS) {
        throw new functions.https.HttpsError('resource-exhausted', `Friend limit reached (max ${social_1.MAX_FRIENDS}).`);
    }
    // 3. Check if already friends
    const existingFriendSnap = await callerFriendsRef.doc(targetUid).get();
    if (existingFriendSnap.exists) {
        throw new functions.https.HttpsError('already-exists', 'You are already friends with this hunter.');
    }
    // 4. Create bilateral friend docs
    const batch = db.batch();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const callerToTargetRef = db.collection('users').doc(callerUid).collection('friends').doc(targetUid);
    const targetToCallerRef = db.collection('users').doc(targetUid).collection('friends').doc(callerUid);
    batch.set(callerToTargetRef, { since: timestamp });
    batch.set(targetToCallerRef, { since: timestamp });
    await batch.commit();
    return { success: true, targetUid };
});
/**
 * removeFriend — Callable Cloud Function
 * Removes a friend, deleting bilateral friend records.
 */
exports.removeFriend = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required.');
    }
    const callerUid = context.auth.uid;
    const targetUid = data?.uid;
    if (!targetUid || typeof targetUid !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Target user UID required.');
    }
    const db = admin.firestore();
    const batch = db.batch();
    const callerToTargetRef = db.collection('users').doc(callerUid).collection('friends').doc(targetUid);
    const targetToCallerRef = db.collection('users').doc(targetUid).collection('friends').doc(callerUid);
    batch.delete(callerToTargetRef);
    batch.delete(targetToCallerRef);
    await batch.commit();
    return { success: true };
});
/**
 * getFriendsLeaderboard — Callable Cloud Function
 * Returns weekly leaderboard for caller and their friends.
 */
exports.getFriendsLeaderboard = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required.');
    }
    const callerUid = context.auth.uid;
    const dateStr = data?.date || new Date().toISOString();
    const weekKey = (0, social_1.isoWeekKey)(new Date(dateStr));
    const db = admin.firestore();
    // Get caller's friends (limit MAX_FRIENDS)
    const friendsSnap = await db.collection('users').doc(callerUid).collection('friends').limit(social_1.MAX_FRIENDS).get();
    const friendUids = friendsSnap.docs.map((doc) => doc.id);
    // Include caller
    const allUids = Array.from(new Set([callerUid, ...friendUids]));
    // Fetch all user docs
    const userSnaps = await Promise.all(allUids.map((id) => db.collection('users').doc(id).get()));
    const rawUsers = [];
    for (const snap of userSnaps) {
        if (snap.exists) {
            const data = snap.data();
            rawUsers.push({
                uid: snap.id,
                displayName: data.displayName,
                rank: data.rank,
                level: data.level,
                weekly: data.weekly,
                settings: data.settings,
            });
        }
    }
    const entries = (0, social_1.buildLeaderboard)(rawUsers, weekKey, callerUid);
    return { weekKey, entries };
});
/**
 * deleteMyAccount — Callable Cloud Function
 * Deletes caller's account, removing bilateral friend docs, friendCode, user data, and Auth user.
 */
exports.deleteMyAccount = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required.');
    }
    const callerUid = context.auth.uid;
    const confirm = data?.confirm;
    if (confirm !== 'DELETE') {
        throw new functions.https.HttpsError('invalid-argument', 'Must type DELETE to confirm account deletion.');
    }
    const db = admin.firestore();
    const userRef = db.collection('users').doc(callerUid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const userData = userSnap.data();
    const friendCode = userData.friendCode;
    // 1. Delete bilateral friend records in other users' friends subcollections
    const friendsSnap = await userRef.collection('friends').get();
    const friendUids = friendsSnap.docs.map((d) => d.id);
    const batch = db.batch();
    for (const fUid of friendUids) {
        batch.delete(db.collection('users').doc(fUid).collection('friends').doc(callerUid));
    }
    // 2. Delete friend code mapping if exists
    if (friendCode) {
        batch.delete(db.collection('friendCodes').doc(friendCode));
    }
    await batch.commit();
    // 3. Delete user document and all subcollections
    await db.recursiveDelete(userRef);
    // 4. Delete Firebase Auth user
    await admin.auth().deleteUser(callerUid);
    return { success: true };
});
//# sourceMappingURL=socialCallables.js.map
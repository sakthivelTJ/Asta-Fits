"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awardXp = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const social_1 = require("./social");
exports.awardXp = functions.firestore
    .document('users/{uid}/workouts/{workoutId}')
    .onCreate(async (snapshot, context) => {
    const workoutData = snapshot.data();
    const { uid } = context.params;
    if (!workoutData || workoutData.validated === true) {
        return null;
    }
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        return null;
    }
    const userData = userSnap.data() || {};
    const currentLevel = userData.level || 1;
    const currentXp = userData.xp || 0;
    const trialPassed = userData.trialPassed || false;
    // --- PHASE 4 ANTI-CHEAT PLAUSIBILITY CHECKS ---
    const durationSec = workoutData.durationSec || 0;
    const sets = workoutData.sets || [];
    // 1. Minimum duration check (at least 5s per logged set)
    if (sets.length > 0 && durationSec < sets.length * 5) {
        return snapshot.ref.update({
            validated: false,
            flaggedReason: 'Plausibility Check Failed: Workout duration too short for logged set count.',
        });
    }
    // 2. Reps per minute speed ceiling check (max 60 reps/min)
    let totalReps = 0;
    sets.forEach((s) => { totalReps += (s.reps || 0); });
    const workoutMinutes = Math.max(1, durationSec / 60);
    if (totalReps / workoutMinutes > 60) {
        return snapshot.ref.update({
            validated: false,
            flaggedReason: 'Plausibility Check Failed: Rep velocity exceeds physical ceiling (60 reps/min).',
        });
    }
    // Calculate Task XP with level scale
    const levelScale = 1 + 0.06 * (currentLevel - 1);
    let rawXp = 0;
    sets.forEach((s) => {
        const reps = Math.min(100, Math.max(1, s.reps || 0));
        const weight = Math.min(300, Math.max(0, s.weight || 0));
        rawXp += Math.round((reps * 4 + weight * 2) * levelScale);
    });
    // Enforce Daily Anti-Overtraining Cap (1.5x dailyTargetXp)
    const dailyTarget = 100 + 6 * currentLevel;
    const dailyCap = Math.floor(1.5 * dailyTarget);
    const awardedXp = Math.min(dailyCap, rawXp);
    // Rank Gate Check (Freeze XP at level gates 9, 24, 44, 69, 99 until boss trial passed)
    const rankGateLevels = [9, 24, 44, 69, 99];
    let newLevel = currentLevel;
    let newXp = currentXp + awardedXp;
    let xpToNext = 80 + 25 * newLevel + 2 * newLevel * newLevel;
    if (!rankGateLevels.includes(currentLevel) || trialPassed) {
        while (newXp >= xpToNext) {
            if (rankGateLevels.includes(newLevel) && !trialPassed) {
                newXp = xpToNext; // Freeze XP at gate level
                break;
            }
            newXp -= xpToNext;
            newLevel += 1;
            xpToNext = 80 + 25 * newLevel + 2 * newLevel * newLevel;
        }
    }
    // Determine Rank
    let rank = 'E';
    let title = 'Magicless Novice Trainee';
    if (newLevel >= 76) {
        rank = 'S';
        title = 'Devil Union Monarch Hunter';
    }
    else if (newLevel >= 51) {
        rank = 'A';
        title = 'Black Bull Vice Captain';
    }
    else if (newLevel >= 31) {
        rank = 'B';
        title = 'Senior Magic Knight';
    }
    else if (newLevel >= 16) {
        rank = 'C';
        title = 'Junior Magic Knight';
    }
    else if (newLevel >= 6) {
        rank = 'D';
        title = 'Black Bull Recruit';
    }
    // Calculate weekly XP update
    const currentWeekKey = (0, social_1.isoWeekKey)();
    const updatedWeekly = (0, social_1.weeklyXpUpdate)(userData.weekly, currentWeekKey, awardedXp);
    // Atomic update user stats, level, and weekly XP
    await userRef.update({
        level: newLevel,
        xp: newXp,
        rank,
        title,
        weekly: updatedWeekly,
        'streak.current': admin.firestore.FieldValue.increment(1),
        'streak.lastCompletedDate': new Date().toISOString().split('T')[0],
        lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return snapshot.ref.update({
        validated: true,
        totalXp: awardedXp,
        validatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
});
//# sourceMappingURL=awardXp.js.map
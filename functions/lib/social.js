"use strict";
/**
 * social.ts — Pure logic for friend codes, weekly XP tracking, and leaderboards.
 * No Firebase dependencies. 100% unit testable.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_FRIENDS = exports.FRIEND_CODE_ALPHABET = void 0;
exports.generateFriendCode = generateFriendCode;
exports.formatFriendCode = formatFriendCode;
exports.normalizeCode = normalizeCode;
exports.isValidCode = isValidCode;
exports.isoWeekKey = isoWeekKey;
exports.weeklyXpUpdate = weeklyXpUpdate;
exports.buildLeaderboard = buildLeaderboard;
exports.FRIEND_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
exports.MAX_FRIENDS = 50;
/**
 * Generate a random 8-character friend code from FRIEND_CODE_ALPHABET.
 * @param pick Random index picker function (0 to maxIndex inclusive) for testability.
 */
function generateFriendCode(pick = (max) => Math.floor(Math.random() * max)) {
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += exports.FRIEND_CODE_ALPHABET[pick(exports.FRIEND_CODE_ALPHABET.length - 1)];
    }
    return code;
}
/**
 * Format friend code as XXXX-XXXX for presentation.
 */
function formatFriendCode(code) {
    const norm = normalizeCode(code);
    if (norm.length !== 8)
        return norm;
    return `${norm.slice(0, 4)}-${norm.slice(4)}`;
}
/**
 * Normalize code input: strip whitespace, hyphens, uppercase.
 */
function normalizeCode(input) {
    if (!input)
        return '';
    return input.trim().toUpperCase().replace(/[\s-]/g, '');
}
/**
 * Check if a normalized string is a valid 8-character code.
 */
function isValidCode(code) {
    const norm = normalizeCode(code);
    if (norm.length !== 8)
        return false;
    for (const char of norm) {
        if (!exports.FRIEND_CODE_ALPHABET.includes(char))
            return false;
    }
    return true;
}
/**
 * Get ISO week key in "YYYY-Www" format (e.g. "2026-W41").
 */
function isoWeekKey(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    const weekStr = weekNo < 10 ? `0${weekNo}` : `${weekNo}`;
    return `${d.getUTCFullYear()}-W${weekStr}`;
}
/**
 * Compute updated weekly XP object when XP is gained.
 */
function weeklyXpUpdate(prev, currentWeekKey, xpGained) {
    if (prev && prev.weekKey === currentWeekKey) {
        return {
            weekKey: currentWeekKey,
            xp: (prev.xp ?? 0) + Math.max(0, xpGained),
        };
    }
    return {
        weekKey: currentWeekKey,
        xp: Math.max(0, xpGained),
    };
}
/**
 * Build a ranked leaderboard from user records.
 * - Hides users with settings.leaderboardVisible === false (except caller if caller set false)
 * - Reset stale weeks to 0 XP
 * - Sorts by weeklyXp desc, then displayName asc
 * - Assigns tie positions (e.g., 1, 2, 2, 4)
 */
function buildLeaderboard(users, currentWeekKey, callerUid) {
    // Filter out hidden users unless it's caller
    const visible = users.filter((u) => {
        if (u.uid === callerUid)
            return true;
        return u.settings?.leaderboardVisible !== false;
    });
    // Calculate effective weekly XP
    const mapped = visible.map((u) => {
        const isCurrentWeek = u.weekly?.weekKey === currentWeekKey;
        const weeklyXp = isCurrentWeek ? (u.weekly?.xp ?? 0) : 0;
        return {
            uid: u.uid,
            displayName: u.displayName || 'Hunter',
            rank: u.rank || 'E',
            level: u.level || 1,
            weeklyXp,
            isMe: u.uid === callerUid,
        };
    });
    // Sort descending by XP, then ascending by name
    mapped.sort((a, b) => {
        if (b.weeklyXp !== a.weeklyXp)
            return b.weeklyXp - a.weeklyXp;
        return a.displayName.localeCompare(b.displayName);
    });
    // Assign position with tie handling (1, 2, 2, 4)
    const result = [];
    let currentPos = 1;
    for (let i = 0; i < mapped.length; i++) {
        if (i > 0 && mapped[i].weeklyXp < mapped[i - 1].weeklyXp) {
            currentPos = i + 1;
        }
        result.push({
            ...mapped[i],
            position: currentPos,
        });
    }
    return result;
}
//# sourceMappingURL=social.js.map
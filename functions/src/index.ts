import * as admin from 'firebase-admin';

admin.initializeApp();

export { awardXp } from './awardXp';
export { generateDailyQuests } from './generateDailyQuests';
export { applyPenalties } from './applyPenalties';
export { rankUpTrial } from './rankUp';
export { ensureDailyQuest } from './ensureDailyQuest';
export { validateWorkout } from './validateWorkout';
export { syncHealthDay } from './syncHealthDay';
export {
  getMyFriendCode,
  addFriendByCode,
  removeFriend,
  getFriendsLeaderboard,
  deleteMyAccount,
} from './socialCallables';



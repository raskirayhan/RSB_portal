// RSB Portal Gamification & Rewards Utility
// Manages Gems, Daily Login Streaks, Game Win Rewards, and On-Time Exam Bonus

import { playFanfare, playSuccessChime, playPop } from './soundFX';
import confetti from 'canvas-confetti';

export interface DailyRewardStatus {
  canClaim: boolean;
  gems: number;
  streak: number;
  lastClaimDate: string | null;
}

export interface GameRewardResult {
  isWin: boolean;
  score: number;
  gemsEarned: number;
  xpEarned: number; // Deprecated, kept for backward compat (always 0)
  newTotalGems: number;
  newTotalXp: number;
}

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Get student's current Gems balance from localStorage
 */
export const getUserGems = (userId?: string, _baseTotalXp: number = 0): number => {
  if (typeof window === 'undefined') return 5;
  const key = userId ? `rsb_gems_${userId}` : 'rsb_gems_guest';
  const stored = localStorage.getItem(key);
  if (stored !== null) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) return parsed;
  }
  // Standard initial starter gems balance
  const initial = 5;
  localStorage.setItem(key, initial.toString());
  return initial;
};

/**
 * Add or deduct gems for user
 */
export const updateUserGems = (userId?: string, delta: number = 0, _baseTotalXp: number = 0): number => {
  if (typeof window === 'undefined') return 5;
  const current = getUserGems(userId);
  const updated = Math.max(0, current + delta);
  const key = userId ? `rsb_gems_${userId}` : 'rsb_gems_guest';
  localStorage.setItem(key, updated.toString());
  // Dispatch custom event so all components (Navbar, Dashboard, Games) update reactively
  window.dispatchEvent(new CustomEvent('rsb_gems_updated', { detail: { gems: updated, delta } }));
  return updated;
};

/**
 * Check if the student can claim today's daily login reward (2 Gems per day)
 */
export const checkDailyLoginReward = (userId?: string, currentStreak: number = 1): DailyRewardStatus => {
  if (typeof window === 'undefined') {
    return { canClaim: false, gems: 2, streak: 1, lastClaimDate: null };
  }
  const today = getTodayKey();
  const key = userId ? `rsb_last_login_claim_${userId}` : 'rsb_last_login_claim_guest';
  const lastClaim = localStorage.getItem(key);

  const canClaim = lastClaim !== today;
  // Daily login strictly gives 2 Gems
  const gems = 2;

  return {
    canClaim,
    gems,
    streak: currentStreak,
    lastClaimDate: lastClaim,
  };
};

/**
 * Claim today's daily login reward (2 Gems)
 */
export const claimDailyLoginReward = (
  userId?: string,
  currentStreak: number = 1,
  _baseTotalXp: number = 0
): { success: boolean; gemsEarned: number; starsEarned: number; newGemsTotal: number; newStreak: number } => {
  const status = checkDailyLoginReward(userId, currentStreak);
  if (!status.canClaim) {
    return {
      success: false,
      gemsEarned: 0,
      starsEarned: 0,
      newGemsTotal: getUserGems(userId),
      newStreak: currentStreak,
    };
  }

  const today = getTodayKey();
  const claimKey = userId ? `rsb_last_login_claim_${userId}` : 'rsb_last_login_claim_guest';
  localStorage.setItem(claimKey, today);

  // Award strictly 2 Gems for daily login
  const gemsEarned = 2;
  const newGemsTotal = updateUserGems(userId, gemsEarned);
  const newStreak = currentStreak + 1;

  // Visual & Sound celebration
  try {
    playFanfare();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  } catch (e) {}

  return {
    success: true,
    gemsEarned,
    starsEarned: 0,
    newGemsTotal,
    newStreak,
  };
};

/**
 * Award 3 Gems for completing an exam on-time
 * "exam time to time dele 3ta gems"
 */
export const awardOnTimeExamReward = (userId?: string): number => {
  const gemsEarned = 3;
  const newGemsTotal = updateUserGems(userId, gemsEarned);
  try {
    playFanfare();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.55 },
    });
  } catch (e) {}
  return newGemsTotal;
};

/**
 * Calculate and award game rewards on winning/completing casual practice mini-games
 * Wins give 1 Gem, XP is completely removed.
 */
export const processGameReward = (
  userId: string | undefined,
  score: number,
  maxPossibleScore: number = 100,
  _baseTotalXp: number = 0
): GameRewardResult => {
  const winThreshold = Math.floor(maxPossibleScore * 0.6);
  const isWin = score >= winThreshold;

  // Win reward: 1 Gem (reduced quantity), XP = 0
  const gemsEarned = isWin ? 1 : 0;
  const xpEarned = 0;

  const newTotalGems = updateUserGems(userId, gemsEarned);

  if (isWin) {
    try {
      playFanfare();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 },
      });
    } catch (e) {}
  } else {
    try {
      playSuccessChime();
    } catch (e) {}
  }

  return {
    isWin,
    score,
    gemsEarned,
    xpEarned,
    newTotalGems,
    newTotalXp: 0,
  };
};

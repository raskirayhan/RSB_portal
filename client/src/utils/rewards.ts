// RSB Portal Gamification & Rewards Utility
// Manages Gems, Stars, XP, Daily Login Streaks, and Game Win Rewards

import { playFanfare, playSuccessChime, playPop } from './soundFX';
import confetti from 'canvas-confetti';

export interface DailyRewardStatus {
  canClaim: boolean;
  gems: number;
  stars: number;
  streak: number;
  lastClaimDate: string | null;
}

export interface GameRewardResult {
  isWin: boolean;
  score: number;
  gemsEarned: number;
  xpEarned: number;
  newTotalGems: number;
  newTotalXp: number;
}

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Get student's current Gems balance from localStorage (synced with profile baseline)
 */
export const getUserGems = (userId?: string, baseTotalXp: number = 0): number => {
  if (typeof window === 'undefined') return 100;
  const key = userId ? `rsb_gems_${userId}` : 'rsb_gems_guest';
  const stored = localStorage.getItem(key);
  if (stored !== null) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) return parsed;
  }
  // Initialize with sensible starting amount + XP bonus
  const initial = Math.max(80, Math.floor(baseTotalXp * 0.4) + 60);
  localStorage.setItem(key, initial.toString());
  return initial;
};

/**
 * Add or deduct gems for user
 */
export const updateUserGems = (userId?: string, delta: number = 0, baseTotalXp: number = 0): number => {
  if (typeof window === 'undefined') return 100;
  const current = getUserGems(userId, baseTotalXp);
  const updated = Math.max(0, current + delta);
  const key = userId ? `rsb_gems_${userId}` : 'rsb_gems_guest';
  localStorage.setItem(key, updated.toString());
  // Dispatch custom event so all components (Navbar, Dashboard, Games) update reactively
  window.dispatchEvent(new CustomEvent('rsb_gems_updated', { detail: { gems: updated, delta } }));
  return updated;
};

/**
 * Check if the student can claim today's daily login reward
 */
export const checkDailyLoginReward = (userId?: string, currentStreak: number = 1): DailyRewardStatus => {
  if (typeof window === 'undefined') {
    return { canClaim: false, gems: 25, stars: 50, streak: 1, lastClaimDate: null };
  }
  const today = getTodayKey();
  const key = userId ? `rsb_last_login_claim_${userId}` : 'rsb_last_login_claim_guest';
  const lastClaim = localStorage.getItem(key);

  const canClaim = lastClaim !== today;
  // Streak multiplier: higher streak = slightly higher daily bonus!
  const streakBonusGems = Math.min(20, Math.floor(currentStreak * 2));
  const gems = 25 + streakBonusGems;
  const stars = 50 + (currentStreak * 5);

  return {
    canClaim,
    gems,
    stars,
    streak: canClaim ? currentStreak : currentStreak,
    lastClaimDate: lastClaim,
  };
};

/**
 * Claim today's daily login reward
 */
export const claimDailyLoginReward = (
  userId?: string,
  currentStreak: number = 1,
  baseTotalXp: number = 0
): { success: boolean; gemsEarned: number; starsEarned: number; newGemsTotal: number; newStreak: number } => {
  const status = checkDailyLoginReward(userId, currentStreak);
  if (!status.canClaim) {
    return {
      success: false,
      gemsEarned: 0,
      starsEarned: 0,
      newGemsTotal: getUserGems(userId, baseTotalXp),
      newStreak: currentStreak,
    };
  }

  const today = getTodayKey();
  const claimKey = userId ? `rsb_last_login_claim_${userId}` : 'rsb_last_login_claim_guest';
  localStorage.setItem(claimKey, today);

  const newGemsTotal = updateUserGems(userId, status.gems, baseTotalXp);
  const newStreak = currentStreak + 1;

  // Visual & Sound celebration
  try {
    playFanfare();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  } catch (e) {}

  return {
    success: true,
    gemsEarned: status.gems,
    starsEarned: status.stars,
    newGemsTotal,
    newStreak,
  };
};

/**
 * Calculate and award game rewards on winning/completing a game
 */
export const processGameReward = (
  userId: string | undefined,
  score: number,
  maxPossibleScore: number = 100,
  baseTotalXp: number = 0
): GameRewardResult => {
  const winThreshold = Math.floor(maxPossibleScore * 0.6);
  const isWin = score >= winThreshold;

  // Reward formula
  let gemsEarned = 0;
  let xpEarned = 0;

  if (isWin) {
    // Win Reward: 30-50 gems depending on score, plus high XP
    gemsEarned = Math.max(30, Math.floor(score * 0.4));
    xpEarned = Math.max(50, score);
  } else {
    // Participation reward
    gemsEarned = Math.max(10, Math.floor(score * 0.2));
    xpEarned = Math.max(20, Math.floor(score * 0.5));
  }

  const newTotalGems = updateUserGems(userId, gemsEarned, baseTotalXp);
  const newTotalXp = baseTotalXp + xpEarned;

  if (isWin) {
    try {
      playFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
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
    newTotalXp,
  };
};

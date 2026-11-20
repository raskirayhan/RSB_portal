// Dynamic Contextual Student Microcopy Engine for RSB_portal

export interface MicrocopyState {
  type: 'NEW_STUDENT' | 'STREAK' | 'EXAM_COUNTDOWN' | 'SIR_FEEDBACK' | 'HIGH_SCORE' | 'CHAPTER_MASTERED';
  badgeTitle: string;
  headline: string;
  subtext: string;
  actionText?: string;
  actionUrl?: string;
  icon: string;
  gradient: string;
}

/**
 * Calculates days remaining until target SSC / HSC board exam date
 */
export function getBoardExamCountdown(academicLevel: string = 'HSC_2026'): { days: number; examName: string } {
  const now = new Date();
  // Target: SSC 2026 ~ Feb 15, 2026 | HSC 2026 ~ June 20, 2026
  const targetYear = now.getFullYear();
  let targetDate: Date;
  let examName: string;

  if (academicLevel.includes('SSC')) {
    examName = 'SSC 2026 Board Exam';
    targetDate = new Date(targetYear + (now.getMonth() > 1 ? 1 : 0), 1, 15);
  } else {
    examName = 'HSC 2026 Board Exam';
    targetDate = new Date(targetYear + (now.getMonth() > 5 ? 1 : 0), 5, 20);
  }

  const diffTime = targetDate.getTime() - now.getTime();
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return { days, examName };
}

/**
 * Generates the most relevant contextual banner message for the student
 */
export function getContextualStudentMicrocopy(params: {
  userName: string;
  isProfileCompleted: boolean;
  streak: number;
  academicLevel?: string;
  hasUnreadFeedback?: boolean;
  lastMasteredChapter?: string;
  gameHighScorePercentile?: number;
}): MicrocopyState {
  const {
    userName,
    isProfileCompleted,
    streak,
    academicLevel = 'HSC_2026',
    hasUnreadFeedback = false,
    lastMasteredChapter,
    gameHighScorePercentile = 92,
  } = params;

  const firstName = userName.split(' ')[0] || 'Scholar';

  // 1. Incomplete profile takes top priority
  if (!isProfileCompleted) {
    return {
      type: 'NEW_STUDENT',
      badgeTitle: 'Lab Access Pending',
      headline: `Welcome to the Lab, ${firstName}! 🔬`,
      subtext: 'Your official Scientist QR Badge and Notes & PDFs library are waiting. Complete your profile 100% to unlock full access.',
      actionText: 'Complete Profile Now',
      actionUrl: '/profile',
      icon: '🧪',
      gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    };
  }

  // 2. Unread Feedback from Rayhan Sir
  if (hasUnreadFeedback) {
    return {
      type: 'SIR_FEEDBACK',
      badgeTitle: 'Teacher Insights',
      headline: 'New Note from Rayhan Sir 📬',
      subtext: 'Sir has updated your monthly performance review and suggested strategic areas to polish before exams.',
      actionText: 'Read Sir\'s Remarks',
      actionUrl: '/feedback',
      icon: '📝',
      gradient: 'from-amber-600 via-orange-500 to-yellow-500',
    };
  }

  // 3. 3+ Day Study Streak
  if (streak >= 3) {
    return {
      type: 'STREAK',
      badgeTitle: `${streak}-Day Study Streak`,
      headline: "You're on fire! 🔥 Keep the momentum alive!",
      subtext: `You have shown up for ${streak} consecutive days of science prep. Only top 5% of students maintain this consistency.`,
      actionText: 'Solve Daily Challenge',
      actionUrl: '/games',
      icon: '⚡',
      gradient: 'from-rose-500 via-amber-500 to-orange-500',
    };
  }

  // 4. Recently Mastered Chapter
  if (lastMasteredChapter) {
    return {
      type: 'CHAPTER_MASTERED',
      badgeTitle: 'Concept Mastered',
      headline: `Level Up! 🚀 Mastered ${lastMasteredChapter}`,
      subtext: 'Your theory and formula retention is rock solid. Ready for the next cadet college question bank challenge?',
      actionText: 'Download CQ Bank',
      actionUrl: '/vault',
      icon: '🏆',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    };
  }

  // 5. Default Board Exam Countdown
  const { days, examName } = getBoardExamCountdown(academicLevel);
  return {
    type: 'EXAM_COUNTDOWN',
    badgeTitle: `${examName} Countdown`,
    headline: `Board Exam Countdown: ${days} Days Left ⏳`,
    subtext: 'Stay calm, revise your formula sheets daily, and master the CQ patterns. You\'ve got this!',
    actionText: 'Open Formula Vault',
    actionUrl: '/vault',
    icon: '🎯',
    gradient: 'from-blue-700 via-indigo-700 to-purple-700',
  };
}

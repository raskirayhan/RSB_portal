import React from 'react';
import { Sparkles, X, Trophy, Flame, Gem, Star, ArrowRight } from 'lucide-react';
import { claimDailyLoginReward } from '../utils/rewards';
import { playPop } from '../utils/soundFX';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  currentStreak?: number;
  totalXp?: number;
  onRewardClaimed?: (gems: number, stars: number, newStreak: number) => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentStreak = 1,
  totalXp = 0,
  onRewardClaimed,
}) => {
  if (!isOpen) return null;

  const streakBonus = Math.min(20, currentStreak * 2);
  const rewardGems = 25 + streakBonus;
  const rewardStars = 50 + currentStreak * 5;

  const handleClaim = () => {
    playPop();
    const result = claimDailyLoginReward(userId, currentStreak, totalXp);
    if (result.success && onRewardClaimed) {
      onRewardClaimed(result.gemsEarned, result.starsEarned, result.newStreak);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white text-center overflow-hidden">
        {/* Glowing Background Radial Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Floating Reward Chest / Gem Header */}
        <div className="relative mx-auto mb-4 w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 p-1 shadow-lg shadow-purple-500/30 animate-bounce">
          <div className="w-full h-full bg-slate-900/90 rounded-[22px] flex items-center justify-center text-5xl">
            💎
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Badge Title */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>দৈনিক লগইন পুরষ্কার (Daily Streak Bonus)</span>
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">
          অভিনন্দন! আপনার রিওয়ার্ড প্রস্তুত 🎉
        </h3>
        <p className="text-xs text-purple-200/80 mt-1 max-w-xs mx-auto">
          প্রতিদিন নিয়মিত লগইন করে স্ট্রিক ধরে রাখুন এবং বিজ্ঞানের দারুণ সব গেমসের জন্য রত্ন সংগ্রহ করুন!
        </p>

        {/* Reward Value Cards */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-extrabold text-2xl">
              <Gem className="w-6 h-6 text-cyan-400" />
              <span>+{rewardGems}</span>
            </div>
            <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Gems রত্ন</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-300 font-extrabold text-2xl">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <span>+{rewardStars}</span>
            </div>
            <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Stars / XP</span>
          </div>
        </div>

        {/* Streak Highlight */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-xs text-amber-200 mb-6">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
            <span className="font-bold text-left">
              বর্তমান স্ট্রিক: {currentStreak} দিন টানা
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
            +{streakBonus} Bonus Gems
          </span>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 group active:scale-95"
        >
          <span>রিওয়ার্ড গ্রহণ করুন (Claim Now)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[10px] text-slate-400 mt-3">
          "নিয়মিত অনুশীলনেই বিজ্ঞান সহজ হয়।" — রায়হান স্যার
        </p>
      </div>
    </div>
  );
};

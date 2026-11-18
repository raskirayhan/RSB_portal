import React from 'react';
import { Trophy, Gem, Star, RefreshCw, Award, ArrowRight, X, Sparkles } from 'lucide-react';
import { playPop } from '../utils/soundFX';

interface GameVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWin: boolean;
  gameTitle: string;
  score: number;
  gemsEarned: number;
  xpEarned: number;
  totalGems: number;
  onPlayAgain: () => void;
  onViewLeaderboard?: () => void;
}

export const GameVictoryModal: React.FC<GameVictoryModalProps> = ({
  isOpen,
  onClose,
  isWin,
  gameTitle,
  score,
  gemsEarned,
  xpEarned,
  totalGems,
  onPlayAgain,
  onViewLeaderboard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white text-center overflow-hidden">
        {/* Glowing Radial */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Floating Trophy / Star */}
        <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-1 shadow-lg shadow-amber-500/30 flex items-center justify-center text-4xl animate-bounce">
          {isWin ? '🏆' : '⚡'}
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isWin ? 'বিজয়ী পুরষ্কার (Victory Rewards)' : 'খেলার ফলাফল (Game Summary)'}</span>
        </div>

        <h3 className="text-2xl font-black text-white">
          {isWin ? 'অসাধারণ খেলেছেন! আপনি বিজয়ী!' : 'দারুণ প্রচেষ্টা! খেলা সমাপ্ত'}
        </h3>
        <p className="text-xs text-purple-200/80 mt-1">
          {gameTitle} • মোট স্কোর: <strong className="text-white">{score} পয়েন্ট</strong>
        </p>

        {/* Rewards Earned Grid */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-black text-2xl">
              <Gem className="w-6 h-6 text-cyan-400" />
              <span>+{gemsEarned}</span>
            </div>
            <span className="text-[11px] text-cyan-200/80 font-bold uppercase tracking-wider">Gems রত্ন</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-300 font-black text-2xl">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <span>+{xpEarned}</span>
            </div>
            <span className="text-[11px] text-amber-200/80 font-bold uppercase tracking-wider">Stars / XP</span>
          </div>
        </div>

        {/* Current Total Balance */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center justify-between mb-6">
          <span>আপনার বর্তমান মোট Gems:</span>
          <span className="font-extrabold text-cyan-300 flex items-center space-x-1">
            <Gem className="w-3.5 h-3.5" />
            <span>{totalGems}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              playPop();
              onPlayAgain();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>আবার খেলুন</span>
          </button>

          {onViewLeaderboard && (
            <button
              onClick={() => {
                playPop();
                onViewLeaderboard();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>লিডারবোর্ড</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Trophy,
  Medal,
  Timer,
  Sparkles,
  ShieldAlert,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';

export interface ChampionData {
  rank: number;
  attemptId: string;
  userId: string;
  name: string;
  studentId: string;
  academicLevel: string;
  batchName: string;
  avatarUrl?: string | null;
  score: number;
  totalQuestions: number;
  timeTakenSec: number;
  tabSwitches: number;
  xpEarned: number;
  completedAt: string;
}

interface ChampionSpotlightProps {
  champion: ChampionData | null;
  podium: ChampionData[];
  rankings: ChampionData[];
  sessionTitle?: string;
  expiresAt?: string;
  totalParticipants?: number;
}

export const ChampionSpotlightLeaderboard: React.FC<ChampionSpotlightProps> = ({
  champion,
  podium,
  rankings,
  sessionTitle,
  expiresAt,
  totalParticipants = 0,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} মিনিট`;
  };

  return (
    <div className="space-y-6">
      {/* 👑 #1 Champion Hero Card (Today's 24-Hour Science Champion) */}
      {champion ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-2xl shadow-amber-500/25"
        >
          {/* Inner Card Container */}
          <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80 rounded-[22px] p-6 sm:p-8 text-white overflow-hidden">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              
              {/* Left: Crown Icon, Avatar & Student Info */}
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Glowing Crowned Avatar */}
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="absolute -top-6 -left-2 z-20"
                  >
                    <div className="p-2 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full shadow-lg shadow-amber-500/50">
                      <Crown className="w-6 h-6 text-slate-950 fill-slate-950" />
                    </div>
                  </motion.div>

                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl shadow-amber-500/30 bg-slate-800 flex items-center justify-center">
                    {champion.avatarUrl ? (
                      <img
                        src={champion.avatarUrl}
                        alt={champion.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-black text-amber-300">
                        {champion.name.charAt(0) || '🎓'}
                      </span>
                    )}
                  </div>

                  {/* Rank 1 Badge */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-3 py-0.5 rounded-full shadow-md">
                    #1 CHAMPION
                  </div>
                </div>

                {/* Champion Details */}
                <div className="space-y-1.5">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>আজকের ২৪-ঘণ্টা সায়েন্স চ্যাম্পিয়ন</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                    <span>{champion.name}</span>
                  </h2>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-amber-200 border border-slate-700">
                      {champion.studentId}
                    </span>
                    <span>•</span>
                    <span className="text-slate-200 font-semibold">{champion.batchName}</span>
                  </div>

                  <p className="text-[11px] text-amber-200/80 font-medium">
                    🏆 এই ২৪ ঘণ্টায় সর্বোচ্চ নির্ভুলতা ও দ্রুততম সময়ে শীর্ষস্থান অধিকার করেছে!
                  </p>
                </div>
              </div>

              {/* Right: Score & Time Highlights */}
              <div className="flex items-center gap-3 bg-white/5 border border-amber-400/30 backdrop-blur-md p-4 rounded-2xl">
                <div className="text-center px-3 border-r border-amber-400/20">
                  <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">স্কোর</p>
                  <div className="text-2xl sm:text-3xl font-black text-yellow-400 flex items-baseline justify-center">
                    <span>{champion.score}</span>
                    <span className="text-xs text-slate-400 font-bold ml-1">/{champion.totalQuestions}</span>
                  </div>
                </div>

                <div className="text-center px-3 border-r border-amber-400/20">
                  <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>সময়</span>
                  </p>
                  <p className="text-sm sm:text-base font-bold text-white mt-1">
                    {formatTime(champion.timeTakenSec)}
                  </p>
                </div>

                <div className="text-center px-3">
                  <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>রিওয়ার্ড</span>
                  </p>
                  <p className="text-base sm:text-lg font-black text-cyan-300 mt-0.5">
                    +৩ Gems 💎
                  </p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      ) : (
        /* Empty Champion Placeholder */
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-white space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
            <Crown className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold">এখনো কোনো চ্যাম্পিয়ন নির্ধারিত হয়নি!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            এই ২৪ ঘণ্টার ২৫টি এমসিকিউ চ্যাম্পিয়নশিপ রাউন্ডে অংশগ্রহণ করুন এবং নির্ভুল দ্রুত উত্তর দিয়ে শীর্ষ চ্যাম্পিয়ন হিসেবে আপনার ছবি ও নাম তুলে ধরুন!
          </p>
        </div>
      )}

      {/* 2nd & 3rd Podium Cards (if available) */}
      {podium.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {podium.slice(1, 3).map((player, idx) => (
            <motion.div
              key={player.attemptId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                player.rank === 2
                  ? 'bg-slate-900 text-white border-slate-700 shadow-md'
                  : 'bg-slate-900 text-white border-amber-900/60 shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${
                    player.rank === 2
                      ? 'bg-slate-700 text-slate-200 border border-slate-500'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}
                >
                  {player.rank === 2 ? '🥈 2' : '🥉 3'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{player.name}</span>
                  </h4>
                  <p className="text-xs text-slate-400">{player.batchName || player.academicLevel}</p>
                  <p className="text-[11px] text-cyan-300 font-mono mt-0.5">
                    ⏱️ {formatTime(player.timeTakenSec)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-amber-400">{player.score}</span>
                <span className="text-xs text-slate-400">/{player.totalQuestions}</span>
                <p className="text-[11px] text-cyan-400 font-bold">+৩ Gems 💎</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Full Live 24-Hour Rank Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>২৪-ঘণ্টা লাইভ র‍্যাঙ্কিং টেবিল</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              মোট অংশগ্রহণকারী: {totalParticipants} জন শিক্ষার্থী
            </p>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            💡 টাই-ব্রেকার নীতি: স্কোর সমান হলে দ্রুত সম্পন্নকারী শিক্ষার্থী এগিয়ে থাকবে।
          </div>
        </div>

        {rankings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            এই রাউন্ডে এখনো কেউ অংশ নেয়নি। আপনিই প্রথম পরীক্ষা দিয়ে শীর্ষে উঠে আসুন!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">র‍্যাঙ্ক</th>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-4">ব্যাচ / শ্রেণি</th>
                  <th className="py-3 px-4 text-center">স্কোর (/২৫)</th>
                  <th className="py-3 px-4 text-center">সময়</th>
                  <th className="py-3 px-4 text-center">ট্যাব সুইচ</th>
                  <th className="py-3 px-4 text-right">Gems 💎</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {rankings.map((row) => (
                  <tr
                    key={row.attemptId}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      row.rank === 1
                        ? 'bg-amber-500/10 font-bold'
                        : row.rank === 2
                        ? 'bg-slate-500/5'
                        : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-black">
                      {row.rank === 1 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs">
                          👑 #1
                        </span>
                      ) : row.rank === 2 ? (
                        <span className="text-slate-400 font-black">🥈 #2</span>
                      ) : row.rank === 3 ? (
                        <span className="text-amber-600 font-black">🥉 #3</span>
                      ) : (
                        `#${row.rank}`
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {row.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {row.studentId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {row.batchName || row.academicLevel}
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-amber-600 dark:text-amber-400 text-sm">
                      {row.score}/25
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-cyan-600 dark:text-cyan-400">
                      {formatTime(row.timeTakenSec)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.tabSwitches > 0 ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                          <ShieldAlert className="w-3 h-3" />
                          <span>{row.tabSwitches} বার</span>
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          ✓ ফেয়ার প্লে
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-cyan-500 dark:text-cyan-400">
                      +৩ 💎
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

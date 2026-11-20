import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { playPop } from '../utils/soundFX';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  History,
  User,
  ShieldCheck,
  RefreshCw,
  Binary
} from 'lucide-react';

interface ChampionStudent {
  userId: string;
  name: string;
  studentId: string;
  academicLevel: string;
  batchName: string;
  avatarUrl?: string;
  rank: number;
  totalAttempts: number;
  bestScore: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalScore: number;
  totalQuestions: number;
  totalXp: number;
  fastestTimeSec: number;
}

interface MyHistoryAttempt {
  id: string;
  questionCount: number;
  chapterFilter: string;
  score: number;
  accuracy: number;
  timeTakenSec: number;
  tabSwitches: number;
  xpEarned: number;
  gemsEarned: number;
  completedAt: string;
}

interface HscIctLeaderboardProps {
  onStartExamClick?: () => void;
}

export const HscIctLeaderboard: React.FC<HscIctLeaderboardProps> = ({ onStartExamClick }) => {
  const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'MY_HISTORY'>('LEADERBOARD');
  const [loading, setLoading] = useState(true);

  // Leaderboard data
  const [champion, setChampion] = useState<ChampionStudent | null>(null);
  const [podium, setPodium] = useState<ChampionStudent[]>([]);
  const [rankings, setRankings] = useState<ChampionStudent[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);

  // My History data
  const [myHistory, setMyHistory] = useState<{
    totalAttempts: number;
    totalScore: number;
    totalQuestions: number;
    averageAccuracy: number;
    recentAttempts: MyHistoryAttempt[];
  } | null>(null);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hsc-ict/leaderboard');
      if (res.data.success && res.data.data) {
        setChampion(res.data.data.champion);
        setPodium(res.data.data.podium || []);
        setRankings(res.data.data.rankings || []);
        setTotalParticipants(res.data.data.totalParticipants || 0);
      }
    } catch (err) {
      console.error('Failed to load ICT leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyHistory = async () => {
    try {
      const res = await api.get('/hsc-ict/my-history');
      if (res.data.success && res.data.data) {
        setMyHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load ICT my history', err);
    }
  };

  useEffect(() => {
    loadLeaderboard();
    loadMyHistory();
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds >= 999990 || seconds <= 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playPop();
              setActiveTab('LEADERBOARD');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'LEADERBOARD'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" /> আইসিটি টপ পারফর্মার লিডারবোর্ড
          </button>

          <button
            type="button"
            onClick={() => {
              playPop();
              setActiveTab('MY_HISTORY');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'MY_HISTORY'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-cyan-400" /> আমার পরীক্ষার হিস্ট্রি ও অগ্রগতি
          </button>
        </div>

        {onStartExamClick && (
          <button
            type="button"
            onClick={onStartExamClick}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          >
            <Zap className="w-4 h-4 fill-current" /> পরীক্ষা দিন
          </button>
        )}
      </div>

      {activeTab === 'LEADERBOARD' ? (
        <div className="space-y-8">
          {/* #1 Champion Hero Card */}
          {champion ? (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-2 border-amber-500/50 p-6 md:p-8 shadow-2xl shadow-amber-500/10">
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                {/* Avatar with Golden Crown */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 p-1 shadow-xl shadow-amber-500/30">
                    <div className="w-full h-full rounded-[22px] bg-slate-900 overflow-hidden flex items-center justify-center">
                      {champion.avatarUrl ? (
                        <img
                          src={champion.avatarUrl}
                          alt={champion.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-extrabold text-amber-300">
                          {champion.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-3 w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-md">
                    <Crown className="w-5 h-5 fill-current" />
                  </div>
                  <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                      #১ চ্যাম্পিয়ন
                    </span>
                  </div>
                </div>

                {/* Champion Details */}
                <div className="text-center md:text-left flex-1 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> এইচএসসি আইসিটি টপ পারফর্মার
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white">{champion.name}</h3>
                  <p className="text-xs md:text-sm text-slate-400">
                    আইডি: <span className="text-slate-200 font-mono font-medium">{champion.studentId}</span> •{' '}
                    ব্যাচ: <span className="text-slate-200 font-medium">{champion.batchName}</span>
                  </p>
                </div>

                {/* Stats highlight grid */}
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
                  <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3 text-center">
                    <div className="text-[11px] text-amber-300 font-medium">গড় নির্ভুলতা</div>
                    <div className="text-xl font-black text-white">{champion.averageAccuracy}%</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-3 text-center">
                    <div className="text-[11px] text-slate-400">মোট সমাধান</div>
                    <div className="text-xl font-black text-white">{champion.totalScore} MCQ</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-3 text-center">
                    <div className="text-[11px] text-slate-400">মোট পরীক্ষা</div>
                    <div className="text-xl font-black text-white">{champion.totalAttempts} বার</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-3 text-center">
                    <div className="text-[11px] text-slate-400">দ্রুততম সময়</div>
                    <div className="text-xl font-black text-white">{formatTime(champion.fastestTimeSec)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400">
              <Binary className="w-12 h-12 mx-auto text-blue-400 opacity-50 mb-3" />
              <p className="text-sm font-medium">এখনও কোনো আইসিটি পরীক্ষা সম্পন্ন হয়নি। প্রথম পরীক্ষা দিয়ে চ্যাম্পিয়ন হন!</p>
            </div>
          )}

          {/* Top 2 & Top 3 Podium Cards */}
          {podium.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {podium.slice(1, 3).map((st, idx) => (
                <div
                  key={st.userId}
                  className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
                    idx === 0
                      ? 'bg-slate-900/90 border-slate-400/40 shadow-lg shadow-slate-500/5'
                      : 'bg-slate-900/90 border-amber-700/40 shadow-lg shadow-amber-900/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow ${
                        idx === 0 ? 'bg-slate-300 text-slate-900' : 'bg-amber-600 text-white'
                      }`}
                    >
                      #{idx + 2}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{st.name}</h4>
                      <p className="text-xs text-slate-400">
                        {st.studentId} • {st.batchName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">{st.averageAccuracy}%</div>
                    <div className="text-[11px] text-slate-400">{st.totalScore} MCQ সলভড</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Medal className="w-5 h-5 text-blue-400" /> আইসিটি মেধার তালিকা ({rankings.length} জন)
              </h4>
              <span className="text-xs text-slate-400">র‍্যাংকিং নির্ভুলতা ও দ্রুততম সময় অনুযায়ী</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3">র‍্যাংক</th>
                    <th className="py-3 px-3">শিক্ষার্থীর নাম</th>
                    <th className="py-3 px-3 hidden sm:table-cell">আইডি ও ব্যাচ</th>
                    <th className="py-3 px-3 text-center">পরীক্ষা</th>
                    <th className="py-3 px-3 text-center">সলভড</th>
                    <th className="py-3 px-3 text-right">গড় নির্ভুলতা</th>
                    <th className="py-3 px-3 text-right hidden sm:table-cell">সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rankings.map((st) => (
                    <tr key={st.userId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                            st.rank === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : st.rank === 2
                              ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40'
                              : st.rank === 3
                              ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                              : 'text-slate-400 font-bold'
                          }`}
                        >
                          {st.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-white">{st.name}</div>
                        <div className="text-[11px] text-slate-400 sm:hidden">{st.studentId}</div>
                      </td>
                      <td className="py-3.5 px-3 hidden sm:table-cell text-slate-300">
                        <div>{st.studentId}</div>
                        <div className="text-[11px] text-slate-400">{st.batchName}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-300">{st.totalAttempts}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-white">{st.totalScore}</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-bold text-emerald-400">{st.averageAccuracy}%</span>
                      </td>
                      <td className="py-3.5 px-3 text-right hidden sm:table-cell text-slate-400 font-mono">
                        {formatTime(st.fastestTimeSec)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* MY EXAM HISTORY TAB */
        <div className="space-y-6">
          {myHistory && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">মোট পরীক্ষা দিয়েছেন</div>
                <div className="text-2xl font-black text-white mt-1">{myHistory.totalAttempts} বার</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">মোট সঠিক সমাধান</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{myHistory.totalScore} টি</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">গড় নির্ভুলতা</div>
                <div className="text-2xl font-black text-blue-400 mt-1">{myHistory.averageAccuracy}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">মোট প্রশ্ন উত্তর</div>
                <div className="text-2xl font-black text-indigo-400 mt-1">{myHistory.totalQuestions} টি</div>
              </div>
            </div>
          )}

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <History className="w-5 h-5 text-indigo-400" /> বিগত পরীক্ষার ফলাফল ও অ্যানালিটিক্স
            </h4>

            {myHistory?.recentAttempts && myHistory.recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {myHistory.recentAttempts.map((att, idx) => (
                  <div
                    key={att.id}
                    className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          পরীক্ষা #{myHistory.recentAttempts.length - idx} • {att.questionCount} MCQ
                        </span>
                        <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                          {att.chapterFilter === 'ALL' ? 'সকল অধ্যায়' : `অধ্যায় ${att.chapterFilter}`}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        তারিখ: {new Date(att.completedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })} • সময়: {formatTime(att.timeTakenSec)} • ট্যাব সুইচ: {att.tabSwitches}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-base font-black text-white">
                          {att.score} / {att.questionCount}
                        </div>
                        <div className="text-xs font-bold text-emerald-400">
                          {att.accuracy}% নির্ভুল
                        </div>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        +{att.gemsEarned} 💎
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                আপনি এখনও কোনো আইসিটি পরীক্ষা দেননি। "পরীক্ষা দিন" বাটনে ক্লিক করে প্রথম পরীক্ষা শুরু করুন!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

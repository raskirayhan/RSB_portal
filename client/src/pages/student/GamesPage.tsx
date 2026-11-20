import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { GameVictoryModal } from '../../components/GameVictoryModal';
import { getUserGems, processGameReward } from '../../utils/rewards';
import { playSuccessChime, playPop, playFanfare } from '../../utils/soundFX';
import confetti from 'canvas-confetti';
import { ChampionSpotlightLeaderboard, type ChampionData } from '../../components/ChampionSpotlightLeaderboard';
import { ChampionshipLiveArena } from '../../components/ChampionshipLiveArena';
import {
  Gamepad2,
  Trophy,
  Award,
  Flame,
  CheckCircle,
  XCircle,
  Timer,
  RefreshCw,
  Sparkles,
  Zap,
  Atom,
  Binary,
  Calculator,
  Gem,
  Star,
  Gift,
  Lock,
  Unlock,
  CheckCircle2,
  Crown
} from 'lucide-react';

export const GamesPage: React.FC = () => {
  const { user, profile, updateProfileState } = useAuth();
  const [activeTab, setActiveTab] = useState<'CHAMPIONSHIP' | 'GAMES' | 'LEADERBOARD' | 'BADGES' | 'PERKS'>('CHAMPIONSHIP');
  const [selectedGame, setSelectedGame] = useState<'PERIODIC' | 'FORMULA' | 'MATH' | 'MCQ'>('PERIODIC');

  const [champData, setChampData] = useState<{
    champion: ChampionData | null;
    podium: ChampionData[];
    rankings: ChampionData[];
    sessionTitle?: string;
    expiresAt?: string;
    totalParticipants?: number;
  }>({
    champion: null,
    podium: [],
    rankings: [],
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [gems, setGems] = useState<number>(() => getUserGems(user?.id, profile?.totalXp));

  const [unlockedPerks, setUnlockedPerks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`rsb_perks_${user?.id || 'guest'}`);
      return stored ? JSON.parse(stored) : ['CHEATSHEET'];
    } catch {
      return ['CHEATSHEET'];
    }
  });

  const [victoryModal, setVictoryModal] = useState<{
    isOpen: boolean;
    isWin: boolean;
    gameTitle: string;
    score: number;
    gemsEarned: number;
    xpEarned: number;
    totalGems: number;
  }>({
    isOpen: false,
    isWin: false,
    gameTitle: '',
    score: 0,
    gemsEarned: 0,
    xpEarned: 0,
    totalGems: gems,
  });

  const loadChampionshipData = async () => {
    try {
      const res = await api.get('/games/championship/leaderboard');
      if (res.data.success && res.data.data) {
        setChampData({
          champion: res.data.data.champion,
          podium: res.data.data.podium || [],
          rankings: res.data.data.rankings || [],
          sessionTitle: res.data.data.session?.title,
          expiresAt: res.data.data.session?.expiresAt,
          totalParticipants: res.data.data.session?.totalParticipants || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load championship leaderboard', err);
    }
  };

  useEffect(() => {
    // Load Championship Data
    loadChampionshipData();

    // Load Leaderboard
    api.get('/games/leaderboard')
      .then((res) => {
        if (res.data.success) setLeaderboard(res.data.data);
      })
      .catch((err) => console.error(err));

    // Load Badges
    api.get('/games/badges')
      .then((res) => {
        if (res.data.success) setBadges(res.data.data);
      })
      .catch((err) => console.error(err));

    const handleGemsUpdate = (e: any) => {
      if (e.detail?.gems !== undefined) setGems(e.detail.gems);
    };
    window.addEventListener('rsb_gems_updated', handleGemsUpdate);
    return () => window.removeEventListener('rsb_gems_updated', handleGemsUpdate);
  }, []);

  const handleScoreSubmission = async (
    gameType: string,
    score: number,
    maxScore: number = 100,
    gameTitle: string = 'সায়েন্স গেম'
  ) => {
    // Process reward (Gems & Stars)
    const reward = processGameReward(user?.id, score, maxScore, profile?.totalXp || 0);
    setGems(reward.newTotalGems);

    setVictoryModal({
      isOpen: true,
      isWin: reward.isWin,
      gameTitle,
      score: reward.score,
      gemsEarned: reward.gemsEarned,
      xpEarned: reward.xpEarned,
      totalGems: reward.newTotalGems,
    });

    try {
      const res = await api.post('/games/score', {
        gameType,
        score,
        xpEarned: reward.xpEarned,
      });

      if (res.data.success) {
        if (profile) {
          updateProfileState({
            ...profile,
            totalXp: res.data.data.totalXp,
          });
        }

        // Refresh Leaderboard and Badges
        const lbRes = await api.get('/games/leaderboard');
        if (lbRes.data.success) setLeaderboard(lbRes.data.data);

        const bgRes = await api.get('/games/badges');
        if (bgRes.data.success) setBadges(bgRes.data.data);
      }
    } catch (err) {
      console.error('Failed to submit game score', err);
    }
  };

  const handleUnlockPerk = (perkId: string, cost: number) => {
    playPop();
    if (gems < cost) {
      alert(`আপনার পর্যাপ্ত Gems নেই! আরও ${cost - gems}টি রত্ন প্রয়োজন। ব্রেইন গেম খেলে রত্ন বাড়িয়ে নিন!`);
      return;
    }
    const updatedGems = gems - cost;
    setGems(updatedGems);
    localStorage.setItem(`rsb_gems_${user?.id || 'guest'}`, updatedGems.toString());
    window.dispatchEvent(new CustomEvent('rsb_gems_updated', { detail: { gems: updatedGems } }));

    const next = [...unlockedPerks, perkId];
    setUnlockedPerks(next);
    localStorage.setItem(`rsb_perks_${user?.id || 'guest'}`, JSON.stringify(next));

    playFanfare();
    confetti({ particleCount: 70, spread: 60 });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-purple-500/20">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>গ্যামিফাইড সায়েন্স লার্নিং হাব</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ইন-অ্যাপ সায়েন্স গেমস ও রিওয়ার্ড এরিনা
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
            পড়াশোনার একঘেয়েমি দূর করতে ব্রেইন গেম খেলুন! খেলায় জিতলেই পাবেন <strong>💎 Gems রত্ন</strong> ও <strong>⭐ XP Stars</strong>, যা দিয়ে লিডারবোর্ডের শীর্ষে উঠে বিশেষ সুবিধা আনলক করা যাবে।
          </p>
        </div>

        {/* Live Balance Widgets */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/20 text-center">
            <Gem className="w-5 h-5 text-cyan-300" />
            <div className="text-left">
              <p className="text-[9px] text-purple-200 font-bold uppercase tracking-wider">Gems রত্ন</p>
              <h3 className="text-lg font-black text-cyan-300">{gems}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/20 text-center">
            <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            <div className="text-left">
              <p className="text-[9px] text-purple-200 font-bold uppercase tracking-wider">মোট XP</p>
              <h3 className="text-lg font-black text-amber-300">{profile?.totalXp || 0} XP</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/20 text-center">
            <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
            <div className="text-left">
              <p className="text-[9px] text-purple-200 font-bold uppercase tracking-wider">স্ট্রিক</p>
              <h3 className="text-lg font-black text-orange-300">{profile?.currentStreak || 1} দিন</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 👑 #1 Champion Hero Card (Today's 24-Hour Science Champion) */}
      <ChampionSpotlightLeaderboard
        champion={champData.champion}
        podium={[]}
        rankings={[]}
        sessionTitle={champData.sessionTitle}
        expiresAt={champData.expiresAt}
        totalParticipants={champData.totalParticipants}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('CHAMPIONSHIP')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'CHAMPIONSHIP'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-900 fill-amber-900" />
          <span>২৪-ঘণ্টা লাইভ চ্যাম্পিয়নশিপ</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('GAMES')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'GAMES'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>আনলিমিটেড প্র্যাকটিস গেমস (৪টি)</span>
        </button>

        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'LEADERBOARD'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>লাইভ লিডারবোর্ড ও র‍্যাঙ্কিং</span>
        </button>

        <button
          onClick={() => setActiveTab('BADGES')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'BADGES'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ডিজিটাল ব্যাজ ({badges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PERKS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'PERKS'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Gem className="w-4 h-4 text-cyan-400" />
          <span>রত্ন সুবিধা (Gems Perks)</span>
        </button>
      </div>

      {/* Tab: Mode B — 24-Hour Live 25-MCQ Championship Arena */}
      {activeTab === 'CHAMPIONSHIP' && (
        <ChampionshipLiveArena onAttemptCompleted={loadChampionshipData} />
      )}

      {/* Tab 1: Games Hub */}
      {activeTab === 'GAMES' && (
        <div className="space-y-6">
          {/* Game Selector Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => { playPop(); setSelectedGame('PERIODIC'); }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedGame === 'PERIODIC'
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <Atom className="w-6 h-6 text-emerald-600 mb-2" />
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Periodic Table Match</h4>
              <p className="text-[10px] text-slate-500">রসায়ন • জিতলেই +৪০ Gems</p>
            </button>

            <button
              onClick={() => { playPop(); setSelectedGame('FORMULA'); }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedGame === 'FORMULA'
                  ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <Zap className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Physics Formula Rush</h4>
              <p className="text-[10px] text-slate-500">পদার্থবিজ্ঞান • জিতলেই +৩৫ Gems</p>
            </button>

            <button
              onClick={() => { playPop(); setSelectedGame('MATH'); }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedGame === 'MATH'
                  ? 'bg-purple-50 border-purple-500 shadow-sm ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <Calculator className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Mental Math Sprint</h4>
              <p className="text-[10px] text-slate-500">উচ্চতর গণিত • জিতলেই +৩৫ Gems</p>
            </button>

            <button
              onClick={() => { playPop(); setSelectedGame('MCQ'); }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedGame === 'MCQ'
                  ? 'bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <Binary className="w-6 h-6 text-amber-600 mb-2" />
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Science MCQ Battle</h4>
              <p className="text-[10px] text-slate-500">ICT ও বিজ্ঞান • জিতলেই +৩০ Gems</p>
            </button>
          </div>

          {/* Active Game Arena */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            {selectedGame === 'PERIODIC' && (
              <PeriodicTableGame
                onComplete={(score, maxScore, title) =>
                  handleScoreSubmission('PERIODIC_TABLE', score, maxScore, title)
                }
              />
            )}
            {selectedGame === 'FORMULA' && (
              <PhysicsFormulaGame
                onComplete={(score, maxScore, title) =>
                  handleScoreSubmission('FORMULA_RUSH', score, maxScore, title)
                }
              />
            )}
            {selectedGame === 'MATH' && (
              <MentalMathGame
                onComplete={(score, maxScore, title) =>
                  handleScoreSubmission('MATH_SPRINT', score, maxScore, title)
                }
              />
            )}
            {selectedGame === 'MCQ' && (
              <ScienceMcqGame
                onComplete={(score, maxScore, title) =>
                  handleScoreSubmission('MCQ_BATTLE', score, maxScore, title)
                }
              />
            )}
          </div>
        </div>
      )}

      {/* Tab: Leaderboard */}
      {activeTab === 'LEADERBOARD' && (
        <div className="space-y-8">
          {/* 24-Hour Live Science Championship Standings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>আজকের ২৪-ঘণ্টা সায়েন্স চ্যাম্পিয়নশিপ স্ট্যান্ডিংস</span>
                </h3>
                <p className="text-xs text-slate-500">
                  সর্বোচ্চ স্কোর (Score DESC) এবং দ্রুততম সমাধান সময় (Time Taken ASC) এর ভিত্তিতে স্বয়ংক্রিয় টাই-ব্রেকার র‍্যাঙ্কিং
                </p>
              </div>
            </div>

            <ChampionSpotlightLeaderboard
              champion={champData.champion}
              podium={champData.podium}
              rankings={champData.rankings}
              sessionTitle={champData.sessionTitle}
              expiresAt={champData.expiresAt}
              totalParticipants={champData.totalParticipants}
            />
          </div>

          {/* Overall Batch XP Leaderboard */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">ব্যাচের অল-টাইম ও সাপ্তাহিক লাইভ লিডারবোর্ড</h3>
                <p className="text-xs text-slate-500">প্রতিটি কুইজ ও গেমসে অর্জিত মোট XP পয়েন্টের ভিত্তিতে সার্বিক র‍্যাঙ্ক</p>
              </div>
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">র‍্যাঙ্ক (Rank)</th>
                  <th className="px-6 py-4">শিক্ষার্থীর নাম</th>
                  <th className="px-6 py-4">স্টুডেন্ট ID</th>
                  <th className="px-6 py-4">ব্যাচ</th>
                  <th className="px-6 py-4">স্ট্রিক</th>
                  <th className="px-6 py-4 text-right">মোট XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((student) => {
                  return (
                    <tr
                      key={student.studentId}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        student.studentId === profile?.studentIdNumber ? 'bg-purple-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                            student.rank === 1
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : student.rank === 2
                              ? 'bg-slate-200 text-slate-800'
                              : student.rank === 3
                              ? 'bg-amber-600/20 text-amber-900'
                              : 'text-slate-500'
                          }`}
                        >
                          {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                        <span>{student.name}</span>
                        {student.studentId === profile?.studentIdNumber && (
                          <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
                            আপনি (You)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-600">{student.studentId}</td>
                      <td className="px-6 py-4 text-slate-500">{student.batch}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1 text-amber-600 font-bold">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{student.streak} দিন</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-purple-700">
                        {student.totalXp} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* Tab 3: Badges */}
      {activeTab === 'BADGES' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">আপনার অর্জিত ডিজিটাল ব্যাজসমূহ</h3>
            <p className="text-xs text-slate-500">বিভিন্ন বিজ্ঞান গেমসে কৃতিত্ব অর্জন করলে স্বয়ংক্রিয়ভাবে এই ব্যাজগুলো আনলক হয়।</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-purple-50 to-white border border-purple-200 text-center space-y-2 shadow-xs"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl mx-auto border border-purple-100">
                  {b.icon}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                <p className="text-[10px] text-emerald-600 font-bold">✓ আনলক সম্পন্ন</p>
                <p className="text-[10px] text-slate-400">অর্জিত: {new Date(b.awardedAt).toLocaleDateString('en-GB')}</p>
              </div>
            ))}

            {/* Locked Badges */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 border-dashed text-center space-y-2 opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center text-2xl mx-auto text-slate-400">
                🔒
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Calculus Titan</h4>
              <p className="text-[10px] text-slate-500">ম্যাথ স্প্রিন্টে ৯০+ স্কোর করলে আনলক হবে</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Gems Perks & Rewards Hub */}
      {activeTab === 'PERKS' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <span>রত্ন দিয়ে আনলকযোগ্য বিশেষ সুবিধা (Gems Perks)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-extrabold">
                  💎 {gems} Gems অবশিষ্ট
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                গেমস খেলে ও প্রতিদিন লগইন করে রত্ন আয় করুন এবং আপনার পড়াশোনার জন্য স্পেশাল ফিচার আনলক করুন!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Perk 1 */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-50/60 to-white border border-cyan-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-2xl shadow-xs">
                  📑
                </div>
                <h4 className="font-bold text-slate-900 text-sm">SSC/HSC বিজ্ঞান স্পেশাল ফর্মুলা শিট</h4>
                <p className="text-xs text-slate-600">
                  রায়হান স্যারের তৈরি ফিজিক্স ও কেমিস্ট্রির হ্যান্ড-রিটেন সুপার ফর্মুলা শিট ডাউনলোড পারমিশন।
                </p>
              </div>
              <div>
                <span className="text-[11px] text-emerald-600 font-bold block mb-2">✓ বিনামূল্যে ডিফল্ট আনলকড</span>
                <button
                  disabled
                  className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs"
                >
                  আনলক করা আছে ✅
                </button>
              </div>
            </div>

            {/* Perk 2 */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white border border-amber-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shadow-xs">
                  👑
                </div>
                <h4 className="font-bold text-slate-900 text-sm">লিডারবোর্ডে গোল্ডেন গ্লো অবতার</h4>
                <p className="text-xs text-slate-600">
                  ব্যাচ লিডারবোর্ডে আপনার নামের পাশে জ্বলজ্বলে গোল্ডেন ব্যাজ ও স্পেশাল হাইলাইট যোগ হবে।
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 font-bold">খরচ:</span>
                  <span className="font-black text-cyan-600 flex items-center space-x-1">
                    <Gem className="w-3.5 h-3.5" />
                    <span>১০০ Gems</span>
                  </span>
                </div>
                {unlockedPerks.includes('GOLDEN_GLOW') ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs"
                  >
                    সক্রিয় করা হয়েছে ✨
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlockPerk('GOLDEN_GLOW', 100)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                  >
                    আনলক করুন (100 Gems) 💎
                  </button>
                )}
              </div>
            </div>

            {/* Perk 3 */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-50/60 to-white border border-purple-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl shadow-xs">
                  🚀
                </div>
                <h4 className="font-bold text-slate-900 text-sm">ডাউট-বাস্টার ফাস্ট প্রায়োরিটি</h4>
                <p className="text-xs text-slate-600">
                  সরাসরি রায়হান স্যারের কাছে ফিজিক্স/ম্যাথের অংক নিয়ে ডাউট পাঠালে সর্বোচ্চ প্রায়োরিটি সমাধান।
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 font-bold">খরচ:</span>
                  <span className="font-black text-cyan-600 flex items-center space-x-1">
                    <Gem className="w-3.5 h-3.5" />
                    <span>১৫০ Gems</span>
                  </span>
                </div>
                {unlockedPerks.includes('PRIORITY_PASS') ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-purple-100 text-purple-800 font-bold text-xs"
                  >
                    সক্রিয় আছে 🚀
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlockPerk('PRIORITY_PASS', 150)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                  >
                    আনলক করুন (150 Gems) 💎
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Victory & Rewards Modal */}
      <GameVictoryModal
        isOpen={victoryModal.isOpen}
        onClose={() => setVictoryModal({ ...victoryModal, isOpen: false })}
        isWin={victoryModal.isWin}
        gameTitle={victoryModal.gameTitle}
        score={victoryModal.score}
        gemsEarned={victoryModal.gemsEarned}
        xpEarned={victoryModal.xpEarned}
        totalGems={victoryModal.totalGems}
        onPlayAgain={() => setVictoryModal({ ...victoryModal, isOpen: false })}
        onViewLeaderboard={() => {
          setVictoryModal({ ...victoryModal, isOpen: false });
          setActiveTab('LEADERBOARD');
        }}
      />
    </div>
  );
};

/* --- MINI GAME 1: PERIODIC TABLE MATCH --- */
const PeriodicTableGame: React.FC<{
  onComplete: (score: number, maxScore: number, title: string) => void;
}> = ({ onComplete }) => {
  const elements = [
    { symbol: 'H', name: 'Hydrogen (হাইড্রোজেন)', atomicNumber: 1, group: 'Group 1' },
    { symbol: 'He', name: 'Helium (হিলিয়াম)', atomicNumber: 2, group: 'Group 18' },
    { symbol: 'Li', name: 'Lithium (লিথিয়াম)', atomicNumber: 3, group: 'Group 1' },
    { symbol: 'C', name: 'Carbon (কার্বন)', atomicNumber: 6, group: 'Group 14' },
    { symbol: 'O', name: 'Oxygen (অক্সিজেন)', atomicNumber: 8, group: 'Group 16' },
    { symbol: 'Na', name: 'Sodium (সোডিয়াম)', atomicNumber: 11, group: 'Group 1' },
    { symbol: 'Cl', name: 'Chlorine (ক্লোরিন)', atomicNumber: 17, group: 'Group 17' },
    { symbol: 'Fe', name: 'Iron (লোহা)', atomicNumber: 26, group: 'Group 8' },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = elements[currentIdx];

  const options = [
    current.atomicNumber,
    current.atomicNumber + 2,
    Math.max(1, current.atomicNumber - 2),
    current.atomicNumber + 5,
  ].sort(() => Math.random() - 0.5);

  const handleChoice = (chosen: number) => {
    let nextScore = score;
    if (chosen === current.atomicNumber) {
      playSuccessChime();
      nextScore += 20;
      setScore(nextScore);
    } else {
      playPop();
    }

    if (currentIdx + 1 < elements.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsGameOver(true);
      onComplete(nextScore, elements.length * 20, 'Periodic Table Match');
    }
  };

  const restart = () => {
    playPop();
    setCurrentIdx(0);
    setScore(0);
    setIsGameOver(false);
  };

  if (isGameOver) {
    return (
      <div className="text-center py-8 space-y-4">
        <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
        <h3 className="text-2xl font-black text-slate-900">দারুণ খেলেছেন! খেলা সমাপ্ত</h3>
        <p className="text-slate-600 text-sm">
          আপনার স্কোর: <strong>{score}</strong> পয়েন্ট • রত্ন রিওয়ার্ড জমা হয়েছে!
        </p>
        <button
          onClick={restart}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>আবার খেলুন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center">
      <div className="flex items-center justify-between text-xs text-slate-500 border-b pb-2">
        <span>প্রশ্ন: {currentIdx + 1} / {elements.length}</span>
        <span className="font-bold text-emerald-600">স্কোর: {score} XP</span>
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-xl space-y-2">
        <span className="text-5xl font-black tracking-tight">{current.symbol}</span>
        <h3 className="text-lg font-bold">{current.name}</h3>
        <p className="text-xs text-emerald-100">{current.group}</p>
      </div>

      <p className="text-sm font-bold text-slate-800">
        এই মৌলের পারমাণবিক সংখ্যা (Atomic Number) কত?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleChoice(opt)}
            className="py-3.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 border border-slate-200 rounded-2xl text-lg font-black text-slate-800 transition-all shadow-xs active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* --- MINI GAME 2: PHYSICS FORMULA RUSH --- */
const PhysicsFormulaGame: React.FC<{
  onComplete: (score: number, maxScore: number, title: string) => void;
}> = ({ onComplete }) => {
  const questions = [
    { q: 'বল (Force)-এর সমীকরণ কোনটি?', ans: 'F = ma', options: ['F = ma', 'F = mv', 'F = mgh', 'F = 1/2 mv²'] },
    { q: 'গতিশক্তি (Kinetic Energy)-এর সমীকরণ কোনটি?', ans: 'Ek = 1/2 mv²', options: ['Ek = 1/2 mv²', 'Ek = mgh', 'Ek = Fs', 'Ek = ma'] },
    { q: 'ভরবেগ (Momentum)-এর সমীকরণ কোনটি?', ans: 'p = mv', options: ['p = mv', 'p = ma', 'p = 1/2 mv²', 'p = Ft'] },
    { q: 'ওহমের সূত্র (Ohm’s Law)-এর রূপ কোনটি?', ans: 'V = IR', options: ['V = IR', 'I = VR', 'R = VI', 'V = I/R'] },
  ];

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isOver, setIsOver] = useState(false);

  const handlePick = (choice: string) => {
    let nextScore = score;
    if (choice === questions[idx].ans) {
      playSuccessChime();
      nextScore += 25;
      setScore(nextScore);
    } else {
      playPop();
    }
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      setIsOver(true);
      onComplete(nextScore, questions.length * 25, 'Physics Formula Rush');
    }
  };

  if (isOver) {
    return (
      <div className="text-center py-8 space-y-4">
        <Zap className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
        <h3 className="text-2xl font-black text-slate-900">ফিজিক্স ফর্মুলা রাশ সম্পন্ন!</h3>
        <p className="text-slate-600 text-sm">আপনার স্কোর: <strong>{score}</strong> পয়েন্ট • রত্ন রিওয়ার্ড যোগ হয়েছে!</p>
        <button
          onClick={() => { playPop(); setIdx(0); setScore(0); setIsOver(false); }}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>পুনরায় শুরু করুন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center">
      <div className="flex items-center justify-between text-xs text-slate-500 border-b pb-2">
        <span>ফর্মুলা {idx + 1} / {questions.length}</span>
        <span className="font-bold text-blue-600">স্কোর: {score} XP</span>
      </div>

      <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 text-blue-900">
        <h3 className="text-lg font-extrabold">{questions[idx].q}</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {questions[idx].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handlePick(opt)}
            className="py-3 px-4 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 transition-all shadow-xs active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* --- MINI GAME 3: MENTAL MATH SPRINT --- */
const MentalMathGame: React.FC<{
  onComplete: (score: number, maxScore: number, title: string) => void;
}> = ({ onComplete }) => {
  const problems = [
    { q: 'sin 30° এর মান কত?', ans: '1/2', opts: ['1/2', '√3/2', '1/√2', '1'] },
    { q: 'd/dx (x³) = ?', ans: '3x²', opts: ['3x²', 'x²', '3x', 'x³/3'] },
    { q: 'cos 90° এর মান কত?', ans: '0', opts: ['0', '1', '-1', '1/2'] },
    { q: 'log₁₀ (1000) = ?', ans: '3', opts: ['3', '2', '10', '100'] },
  ];

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const handleAns = (ans: string) => {
    let nextScore = score;
    if (ans === problems[idx].ans) {
      playSuccessChime();
      nextScore += 25;
      setScore(nextScore);
    } else {
      playPop();
    }

    if (idx + 1 < problems.length) {
      setIdx(idx + 1);
    } else {
      setIsDone(true);
      onComplete(nextScore, problems.length * 25, 'Mental Math Sprint');
    }
  };

  if (isDone) {
    return (
      <div className="text-center py-8 space-y-4">
        <Calculator className="w-16 h-16 text-purple-600 mx-auto" />
        <h3 className="text-2xl font-black text-slate-900">ম্যাথ স্প্রিন্ট সম্পন্ন!</h3>
        <p className="text-slate-600 text-sm">আপনার স্কোর: <strong>{score}</strong> • রত্ন রিওয়ার্ড যোগ হয়েছে!</p>
        <button
          onClick={() => { playPop(); setIdx(0); setScore(0); setIsDone(false); }}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>পুনরায় খেলুন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center">
      <div className="flex items-center justify-between text-xs text-slate-500 border-b pb-2">
        <span>গণিত চ্যালেঞ্জ: {idx + 1} / {problems.length}</span>
        <span className="font-bold text-purple-600">স্কোর: {score} XP</span>
      </div>

      <div className="p-6 rounded-3xl bg-purple-50 border border-purple-200 text-purple-900">
        <h3 className="text-xl font-black font-mono">{problems[idx].q}</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {problems[idx].opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAns(opt)}
            className="py-3 px-4 bg-white hover:bg-purple-600 hover:text-white border border-slate-200 rounded-2xl text-base font-bold text-slate-800 transition-all shadow-xs active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* --- MINI GAME 4: SCIENCE MCQ BATTLE --- */
const ScienceMcqGame: React.FC<{
  onComplete: (score: number, maxScore: number, title: string) => void;
}> = ({ onComplete }) => {
  const mcqs = [
    { q: 'ইলেকট্রনের আধান (Charge) কত?', ans: '-1.6 × 10⁻¹⁹ C', opts: ['-1.6 × 10⁻¹⁹ C', '+1.6 × 10⁻¹⁹ C', '9.1 × 10⁻³¹ C', '1 C'] },
    { q: 'আদর্শ গ্যাসে পরম শূন্য তাপমাত্রা কত?', ans: '-273.15 °C', opts: ['-273.15 °C', '0 °C', '273.15 K', '-100 °C'] },
    { q: 'ICT-তে সার্বজনীন লজিক গেট (Universal Gate) কোনটি?', ans: 'NAND & NOR', opts: ['NAND & NOR', 'AND & OR', 'NOT & XOR', 'XOR & XNOR'] },
  ];

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const handleAns = (ans: string) => {
    let nextScore = score;
    if (ans === mcqs[idx].ans) {
      playSuccessChime();
      nextScore += 30;
      setScore(nextScore);
    } else {
      playPop();
    }

    if (idx + 1 < mcqs.length) {
      setIdx(idx + 1);
    } else {
      setIsDone(true);
      onComplete(nextScore, mcqs.length * 30, 'Science MCQ Battle');
    }
  };

  if (isDone) {
    return (
      <div className="text-center py-8 space-y-4">
        <Trophy className="w-16 h-16 text-amber-500 mx-auto" />
        <h3 className="text-2xl font-black text-slate-900">কুইজ ব্যাটল সম্পন্ন!</h3>
        <p className="text-slate-600 text-sm">আপনার স্কোর: <strong>{score}</strong> • রত্ন রিওয়ার্ড যোগ হয়েছে!</p>
        <button
          onClick={() => { playPop(); setIdx(0); setScore(0); setIsDone(false); }}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>পুনরায় খেলুন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center">
      <div className="flex items-center justify-between text-xs text-slate-500 border-b pb-2">
        <span>কুইজ {idx + 1} / {mcqs.length}</span>
        <span className="font-bold text-amber-600">স্কোর: {score} XP</span>
      </div>

      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950">
        <h3 className="text-lg font-bold">{mcqs[idx].q}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mcqs[idx].opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAns(opt)}
            className="py-3 px-4 bg-white hover:bg-amber-500 hover:text-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all shadow-xs active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

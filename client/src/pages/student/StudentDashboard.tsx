import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { QRBadgeModal } from '../../components/QRBadgeModal';
import { DailyRewardModal } from '../../components/DailyRewardModal';
import { getUserGems, checkDailyLoginReward } from '../../utils/rewards';
import { playPop } from '../../utils/soundFX';
import {
  BookOpen,
  CreditCard,
  Gamepad2,
  QrCode,
  Flame,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Clock,
  ShieldCheck,
  TrendingUp,
  Gem,
  Star,
  GraduationCap,
  Layers,
  DownloadCloud,
  Trophy
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, profile, updateProfileState } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDailyRewardModalOpen, setIsDailyRewardModalOpen] = useState(false);
  const [gems, setGems] = useState<number>(() => getUserGems(user?.id, profile?.totalXp));
  const [rewardStatus, setRewardStatus] = useState(() => checkDailyLoginReward(user?.id, profile?.currentStreak));

  // Determine active level: CLASS_8, SSC, or HSC
  const getInitialLevel = (): 'CLASS_8' | 'SSC' | 'HSC' => {
    const saved = localStorage.getItem('rsb_selected_academic_level');
    if (saved === 'CLASS_8' || saved === 'SSC' || saved === 'HSC') return saved;
    const lvl = (profile?.academicLevel || '').toUpperCase();
    if (lvl.includes('8') || lvl.includes('JSC')) return 'CLASS_8';
    if (lvl.includes('SSC')) return 'SSC';
    return 'HSC';
  };

  const [activeLevel, setActiveLevel] = useState<'CLASS_8' | 'SSC' | 'HSC'>(getInitialLevel());

  useEffect(() => {
    // If profile changes, align active level if not manually selected
    if (profile?.academicLevel) {
      const lvl = profile.academicLevel.toUpperCase();
      if (lvl.includes('8') || lvl.includes('JSC')) setActiveLevel('CLASS_8');
      else if (lvl.includes('SSC')) setActiveLevel('SSC');
      else setActiveLevel('HSC');
    }
  }, [profile?.academicLevel]);

  useEffect(() => {
    // Load student invoices
    api.get('/billing/invoices')
      .then((res) => {
        if (res.data.success) setInvoices(res.data.data);
      })
      .catch((err) => console.error(err));

    // Load feedback
    api.get('/feedback')
      .then((res) => {
        if (res.data.success) setFeedback(res.data.data);
      })
      .catch((err) => console.error(err));

    // Load milestones
    api.get('/profile/milestones')
      .then((res) => {
        if (res.data.success) setMilestones(res.data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const status = checkDailyLoginReward(user?.id, profile?.currentStreak);
    setRewardStatus(status);
    setGems(getUserGems(user?.id, profile?.totalXp));

    // Check if redirected from fresh login
    const justLoggedIn = sessionStorage.getItem('rsb_show_daily_reward');
    if (justLoggedIn === 'true') {
      sessionStorage.removeItem('rsb_show_daily_reward');
      if (status.canClaim) {
        setIsDailyRewardModalOpen(true);
      }
    }

    const handleGemsUpdate = (e: any) => {
      if (e.detail?.gems !== undefined) setGems(e.detail.gems);
    };
    window.addEventListener('rsb_gems_updated', handleGemsUpdate);
    return () => window.removeEventListener('rsb_gems_updated', handleGemsUpdate);
  }, [user?.id, profile?.currentStreak, profile?.totalXp]);

  const handleRewardClaimed = (_gemsEarned: number, _starsEarned: number, newStreak: number) => {
    setRewardStatus({ ...rewardStatus, canClaim: false });
    if (profile) {
      updateProfileState({
        ...profile,
        currentStreak: newStreak,
      });
    }
  };

  const latestInvoice = invoices[0];
  const isFeePaid = latestInvoice?.status === 'PAID';

  const academicTitle =
    activeLevel === 'CLASS_8'
      ? '৮ম শ্রেণি (JSC) বিজ্ঞান ও গণিত ফাউন্ডেশন ব্যাচ'
      : activeLevel === 'SSC'
      ? 'এসএসসি (SSC Science) ২০২৬ এক্সিলেন্স ব্যাচ'
      : 'এইচএসসি (HSC Science) উচ্চ মাধ্যমিক ব্যাচ';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Motivational Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-4 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-blue-100 text-[10px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              <span className="truncate">{academicTitle}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              হ্যালো, {user?.name}! প্রস্তুত তো আজকের ক্লাসের জন্য?
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              "কঠিন পরিশ্রমে সাফল্য নিশ্চিত। প্রতিদিনের লেকচার শিট অনুশীলন করুন এবং কুইজ খেলে আপনার কনসেপ্ট ঝালাই করে নিন।" — রায়হান স্যার
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <QrCode className="w-4 h-4 text-blue-700" />
              <span>ডিজিটাল QR ব্যাজ দেখুন</span>
            </button>
            <Link
              to="/vault"
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-blue-600/80 hover:bg-blue-600 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 whitespace-nowrap text-center"
            >
              <BookOpen className="w-4 h-4" />
              <span>স্টাডি ভল্ট ও NCTB বই</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Login Reward Claim Alert Banner */}
      {rewardStatus.canClaim && (
        <div className="p-3.5 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-blue-900/80 border border-purple-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-purple-500/30 animate-bounce flex-shrink-0">
              🎁
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white flex items-center space-x-2">
                <span>আজকের দৈনিক লগইন বোনাস প্রস্তুত!</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold uppercase">
                  Ready
                </span>
              </h4>
              <p className="text-[11px] sm:text-xs text-purple-200 mt-0.5">
                লগইন স্ট্রিক বজায় রেখে সংগ্রহ করুন: <strong className="text-cyan-300">+{rewardStatus.gems} 💎 Gems</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDailyRewardModalOpen(true)}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 whitespace-nowrap active:scale-95"
          >
            <span>রিওয়ার্ড ক্লেইম করুন 💎</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid - Compact 2-col on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Profile Status */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">প্রোফাইল</p>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${profile?.isCompleted ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'}`}>
              {profile?.isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              {profile?.isCompleted ? '১০০% সম্পন্ন' : 'অসম্পূর্ণ'}
            </h4>
            <Link to="/profile" className="text-[11px] sm:text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block">
              {profile?.isCompleted ? 'তথ্য দেখুন →' : 'পূরণ করুন →'}
            </Link>
          </div>
        </div>

        {/* Monthly Tuition Fee */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">চলতি মাসের ফি</p>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isFeePaid ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'}`}>
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <h4 className={`text-sm sm:text-base font-black truncate ${isFeePaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isFeePaid ? 'পরিশোধিত (PAID)' : 'বকেয়া (UNPAID)'}
            </h4>
            <Link to="/billing" className="text-[11px] sm:text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block truncate">
              {isFeePaid ? 'রিসিট →' : 'পেমেন্ট করুন →'}
            </Link>
          </div>
        </div>

        {/* Gems Wallet */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gems ওয়ালেট</p>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center">
              <Gem className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-cyan-600 dark:text-cyan-400 flex items-center space-x-1">
              <span>{gems} 💎</span>
            </h4>
            <Link to="/games" className="text-[11px] sm:text-xs text-cyan-600 font-semibold hover:underline mt-1 inline-block">
              গেমস খেলুন →
            </Link>
          </div>
        </div>

        {/* 24-Hour Science Championship Exam */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">২৪-ঘণ্টা এক্সাম</p>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 truncate">
              +৩ Gems বোনাস
            </h4>
            <Link to="/games" className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline mt-1 inline-block">
              পরীক্ষা দিন →
            </Link>
          </div>
        </div>

        {/* Daily Streak - Spans 2 cols on mobile */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">লগইন স্ট্রিক</p>
            <h4 className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 mt-1">
              {profile?.currentStreak || 1} দিন টানা 🔥
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              দৈনিক কুইজ খেলুন
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Main Grid: Study Vault Shortcuts & Teacher Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Academic Segmented Subject Fast Vault (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Academic Level Selector & Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>আমার সিলেবাস ও বিষয়ভিত্তিক স্টাডি ভল্ট</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                শিক্ষাস্তর অনুসারে সাজানো অধ্যায়, লেকচার শিট ও বোর্ড বই
              </p>
            </div>

            {/* Academic Level Toggle Chips */}
            <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setActiveLevel('CLASS_8');
                  localStorage.setItem('rsb_selected_academic_level', 'CLASS_8');
                }}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center truncate ${
                  activeLevel === 'CLASS_8'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏫 ৮ম (JSC)
              </button>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setActiveLevel('SSC');
                  localStorage.setItem('rsb_selected_academic_level', 'SSC');
                }}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center truncate ${
                  activeLevel === 'SSC'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🎓 এসএসসি
              </button>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setActiveLevel('HSC');
                  localStorage.setItem('rsb_selected_academic_level', 'HSC');
                }}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center truncate ${
                  activeLevel === 'HSC'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🔬 এইচএসসি
              </button>
            </div>
          </div>

          {/* DYNAMIC SUBJECT CARDS PER ACADEMIC LEVEL */}
          {activeLevel === 'CLASS_8' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/vault?subject=CLASS_8_SCIENCE"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg">
                    🧪
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      বিজ্ঞান (Class 8 Science)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">পরমাণুর গঠন, অম্ল-ক্ষারক-লবণ, আলো, বর্তনী</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>৮ম শ্রেণির কনসেপ্ট ও নোটস</span>
                  <span className="font-bold text-blue-600">ভল্ট খুলুন →</span>
                </div>
              </Link>

              <Link
                to="/vault?subject=CLASS_8_MATH"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-lg">
                    📐
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">
                      গণিত (Class 8 Mathematics)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">প্যাটার্ন, বীজগণিতীয় সূত্রাবলি, জ্যামিতি</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>অনুশীলনী সমাধান ও CQ শিট</span>
                  <span className="font-bold text-purple-600">ভল্ট খুলুন →</span>
                </div>
              </Link>
            </div>
          )}

          {activeLevel === 'SSC' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/vault?subject=PHYSICS"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      পদার্থবিজ্ঞান (SSC Physics)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">গতি, বল, কাজ ক্ষমতা শক্তি, তরঙ্গ ও শব্দ</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>লেকচার শিট ও সূত্র</span>
                  <span className="font-bold text-blue-600">ভল্ট খুলুন →</span>
                </div>
              </Link>

              <Link
                to="/vault?subject=CHEMISTRY"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
                    ⚗️
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
                      রসায়ন (SSC Chemistry)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">পদার্থের অবস্থা, পর্যায় সারণি, রাসায়নিক বন্ধন</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>বিক্রিয়া ও নোটস</span>
                  <span className="font-bold text-emerald-600">ভল্ট খুলুন →</span>
                </div>
              </Link>

              <Link
                to="/vault?subject=HIGHER_MATH"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-lg">
                    📐
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">
                      উচ্চতর গণিত (SSC Higher Math)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">সেট ও ফাংশন, বীজগণিতীয় রাশি, দ্বিপদী</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>শর্টকাট ট্রিকস ও CQ</span>
                  <span className="font-bold text-purple-600">ভল্ট খুলুন →</span>
                </div>
              </Link>

              <Link
                to="/vault?subject=BIOLOGY"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-lg">
                    🧬
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-rose-600 transition-colors">
                      জীববিজ্ঞান (SSC Biology)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">জীবন পাঠ, জীবকোষ ও টিস্যু, জীবনীশক্তি</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>চিত্রভিত্তিক লেকচার ও রিভিশন</span>
                  <span className="font-bold text-rose-600">ভল্ট খুলুন →</span>
                </div>
              </Link>
            </div>
          )}

          {activeLevel === 'HSC' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/vault?subject=PHYSICS"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      পদার্থবিজ্ঞান ১ম ও ২য় পত্র (HSC Physics)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ভেক্টর, নিউটোনিয়ান বলবিদ্যা, তাপগতিবিদ্যা, আলো</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>লেকচার শিট ও ফর্মুলা বুক</span>
                  <span className="font-bold text-blue-600">ভল্ট খুলুন →</span>
                </div>
              </Link>

              <Link
                to="/vault?subject=CHEMISTRY"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
                    ⚗️
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
                      রসায়ন ১ম ও ২য় পত্র (HSC Chemistry)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">গুণগত রসায়ন, পর্যায়বৃত্ত ধর্ম, জৈব রসায়ন</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>বিক্রিয়া মেকানিজম ও নোটস</span>
                  <span className="font-bold text-emerald-600">ভল্ট খুলুন →</span>
                </div>
              </Link>

              <Link
                to="/vault?subject=HIGHER_MATH"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-lg">
                    📐
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">
                      উচ্চতর গণিত ১ম ও ২য় পত্র (HSC Math)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ম্যাট্রিক্স, সরলরেখা, ক্যালকুলাস, ত্রিকোণমিতি</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>শর্টকাট ট্রিকস ও CQ শিট</span>
                  <span className="font-bold text-purple-600">ভল্ট খুলুন →</span>
                </div>
              </Link>

              <Link
                to="/vault?subject=ICT"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-lg">
                    💻
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-amber-600 transition-colors">
                      তথ্য ও যোগাযোগ প্রযুক্তি (HSC ICT)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">সংখ্যা পদ্ধতি, লজিক গেট, সি প্রোগ্রামিং, এইচটিএমএল</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>লজিক গেট সার্কিট ও কোড শিট</span>
                  <span className="font-bold text-amber-600">ভল্ট খুলুন →</span>
                </div>
              </Link>
            </div>
          )}

          {/* NCTB Textbooks Direct Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 border border-emerald-500/30 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
                <BookOpen className="w-3 h-3" />
                <span>NCTB Official Textbooks</span>
              </div>
              <h4 className="text-base font-extrabold text-white">
                ৮ম শ্রেণি, এসএসসি ও এইচএসসি মূল বোর্ড বইসমূহ (PDF)
              </h4>
              <p className="text-xs text-emerald-100/80 max-w-xl">
                জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত বিজ্ঞান ও গণিত মূল বইগুলো এক ক্লিকে অনলাইনে পড়ুন বা ডাউনলোড করুন।
              </p>
            </div>

            <Link
              to="/vault"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 whitespace-nowrap active:scale-95"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>বোর্ড বই ডাউনলোড করুন →</span>
            </Link>
          </div>

          {/* Gamification Hub Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 uppercase">
                সায়েন্স ব্রেইন মিনি গেমস
              </span>
              <h4 className="text-lg font-bold">পড়াশোনার ক্লান্তি দূর করতে আজই কুইজ ব্যাটেলে অংশ নিন!</h4>
              <p className="text-xs text-purple-200 max-w-md">
                পিরিয়ডিক টেবিল কুইক ম্যাচ, ফিজিক্স ফর্মুলা রাশ এবং মেন্টাল ম্যাথ স্প্রিন্ট খেলে ব্যাচের শীর্ষে উঠে আসুন।
              </p>
            </div>
            <Link
              to="/games"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm rounded-xl transition-all shadow-md whitespace-nowrap flex items-center space-x-2"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>গেম খেলুন</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Teacher Academic Feedback & QR Quick View (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Teacher Feedback Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center space-x-2 text-blue-600 mb-3">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">রায়হান স্যারের পর্যবেক্ষণ</h3>
            </div>

            {feedback.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 text-xs space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 italic">
                    "{feedback[0].remarks}"
                  </p>
                  {feedback[0].strengths && (
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                      ✓ শক্তি: {feedback[0].strengths}
                    </p>
                  )}
                  {feedback[0].areasToImprove && (
                    <p className="text-rose-700 dark:text-rose-400 font-medium">
                      ⚠ উন্নতির ক্ষেত্র: {feedback[0].areasToImprove}
                    </p>
                  )}
                </div>
                <Link
                  to="/feedback"
                  className="block text-center py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  স্যারের সাথে কথা বলুন / ডাউট জানান →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                চলতি মাসের প্রথম ক্লাসের পর স্যার আপনার ফিডব্যাক আপডেট করবেন।
              </div>
            )}
          </div>

          {/* Quick ID Badge Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md text-center">
            {/* Avatar display on badge */}
            {profile?.avatarUrl && (
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-blue-400/70 shadow-md">
                <img src={profile.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="w-24 h-24 bg-white p-2 rounded-xl mx-auto mb-3 shadow-md">
              {profile?.qrCodeDataUrl ? (
                <img src={profile.qrCodeDataUrl} alt="Student QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">QR Loading</div>
              )}
            </div>
            <h4 className="font-bold text-white text-base">{user?.name}</h4>
            <p className="text-xs text-blue-400 font-mono font-bold mt-0.5">{profile?.studentIdNumber}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {profile?.batch?.name || (activeLevel === 'CLASS_8' ? '৮ম শ্রেণি (JSC)' : activeLevel === 'SSC' ? 'এসএসসি (SSC Science)' : 'এইচএসসি (HSC Science)')}
            </p>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>কার্ড ভিউ ও প্রিন্ট</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Badge Modal */}
      {profile && (
        <QRBadgeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          student={{
            name: user?.name || '',
            studentId: profile.studentIdNumber,
            academicLevel: profile.academicLevel,
            batchName: profile.batch?.name || (activeLevel === 'CLASS_8' ? '৮ম শ্রেণি (JSC)' : activeLevel === 'SSC' ? 'এসএসসি (SSC Science)' : 'এইচএসসি (HSC Science)'),
            institution: profile.institutionName,
            phone: profile.studentPhone,
            qrCodeDataUrl: profile.qrCodeDataUrl,
            avatarUrl: profile.avatarUrl,
          }}
        />
      )}

      {/* Daily Reward Modal */}
      <DailyRewardModal
        isOpen={isDailyRewardModalOpen}
        onClose={() => setIsDailyRewardModalOpen(false)}
        userId={user?.id}
        currentStreak={profile?.currentStreak || 1}
        totalXp={profile?.totalXp || 0}
        onRewardClaimed={handleRewardClaimed}
      />
    </div>
  );
};
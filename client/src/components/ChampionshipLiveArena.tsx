import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { playPop, playSuccessChime, playFanfare } from '../utils/soundFX';
import { awardOnTimeExamReward } from '../utils/rewards';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Timer,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
  Zap,
  Eye,
  ShieldAlert,
  Flame,
  Award
} from 'lucide-react';

interface ChampionshipQuestion {
  id: number;
  subject: string;
  chapter?: string;
  questionText: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
}

interface ChampionshipSession {
  id: string;
  title: string;
  subject: string;
  chapter?: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  startsAt: string;
  expiresAt: string;
  totalParticipants: number;
  questions: ChampionshipQuestion[];
}

interface MyAttempt {
  score: number;
  totalQuestions: number;
  timeTakenSec: number;
  tabSwitches: number;
  answers: Record<string, number>;
  xpEarned: number;
  completedAt: string;
}

interface ChampionshipLiveArenaProps {
  onAttemptCompleted?: () => void;
}

export const ChampionshipLiveArena: React.FC<ChampionshipLiveArenaProps> = ({ onAttemptCompleted }) => {
  const [session, setSession] = useState<ChampionshipSession | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [myAttempt, setMyAttempt] = useState<MyAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 24-hour round countdown timer
  const [roundTimeLeft, setRoundTimeLeft] = useState<{ hours: number; mins: number; secs: number }>({
    hours: 24,
    mins: 0,
    secs: 0,
  });

  // In-Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [examSecondsLeft, setExamSecondsLeft] = useState(12 * 60); // 12 mins
  const [tabSwitches, setTabSwitches] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [fullReviewQuestions, setFullReviewQuestions] = useState<ChampionshipQuestion[]>([]);

  const timerRef = useRef<any>(null);

  // Load Active Championship
  const loadActiveChampionship = async () => {
    try {
      setLoading(true);
      const res = await api.get('/games/championship/active');
      if (res.data.success) {
        const { session: sess, hasAttempted: attempted, myAttempt: att } = res.data.data;
        setSession(sess);
        setHasAttempted(attempted);
        setMyAttempt(att);
        if (sess?.questions) {
          setFullReviewQuestions(sess.questions);
        }
      }
    } catch (err: any) {
      console.error('Failed to load championship', err);
      setError('চ্যাম্পিয়নশিপ সেশন লোড করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveChampionship();
  }, []);

  // Calculate 24-Hour Round Countdown
  useEffect(() => {
    if (!session?.expiresAt) return;

    const updateRoundCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(session.expiresAt).getTime();
      const distance = Math.max(0, expiry - now);

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((distance % (1000 * 60)) / 1000);

      setRoundTimeLeft({ hours, mins, secs });
    };

    updateRoundCountdown();
    const interval = setInterval(updateRoundCountdown, 1000);
    return () => clearInterval(interval);
  }, [session?.expiresAt]);

  // Anti-Cheat: Tab-Switch Visibility Listener
  useEffect(() => {
    if (!gameStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameStarted]);

  // 12-Minute In-Exam Countdown Timer
  useEffect(() => {
    if (!gameStarted) return;

    timerRef.current = setInterval(() => {
      setExamSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameStarted]);

  const handleStartExam = () => {
    playPop();
    setGameStarted(true);
    setExamSecondsLeft((session?.timeLimitMinutes || 12) * 60);
    setAnswers({});
    setTabSwitches(0);
    setCurrentQIndex(0);
  };

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    playPop();
    setAnswers((prev) => ({
      ...prev,
      [qIdx]: optionIdx,
    }));
  };

  const handleAutoSubmit = () => {
    alert('সময় শেষ! আপনার পরীক্ষা স্বয়ংক্রিয়ভাবে সাবমিট করা হচ্ছে...');
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (submitting || !session) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const totalDuration = (session.timeLimitMinutes || 12) * 60;
    const timeTaken = Math.max(1, totalDuration - examSecondsLeft);

    try {
      const res = await api.post('/games/championship/submit', {
        sessionId: session.id,
        answers,
        timeTakenSec: timeTaken,
        tabSwitches,
      });

      if (res.data.success) {
        const data = res.data.data;
        setHasAttempted(true);
        setMyAttempt({
          score: data.score,
          totalQuestions: data.totalQuestions,
          timeTakenSec: data.timeTakenSec,
          tabSwitches: data.tabSwitches,
          answers: data.answers,
          xpEarned: data.xpEarned,
          completedAt: new Date().toISOString(),
        });

        // Award 3 Gems for on-time exam completion ("exam time to time dele 3ta gems")
        awardOnTimeExamReward();

        if (data.fullReview) {
          setFullReviewQuestions(data.fullReview);
        }

        setGameStarted(false);
        playFanfare();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

        if (onAttemptCompleted) {
          onAttemptCompleted();
        }
      }
    } catch (err: any) {
      console.error('Submit championship error', err);
      alert(err.response?.data?.message || 'সাবমিট করতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  const formatExamTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold">২৪-ঘণ্টা লাইভ চ্যাম্পিয়নশিপ লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
        চ্যাম্পিয়নশিপ লোড করা যাচ্ছে না। দয়া করে পেজ রিফ্রেশ করুন।
      </div>
    );
  }

  const questions = session.questions || [];
  const currentQ = questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      {/* 24-Hour Live Championship Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-indigo-500/30 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>২৪-ঘণ্টা লাইভ চ্যাম্পিয়নশিপ</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                {session.subject}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {session.title}
            </h2>

            {session.chapter && (
              <p className="text-xs text-indigo-200/80 font-medium">
                🎯 সিলেবাস: {session.chapter}
              </p>
            )}
          </div>

          {/* 24-Hour Countdown Timer Display */}
          <div className="flex flex-col items-center sm:items-end">
            <div className="text-[10px] text-amber-300 uppercase font-black tracking-widest flex items-center gap-1 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>রাউন্ড শেষ হতে বাকি:</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-400/40 px-4 py-2.5 rounded-2xl shadow-inner">
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  {roundTimeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] block text-slate-400 uppercase">ঘণ্টা</span>
              </div>
              <span className="text-xl font-bold text-amber-400">:</span>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  {roundTimeLeft.mins.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] block text-slate-400 uppercase">মিনিট</span>
              </div>
              <span className="text-xl font-bold text-amber-400">:</span>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {roundTimeLeft.secs.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] block text-slate-400 uppercase">সেকেন্ড</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATE 1: Student Already Attempted - Result & Review Card */}
      {hasAttempted && myAttempt && !gameStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>আপনার পরীক্ষা সম্পন্ন হয়েছে!</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                আপনার ২৪-ঘণ্টা চ্যাম্পিয়নশিপ ফলাফল
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                প্রতি ২৪ ঘণ্টায় মাত্র একবারই অংশ নেওয়া সম্ভব। আপনার স্কোর স্বয়ংক্রিয়ভাবে লাইভ লিডারবোর্ডে যুক্ত হয়েছে।
              </p>
            </div>

            <button
              onClick={() => { playPop(); setShowReviewModal(true); }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-98"
            >
              <Eye className="w-4 h-4" />
              <span>সম্পূর্ণ সমাধান ও ব্যাখ্যা দেখুন</span>
            </button>
          </div>

          {/* Result Score Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">আপনার স্কোর</p>
              <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {myAttempt.score} <span className="text-xs text-slate-400">/{myAttempt.totalQuestions}</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                নিখুঁততা: {Math.round((myAttempt.score / myAttempt.totalQuestions) * 100)}%
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">সময় লেগেছে</p>
              <h4 className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1 font-mono">
                {formatExamTime(myAttempt.timeTakenSec)}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">১২ মিনিটের মধ্যে</p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-center">
              <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400">অন-টাইম এক্সাম রিওয়ার্ড</p>
              <h4 className="text-2xl font-black text-cyan-600 dark:text-cyan-300 mt-1 flex items-center justify-center gap-1">
                <span>+৩ Gems</span> 💎
              </h4>
              <p className="text-[10px] text-cyan-600/80 dark:text-cyan-400/80 mt-0.5">রত্ন একাউন্টে যোগ হয়েছে</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ট্যাব সুইচ সনাক্ত</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">
                {myAttempt.tabSwitches} <span className="text-xs text-slate-400">বার</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {myAttempt.tabSwitches === 0 ? '✓ শতভাগ ফেয়ার প্লে' : 'সতর্কতা চিহ্নিত'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* STATE 2: Pre-Game Rules Screen */}
      {!hasAttempted && !gameStarted && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              সায়েন্স চ্যাম্পিয়নশিপ শুরু করতে প্রস্তুত?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              রায়হান স্যারের গুগল ড্রাইভ বোর্ড কোশ্চেন ব্যাঙ্ক থেকে সংকলিত ২৫টি গুরুত্বপূর্ণ বোর্ড-স্ট্যান্ডার্ড এমসিকিউ।
            </p>
          </div>

          {/* Strict Rules Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <Timer className="w-5 h-5 text-indigo-500 mx-auto" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">১২ মিনিট সময়</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">২৫টি প্রশ্নের জন্য মোট ১২ মিনিট।</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <ShieldAlert className="w-5 h-5 text-rose-500 mx-auto" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">একবারই সুযোগ (1x)</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">২৪ ঘণ্টায় কেবল একবার সাবমিট করা যাবে।</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">টাই-ব্রেকার রেটিং</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">স্কোর সমান হলে দ্রুততম শিক্ষার্থী বিজয়ী হবে।</p>
            </div>
          </div>

          <div className="p-3.5 max-w-xl mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2.5">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>অ্যান্টি-চিটিং নোটিশ:</strong> পরীক্ষা চলাকালীন ব্রাউজার বা ট্যাব বদল করলে তা সরাসরি সিস্টেমে কাউন্ট হবে।
            </span>
          </div>

          {/* Start CTA */}
          <div className="text-center pt-2">
            <button
              onClick={handleStartExam}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all active:scale-98 inline-flex items-center space-x-2"
            >
              <span>২৫-MCQ চ্যাম্পিয়নশিপ শুরু করুন 🚀</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: In-Game Interactive Exam Screen */}
      {gameStarted && currentQ && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          {/* Top In-Exam Navigation & Timers */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                প্রশ্ন {currentQIndex + 1} / {questions.length}
              </span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                উত্তর দেওয়া হয়েছে: {answeredCount} / {questions.length}
              </h4>
            </div>

            <div className="flex items-center space-x-3">
              {/* Anti-cheat tab alert */}
              {tabSwitches > 0 && (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>ট্যাব সুইচ: {tabSwitches}</span>
                </div>
              )}

              {/* 12-Min Countdown */}
              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-mono text-sm font-black border transition-colors ${
                  examSecondsLeft < 120
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700'
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>{formatExamTime(examSecondsLeft)}</span>
              </div>
            </div>
          </div>

          {/* Quick Jump Navigator Buttons (1 to 25) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {questions.map((q, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent = currentQIndex === idx;
              return (
                <button
                  key={q.id || idx}
                  onClick={() => { playPop(); setCurrentQIndex(idx); }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-2 ring-blue-500/30'
                      : isAnswered
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Text Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 block mb-1">
              {currentQ.chapter || session.subject}
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.questionText}
            </h3>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = answers[currentQIndex] === optIdx;
              const optionLetters = ['ক', 'খ', 'গ', 'ঘ'];
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQIndex, optIdx)}
                  className={`p-4 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 text-blue-900 dark:text-blue-100 font-bold'
                      : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {optionLetters[optIdx]}
                  </span>
                  <span className="text-xs sm:text-sm">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Bottom Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => { playPop(); setCurrentQIndex((prev) => Math.max(0, prev - 1)); }}
              disabled={currentQIndex === 0}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পূর্ববর্তী</span>
            </button>

            {currentQIndex < questions.length - 1 ? (
              <button
                onClick={() => { playPop(); setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1)); }}
                className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <span>পরবর্তী প্রশ্ন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-2.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 active:scale-98 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'সাবমিট হচ্ছে...' : 'পরীক্ষা জমা দিন (Submit)'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* FULL SOLUTION REVIEW MODAL */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>২৫টি প্রশ্নের পূর্ণাঙ্গ সমাধান ও কনসেপ্ট ব্যাখ্যা</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    স্কোর: {myAttempt?.score}/{myAttempt?.totalQuestions} • রায়হান স্যারের বিস্তারিত নোট
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                >
                  বন্ধ করুন
                </button>
              </div>

              {/* Scrollable Questions Review */}
              <div className="p-5 overflow-y-auto space-y-5">
                {fullReviewQuestions.map((q, idx) => {
                  const studentAns = myAttempt?.answers?.[idx] ?? myAttempt?.answers?.[q.id];
                  const isCorrect = studentAns !== undefined && studentAns === q.correctIndex;
                  const optionLetters = ['ক', 'খ', 'গ', 'ঘ'];

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-4 rounded-2xl border ${
                        isCorrect
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          প্রশ্ন {idx + 1}: {q.questionText}
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>সঠিক</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                            <XCircle className="w-4 h-4" />
                            <span>ভুল</span>
                          </span>
                        )}
                      </div>

                      {/* Options List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isStudentChoice = studentAns === oIdx;
                          const isTheCorrectAns = q.correctIndex === oIdx;

                          let badgeClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                          if (isTheCorrectAns) {
                            badgeClass = 'bg-emerald-100 dark:bg-emerald-900 border-emerald-400 text-emerald-900 dark:text-emerald-100 font-bold';
                          } else if (isStudentChoice && !isCorrect) {
                            badgeClass = 'bg-rose-100 dark:bg-rose-900 border-rose-400 text-rose-900 dark:text-rose-100 font-bold';
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2 ${badgeClass}`}
                            >
                              <span className="font-bold">{optionLetters[oIdx]}.</span>
                              <span>{opt}</span>
                              {isTheCorrectAns && <span className="ml-auto text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">✓ সঠিক উত্তর</span>}
                              {isStudentChoice && !isTheCorrectAns && <span className="ml-auto text-[10px] text-rose-600 dark:text-rose-300 font-bold">আপনার পছন্দ</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Rayhan Sir's Concept Explanation */}
                      {q.explanation && (
                        <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                          <strong>💡 ব্যাখ্যা (কনসেপ্ট নোট):</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

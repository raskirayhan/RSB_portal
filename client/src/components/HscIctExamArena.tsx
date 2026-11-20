import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { playPop, playSuccessChime, playFanfare } from '../utils/soundFX';
import { updateUserGems } from '../utils/rewards';
import confetti from 'canvas-confetti';
import {
  Binary,
  Clock,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Zap,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Send,
  HelpCircle,
  BookOpen,
  Filter,
  Trophy,
  ChevronRight,
  Eye,
  ShieldAlert,
  Flame,
  Check
} from 'lucide-react';

interface QuestionItem {
  id: string;
  displayNumber: number;
  chapter: number;
  chapterTitle: string;
  topic?: string;
  questionText: string;
  options: string[];
  boardYear?: string;
}

interface QuestionReview {
  id: string;
  chapter: number;
  chapterTitle: string;
  topic?: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  correctOptionText: string;
  chosenText: string | null;
  selectedIndex: number;
  isCorrect: boolean;
  explanation: string;
  boardYear?: string;
}

interface ExamResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSec: number;
  tabSwitches: number;
  xpEarned: number;
  gemsEarned: number;
  questionsReview: QuestionReview[];
}

interface ChapterOption {
  id: number;
  title: string;
  totalQuestions: number;
}

interface HscIctExamArenaProps {
  userId?: string;
  onViewLeaderboard?: () => void;
}

export const HscIctExamArena: React.FC<HscIctExamArenaProps> = ({ userId, onViewLeaderboard }) => {
  // Config & Status States
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [chapters, setChapters] = useState<ChapterOption[]>([]);
  const [totalBankQuestions, setTotalBankQuestions] = useState<number>(0);
  const [selectedLength, setSelectedLength] = useState<30 | 40>(30);
  const [selectedChapter, setSelectedChapter] = useState<string>('ALL');

  // Exam Progress States
  const [examState, setExamState] = useState<'CONFIG' | 'IN_PROGRESS' | 'COMPLETED'>('CONFIG');
  const [startingExam, setStartingExam] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers stores: { [questionId]: chosenOptionText }
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Timer & Anti-Cheat
  const [timeLeftSec, setTimeLeftSec] = useState<number>(25 * 60);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Result & Review States
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'WRONG' | 'CORRECT'>('ALL');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // 1. Load Question Bank Config
  const loadConfig = async () => {
    try {
      setLoadingConfig(true);
      const res = await api.get('/hsc-ict/config');
      if (res.data.success) {
        setChapters(res.data.data.chapters || []);
        setTotalBankQuestions(res.data.data.totalQuestionsInBank || 0);
      }
    } catch (err) {
      console.error('Failed to load HSC ICT config', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // 2. Anti-Cheat Visibility Change Detector
  useEffect(() => {
    if (examState !== 'IN_PROGRESS') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const updated = prev + 1;
          setShowTabWarning(true);
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examState]);

  // 3. Countdown Timer
  useEffect(() => {
    if (examState !== 'IN_PROGRESS') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [examState]);

  // Start Dynamic Exam
  const handleStartExam = async () => {
    try {
      setStartingExam(true);
      playPop();

      const res = await api.post('/hsc-ict/generate-exam', {
        questionCount: selectedLength,
        chapterFilter: selectedChapter,
      });

      if (res.data.success && res.data.data?.questions) {
        const fetchedQuestions = res.data.data.questions;
        setQuestions(fetchedQuestions);
        setCurrentIndex(0);
        setAnswers({});
        setTabSwitches(0);
        setShowTabWarning(false);
        const limitMins = selectedLength === 40 ? 35 : 25;
        setTimeLeftSec(limitMins * 60);
        startTimeRef.current = Date.now();
        setExamState('IN_PROGRESS');
      }
    } catch (err: any) {
      console.error('Failed to start ICT exam', err);
      alert(err.response?.data?.message || 'পরীক্ষা শুরু করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setStartingExam(false);
    }
  };

  // Option selection
  const handleSelectOption = (questionId: string, optionText: string) => {
    playPop();
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  // Auto-submit when time expires
  const handleAutoSubmit = () => {
    handleSubmitExam(true);
  };

  // Submit Exam
  const handleSubmitExam = async (isAuto: boolean = false) => {
    if (submittingExam) return;
    try {
      setSubmittingExam(true);
      setShowSubmitModal(false);

      const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      const questionIds = questions.map((q) => q.id);

      const res = await api.post('/hsc-ict/submit-exam', {
        questionCount: questions.length,
        chapterFilter: selectedChapter,
        timeTakenSec,
        tabSwitches,
        answers,
        questionIds,
      });

      if (res.data.success && res.data.data) {
        const result: ExamResult = res.data.data;
        setExamResult(result);
        setExamState('COMPLETED');

        // Award +3 Gems on completion
        updateUserGems(userId, 3);

        // Sound & Confetti celebration
        if (result.accuracy >= 70) {
          playFanfare();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
          });
        } else {
          playSuccessChime();
        }
      }
    } catch (err: any) {
      console.error('Failed to submit ICT exam', err);
      alert(err.response?.data?.message || 'পরীক্ষা জমা দিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmittingExam(false);
    }
  };

  // Reset for a fresh retake
  const handleRetakeExam = () => {
    playPop();
    setExamResult(null);
    setExamState('CONFIG');
    loadConfig();
  };

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // Bengali option letter mapping
  const banglaLetters = ['ক', 'খ', 'গ', 'ঘ'];

  // ==========================================
  // RENDER: EXAM CONFIGURATION SCREEN
  // ==========================================
  if (examState === 'CONFIG') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/30 p-8 shadow-2xl text-white">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-12 bottom-6 opacity-20 hidden md:block">
            <Binary className="w-48 h-48 text-blue-300" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Binary className="w-3.5 h-3.5" /> এইচএসসি আইসিটি ডাইনামিক এক্সাম ইঞ্জিন
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              আনলিমিটেড এইচএসসি আইসিটি <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">MCQ প্র্যাকটিস এরিনা</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              রেহান স্যারের ৫-স্টার মাস্টার গাইড থেকে প্রস্তুতকৃত শতভাগ নির্ভুল বোর্ড স্ট্যান্ডার্ড প্রশ্নব্যাংক।
              কোনো ২৪ ঘণ্টার অপেক্ষা নেই—যেকোনো সময় আনলিমিটেড পরীক্ষা দিন। প্রতিবার নতুন ও অভিন্ন প্রশ্ন নির্বাচন।
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300">প্রশ্ন ব্যাংকে প্রশ্ন:</span>
                <span className="text-sm font-bold text-white">
                  {loadingConfig ? '...' : `${totalBankQuestions}+ প্রশ্ন`}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">কমপ্লিশন বোনাস:</span>
                <span className="text-sm font-bold text-emerald-300">+৩ জেমস</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300">অ্যান্টি-চিট:</span>
                <span className="text-sm font-bold text-amber-300">ট্যাব ট্র্যাকিং অ্যাক্টিভ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-400" /> পরীক্ষার কনফিগারেশন নির্বাচন করুন
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              আপনার প্রয়োজন অনুযায়ী অধ্যায় এবং প্রশ্নের সংখ্যা নির্ধারণ করে সরাসরি পরীক্ষায় প্রবেশ করুন।
            </p>
          </div>

          {/* Step 1: Question Count */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 block">
              ১. পরীক্ষার দৈর্ঘ্য (প্রশ্নের সংখ্যা ও সময়সীমা):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedLength(30)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                  selectedLength === 30
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`p-3 rounded-xl ${selectedLength === 30 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <Timer className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">৩০টি বহুনির্বাচনি (MCQ)</span>
                    {selectedLength === 30 && (
                      <span className="bg-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white">সিলেক্টেড</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">সময়সীমা: ২৫ মিনিট • কুইক স্প্রিন্ট প্র্যাকটিস</p>
                  <p className="text-xs text-emerald-400 font-medium mt-1">✓ কমপ্লিশনে +৩ জেমস বোনাস</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLength(40)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                  selectedLength === 40
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`p-3 rounded-xl ${selectedLength === 40 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">৪০টি বহুনির্বাচনি (MCQ)</span>
                    {selectedLength === 40 && (
                      <span className="bg-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white">সিলেক্টেড</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">সময়সীমা: ৩৫ মিনিট • ফুল বোর্ড স্ট্যান্ডার্ড টেস্ট</p>
                  <p className="text-xs text-emerald-400 font-medium mt-1">✓ কমপ্লিশনে +৩ জেমস বোনাস</p>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Chapter Selection */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-slate-300 block">
              ২. সিলেবাস ও অধ্যায় ফিল্টার:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedChapter('ALL')}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedChapter === 'ALL'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm">সকল অধ্যায় (বোর্ড স্ট্যান্ডার্ড মিক্স)</div>
                  <div className="text-xs text-slate-400 mt-0.5">১ থেকে ৬ অধ্যায়ের সমন্বিত প্রশ্ন</div>
                </div>
                {selectedChapter === 'ALL' && <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />}
              </button>

              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChapter(String(ch.id))}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedChapter === String(ch.id)
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="pr-2">
                    <div className="font-semibold text-sm truncate">{ch.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {ch.totalQuestions > 0 ? `${ch.totalQuestions}টি প্রশ্ন প্রস্তুত` : 'মাস্টার গাইড সংকলন'}
                    </div>
                  </div>
                  {selectedChapter === String(ch.id) && (
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button & Leaderboard Link */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onViewLeaderboard}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
            >
              <Trophy className="w-4 h-4" /> আইসিটি টপ পারফর্মার লিডারবোর্ড দেখুন
            </button>

            <button
              type="button"
              onClick={handleStartExam}
              disabled={startingExam}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {startingExam ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> প্রশ্ন প্রস্তুত হচ্ছে...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" /> পরীক্ষা শুরু করুন ({selectedLength} MCQs)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: LIVE EXAM IN PROGRESS
  // ==========================================
  if (examState === 'IN_PROGRESS' && currentQ) {
    const isLast = currentIndex === questions.length - 1;
    const isCurrentAnswered = answers[currentQ.id] !== undefined;

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
        {/* Anti-cheat tab switch warning */}
        {showTabWarning && (
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between text-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs md:text-sm">
                <span className="font-bold">সতর্কবার্তা:</span> আপনি ব্রাউজার ট্যাব পরিবর্তন করেছেন ({tabSwitches} বার)।
                পরীক্ষার স্বচ্ছতার জন্য অনুগ্রহ করে উইন্ডো পরিবর্তন করবেন না।
              </div>
            </div>
            <button
              onClick={() => setShowTabWarning(false)}
              className="text-xs text-amber-300 hover:text-white px-2 py-1 rounded bg-amber-500/20"
            >
              বুঝেছি
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="sticky top-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              {currentIndex + 1}
            </div>
            <div>
              <div className="text-xs text-slate-400">প্রশ্ন অগ্রগতি</div>
              <div className="text-sm font-bold text-white">
                {currentIndex + 1} / {questions.length} • উত্তর দেওয়া: {answeredCount}
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-base font-bold transition-all ${
            timeLeftSec < 120
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
              : 'bg-slate-800 border-slate-700 text-cyan-300'
          }`}>
            <Clock className="w-5 h-5" />
            <span>{formatTime(timeLeftSec)}</span>
          </div>

          {/* Quick Submit Button */}
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs md:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" /> পরীক্ষা জমা দিন
          </button>
        </div>

        {/* Question Navigator Grid */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>প্রশ্ন নেভিগেটর ({questions.length}টি প্রশ্ন)</span>
            <span className="text-[11px] text-emerald-400">{answeredCount}টি সম্পন্ন</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5">
            {questions.map((q, idx) => {
              const isAns = answers[q.id] !== undefined;
              const isCurr = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    isCurr
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : isAns
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Question Card */}
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl"
        >
          {/* Question Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                {currentQ.chapterTitle}
              </span>
              {currentQ.topic && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs">
                  {currentQ.topic}
                </span>
              )}
            </div>
            {currentQ.boardYear && (
              <span className="text-xs text-amber-400/90 font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {currentQ.boardYear}
              </span>
            )}
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
              {currentIndex + 1}. {currentQ.questionText}
            </h3>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((optText, optIdx) => {
              const isSelected = answers[currentQ.id] === optText;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, optText)}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                      : 'bg-slate-800/40 border-slate-700/70 text-slate-200 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/80 text-slate-300'
                    }`}
                  >
                    {banglaLetters[optIdx] || optIdx + 1}
                  </div>
                  <div className="text-sm md:text-base font-medium flex-1 pt-0.5">
                    {optText}
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> পূর্ববর্তী
            </button>

            <div className="text-xs text-slate-400">
              {isCurrentAnswered ? (
                <span className="text-emerald-400 font-medium">✓ উত্তর রেকর্ড করা হয়েছে</span>
              ) : (
                <span>একটি বিকল্প বেছে নিন</span>
              )}
            </div>

            {isLast ? (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
              >
                জমা দিন <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
              >
                পরবর্তী <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Confirmation Submit Modal */}
        <AnimatePresence>
          {showSubmitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">পরীক্ষা কি সমাপ্ত করবেন?</h3>
                  <p className="text-xs text-slate-400">
                    মোট প্রশ্ন: <span className="font-bold text-white">{questions.length}</span> | উত্তর দিয়েছেন:{' '}
                    <span className="font-bold text-emerald-400">{answeredCount}</span> | বাকি রয়েছে:{' '}
                    <span className="font-bold text-amber-400">{questions.length - answeredCount}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    ফিরে যান
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitExam(false)}
                    disabled={submittingExam}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    {submittingExam ? 'জমা হচ্ছে...' : 'হ্যাঁ, জমা দিন'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==========================================
  // RENDER: EXAM COMPLETED / SOLUTION REVIEW
  // ==========================================
  if (examState === 'COMPLETED' && examResult) {
    const filteredReview = examResult.questionsReview.filter((qr) => {
      if (reviewFilter === 'WRONG') return !qr.isCorrect;
      if (reviewFilter === 'CORRECT') return qr.isCorrect;
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
        {/* Performance Victory Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-8 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> পরীক্ষা সফলভাবে সম্পন্ন হয়েছে
          </div>

          <div>
            <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              {examResult.score} / {examResult.totalQuestions}
            </div>
            <p className="text-slate-300 text-sm mt-2">
              নির্ভুলতা: <span className="font-bold text-emerald-400">{examResult.accuracy}%</span>
              {examResult.accuracy >= 80 ? ' • 🌟 অসাধারণ প্রস্তুতি!' : ' • আরও অনুশীলনে সেরা ফলাফল আসবে!'}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">সময় লেগেছে</div>
              <div className="text-base font-bold text-white mt-0.5">{formatTime(examResult.timeTakenSec)}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">ট্যাব সুইচ</div>
              <div className="text-base font-bold text-amber-300 mt-0.5">{examResult.tabSwitches} বার</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">অর্জিত পয়েন্ট</div>
              <div className="text-base font-bold text-blue-400 mt-0.5">+{examResult.xpEarned} XP</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="text-[11px] text-emerald-400">জেমস বোনাস</div>
              <div className="text-base font-bold text-emerald-300 mt-0.5">+{examResult.gemsEarned} 💎</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleRetakeExam}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> নতুন পরীক্ষা দিন (Different Questions)
            </button>

            {onViewLeaderboard && (
              <button
                type="button"
                onClick={onViewLeaderboard}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2 transition-all"
              >
                <Trophy className="w-4 h-4 text-amber-400" /> আইসিটি লিডারবোর্ড দেখুন
              </button>
            )}
          </div>
        </div>

        {/* Detailed Solutions & Concept Explanations */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> রেহান স্যারের পূর্ণাঙ্গ সমাধান ও ব্যাখ্যা
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                প্রতিটি প্রশ্নের নির্ভুল উত্তর ও পাঠ্যবই ভিত্তিক মূল কনসেপ্ট নোট
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setReviewFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  reviewFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                সব প্রশ্ন ({examResult.questionsReview.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('WRONG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  reviewFilter === 'WRONG'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ভুল উত্তর ({examResult.questionsReview.filter((q) => !q.isCorrect).length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('CORRECT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  reviewFilter === 'CORRECT'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                সঠিক ({examResult.questionsReview.filter((q) => q.isCorrect).length})
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {filteredReview.map((qr, idx) => (
              <div
                key={qr.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 ${
                  qr.isCorrect
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-red-950/10 border-red-500/30'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        qr.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {qr.chapterTitle} • {qr.topic || 'সাধারণ'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {qr.boardYear && (
                      <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        {qr.boardYear}
                      </span>
                    )}
                    {qr.isCorrect ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> সঠিক উত্তর (+১)
                      </span>
                    ) : (
                      <span className="text-xs text-red-400 font-bold flex items-center gap-1 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30">
                        <XCircle className="w-3.5 h-3.5" /> ভুল উত্তর
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <h4 className="text-base font-bold text-white leading-relaxed">
                  {qr.questionText}
                </h4>

                {/* Option Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {qr.options.map((opt, optIdx) => {
                    const isTheCorrectOption = opt.trim().toLowerCase() === qr.correctOptionText.trim().toLowerCase();
                    const isStudentChosen = qr.chosenText && opt.trim().toLowerCase() === qr.chosenText.trim().toLowerCase();

                    let style = 'bg-slate-800/40 border-slate-700/60 text-slate-400';
                    if (isTheCorrectOption) {
                      style = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isStudentChosen && !qr.isCorrect) {
                      style = 'bg-red-950/40 border-red-500 text-red-200 font-medium';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs md:text-sm flex items-center justify-between gap-2 ${style}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs opacity-75">
                            {banglaLetters[optIdx] || optIdx + 1}.
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isTheCorrectOption && (
                          <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">
                            সঠিক উত্তর
                          </span>
                        )}
                        {isStudentChosen && !isTheCorrectOption && (
                          <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded">
                            আপনার উত্তর
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Rayhan Sir's Bengali Explanation Box */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 space-y-1.5 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> রেহান স্যারের কনসেপ্ট নোট:
                  </div>
                  <p className="leading-relaxed text-slate-200">
                    {qr.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

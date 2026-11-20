import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import {
  GraduationCap,
  Play,
  CheckCircle,
  Users,
  Shield,
  FileText,
  Smartphone,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  X,
  Star,
  BookOpen,
  Award,
  Zap,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Phone,
  MapPin,
  TrendingUp,
  Cpu,
  Atom,
  Flame,
  Binary
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [landingData, setLandingData] = useState<any>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    api
      .get('/public/landing-data')
      .then((res) => {
        if (res.data.success) {
          setLandingData(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load landing data', err));
  }, []);

  const faqs = [
    {
      q: 'How do I register and get my Student QR ID?',
      a: 'রেজিস্ট্রেশন পেইজে গিয়ে নাম, ইমেইল ও পাসওয়ার্ড দিয়ে সাইন-আপ করলে আপনার ইমেইলে একটি ৬-ডিজিটের OTP কোড যাবে। কোডটি ভেরিফাই করার পর আপনার প্রোফাইল ১০০% পূরণ করলেই সিস্টেম স্বয়ংক্রিয়ভাবে একটি ইউনিক RSB স্টুডেন্ট আইডি ও কিউআর (QR) ব্যাজ তৈরি করে দেবে।',
    },
    {
      q: 'How does the monthly tuition fee payment work?',
      a: 'প্রতি মাসের ১ তারিখে আপনার স্টুডেন্ট ড্যাশবোর্ডে ওই মাসের টিউশন ফি যোগ হবে। আপনি bKash বা Nagad-এ ফি পাঠিয়ে ট্রানজেকশন আইডি (TrxID) ইনপুট দিলেই স্যার ভেরিফাই করে অ্যাপ্রুভ করবেন এবং সাথে সাথেই আপনি অফিসিয়াল ডিজিটাল মানি রিসিট ডাউনলোড করতে পারবেন।',
    },
    {
      q: 'Can guardians track their child’s monthly attendance and test results?',
      a: 'হ্যাঁ, প্রোফাইলে দেওয়া অভিভাবকের ইমেইলে প্রতি মাসের শেষে শিক্ষার্থীর মোট উপস্থিতি, অধ্যায়ভিত্তিক কুইজের স্কোর, এবং রায়হান স্যারের স্পেশাল পার্সোনালাইজড ফিডব্যাক স্বয়ংক্রিয়ভাবে পৌঁছে যাবে।',
    },
    {
      q: 'Where are the offline coaching batches located in Khulna & Bagerhat?',
      a: 'খুলনা ও বাগেরহাটের নির্দিষ্ট প্রাইভেট সেন্টারে সপ্তাহে ৩ দিন করে অফলাইন ব্যাচ পরিচালিত হয়। অফলাইনে ক্লাসের পাশাপাশি শিক্ষার্থীরা যেকোনো সময় ওয়েবসাইটের স্টাডি ভল্ট, ওয়াটারমার্কড নোটস ও ডেমো ভিডিও ব্যাকআপ হিসেবে ব্যবহার করতে পারে।',
    },
    {
      q: 'What makes the PDF notes anti-piracy and watermarked?',
      a: 'যেকোনো শিক্ষার্থী যখন কোনো লেকচার শিট বা সূত্রের শিট ডাউনলোড করে, সিস্টেম রিয়েল-টাইমে পিডিএফ ফাইলের প্রতিটি পৃষ্ঠার ওপর ওই শিক্ষার্থীর নাম, স্টুডেন্ট আইডি, ফোন নম্বর ও ডাউনলোডের সঠিক সময় দিয়ে অদৃশ্য ও দৃশ্যমান ওয়াটারমার্ক এমবেড করে দেয়।',
    },
  ];

  const subjects = [
    {
      code: 'PHYSICS',
      name: 'Physics (পদার্থবিজ্ঞান)',
      badge: 'Mechanics & Waves',
      topics: 'ভেক্টর, গতিবিদ্যা, নিউটনীয় বলবিদ্যা, কাজ-শক্তি ও পর্যায়বৃত্ত গতি',
      color: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
      tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      icon: Atom,
      iconColor: 'text-blue-600',
    },
    {
      code: 'CHEMISTRY',
      name: 'Chemistry (রসায়ন)',
      badge: 'Organic & Equilibrium',
      topics: 'গুণগত রসায়ন, পর্যায়বৃত্ত ধর্ম, জৈব রসায়নের মেকানিজম ও বিক্রিয়া',
      color: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
      tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      icon: Flame,
      iconColor: 'text-emerald-600',
    },
    {
      code: 'HIGHER_MATH',
      name: 'Higher Math (উচ্চতর গণিত)',
      badge: 'Calculus & Vectors',
      topics: 'ম্যাট্রিক্স-নির্ণায়ক, সরলরেখা, বৃত্ত, অন্তরীকরণ ও যোগজীকরণ',
      color: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
      tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
      icon: TrendingUp,
      iconColor: 'text-amber-600',
    },
    {
      code: 'GENERAL_MATH',
      name: 'General Math (সাধারণ গণিত)',
      badge: 'Algebra & Geometry',
      topics: 'বাস্তব সংখ্যা, বীজগণিতীয় রাশি, জ্যামিতিক উপপাদ্য ও পরিমিতি',
      color: 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200',
      tagColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
      icon: BookOpen,
      iconColor: 'text-orange-600',
    },
    {
      code: 'BIOLOGY',
      name: 'Biology (জীববিজ্ঞান)',
      badge: 'Genetics & Physiology',
      topics: 'কোষ ও কোষের গঠন, ডিএনএ রেপ্লিকেশন, জিনতত্ত্ব ও বিবর্তন',
      color: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200',
      tagColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
      icon: Sparkles,
      iconColor: 'text-rose-600',
    },
    {
      code: 'ICT',
      name: 'ICT (তথ্য ও প্রযুক্তি)',
      badge: 'C Code & Logic Gates',
      topics: 'সংখ্যা পদ্ধতি, ডিজিটাল ডিভাইস, সি প্রোগ্রামিং অ্যালগরিদম ও এইচটিএমএল',
      color: 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200',
      tagColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
      icon: Binary,
      iconColor: 'text-purple-600',
    },
  ];

  const reviews = [
    {
      name: 'আবির হোসেন',
      level: 'HSC Science 2026',
      college: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
      rating: 5,
      comment:
        'ফিজিক্সের ভেক্টর আর গতিবিদ্যার অংকগুলো আগে মুখস্থ করার মতো লাগত। রায়হান স্যারের ক্লাস করার পর বুঝতে পারলাম সায়েন্সকে ইঞ্জিনিয়ারিং লজিকে কতটা সহজভাবে ভাবা যায়!',
    },
    {
      name: 'সাকিব আল হাসান',
      level: 'SSC Science 2026',
      college: 'খুলনা জিলা স্কুল',
      rating: 5,
      comment:
        'অর্গানিক কেমিস্ট্রির বিক্রিয়াগুলো আগে আতঙ্কের মতো ছিল। স্যারের শর্টকাট সূত্রের শিট এবং ৩ মিনিটের কনসেপ্ট ভিডিওগুলো রিভিশনের জন্য সেরা সাপোর্ট দেয়।',
    },
    {
      name: 'মো: মোস্তফা কামাল (অভিভাবক)',
      level: 'গার্ডিয়ান অব আবির',
      college: 'খুলনা',
      rating: 5,
      comment:
        'সবচেয়ে ভালো লেগেছে প্রতি মাসের শেষে গার্ডিয়ান রিপোর্ট এবং স্বয়ংক্রিয় bKash রিসিট সিস্টেম। ছেলে কতদিন উপস্থিত ছিল আর কোন অধ্যায়ে দুর্বল তা ঘরে বসেই জানতে পারি।',
    },
  ];

  return (
    <div className="space-y-0 selection:bg-blue-600 selection:text-white">
      {/* ========================================================= */}
      {/* SECTION 1: GLASS NAVBAR & HERO (Light Lavender/White Theme) */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden pt-8 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800/80">
        {/* Glow orbs - clamped on mobile */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[90vw] max-w-[650px] h-[250px] sm:h-[350px] bg-gradient-to-tr from-blue-400/15 via-indigo-400/20 to-purple-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Column: Headline & CTAs */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-blue-100/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[10px] sm:text-xs font-black tracking-wide max-w-full text-center leading-normal"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="truncate sm:overflow-visible">CLASS 8, SSC & HSC 2026-2027 • KHULNA & BAGERHAT</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]"
              >
                Master Science (Class 8, SSC & HSC) with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  Rayhan Sir
                </span>{' '}
                — Smarter, Faster, Clearer.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium"
              >
                ইন্টারেক্টিভ ৩ মিনিটের কনসেপ্ট লেসন, অ্যান্টি-লিক ওয়াটারমার্কড নোটস, মান্থলি গার্ডিয়ান প্রগ্রেস ট্র্যাকিং এবং ব্রেন গেমস—খুলনা ও বাগেরহাটের বিজ্ঞান শিক্ষার্থীদের জন্য পূর্ণাঙ্গ একাডেমিক সাপোর্ট।
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1 sm:pt-2"
              >
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 text-sm sm:text-base text-center"
                >
                  <span>Join the Batch 🚀</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/vault"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex items-center justify-center space-x-2 text-sm sm:text-base backdrop-blur-md text-center"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Study Vault (Notes & PDFs) 📚</span>
                </Link>
              </motion.div>

              {/* Batch Location Pill */}
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>অফলাইন প্রাইভেট ব্যাচ: খুলনা ও বাগেরহাট • সাথে ২৪/৭ স্মার্ট পোর্টাল ব্যাকআপ</span>
              </div>
            </div>

            {/* Right Column: Centerpiece Visual Card with Floating Badges */}
            <div className="lg:col-span-5 relative w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative mx-auto w-full max-w-sm sm:max-w-md bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-7 backdrop-blur-xl"
              >
                {/* Header Profile Badge */}
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                    RR
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
                      শেখ রাসকি রায়হান
                    </h3>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                      CSE Engineer & Science Educator
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      Khulna & Bagerhat Mentor
                    </span>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-[11px] sm:text-xs font-bold text-blue-900 dark:text-blue-200">
                    <span className="flex items-center space-x-2 truncate">
                      <Atom className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate">Physics (Mechanics & Waves)</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-blue-200/70 dark:bg-blue-900 px-2 py-0.5 rounded-full font-mono flex-shrink-0 ml-1">
                      CORE
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-[11px] sm:text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <span className="flex items-center space-x-2 truncate">
                      <Flame className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">Chemistry (Organic & Periodic)</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-emerald-200/70 dark:bg-emerald-900 px-2 py-0.5 rounded-full font-mono flex-shrink-0 ml-1">
                      CORE
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-[11px] sm:text-xs font-bold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center space-x-2 truncate">
                      <TrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="truncate">Higher Math (Calculus & Vectors)</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-amber-200/70 dark:bg-amber-900 px-2 py-0.5 rounded-full font-mono flex-shrink-0 ml-1">
                      CORE
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-[11px] sm:text-xs font-bold text-purple-900 dark:text-purple-200">
                    <span className="flex items-center space-x-2 truncate">
                      <Binary className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="truncate">ICT (C Code & Logic Gates)</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-purple-200/70 dark:bg-purple-900 px-2 py-0.5 rounded-full font-mono flex-shrink-0 ml-1">
                      CORE
                    </span>
                  </div>
                </div>

                {/* Target GPA 5.00 Banner */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md">
                  <div className="flex items-center space-x-2 sm:space-x-2.5">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold">Target: Board GPA 5.00</p>
                      <p className="text-[9px] sm:text-[10px] text-blue-100">BUET & Medical Admission Foundation</p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black bg-white/20 px-2 py-0.5 sm:py-1 rounded-lg flex-shrink-0">100% Care</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: TRUST & COUNTER BAR (Floating White Card)       */}
      {/* ========================================================= */}
      <section className="-mt-6 sm:-mt-10 relative z-20 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl p-4 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 md:bg-transparent">
              <p className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">500+</p>
              <p className="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">Students Mentored</p>
              <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400">SSC & HSC Science Batches</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 md:bg-transparent">
              <p className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
              <p className="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">Concept Clarity</p>
              <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400">Zero Memorization Guarantee</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 md:bg-transparent">
              <p className="text-2xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">Smart</p>
              <p className="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">Digital QR Portal</p>
              <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400">Auto-ID & Attendance Scan</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 md:bg-transparent">
              <p className="text-2xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">24/7</p>
              <p className="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">Doubt Support</p>
              <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400">Direct WhatsApp & Portal</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: HOW YOUR LEARNING WORKS (Deep Dark Navy #0F0C29)*/}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-24 bg-[#0F0C29] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-3.5 py-1 rounded-full border border-indigo-800">
              STREAMLINED WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4">
              How Your Learning Works at Rayhan's Lab
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              অ্যাডমিশন থেকে শুরু করে বোর্ড পরীক্ষায় এ-প্লাস অর্জন—৬টি স্বয়ংক্রিয় ধাপে সাজানো আপনার সফলতার যাত্রা
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 backdrop-blur-md transition-all hover:translate-y-[-4px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-mono font-black text-lg">
                01
              </div>
              <h3 className="text-base font-extrabold text-white">Quick Sign-Up & OTP</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google, Facebook অথবা ৫ মিনিটের মেয়াদযুক্ত ৬-ডিজিট ইমেইল OTP দিয়ে ১ মিনিটে নিরাপদ সাইন-আপ ও পাসওয়ার্ড রিসেট সুবিধা।
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 backdrop-blur-md transition-all hover:translate-y-[-4px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-black text-lg">
                02
              </div>
              <h3 className="text-base font-extrabold text-white">Smart Digital ID & QR Card</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                প্রোফাইল শতভাগ পূরণ করলেই সিস্টেম ইউনিক RSB আইডি (যেমন: RSB-26-001) ও QR ব্যাজ তৈরি করবে, যা অফলাইন ক্লাসের অ্যাটেনডেন্সে স্ক্যান হয়।
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 backdrop-blur-md transition-all hover:translate-y-[-4px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-mono font-black text-lg">
                03
              </div>
              <h3 className="text-base font-extrabold text-white">3-Min Concept Videos</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                বড় লেকচারের ক্লান্তি দূর করতে জটিল টপিকগুলো ২-৪ মিনিটের নিখুঁত কনসেপ্ট ভিডিওতে ব্যাখ্যা করা—যাতে যেকোনো সময় দ্রুত রিভিশন দেওয়া যায়।
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all hover:translate-y-[-4px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-black text-lg">
                04
              </div>
              <h3 className="text-base font-extrabold text-white">The Study Vault & Watermarking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                অধ্যায়ভিত্তিক লেকচার শিট, সূত্রের শিট ও ক্যাডেট কলেজ CQ প্রশ্নব্যাংক ডাউনলোড করুন। পাইরেসি রোধে থাকবে আপনার নিজস্ব ডায়নামিক ওয়াটারমার্ক।
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-rose-500/40 backdrop-blur-md transition-all hover:translate-y-[-4px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-mono font-black text-lg">
                05
              </div>
              <h3 className="text-base font-extrabold text-white">Brain Arena & Quizzes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ফিজিক্স ফর্মুলা রাশ ও পিরিয়ডিক টেবিল কুইজ খেলে অর্জন করুন XP পয়েন্ট, স্ট্রিক ব্যাজ এবং ব্যাচের লিডারবোর্ডে টপ র‍্যাংক দখল করুন।
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 backdrop-blur-md transition-all hover:translate-y-[-4px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-black text-lg">
                06
              </div>
              <h3 className="text-base font-extrabold text-white">Monthly Guardian Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                প্রতি মাসে অভিভাবকের ইমেইলে শিক্ষার্থীর উপস্থিতি, অধ্যায় টেস্টের প্রগ্রেস এবং টিউশন ফি জমার ডিজিটাল মানি রিসিট পৌঁছে যাবে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: WHY RAYHAN'S LAB IS DIFFERENT (Clean Light Grid) */}
      {/* ========================================================= */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-3.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              THE RAYHAN ADVANTAGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-4">
              Why Rayhan's Science Lab is Different
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              সাধারণ মুখস্থবিদ্যার বদলে লজিক্যাল অ্যানালাইসিস এবং টেকনোলজি-সাপোর্টেড প্রিমিয়াম লার্নিং
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                CSE Engineer's Analytical Approach
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                কম্পিউটার সায়েন্স ইঞ্জিনিয়ারিং ব্যাকগ্রাউন্ডের শিক্ষক হিসেবে সায়েন্স ও আইসিটির প্রতিটি সূত্রকে রিয়েল-লাইফ লজিক ও প্রবলেম সলভিং মাইন্ডসেটে উপস্থাপন করা হয়।
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Personalized Teacher Feedback
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                কেবল ক্লাস নেওয়াই নয়, প্রতিটি শিক্ষার্থীর খাতা দেখে তার দুর্বল অধ্যায়গুলো চিহ্নিত করে আলাদা ফিডব্যাক ও স্ট্র্যাটেজিক নোট প্রদান করা হয়।
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Hassle-Free Monthly Billing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                বিকাশ/নগদ-এ ফি পরিশোধের সাথে সাথে ট্রানজেকশন ট্র্যাক করা যায় এবং অনুমোদনের পর স্বয়ংক্রিয় ডিজিটাল PDF মানি রিসিট ডাউনলোড করা যায়।
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Offline + Online Hybrid Support
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                খুলনা ও বাগেরহাটের শিক্ষার্থীদের জন্য মুখোমুখি অফলাইন প্রাইভেট কোচিং এবং অসুস্থতা বা ছুটির দিনে ওয়েবসাইট থেকে ফুল অনলাইন ব্যাকআপ।
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Board Exam & Admission Focus
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                বোর্ড পরীক্ষার সৃজনশীল CQ ও বহুনির্বাচনী MCQ-এর পূর্ণাঙ্গ প্রস্তুতির পাশাপাশি বুয়েট ও মেডিকেল ভর্তি পরীক্ষার প্রাথমিক ভিত্তি তৈরি।
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Anti-Distraction Learning Zone
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                সোশ্যাল মিডিয়ায় অপ্রয়োজনীয় সময় নষ্ট না করে শিক্ষার্থীরা ওয়েবসাইটেই কুইজ খেলে, ফর্মুলা রাফ করে ও স্ট্রিক তৈরি করে আনন্দের সাথে পড়বে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: DARK EVOLUTION ROADMAP BANNER (Dark Emerald/Teal)*/}
      {/* ========================================================= */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#061a14] via-[#0d281e] to-[#082017] text-white border-y border-emerald-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column (5 cols) */}
            <div className="lg:col-span-5 space-y-3 text-center lg:text-left">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                ACADEMIC ROADMAP
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                From Board Basics to Engineering & Medical Foundation
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
                পরিকল্পিত ৪-ধাপের মাইলস্টোন যা ৮ম-৯ম শ্রেণি থেকে শুরু করে বিশ্ববিদ্যালয় ভর্তি পরীক্ষা পর্যন্ত প্রতিটি সায়েন্স স্টুডেন্টকে আত্মবিশ্বাসী করে তোলে।
              </p>
            </div>

            {/* Right Column: Connected Node Graph (7 cols) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-900/30 border border-emerald-500/30 text-center space-y-1.5 backdrop-blur-md">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">STEP 01</span>
                  <h4 className="text-xs font-black text-white">Class 8-10 Foundation</h4>
                  <p className="text-[10px] text-emerald-300/70">মৌলিক ধারণা ও বোর্ডের সৃজনশীল সমাধান</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 text-center space-y-1.5 backdrop-blur-md">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">STEP 02</span>
                  <h4 className="text-xs font-black text-white">HSC Core Concepts</h4>
                  <p className="text-[10px] text-emerald-300/70">গাণিতিক বিশ্লেষণ ও জটিল সূত্রের ব্যুৎপত্তি</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-900/50 border border-emerald-400/60 text-center space-y-1.5 shadow-lg shadow-emerald-500/20 backdrop-blur-md">
                  <span className="text-[10px] font-mono text-emerald-300 font-bold">STEP 03</span>
                  <h4 className="text-xs font-black text-white">Board GPA 5.00</h4>
                  <p className="text-[10px] text-emerald-200">ক্যাডেট কলেজ প্রশ্নব্যাংক ও টাইম ম্যানেজমেন্ট</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-emerald-600/40 to-teal-700/40 border border-emerald-300/80 text-center space-y-1.5 backdrop-blur-md">
                  <span className="text-[10px] font-mono text-white font-bold">STEP 04</span>
                  <h4 className="text-xs font-black text-white">BUET / Medical / Varsity</h4>
                  <p className="text-[10px] text-emerald-100">অ্যাডভান্সড প্রবলেম সলভিং ও ভর্তি প্রস্তুতি</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: SUBJECTS & MODULES WE COVER (Pastel 6-Card Grid)*/}
      {/* ========================================================= */}
      <section id="subjects" className="py-24 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              CURRICULUM COVERAGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-4">
              Subjects & Modules We Cover
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              বিজ্ঞান বিভাগের প্রতিটি বিষয়ে জাতীয় শিক্ষাক্রম অনুযায়ী থিওরি, গাণিতিক সমস্যা এবং সৃজনশীল প্রস্তুতি
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => {
              const Icon = sub.icon;
              return (
                <div
                  key={sub.code}
                  className={`p-7 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${sub.color}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${sub.tagColor}`}>
                      {sub.badge}
                    </span>
                    <Icon className={`w-5 h-5 ${sub.iconColor}`} />
                  </div>

                  <h3 className="text-lg font-black mb-2">{sub.name}</h3>
                  <p className="text-xs opacity-90 leading-relaxed mb-4">{sub.topics}</p>

                  <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                    <span>ফুল সিলেবাস কভারেজ</span>
                    <Link
                      to="/vault"
                      className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>নোটস দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: STUDENT & GUARDIAN EXPERIENCES                */}
      {/* ========================================================= */}
      <section id="reviews" className="py-20 bg-[#090d16] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Student & Guardian Reviews Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3.5 py-1 rounded-full border border-blue-800">
              TRUST & EXCELLENCE
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-3">
              Student & Guardian Experiences
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              খুলনা ও বাগেরহাটের শিক্ষার্থী ও অভিভাবকদের বাস্তব অভিজ্ঞতা
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3"
              >
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                <div className="pt-3 border-t border-white/10">
                  <h5 className="text-xs font-black text-white">{rev.name}</h5>
                  <p className="text-[10px] text-slate-400">{rev.level} • {rev.college}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: ACCORDION FAQ (Clean Light Menu)               */}
      {/* ========================================================= */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-3.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-4">
              স্টুডেন্ট ও অভিভাবকদের সাধারণ প্রশ্নাবলী
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              ভর্তি, ব্যাচের সময়সূচি বা পোর্টাল ব্যবহার নিয়ে যেকোনো তথ্যের সহজ উত্তর
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: DIRECT CONNECT CTA BANNER                      */}
      {/* ========================================================= */}
      <section className="py-20 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full border border-white/30">
            ADMISSIONS OPEN • SSC & HSC 2026-2027
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Ready to Master Science with Rayhan Sir?
          </h2>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            খুলনা ও বাগেরহাটের বিজ্ঞান ব্যাচে আসন সংখ্যা সীমিত। যেকোনো তথ্যের জন্য এখনই সরাসরি কল করুন অথবা অনলাইনে আপনার ডিজিটাল আইডি তৈরি করে নিন।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <span>Join the Batch Now 🚀</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>

            <a
              href="https://wa.me/8801779181871"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-400 shadow-xl transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: 01779-181871</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

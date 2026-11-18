import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { QRBadgeModal } from '../../components/QRBadgeModal';
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
  TrendingUp
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

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

  const latestInvoice = invoices[0];
  const isFeePaid = latestInvoice?.status === 'PAID';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Motivational Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-blue-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>বিজ্ঞান বিভাগে A+ অর্জনের মিশন ২০২৬</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              হ্যালো, {user?.name}! প্রস্তুত তো আজকের ক্লাসের জন্য?
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              "কঠিন পরিশ্রমে সাফল্য নিশ্চিত। প্রতিদিনের লেকচার শিট অনুশীলন করুন এবং কুইজ খেলে আপনার কনসেপ্ট ঝালাই করে নিন।" — রায়হান স্যার
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <QrCode className="w-4 h-4 text-blue-700" />
              <span>ডিজিটাল QR ব্যাজ দেখুন</span>
            </button>
            <Link
              to="/vault"
              className="px-5 py-3 rounded-xl bg-blue-600/80 hover:bg-blue-600 border border-white/20 text-white font-bold text-sm transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>নোটস ডাউনলোড</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Profile Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">প্রোফাইল স্ট্যাটাস</p>
            <h4 className="text-lg font-black text-slate-900 mt-1">
              {profile?.isCompleted ? '১০০% সম্পন্ন' : 'অসম্পূর্ণ (Incomplete)'}
            </h4>
            <Link to="/profile" className="text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block">
              {profile?.isCompleted ? 'তথ্য দেখুন →' : 'এখনই তথ্য পূরণ করুন →'}
            </Link>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile?.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {profile?.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
        </div>

        {/* Monthly Tuition Fee */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">চলতি মাসের ফি</p>
            <h4 className={`text-lg font-black mt-1 ${isFeePaid ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isFeePaid ? 'পরিশোধিত (PAID)' : 'বকেয়া (UNPAID)'}
            </h4>
            <Link to="/billing" className="text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block">
              {isFeePaid ? 'মানি রিসিট ডাউনলোড →' : 'bKash-এ পেমেন্ট করুন →'}
            </Link>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isFeePaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Total XP Points */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">মোট অর্জিত পয়েন্ট</p>
            <h4 className="text-lg font-black text-purple-600 mt-1">
              {profile?.totalXp || 0} XP
            </h4>
            <Link to="/games" className="text-xs text-purple-600 font-semibold hover:underline mt-1 inline-block">
              গেমস খেলে XP বাড়ান →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">লগইন স্ট্রিক</p>
            <h4 className="text-lg font-black text-amber-600 mt-1">
              {profile?.currentStreak || 1} দিন টানা
            </h4>
            <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
              প্রতিদিনের কুইজে অংশ নিন
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Main Grid: Study Vault Shortcuts & Teacher Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Subject Fast Vault (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">বিষয়ভিত্তিক স্টাডি ভল্ট (নোটস ও প্রশ্নব্যাংক)</h3>
              <p className="text-xs text-slate-500">আপনার জন্য রিয়েল-টাইম ওয়াটারমার্কড পিডিএফ প্রস্তুত রয়েছে</p>
            </div>
            <Link to="/vault" className="text-xs font-bold text-blue-600 hover:underline">
              সব নোট দেখুন →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/vault?subject=PHYSICS"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    পদার্থবিজ্ঞান (Physics)
                  </h4>
                  <p className="text-xs text-slate-500">ভেক্টর, গতিবিদ্যা, নিউটনীয় বলবিদ্যা</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span>লেকচার শিট ও সূত্র</span>
                <span className="font-bold text-blue-600">ভল্ট খুলুন →</span>
              </div>
            </Link>

            <Link
              to="/vault?subject=CHEMISTRY"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ⚗️
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    রসায়ন (Chemistry)
                  </h4>
                  <p className="text-xs text-slate-500">গুণগত রসায়ন, পর্যায়বৃত্ত ধর্ম, জৈব যৌগ</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span>বিক্রিয়া ও নোটস</span>
                <span className="font-bold text-emerald-600">ভল্ট খুলুন →</span>
              </div>
            </Link>

            <Link
              to="/vault?subject=HIGHER_MATH"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  📐
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                    উচ্চতর গণিত (Higher Math)
                  </h4>
                  <p className="text-xs text-slate-500">ম্যাট্রিক্স, সরলরেখা, ক্যালকুলাস</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span>শর্টকাট ট্রিকস ও CQ</span>
                <span className="font-bold text-purple-600">ভল্ট খুলুন →</span>
              </div>
            </Link>

            <Link
              to="/vault?subject=ICT"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  💻
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                    তথ্য ও যোগাযোগ প্রযুক্তি (ICT)
                  </h4>
                  <p className="text-xs text-slate-500">ডিজিটাল লজিক, সি প্রোগ্রামিং, এইচটিএমএল</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span>লজিক গেট সার্কিট শিট</span>
                <span className="font-bold text-amber-600">ভল্ট খুলুন →</span>
              </div>
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-2 text-blue-600 mb-3">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-sm">রায়হান স্যারের পর্যবেক্ষণ</h3>
            </div>

            {feedback.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-2">
                  <p className="font-semibold text-slate-700 italic">
                    "{feedback[0].remarks}"
                  </p>
                  {feedback[0].strengths && (
                    <p className="text-emerald-700 font-medium">
                      ✓ শক্তি: {feedback[0].strengths}
                    </p>
                  )}
                  {feedback[0].areasToImprove && (
                    <p className="text-rose-700 font-medium">
                      ⚠ উন্নতির ক্ষেত্র: {feedback[0].areasToImprove}
                    </p>
                  )}
                </div>
                <Link
                  to="/feedback"
                  className="block text-center py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
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
            <div className="w-24 h-24 bg-white p-2 rounded-xl mx-auto mb-3 shadow-md">
              {profile?.qrCodeDataUrl ? (
                <img src={profile.qrCodeDataUrl} alt="Student QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">QR Loading</div>
              )}
            </div>
            <h4 className="font-bold text-white text-base">{user?.name}</h4>
            <p className="text-xs text-blue-400 font-mono font-bold mt-0.5">{profile?.studentIdNumber}</p>
            <p className="text-[11px] text-slate-400 mt-1">{profile?.batch?.name || profile?.academicLevel}</p>

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
            batchName: profile.batch?.name,
            institution: profile.institutionName,
            phone: profile.studentPhone,
            qrCodeDataUrl: profile.qrCodeDataUrl,
          }}
        />
      )}
    </div>
  );
};

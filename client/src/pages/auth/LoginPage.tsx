import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Monitor,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Gem,
  Star,
  Flame,
  Trophy,
  Gamepad2,
  Atom,
  CheckCircle2
} from 'lucide-react';
import { playPop, playSuccessChime } from '../../utils/soundFX';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    playPop();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
        deviceName: deviceName.trim() || undefined,
      });

      if (res.data.success) {
        const { user, profile, tokens } = res.data.data;
        login(tokens.accessToken, user, profile);

        // Flag to trigger the Daily Login Reward popup on dashboard
        sessionStorage.setItem('rsb_show_daily_reward', 'true');
        playSuccessChime();

        if (user.role === 'SUPER_ADMIN') {
          navigate('/admin');
        } else {
          navigate(from === '/login' ? '/dashboard' : from);
        }
      }
    } catch (err: any) {
      console.error('Login error', err);
      const networkHelp =
        err.message === 'Network Error'
          ? 'সার্ভারে কানেক্ট করা যাচ্ছে না। দয়া করে ব্যাকএন্ড সার্ভার চালু আছে কিনা বা Vercel Settings-এ VITE_API_URL সঠিক কিনা নিশ্চিত করুন।'
          : undefined;
      setError(err.response?.data?.message || networkHelp || 'লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড সঠিক কিনা পরীক্ষা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click test credentials
  const fillCredentials = (role: 'admin' | 'student1' | 'student2') => {
    playPop();
    if (role === 'admin') {
      setEmail('rayhan@rsb.com');
      setPassword('Password123!');
      setDeviceName("Rayhan Sir's Laptop");
    } else if (role === 'student1') {
      setEmail('student@rsb.com');
      setPassword('Password123!');
      setDeviceName('Abir Galaxy Phone');
    } else {
      setEmail('sakib@rsb.com');
      setPassword('Password123!');
      setDeviceName('Sakib Laptop');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Cosmic Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container: 2-Column Split on Large Screens */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Gamification & RSB Lab Showcase */}
        <div className="lg:col-span-6 space-y-6 text-white text-left p-4 sm:p-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold backdrop-blur-md">
            <Atom className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Rayhan's Interactive Science Lab</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              লগইন করলেই পাচ্ছেন দৈনিক Gems & Stars! 💎⭐
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              বিজ্ঞান মুখস্থ নয়, কনসেপ্ট ক্লিয়ার করার স্মার্ট প্ল্যাটফর্ম। প্রতিদিন লগইন করুন, সায়েন্স গেমস খেলুন এবং লিডারবোর্ডের শীর্ষে উঠে জিতে নিন বিশেষ সম্মাননা।
            </p>
          </div>

          {/* Gamification Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:border-purple-400/40 transition-all">
              <div className="flex items-center space-x-2 text-cyan-300 font-extrabold text-sm">
                <Gem className="w-4 h-4 text-cyan-400" />
                <span>+২৫ Gems দৈনিক রিওয়ার্ড</span>
              </div>
              <p className="text-xs text-slate-400">
                প্রতিদিন সাইটে লগইন করলেই অ্যাকাউন্টে ফ্রি রত্ন ও এক্সপি যোগ হবে।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:border-purple-400/40 transition-all">
              <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-sm">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>গেমস খেলে আনলিমিটেড রত্ন</span>
              </div>
              <p className="text-xs text-slate-400">
                Periodic Table, Formula Rush ও Math Sprint জিতে রত্ন বাড়ান।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:border-purple-400/40 transition-all">
              <div className="flex items-center space-x-2 text-orange-300 font-extrabold text-sm">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>টানা স্ট্রিক বোনাস</span>
              </div>
              <p className="text-xs text-slate-400">
                টানা স্ট্রিক ধরে রাখলে দ্বিগুণ রিওয়ার্ড ও এক্সক্লুসিভ ব্যাজ আনলক হবে।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:border-purple-400/40 transition-all">
              <div className="flex items-center space-x-2 text-emerald-300 font-extrabold text-sm">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span>লাইভ ব্যাচ লিডারবোর্ড</span>
              </div>
              <p className="text-xs text-slate-400">
                টপ স্কোরারদের জন্য রায়হান স্যারের স্পেশাল গিফট ও মেন্টরশিপ।
              </p>
            </div>
          </div>

          {/* Live Top Student Badge Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/60 border border-purple-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-md">
                🥇
              </div>
              <div>
                <p className="font-extrabold text-white text-sm">আবির হাসান (RSB-26-001)</p>
                <p className="text-purple-200 text-[11px]">চলতি সপ্তাহের টপ লিডার • ৫ দিন স্ট্রিক 🔥</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-amber-300 text-sm">১,২৫০ XP</span>
              <p className="text-cyan-300 text-[10px] font-bold">💎 ৬২০ Gems</p>
            </div>
          </div>
        </div>

        {/* Right Column: High-Tech Glassmorphic Login Card */}
        <div className="lg:col-span-6 w-full">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                স্টুডেন্ট ও টিচার লগইন
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rayhan Special Batch (RSB_Portal) • খুলনা ও বাগেরহাট
              </p>
            </div>

            {/* Fast 1-Click Credentials Chips */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-700 rounded-2xl text-xs space-y-2.5">
              <div className="flex items-center space-x-1.5 text-blue-900 dark:text-blue-300 font-extrabold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>১-ক্লিকে টেস্ট লগইন (1-Click Fill):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('student1')}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold rounded-xl border border-blue-200 dark:border-slate-600 transition-all text-xs flex items-center space-x-1 shadow-xs active:scale-95"
                >
                  <span>👨‍🎓 আবির (Top Student)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('student2')}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold rounded-xl border border-blue-200 dark:border-slate-600 transition-all text-xs flex items-center space-x-1 shadow-xs active:scale-95"
                >
                  <span>🧑‍🎓 সাকিব (Student)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin')}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs flex items-center space-x-1 shadow-xs active:scale-95"
                >
                  <span>👑 রায়হান স্যার (Admin)</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ইমেইল ঠিকানা (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@rsb.com বা your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    পাসওয়ার্ড (Password)
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Device Name Field + Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ডিভাইসের নাম (ঐচ্ছিক)
                  </label>
                  <span className="text-[10px] text-slate-400">নিরাপত্তার জন্য</span>
                </div>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="যেমন: My Galaxy S24 বা Personal Laptop"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setDeviceName('আমার মোবাইল')}
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>আমার ফোন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceName('ল্যাপটপ')}
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1"
                  >
                    <Laptop className="w-3 h-3" />
                    <span>ল্যাপটপ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceName('বাসার ডেস্কটপ')}
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1"
                  >
                    <Monitor className="w-3 h-3" />
                    <span>ডেস্কটপ</span>
                  </button>
                </div>
              </div>

              {/* Dual-Device Policy Note */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>ডুয়াল-ডিভাইস নীতি:</strong> সর্বোচ্চ ২টি ডিভাইসে লগইন সক্রিয় রাখা যাবে। ৩য় ডিভাইসে লগইন করলে পুরনোটি স্বয়ংক্রিয়ভাবে লগআউট হবে।
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>লগইন যাচাই হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <span>লগইন করুন ও রিওয়ার্ড নিন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register CTA */}
            <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              নতুন শিক্ষার্থী?{' '}
              <Link
                to="/register"
                className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
              >
                এখনই ব্যাচে ভর্তি / অ্যাকাউন্ট তৈরি করুন 🚀
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

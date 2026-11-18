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
  AlertCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { playPop, playSuccessChime } from '../../utils/soundFX';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [batchLevel, setBatchLevel] = useState<'CLASS_8' | 'SSC' | 'HSC'>('HSC');
  const [showPassword, setShowPassword] = useState(false);
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
      });

      if (res.data.success) {
        const { user, profile, tokens } = res.data.data;
        login(tokens.accessToken, user, profile);

        // Store selected academic batch preference if student hasn't set one yet
        if (batchLevel) {
          localStorage.setItem('rsb_selected_academic_level', batchLevel);
        }

        // Trigger daily login reward popup on dashboard
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
          ? 'সার্ভারে কানেক্ট করা যাচ্ছে না। দয়া করে ব্যাকএন্ড সার্ভার চালু আছে কিনা নিশ্চিত করুন।'
          : undefined;
      setError(
        err.response?.data?.message ||
          networkHelp ||
          'লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড সঠিক কিনা পরীক্ষা করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all">
        
        {/* Simple Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            স্টুডেন্ট লগইন
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rayhan Special Batch (RSB_Portal) • খুলনা ও বাগেরহাট
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form: Just Batch, Email & Password */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Batch Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              আপনার ব্যাচ / শ্রেণি (Batch)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setBatchLevel('CLASS_8');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  batchLevel === 'CLASS_8'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                ৮ম শ্রেণি (JSC)
              </button>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  setBatchLevel('SSC');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  batchLevel === 'SSC'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                SSC Science
              </button>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  setBatchLevel('HSC');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  batchLevel === 'HSC'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                HSC Science
              </button>
            </div>
          </div>

          {/* Email Field */}
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
                placeholder="student@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </div>
            ) : (
              <>
                <span>লগইন করুন</span>
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
            অ্যাকাউন্ট তৈরি করুন 🚀
          </Link>
        </div>
      </div>
    </div>
  );
};

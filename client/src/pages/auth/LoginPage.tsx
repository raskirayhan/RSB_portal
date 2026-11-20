import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  GraduationCap,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { playPop, playSuccessChime } from '../../utils/soundFX';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
        identifier: identifier.trim(),
        password,
      });

      if (res.data.success) {
        const { user, profile, tokens } = res.data.data;
        login(tokens.accessToken, user, profile);

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
          'লগইন ব্যর্থ হয়েছে। ইমেইল/ফোন ও পাসওয়ার্ড সঠিক কিনা পরীক্ষা করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'GOOGLE' | 'FACEBOOK') => {
    playPop();
    setError('');
    setLoading(true);

    try {
      const demoEmail = prompt(
        `${provider === 'GOOGLE' ? 'Google' : 'Facebook'} একাউন্টের ইমেইল প্রদান করুন (OAuth Demo):`,
        provider === 'GOOGLE' ? 'student@gmail.com' : 'student@fb.com'
      );

      if (!demoEmail) {
        setLoading(false);
        return;
      }

      const res = await api.post('/auth/social', {
        provider,
        email: demoEmail.trim(),
        name: provider === 'GOOGLE' ? 'Google Student' : 'Facebook Student',
      });

      if (res.data.success) {
        const { user, profile, tokens } = res.data.data;
        login(tokens.accessToken, user, profile);
        sessionStorage.setItem('rsb_show_daily_reward', 'true');
        playSuccessChime();
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `${provider} লগইন ব্যর্থ হয়েছে।`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-5 bg-white dark:bg-slate-900 p-5 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            স্টুডেন্ট লগইন
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
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

        {/* Login Form: Identifier (Email/Phone) & Password */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email OR Phone Number Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ইমেইল অথবা মোবাইল নম্বর (Email or Phone)
            </label>
            <div className="relative">
              {identifier.includes('@') ? (
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              ) : (
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              )}
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="017XXXXXXXX বা student@example.com"
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

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            অথবা সোশ্যাল অ্যাকাউন্টের মাধ্যমে
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Social Auth Buttons (Placed at the bottom) */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => handleSocialAuth('GOOGLE')}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-98"
          >
            {/* Google Multicolor SVG */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialAuth('FACEBOOK')}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-98"
          >
            {/* Facebook Blue SVG */}
            <svg className="w-4 h-4 flex-shrink-0" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>

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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
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

  // Responsive button width matching card while strictly adhering to Google's 200-400px constraint
  const [btnWidth, setBtnWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.min(380, Math.max(240, window.innerWidth - 64));
    }
    return 350;
  });

  useEffect(() => {
    const handleResize = () => {
      setBtnWidth(Math.min(380, Math.max(240, window.innerWidth - 64)));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        } else if (profile && !profile.isProfileComplete) {
          navigate('/complete-profile');
        } else {
          navigate(from === '/login' ? '/dashboard' : from);
        }
      }
    } catch (err: any) {
      console.error('Login error', err);
      const networkHelp =
        err.message === 'Network Error'
          ? 'সার্ভারে কানেক্ট করা যাচ্ছে না। দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন অথবা কিছুক্ষণ পর পুনরায় চেষ্টা করুন।'
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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google সাইন-ইন থেকে কোনো টোকেন পাওয়া যায়নি।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });

      if (res.data.success) {
        const { user, profile, tokens } = res.data.data;
        login(tokens.accessToken, user, profile);
        sessionStorage.setItem('rsb_show_daily_reward', 'true');
        playSuccessChime();
        if (user.role === 'SUPER_ADMIN') {
          navigate('/admin');
        } else if (profile?.isProfileComplete) {
          navigate(from === '/login' ? '/dashboard' : from);
        } else {
          // Mandatory onboarding gatekeeper
          navigate('/complete-profile');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google অ্যাকাউন্ট দিয়ে লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google সাইন-ইন বাতিল করা হয়েছে বা পপআপ বন্ধ করা হয়েছে।');
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
              ইমেইল, মোবাইল নম্বর অথবা স্টুডেন্ট আইডি (Email, Phone or Student ID)
            </label>
            <div className="relative">
              {identifier.includes('@') ? (
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              ) : identifier.toUpperCase().includes('RSB') ? (
                <GraduationCap className="w-4 h-4 text-blue-500 absolute left-3.5 top-3.5" />
              ) : (
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              )}
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="017XXXXXXXX বা RSB-26-001 বা student@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
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

        {/* Real Google OAuth Button */}
        <div className="w-full flex justify-center items-center overflow-hidden">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="continue_with"
            shape="pill"
            width={btnWidth}
            containerProps={{
              className: 'google-oauth-btn-wrapper',
            }}
          />
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

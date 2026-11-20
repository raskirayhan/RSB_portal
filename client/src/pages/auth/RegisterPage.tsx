import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  GraduationCap,
  Mail,
  Phone,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen,
  Users
} from 'lucide-react';
import { playPop, playSuccessChime } from '../../utils/soundFX';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [classLevel, setClassLevel] = useState('HSC_11');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    playPop();
    setError('');

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        fullName: fullName.trim(),
        identifier: identifier.trim(),
        classLevel,
        password,
        confirmPassword,
      });

      if (res.data.success) {
        const { user, profile, tokens } = res.data.data;
        login(tokens.accessToken, user, profile);

        // Store selected academic batch preference
        localStorage.setItem('rsb_selected_academic_level', classLevel);
        sessionStorage.setItem('rsb_show_daily_reward', 'true');
        playSuccessChime();

        // Instant redirect straight to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration Error', err);
      const networkHelp =
        err.message === 'Network Error'
          ? 'সার্ভারে কানেক্ট করা যাচ্ছে না। দয়া করে ব্যাকএন্ড সার্ভার চালু আছে কিনা নিশ্চিত করুন।'
          : undefined;
      setError(
        err.response?.data?.message ||
          networkHelp ||
          'রেজিস্ট্রেশন সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।'
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
        classLevel,
      });

      if (res.data.success) {
        const { user, profile, tokens } = res.data.data;
        login(tokens.accessToken, user, profile);
        localStorage.setItem('rsb_selected_academic_level', classLevel);
        playSuccessChime();
        if (profile?.isProfileComplete) {
          navigate('/dashboard');
        } else {
          // Mandatory onboarding gatekeeper
          navigate('/complete-profile');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google দিয়ে সাইন আপ ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google সাইন-আপ বাতিল করা হয়েছে বা পপআপ বন্ধ করা হয়েছে।');
  };

  const handleFacebookAuth = () => {
    playPop();
    setError('Facebook লগইন বর্তমানে রক্ষণাবেক্ষণে আছে। অনুগ্রহ করে Google অ্যাকাউন্ট দিয়ে সাইন-আপ করুন।');
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
            স্টুডেন্ট সাইন আপ
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Rayhan Special Batch (RSB_Portal) • ইনস্ট্যান্ট ফ্রি রেজিস্ট্রেশন
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form: Instant, No OTP */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              শিক্ষার্থীর পূর্ণ নাম (Full Name)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="যেমন: আবির হাসান"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* 2. Identifier: Email OR Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* 3. Class Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>শ্রেণি / ক্লাস (Class)</span>
            </label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SSC_9">SSC (৯ম শ্রেণি)</option>
              <option value="SSC_10">SSC (১০ম শ্রেণি)</option>
              <option value="HSC_11">HSC (১১শ শ্রেণি - ১ম বর্ষ)</option>
              <option value="HSC_12">HSC (১২শ শ্রেণি - ২য় বর্ষ)</option>
              <option value="CLASS_8">৮ম শ্রেণি (JSC)</option>
            </select>
          </div>

          {/* 5. Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              পাসওয়ার্ড (Password - কমপক্ষে ৬ অক্ষর)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              কনফার্ম পাসওয়ার্ড (Confirm Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Instant Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98 mt-2"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
              </div>
            ) : (
              <>
                <span>সরাসরি সাইন আপ করুন 🚀</span>
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

        {/* Real Google OAuth & Social Auth Buttons */}
        <div className="space-y-2.5">
          <div className="w-full flex justify-center [&>div]:w-full [&>div>iframe]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signup_with"
              shape="pill"
              width="100%"
            />
          </div>

          <button
            type="button"
            onClick={handleFacebookAuth}
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

        {/* Bottom Login Link */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <Link
            to="/login"
            className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
          >
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};

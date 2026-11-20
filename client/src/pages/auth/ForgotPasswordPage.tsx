import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Clock,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import { playPop, playSuccessChime } from '../../utils/soundFX';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes = 300 seconds

  const navigate = useNavigate();

  // 5-minute countdown timer
  useEffect(() => {
    let timer: any;
    if (isOtpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Send 6-Digit Email OTP (5 Mins Validity)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    playPop();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });

      if (res.data.success) {
        setIsOtpSent(true);
        setCountdown(300); // Reset to 5 minutes
        setMessage('পাসওয়ার্ড রিসেট করার ৬ ডিজিটের OTP আপনার ইমেইলে পাঠানো হয়েছে (মেয়াদ ৫ মিনিট)।');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'অনুরোধ পাঠানো সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify 6-Digit Code & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    playPop();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        playSuccessChime();
        alert('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! নতুন পাসওয়ার্ড দিয়ে এখন লগইন করুন।');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-5 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <KeyRound className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            পাসওয়ার্ড পুনরুদ্ধার
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Rayhan Special Batch (RSB_Portal) • সিকিউর ইমেইল ওটিপি
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start space-x-2.5">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Step 1: Request 6-Digit Email Code */}
        {!isOtpSent ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                নিবন্ধিত ইমেইল ঠিকানা (Registered Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                এই ইমেইলে একটি ৫ মিনিট মেয়াদী ৬ ডিজিটের গোপন কোড পাঠানো হবে।
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>কোড পাঠানো হচ্ছে...</span>
                </div>
              ) : (
                <>
                  <span>৬ ডিজিট রিসেট কোড পাঠান</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Enter 6-Digit Code & New Password */
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Target Email & Timer Banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">কোড পাঠানো হয়েছে:</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {email}
              </p>
              <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>কোডের মেয়াদ: {formatTime(countdown)}</span>
              </div>
            </div>

            {/* 6-Digit OTP Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-center">
                ইমেইলে প্রাপ্ত ৬ ডিজিটের কোড
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] sm:tracking-[0.5em] text-xl sm:text-2xl font-black py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                নতুন পাসওয়ার্ড (New Password - কমপক্ষে ৬ অক্ষর)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                কনফার্ম নতুন পাসওয়ার্ড (Confirm Password)
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
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

            {/* Reset Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>সংরক্ষণ করা হচ্ছে...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>পাসওয়ার্ড নিশ্চিত করুন</span>
                </>
              )}
            </button>

            {/* Resend or Change Email Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                ← ইমেইল পরিবর্তন করুন
              </button>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={countdown > 0}
                className={`flex items-center space-x-1 font-bold ${
                  countdown > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-amber-600 dark:text-amber-400 hover:underline'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>পুনরায় কোড পাঠান</span>
              </button>
            </div>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <Link
            to="/login"
            className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← লগইন পেজে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
};

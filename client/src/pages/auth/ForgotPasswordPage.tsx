import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Mail, Lock, CheckCircle, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setIsOtpSent(true);
        setMessage('পাসওয়ার্ড রিসেট করার ৬ ডিজিটের OTP আপনার ইমেইলে পাঠানো হয়েছে।');
      }
    } catch (err: any) {
      setError('অনুরোধ পাঠানো সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      if (res.data.success) {
        alert('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            পাসওয়ার্ড পুনরুদ্ধার
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rayhan Special Batch (RSB_portal)
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start space-x-2.5">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {!isOtpSent ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">নিবন্ধিত ইমেইল ঠিকানা</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'পাঠানো হচ্ছে...' : 'রিসেট কোড (OTP) পাঠান'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইলে প্রাপ্ত ৬ ডিজিট OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-xl font-bold py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড নিশ্চিত করুন'}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            ← লগইন পেজে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
};

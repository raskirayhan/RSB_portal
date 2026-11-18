import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [academicLevel, setAcademicLevel] = useState('HSC_2026');

  // OTP Step State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        academicLevel,
      });

      if (res.data.success) {
        setIsOtpStep(true);
        setSuccess('৬ ডিজিটের ওটিপি (OTP) আপনার ইমেইলে পাঠানো হয়েছে।');
      }
    } catch (err: any) {
      console.error('Registration Error', err);
      const networkHelp = err.message === 'Network Error' 
        ? 'সার্ভারে কানেক্ট করা যাচ্ছে না। দয়া করে ব্যাকএন্ড চালু আছে কিনা বা Vercel Settings-এ VITE_API_URL সঠিক কিনা নিশ্চিত করুন।' 
        : undefined;
      setError(err.response?.data?.message || networkHelp || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otpCode.trim(),
        academicLevel,
      });

      if (res.data.success) {
        alert('অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই হয়েছে। আপনার ইউনিক স্টুডেন্ট আইডি ও QR ব্যাজ জেনারেট হয়েছে। এখন লগইন করুন।');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'ভুল বা মেয়াদোত্তীর্ণ OTP কোড।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isOtpStep ? 'ইমেইল OTP ভেরিফিকেশন' : 'নতুন স্টুডেন্ট রেজিস্ট্রেশন'}
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

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start space-x-2.5">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {!isOtpStep ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর পূর্ণ নাম</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">শ্রেণি / শিক্ষাবর্ষ</label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SSC_2026">SSC 2026 বিজ্ঞান বিভাগ</option>
                <option value="HSC_2026">HSC 2026 বিজ্ঞান বিভাগ (১ম/২য় বর্ষ)</option>
                <option value="HSC_2027">HSC 2027 বিজ্ঞান বিভাগ</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-800 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                সাবমিট করার পর আপনার ইমেইলে ৫ মিনিট মেয়াদী একটি ৬ ডিজিটের সিকিউর OTP কোড পাঠানো হবে।
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>ওটিপি তৈরি হচ্ছে...</span>
              ) : (
                <>
                  <span>OTP ভেরিফিকেশনে এগিয়ে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* OTP Verification Step */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
              <p className="text-xs text-slate-600">কোড পাঠানো হয়েছে:</p>
              <p className="text-sm font-bold text-slate-900">{email}</p>
              <div className="flex items-center justify-center space-x-1 text-[11px] text-amber-600 font-semibold pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>মেয়াদ: ৫ মিনিট</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                ৬ ডিজিটের OTP কোড লিখুন
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200 text-center">
              টেস্টিং নোট: ব্যাকএন্ড কনসোল লগে ওটিপি প্রিন্ট হয়েছে (Check Terminal)।
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>যাচাই করা হচ্ছে...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>ভেরিফাই করুন এবং আইডি তৈরি করুন</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsOtpStep(false)}
              className="w-full text-xs text-slate-500 hover:text-slate-800 text-center"
            >
              ← তথ্য পরিবর্তন করুন
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  GraduationCap,
  Mail,
  Lock,
  Smartphone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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

        if (user.role === 'SUPER_ADMIN') {
          navigate('/admin');
        } else {
          navigate(from === '/login' ? '/dashboard' : from);
        }
      }
    } catch (err: any) {
      console.error('Login error', err);
      const networkHelp = err.message === 'Network Error' 
        ? 'সার্ভারে কানেক্ট করা যাচ্ছে না। দয়া করে ব্যাকএন্ড সার্ভার চালু আছে কিনা বা Vercel Settings-এ VITE_API_URL সঠিক কিনা নিশ্চিত করুন।' 
        : undefined;
      setError(err.response?.data?.message || networkHelp || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill for demonstration/testing
  const fillCredentials = (role: 'admin' | 'student1' | 'student2') => {
    if (role === 'admin') {
      setEmail('rayhan@rsb.com');
      setPassword('Password123!');
      setDeviceName("Rayhan Sir's Laptop");
    } else if (role === 'student1') {
      setEmail('student@rsb.com');
      setPassword('Password123!');
      setDeviceName('Abir Phone');
    } else {
      setEmail('sakib@rsb.com');
      setPassword('Password123!');
      setDeviceName('Sakib Laptop');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            স্টুডেন্ট ও অ্যাডমিন লগইন
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rayhan Special Batch (RSB_portal)
          </p>
        </div>

        {/* Demo Fast-Fill Chips */}
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs space-y-2">
          <div className="flex items-center space-x-1 text-blue-800 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>দ্রুত টেস্টিং ক্রেডেনশিয়াল (1-Click Fill):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials('student1')}
              className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors"
            >
              👨‍🎓 আবির (Full Profile)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('student2')}
              className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors"
            >
              🧑‍🎓 সাকিব (Incomplete)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
            >
              👑 রায়হান স্যার (Admin)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">পাসওয়ার্ড</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ডিভাইসের নাম (ঐচ্ছিক)
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="যেমন: My Galaxy S24 বা Laptop"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Dual-Device Policy Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>ডুয়াল-ডিভাইস নীতি:</strong> সর্বোচ্চ ২টি ডিভাইসে লগইন সক্রিয় রাখা যাবে। ৩য় ডিভাইসে লগইন করলে পুরনোটি স্বয়ংক্রিয়ভাবে লগআউট হবে।
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>যাচাই করা হচ্ছে...</span>
            ) : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
          নতুন স্টুডেন্ট?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            অ্যাকাউন্ট তৈরি করুন
          </Link>
        </div>
      </div>
    </div>
  );
};

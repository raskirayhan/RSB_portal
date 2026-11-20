import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { playSuccessChime } from '../../utils/soundFX';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setErrorMessage('কোনো অথরাইজেশন টোকেন পাওয়া যায়নি।');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        localStorage.setItem('rsb_token', token);
        const res = await api.get('/auth/me');

        if (res.data.success) {
          const { user, profile } = res.data.data;
          login(token, user, profile);
          setStatus('success');
          playSuccessChime();

          if (user.role === 'SUPER_ADMIN') {
            navigate('/admin');
          } else if (profile?.isProfileComplete) {
            navigate('/dashboard');
          } else {
            // Mandatory profile completion gatekeeper
            navigate('/complete-profile');
          }
        } else {
          throw new Error('ব্যবহারকারী তথ্য লোড করতে ব্যর্থ হয়েছে।');
        }
      } catch (err: any) {
        console.error('OAuth Callback Error:', err);
        setStatus('error');
        setErrorMessage(err?.response?.data?.message || err.message || 'OAuth লগইন ব্যর্থ হয়েছে।');
        setTimeout(() => navigate('/login'), 2500);
      }
    };

    handleAuth();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
        {status === 'verifying' && (
          <>
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold">Google অ্যাকাউন্টের সাথে সংযোগ স্থাপন হচ্ছে...</h2>
            <p className="text-xs text-slate-400">
              অনুগ্রহ করে অপেক্ষা করুন, আপনার স্টুডেন্ট আইডি ও প্রোফাইল যাচাই করা হচ্ছে।
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-emerald-400">Google সাইন-ইন সফল!</h2>
            <p className="text-xs text-slate-300">আপনাকে রিডাইরেক্ট করা হচ্ছে...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-rose-400">লগইন ব্যর্থ হয়েছে</h2>
            <p className="text-xs text-slate-400">{errorMessage}</p>
            <p className="text-[11px] text-slate-500">আপনাকে লগইন পেজে ফিরিয়ে নেওয়া হচ্ছে...</p>
          </>
        )}
      </div>
    </div>
  );
};

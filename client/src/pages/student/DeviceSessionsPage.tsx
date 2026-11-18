import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Smartphone,
  Laptop,
  ShieldCheck,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';

export const DeviceSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/auth/sessions');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ডিভাইসটি লগআউট করতে চান?')) return;

    try {
      const res = await api.delete(`/auth/sessions/${sessionId}`);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'ডিভাইস সেশনটি সফলভাবে বন্ধ করা হয়েছে।' });
        await fetchSessions();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'ডিভাইস সেশন বন্ধ করা সম্ভব হয়নি।' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              একাউন্ট সিকিউরিটি ও পাইরেসি রোধ
            </span>
            <span className="text-xs text-slate-500 font-medium">Dual-Device Limit Active</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            লগইন ডিভাইস ও সেশন কন্ট্রোল
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            এক আইডি দিয়ে একাধিক ব্যক্তি যাতে নোটস বা ক্লাস অ্যাক্সেস না করতে পারে, সেজন্য একই সাথে সর্বোচ্চ ২টি ডিভাইসে লগইন অনুমোদন থাকে।
          </p>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[170px]">
          <p className="text-xs font-bold text-slate-600">সক্রিয় ডিভাইস</p>
          <h3 className="text-2xl font-black text-emerald-700 my-0.5">{sessions.length} / ২</h3>
          <span className="text-[11px] text-emerald-800 font-medium">সর্বোচ্চ ২টি প্রযোজ্য</span>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center space-x-3 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* FIFO Explanation Policy */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 text-xs sm:text-sm text-blue-900 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-950">স্বয়ংক্রিয় সেশন কন্ট্রোল নীতি (FIFO Eviction):</p>
          <p className="leading-relaxed text-slate-700">
            যদি আপনার অ্যাকাউন্টে ইতিমধ্যে ২টি ডিভাইস লগইন থাকে এবং আপনি ৩য় কোনো ডিভাইসে লগইন করেন, তবে সবচেয়ে পুরনো ডিভাইসটি স্বয়ংক্রিয়ভাবে লগআউট হয়ে যাবে। অপ্রয়োজনীয় ডিভাইস নিচে থেকে রিমোটলি লগআউট করে নিতে পারেন।
          </p>
        </div>
      </div>

      {/* Active Sessions List */}
      <div className="space-y-4">
        {sessions.map((s, idx) => {
          const isMobile = s.deviceType === 'MOBILE';
          return (
            <div
              key={s.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                  {isMobile ? <Smartphone className="w-6 h-6 text-blue-600" /> : <Laptop className="w-6 h-6 text-indigo-600" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      {s.deviceName || (isMobile ? 'Mobile Phone' : 'Computer Desktop')}
                    </h4>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        বর্তমান সক্রিয় ডিভাইস
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.os || 'Unknown OS'} • {s.browser?.slice(0, 40) || 'Web Browser'}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>সর্বশেষ সক্রিয়: {new Date(s.lastActiveAt).toLocaleString('en-US')}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>IP: {s.ipAddress || '127.0.0.1'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleTerminateSession(s.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>রিমোট লগআউট</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

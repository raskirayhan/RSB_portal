import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Users,
  CreditCard,
  BookOpen,
  QrCode,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Play,
  Sparkles,
  Calendar,
  Clock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingTriggerLoading, setBillingTriggerLoading] = useState(false);
  const [billingMsg, setBillingMsg] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTriggerBilling = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে বর্তমান মাসের অটোমেটিক টিউশন বিলিং চালাতে চান?')) return;
    setBillingTriggerLoading(true);
    setBillingMsg(null);

    try {
      const res = await api.post('/admin/billing/trigger');
      if (res.data.success) {
        setBillingMsg(res.data.message);
        await fetchAnalytics();
      }
    } catch (err: any) {
      setBillingMsg('বিলিং চালাতে সমস্যা হয়েছে।');
    } finally {
      setBillingTriggerLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-900/50">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>রায়হান স্যারের কন্ট্রোল রুম • {analytics?.currentMonth}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            অ্যাডমিন ওভারভিউ ও ব্যাচ অ্যানালিটিক্স
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            সকল ব্যাচের শিক্ষার্থী উপস্থিতি, পেমেন্ট কালেকশন ও স্টাডি ভল্টের সার্বিক কার্যক্রম এক নজরে পর্যবেক্ষণ করুন।
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleTriggerBilling}
            disabled={billingTriggerLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            <span>{billingTriggerLoading ? 'রান হচ্ছে...' : 'মাসিক বিলিং ক্রন চালান'}</span>
          </button>
          <Link
            to="/admin/scanner"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>অফলাইন QR স্ক্যানার</span>
          </Link>
        </div>
      </div>

      {billingMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{billingMsg}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">মোট সক্রিয় শিক্ষার্থী</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{analytics?.totalStudents || 0} জন</h4>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              {analytics?.completedProfiles || 0} জন প্রোফাইল ১০০% সম্পন্ন
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">চলতি মাসের কালেকশন</p>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">
              ৳ {(analytics?.totalCollected || 0).toLocaleString()}
            </h4>
            <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
              {analytics?.currentMonth}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">বকেয়া টিউশন ফি</p>
            <h4 className="text-2xl font-black text-rose-600 mt-1">
              ৳ {(analytics?.pendingAmount || 0).toLocaleString()}
            </h4>
            <span className="text-[11px] text-rose-500 font-semibold mt-1 inline-block">
              মাসের ১৫ তারিখের পর লক নীতি
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Verifications Queue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">bKash ভেরিফিকেশন কিউ</p>
            <h4 className="text-2xl font-black text-amber-600 mt-1">
              {analytics?.pendingPaymentsCount || 0}টি
            </h4>
            <Link to="/admin/payments" className="text-xs font-bold text-amber-700 hover:underline mt-1 inline-block">
              অনুমোদন করুন →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Batches Table & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">অফলাইন ও অনলাইন ব্যাচ সারসংক্ষেপ</h3>
              <p className="text-xs text-slate-500">চলতি সেশনের সক্রিয় ব্যাচসমূহ</p>
            </div>
            <Link to="/admin/students" className="text-xs font-bold text-indigo-600 hover:underline">
              সকল শিক্ষার্থী দেখুন →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">ব্যাচের নাম</th>
                  <th className="px-6 py-4">লেভেল</th>
                  <th className="px-6 py-4">ক্লাস ডেস ও সময়</th>
                  <th className="px-6 py-4">মাসিক ফি</th>
                  <th className="px-6 py-4 text-right">শিক্ষার্থী সংখ্যা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics?.batches?.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{b.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-xs">
                        {b.academicLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {b.scheduleDays} ({b.timeSlot})
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">৳ {b.monthlyFee.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-black text-indigo-700">
                      {b._count?.students || 0} জন
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">তাত্ক্ষণিক অপারেশন মেনু</h3>

            <div className="space-y-2.5">
              <Link
                to="/admin/payments"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-xs">পেমেন্ট ভেরিফিকেশন কিউ</span>
                </div>
                <span className="text-xs font-black bg-amber-600 text-white px-2 py-0.5 rounded-full">
                  {analytics?.pendingPaymentsCount || 0}
                </span>
              </Link>

              <Link
                to="/admin/scanner"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-xs">অফলাইন ব্যাচ QR স্ক্যানার</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">Open Camera</span>
              </Link>

              <Link
                to="/admin/materials"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-xs">নতুন লেকচার শিট ও ডেমো ক্লাস</span>
                </div>
                <span className="text-xs font-bold text-blue-700">+ Add</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

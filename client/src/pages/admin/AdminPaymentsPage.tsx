import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../../api/client';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  Receipt,
  Search,
  Check,
  X
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/payments/pending');
      if (res.data.success) {
        setPendingPayments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (receiptId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(receiptId);
    setActionMsg(null);

    try {
      const res = await api.post('/admin/payments/review', {
        receiptId,
        action,
      });

      if (res.data.success) {
        setActionMsg({ type: 'success', text: res.data.message });
        await fetchPending();
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: 'পেমেন্ট রিভিউ করতে সমস্যা হয়েছে।' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 mb-2">
            <CreditCard className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">ম্যানুয়াল পেমেন্ট গেটকিপার</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            bKash ও Nagad পেমেন্ট ভেরিফিকেশন কিউ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            শিক্ষার্থীদের সাবমিট করা বিকাশ ট্রানজেকশন আইডি (TrxID) এক ক্লিকে অনুমোদন করুন। অনুমোদনের সাথে সাথে স্বয়ংক্রিয়ভাবে ডিজিটাল মানি রিসিট প্রস্তুত হবে।
          </p>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center min-w-[170px]">
          <p className="text-xs font-bold text-slate-600">অনুমোদনের অপেক্ষায়</p>
          <h3 className="text-2xl font-black text-amber-700 my-0.5">{pendingPayments.length} টি</h3>
          <span className="text-[11px] text-amber-800 font-medium">পেন্ডিং TrxID</span>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center space-x-3 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Pending Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">যাচাইয়ের অপেক্ষমান পেমেন্ট তালিকা</h3>
          <span className="text-xs text-slate-400 font-medium">{pendingPayments.length}টি পেন্ডিং</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">শিক্ষার্থী</th>
                <th className="px-6 py-4">মাস</th>
                <th className="px-6 py-4">পরিমাণ</th>
                <th className="px-6 py-4">মেথড</th>
                <th className="px-6 py-4">প্রেরক নম্বর</th>
                <th className="px-6 py-4">Transaction ID (TrxID)</th>
                <th className="px-6 py-4 text-right">অনুমোদন / বাতিল</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingPayments.map((p) => {
                const isProcessing = processingId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{p.user?.name}</div>
                      <div className="text-[11px] text-indigo-600 font-mono font-medium">
                        {p.user?.profile?.studentIdNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{p.invoice?.month}</td>
                    <td className="px-6 py-4 font-black text-slate-900">৳ {p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-xs">
                        {p.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-700">{p.senderNumber}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 font-mono font-black text-xs rounded-lg">
                        {p.trxId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleReview(p.id, 'APPROVE')}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>অ্যাপ্রুভ</span>
                      </button>

                      <button
                        onClick={() => handleReview(p.id, 'REJECT')}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all inline-flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>বাতিল</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {pendingPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">কোনো পেন্ডিং পেমেন্ট ভেরিফিকেশন নেই</p>
                    <p className="text-xs text-slate-400">সবগুলো পেমেন্ট ইতিমধ্যেই যাচাই ও ক্লিয়ার করা হয়েছে।</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

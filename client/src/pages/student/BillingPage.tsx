import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Smartphone,
  ShieldCheck,
  Send,
  Sparkles,
  Receipt
} from 'lucide-react';

export const BillingPage: React.FC = () => {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Payment Submission State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('BKASH_MANUAL');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/billing/invoices');
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPayModalOpen(true);
    setMsg(null);
  };

  const handleSubmitTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMsg(null);

    try {
      const res = await api.post('/billing/submit-manual', {
        invoiceId: selectedInvoice.id,
        paymentMethod,
        senderNumber: senderNumber.trim(),
        trxId: trxId.trim(),
      });

      if (res.data.success) {
        setMsg({ type: 'success', text: res.data.message });
        setSenderNumber('');
        setTrxId('');
        await fetchInvoices();
        setTimeout(() => setIsPayModalOpen(false), 2000);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'পেমেন্ট সাবমিশন ব্যর্থ হয়েছে।' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDownloadReceipt = async (receiptId: string, trx: string) => {
    try {
      const token = localStorage.getItem('rsb_token');
      const response = await fetch(`${API_BASE_URL}/billing/receipt/${receiptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('রিসিট ডাউনলোড করা যায়নি।');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RSB_Receipt_${trx}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const activeInvoice = invoices[0];
  const isOverdue = activeInvoice?.status === 'OVERDUE';
  const isPaid = activeInvoice?.status === 'PAID';

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              অটোমেটেড বিলিং ইঞ্জিন
            </span>
            <span className="text-xs text-slate-500 font-medium">প্রতি মাসের ১ তারিখে ইনভয়েস যুক্ত হয়</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            টিউশন ফি ও পেমেন্ট রিসিট
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            বিকাশ বা নগদ ট্রানজেকশন আইডি সাবমিট করে ১ ক্লিকে ভেরিফাই করান এবং অফিসিয়াল সাইন করা ডিজিটাল মানি রিসিট ডাউনলোড করুন।
          </p>
        </div>

        {/* Current Active Invoice Card */}
        {activeInvoice && (
          <div className={`p-5 rounded-2xl border text-center min-w-[200px] ${
            isPaid ? 'bg-emerald-50 border-emerald-200' : isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{activeInvoice.month}</p>
            <h3 className="text-2xl font-black text-slate-900 my-0.5">৳ {activeInvoice.amount.toLocaleString()}</h3>
            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${
              isPaid ? 'bg-emerald-200 text-emerald-800' : isOverdue ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
            }`}>
              {isPaid ? 'পরিশোধিত (PAID)' : isOverdue ? 'বকেয়া (OVERDUE)' : 'বকেয়া (UNPAID)'}
            </span>
          </div>
        )}
      </div>

      {/* Overdue / Reminder Warning */}
      {!isPaid && activeInvoice && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start space-x-3 ${
          isOverdue ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">
              {isOverdue ? 'বকেয়া নোটিশ: স্টাডি ভল্ট সাময়িকভাবে লক হতে পারে' : 'টিউশন ফি রিমাইন্ডার'}
            </p>
            <p className="mt-0.5 leading-relaxed">
              মাসের ১০ তারিখের মধ্যে টিউশন ফি পরিশোধের অনুরোধ করা হচ্ছে। ১৫ তারিখ পার হলে বকেয়া পরিশোধ না করা পর্যন্ত প্রিমিয়াম লেকচার শিট সাময়িকভাবে লক থাকবে।
            </p>
            <button
              onClick={() => handleOpenPaymentModal(activeInvoice)}
              className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
            >
              এখনই বিকাশ / নগদে পরিশোধ করুন →
            </button>
          </div>
        </div>
      )}

      {/* Invoices History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">ইনভয়েস ও রসিদের ইতিহাস</h3>
          <span className="text-xs text-slate-400 font-medium">মোট ইনভয়েস: {invoices.length}টি</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">মাস (Month)</th>
                <th className="px-6 py-4">পরিমাণ</th>
                <th className="px-6 py-4">শেষ তারিখ (Due Date)</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4">ট্রানজেকশন ID</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => {
                const receipt = inv.receipt;
                const isCleared = inv.status === 'PAID';
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{inv.month}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">৳ {inv.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(inv.dueDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isCleared
                          ? 'bg-emerald-100 text-emerald-800'
                          : receipt?.status === 'PENDING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isCleared
                          ? 'পরিশোধিত'
                          : receipt?.status === 'PENDING'
                          ? 'যাচাইাধীন (Pending)'
                          : 'বকেয়া (Unpaid)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-600">
                      {receipt ? receipt.trxId : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isCleared && receipt ? (
                        <button
                          onClick={() => handleDownloadReceipt(receipt.id, receipt.trxId)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 transition-colors inline-flex items-center space-x-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>রিসিট PDF</span>
                        </button>
                      ) : receipt?.status === 'PENDING' ? (
                        <span className="text-xs text-slate-400 italic">রায়হান স্যার যাচাই করছেন</span>
                      ) : (
                        <button
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                        >
                          পেমেন্ট করুন
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Modal */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <h3 className="font-extrabold text-lg">টিউশন ফি পেমেন্ট ভেরিফিকেশন</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {selectedInvoice.month} • ৳ {selectedInvoice.amount.toLocaleString()}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Payment Instructions */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/70 text-xs text-blue-900 space-y-2">
                <p className="font-bold flex items-center space-x-1.5 text-blue-800">
                  <Smartphone className="w-4 h-4" />
                  <span>পেমেন্ট নির্দেশনা (bKash / Nagad):</span>
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>আপনার বিকাশ অ্যাপে গিয়ে <strong>Send Money</strong> অথবা পেমেন্ট অপশনে যান।</li>
                  <li>রায়হান স্যারের নম্বর: <strong className="text-blue-700 font-mono text-sm">01711223344</strong></li>
                  <li>টাকার পরিমাণ: <strong>৳ {selectedInvoice.amount}</strong> দিন।</li>
                  <li>পেমেন্ট শেষে পাওয়া <strong>TrxID</strong> এবং আপনার বিকাশ নম্বর নিচে লিখে সাবমিট করুন।</li>
                </ol>
              </div>

              {msg && (
                <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{msg.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmitTrx} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পেমেন্ট মেথড</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BKASH_MANUAL">bKash (বিকাশ ম্যানুয়াল)</option>
                    <option value="NAGAD_MANUAL">Nagad (নগদ ম্যানুয়াল)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রেরকের বিকাশ/নগদ নম্বর</label>
                  <input
                    type="tel"
                    required
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ট্রানজেকশন আইডি (TrxID)</label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="যেমন: BKASH8839210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitLoading ? 'সাবমিট হচ্ছে...' : 'পেমেন্ট সাবমিট করুন'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

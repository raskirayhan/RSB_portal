import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  QrCode,
  Send,
  X,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Phone,
  Building,
  RefreshCw,
  Edit2,
  Check
} from 'lucide-react';
import { QRBadgeModal } from '../../components/QRBadgeModal';
import { playPop, playSuccessChime } from '../../utils/soundFX';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [loading, setLoading] = useState(true);

  // Batch Secret Code State
  const [batchSecretCode, setBatchSecretCode] = useState('RSB26');
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeSuccessMsg, setCodeSuccessMsg] = useState<string | null>(null);

  // Feedback Modal State
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [strengths, setStrengths] = useState('');
  const [areasToImprove, setAreasToImprove] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // QR Modal State
  const [qrModalStudent, setQrModalStudent] = useState<any>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchCode = async () => {
    try {
      const res = await api.get('/admin/settings/batch-code');
      if (res.data.success && res.data.data?.batchSecretCode) {
        setBatchSecretCode(res.data.data.batchSecretCode);
        setNewCodeInput(res.data.data.batchSecretCode);
      }
    } catch (err) {
      console.error('Failed to fetch batch code', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchBatchCode();
  }, []);

  const handleUpdateBatchCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeInput.trim()) return;
    setCodeLoading(true);
    setCodeSuccessMsg(null);

    try {
      const res = await api.post('/admin/settings/batch-code', {
        code: newCodeInput.trim(),
      });

      if (res.data.success) {
        playSuccessChime();
        setBatchSecretCode(res.data.data.batchSecretCode);
        setIsEditingCode(false);
        setCodeSuccessMsg('ব্যাচ সিক্রেট কোড সফলভাবে আপডেট হয়েছে!');
        setTimeout(() => setCodeSuccessMsg(null), 3000);
      }
    } catch (err) {
      alert('কোড আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleToggleVerification = async (student: any) => {
    playPop();
    setActionLoadingId(student.id);

    try {
      const newTarget = student.verificationStatus === 'VERIFIED' ? 'UNVERIFIED' : 'VERIFIED';
      const res = await api.patch(`/admin/students/${student.id}/verification`, {
        status: newTarget,
      });

      if (res.data.success) {
        playSuccessChime();
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, ...res.data.data } : s))
        );
      }
    } catch (err) {
      alert('ভেরিফিকেশন স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenFeedback = (student: any) => {
    setSelectedStudentForFeedback(student);
    setRemarks('');
    setStrengths('');
    setAreasToImprove('');
    setFeedbackSuccess(false);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) return;
    setFeedbackLoading(true);

    try {
      const res = await api.post('/admin/feedback', {
        studentUserId: selectedStudentForFeedback.userId,
        remarks: remarks.trim(),
        strengths: strengths.trim() || undefined,
        areasToImprove: areasToImprove.trim() || undefined,
      });

      if (res.data.success) {
        playSuccessChime();
        setFeedbackSuccess(true);
        setTimeout(() => setSelectedStudentForFeedback(null), 1500);
      }
    } catch (err) {
      alert('ফিডব্যাক সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.institutionName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentPhone?.includes(searchQuery) ||
      s.guardianPhone?.includes(searchQuery);

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'VERIFIED' && s.verificationStatus === 'VERIFIED') ||
      (filterStatus === 'UNVERIFIED' && s.verificationStatus !== 'VERIFIED');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            শিক্ষার্থী ডিরেক্টরি ও অথেন্টিকেশন ম্যানেজমেন্ট
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            রায়হান স্যারের ব্যাচের সকল শিক্ষার্থীর স্কুল/কলেজ, অভিভাবকের তথ্য ও আইডেন্টিটি ভেরিফিকেশন পরিচালনা করুন।
          </p>
        </div>

        <button
          onClick={fetchStudents}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Batch Secret Code Management Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-blue-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
            <KeyRound className="w-4 h-4" />
            <span>Active Batch Access Secret Code</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            ক্লাসের গোপন ভেরিফিকেশন কোড: <span className="font-mono text-cyan-300 tracking-wider font-extrabold">{batchSecretCode}</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Google Sign-In করা শিক্ষার্থীরা এই কোডটি দিয়ে ফর্ম সাবমিট করলে তৎক্ষণাৎ তাদের প্রোফাইল ও QR কার্ড ভেরিফাইড হয়ে যাবে।
          </p>
          {codeSuccessMsg && (
            <p className="text-xs text-emerald-300 font-bold flex items-center space-x-1 mt-1">
              <Check className="w-3.5 h-3.5" />
              <span>{codeSuccessMsg}</span>
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isEditingCode ? (
            <form onSubmit={handleUpdateBatchCode} className="flex items-center space-x-2">
              <input
                type="text"
                required
                value={newCodeInput}
                onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                placeholder="নতুন কোড (যেমন: RSB26)"
                className="px-3 py-2 bg-slate-950 border border-blue-400 rounded-xl text-xs font-mono font-bold text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={codeLoading}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {codeLoading ? '...' : 'সংরক্ষণ'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingCode(false)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
              >
                বাতিল
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                playPop();
                setNewCodeInput(batchSecretCode);
                setIsEditingCode(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>কোড পরিবর্তন করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            সকল শিক্ষার্থী ({students.length})
          </button>
          <button
            onClick={() => setFilterStatus('VERIFIED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'VERIFIED'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            ভেরিফাইড (VERIFIED)
          </button>
          <button
            onClick={() => setFilterStatus('UNVERIFIED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'UNVERIFIED'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            অননুমোদিত (UNVERIFIED)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ID, ফোন বা কলেজ খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800 uppercase text-[11px]">
              <tr>
                <th className="px-5 py-4">শিক্ষার্থী</th>
                <th className="px-5 py-4">স্টুডেন্ট ID</th>
                <th className="px-5 py-4">শ্রেণি ও ব্যাচ</th>
                <th className="px-5 py-4">শিক্ষা প্রতিষ্ঠান</th>
                <th className="px-5 py-4">ফোন ও অভিভাবক</th>
                <th className="px-5 py-4">ভেরিফিকেশন স্ট্যাটাস</th>
                <th className="px-5 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s) => {
                const isVerified = s.verificationStatus === 'VERIFIED';
                const isActionLoading = actionLoadingId === s.id;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        {s.avatarUrl ? (
                          <img src={s.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : null}
                        <div>
                          <div>{s.fullName || s.user?.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{s.user?.email || '—'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {s.studentIdNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      <div>{s.academicLevel}</div>
                      <div className="text-[10px] text-slate-400">{s.batchName || s.batch?.name || 'Special Batch'}</div>
                    </td>

                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate max-w-[150px]">{s.institutionName || '—'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-300 text-xs">
                      <div>ছাত্র: {s.studentPhone || s.user?.phone || '—'}</div>
                      <div className="text-[11px] text-slate-400">অভিভাবক: {s.guardianPhone || '—'}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isVerified
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {isVerified ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>VERIFIED</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            <span>UNVERIFIED</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      {/* Toggle Verification Button */}
                      <button
                        onClick={() => handleToggleVerification(s)}
                        disabled={isActionLoading}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                          isVerified
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300'
                        }`}
                        title="স্ট্যাটাস পরিবর্তন"
                      >
                        {isActionLoading
                          ? '...'
                          : isVerified
                          ? 'আন-ভেরিফাই'
                          : 'ভেরিফাই করুন'}
                      </button>

                      {/* QR Button */}
                      <button
                        onClick={() => setQrModalStudent(s)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                        title="QR আইডি কার্ড"
                      >
                        <QrCode className="w-3.5 h-3.5 inline mr-1" />
                        <span>QR</span>
                      </button>

                      {/* Feedback Button */}
                      <button
                        onClick={() => handleOpenFeedback(s)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                        <span>ফিডব্যাক</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Feedback Modal */}
      {selectedStudentForFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">শিক্ষার্থী অ্যাকাডেমিক মূল্যায়ন</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  {selectedStudentForFeedback.fullName || selectedStudentForFeedback.user?.name} ({selectedStudentForFeedback.studentIdNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForFeedback(null)}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">ফিডব্যাক সফলভাবে পাঠানো হয়েছে!</h4>
                <p className="text-xs text-slate-500">শিক্ষার্থী ও অভিভাবকের পোর্টালে সিঙ্ক করা হয়েছে।</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সার্বিক মন্তব্য ও পর্যবেক্ষণ (Overall Remarks) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="যেমন: পদার্থবিজ্ঞানের গাণিতিক দক্ষতায় উন্নতি হচ্ছে, তবে গতি অধ্যায়ের গ্রাফে আরও নজর দিতে হবে..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সবল দিক (Strengths)
                  </label>
                  <input
                    type="text"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="যেমন: নিয়মিত ক্লাসে উপস্থিতি, সময়ানুবর্তিতা"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    যে বিষয়গুলোতে আরও উন্নতি প্রয়োজন (Areas to Improve)
                  </label>
                  <input
                    type="text"
                    value={areasToImprove}
                    onChange={(e) => setAreasToImprove(e.target.value)}
                    placeholder="যেমন: MCQ সমাধান করার সময় কিছুটা তাড়াহুড়ো করে"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForFeedback(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{feedbackLoading ? 'পাঠানো হচ্ছে...' : 'ফিডব্যাক সাবমিট করুন'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Badge Modal */}
      {qrModalStudent && (
        <QRBadgeModal
          isOpen={!!qrModalStudent}
          onClose={() => setQrModalStudent(null)}
          student={qrModalStudent}
        />
      )}
    </div>
  );
};

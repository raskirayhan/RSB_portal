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
  X
} from 'lucide-react';
import { QRBadgeModal } from '../../components/QRBadgeModal';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Feedback Modal State
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [strengths, setStrengths] = useState('');
  const [areasToImprove, setAreasToImprove] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // QR Modal State
  const [qrModalStudent, setQrModalStudent] = useState<any>(null);

  const fetchStudents = async () => {
    try {
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

  useEffect(() => {
    fetchStudents();
  }, []);

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
        setFeedbackSuccess(true);
        setTimeout(() => setSelectedStudentForFeedback(null), 1500);
      }
    } catch (err) {
      alert('ফিডব্যাক সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.institutionName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            শিক্ষার্থী ডিরেক্টরি ও প্রগ্রেস ট্র্যাকার
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            সকল ব্যাচের শিক্ষার্থীর তথ্য, প্রোফাইল সম্পূর্ণতা ও অ্যাকাডেমিক মূল্যায়ন করুন।
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ID বা কলেজ লিখে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">শিক্ষার্থীর নাম</th>
                <th className="px-6 py-4">স্টুডেন্ট ID</th>
                <th className="px-6 py-4">ব্যাচ</th>
                <th className="px-6 py-4">শিক্ষা প্রতিষ্ঠান</th>
                <th className="px-6 py-4">অভিভাবকের ফোন</th>
                <th className="px-6 py-4">প্রোফাইল স্ট্যাটাস</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div>{s.user?.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{s.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                    {s.studentIdNumber}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {s.batch?.name || s.academicLevel}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{s.institutionName || '—'}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {s.guardianPhone || s.studentPhone || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>১০০% পূর্ণ</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>অসম্পূর্ণ</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => setQrModalStudent(s)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                      title="QR আইডি কার্ড"
                    >
                      <QrCode className="w-3.5 h-3.5 inline mr-1" />
                      <span>QR</span>
                    </button>
                    <button
                      onClick={() => handleOpenFeedback(s)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                      <span>ফিডব্যাক দিন</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Feedback Modal */}
      {selectedStudentForFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">শিক্ষার্থী অ্যাকাডেমিক মূল্যায়ন</h3>
                <p className="text-xs text-indigo-100 mt-0.5">
                  {selectedStudentForFeedback.user?.name} ({selectedStudentForFeedback.studentIdNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForFeedback(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {feedbackSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ফিডব্যাক সফলভাবে সংরক্ষিত ও শিক্ষার্থীর ড্যাশবোর্ডে যুক্ত হয়েছে!</span>
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সার্বিক মূল্যায়ন ও পর্যবেক্ষণ (Remarks)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="যেমন: ফিজিক্সের গাণিতিক দক্ষতায় প্রভূত উন্নতি হয়েছে। তবে অর্গানিক বিক্রিয়ার মেকানিজমে আরো কয়েকবার লিখে অনুশীলন করতে হবে।"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সবল দিক (Strengths)
                  </label>
                  <input
                    type="text"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="যেমন: ভেক্টর ও গতিবিদ্যার সমস্যা দ্রুত সমাধান"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    উন্নতির ক্ষেত্র (Areas of Improvement)
                  </label>
                  <input
                    type="text"
                    value={areasToImprove}
                    onChange={(e) => setAreasToImprove(e.target.value)}
                    placeholder="যেমন: জৈব রসায়ন ও ক্যালকুলাস রিভিশন"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForFeedback(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackLoading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{feedbackLoading ? 'সংরক্ষণ হচ্ছে...' : 'ফিডব্যাক পাঠান'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal View */}
      {qrModalStudent && (
        <QRBadgeModal
          isOpen={true}
          onClose={() => setQrModalStudent(null)}
          student={{
            name: qrModalStudent.user?.name,
            studentId: qrModalStudent.studentIdNumber,
            academicLevel: qrModalStudent.academicLevel,
            batchName: qrModalStudent.batch?.name,
            institution: qrModalStudent.institutionName,
            phone: qrModalStudent.studentPhone,
            qrCodeDataUrl: qrModalStudent.qrCodeDataUrl,
          }}
        />
      )}
    </div>
  );
};

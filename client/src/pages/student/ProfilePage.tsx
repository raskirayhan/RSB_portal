import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { QRBadgeModal } from '../../components/QRBadgeModal';
import confetti from 'canvas-confetti';
import {
  User,
  School,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  Save,
  Printer
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfileState, refreshUserData } = useAuth();

  const [name, setName] = useState('');
  const [academicLevel, setAcademicLevel] = useState('HSC_2026');
  const [institutionName, setInstitutionName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  const [batches, setBatches] = useState<any[]>([]);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    // Load Batches
    api.get('/public/landing-data')
      .then((res) => {
        if (res.data.success) {
          setBatches(res.data.data.batches || []);
        }
      })
      .catch((err) => console.error(err));

    // Load Profile details
    api.get('/profile')
      .then((res) => {
        if (res.data.success) {
          const p = res.data.data.profile;
          setName(p.user?.name || user?.name || '');
          setAcademicLevel(p.academicLevel || 'HSC_2026');
          setInstitutionName(p.institutionName || '');
          setBatchId(p.batchId || '');
          setFatherName(p.fatherName || '');
          setMotherName(p.motherName || '');
          setStudentPhone(p.studentPhone || '');
          setGuardianPhone(p.guardianPhone || '');
          setGuardianEmail(p.guardianEmail || '');
          setCompletionPercent(res.data.data.completionPercentage || 0);
        }
      })
      .catch((err) => console.error(err));
  }, [user]);

  // Dynamic recalculation of completion percentage
  useEffect(() => {
    const fields = [
      name,
      academicLevel,
      institutionName,
      batchId,
      fatherName,
      motherName,
      studentPhone,
      guardianPhone,
      guardianEmail,
    ];
    const filled = fields.filter((f) => !!f && f.toString().trim() !== '').length;
    setCompletionPercent(Math.round((filled / fields.length) * 100));
  }, [name, academicLevel, institutionName, batchId, fatherName, motherName, studentPhone, guardianPhone, guardianEmail]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.put('/profile', {
        name,
        academicLevel,
        institutionName,
        batchId: batchId || undefined,
        fatherName,
        motherName,
        studentPhone,
        guardianPhone,
        guardianEmail,
      });

      if (res.data.success) {
        updateProfileState(res.data.data);
        setStatusMsg({ type: 'success', text: res.data.message });

        if (res.data.data.isCompleted) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        await refreshUserData();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header & Status Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {profile?.studentIdNumber || 'RSB-26-XXX'}
              </span>
              <span className="text-xs text-slate-500 font-medium">{profile?.academicLevel}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              শিক্ষার্থী প্রোফাইল ও গার্ডিয়ান পোর্টাল
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              সঠিক যোগাযোগের জন্য শিক্ষার্থী ও অভিভাবকের তথ্য ১০০% পূরণ থাকা আবশ্যক। প্রোফাইল ১০০% সম্পন্ন হলে স্টাডি ভল্টের সকল নোটস ও ডিজিটাল QR কার্ড আনলক হবে।
            </p>
          </div>

          {/* Completion Progress Gauge */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center min-w-[180px]">
            <p className="text-xs font-bold text-slate-500 mb-1">প্রোফাইল কমপ্লিশন</p>
            <div className="flex items-center justify-center space-x-1.5 my-1">
              <span className={`text-2xl font-black ${completionPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {completionPercent}%
              </span>
              {completionPercent === 100 && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  completionPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start space-x-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Grid: Form (Left 8 cols) & Digital Card Preview (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Section 1: Academic & Personal */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2 mb-4">
                <User className="w-4 h-4 text-blue-600" />
                <span>ব্যক্তিগত ও শিক্ষা প্রতিষ্ঠানের তথ্য</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল (লগইন আইডি)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">স্কুল / কলেজ / মাদ্রাসা</label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="যেমন: নটর ডেম কলেজ / আইডিয়াল স্কুল"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শ্রেণি / শিক্ষাবর্ষ</label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SSC_2026">SSC 2026 বিজ্ঞান বিভাগ</option>
                    <option value="HSC_2026">HSC 2026 বিজ্ঞান বিভাগ (১ম/২য় বর্ষ)</option>
                    <option value="HSC_2027">HSC 2027 বিজ্ঞান বিভাগ</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">অন্তর্ভুক্ত ব্যাচ</label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- ব্যাচ নির্বাচন করুন --</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.scheduleDays} • {b.timeSlot}) - ৳{b.monthlyFee}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Guardian Information */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>অভিভাবকের তথ্য (Guardian Details)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="পিতার নাম"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মাতার নাম</label>
                  <input
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="মাতার নাম"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অভিভাবকের মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অভিভাবকের ইমেইল (মাসিক প্রগ্রেস ডাইজেস্টের জন্য)
                  </label>
                  <input
                    type="email"
                    required
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="guardian@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    এই ইমেইলে প্রতি মাসের শেষে স্বয়ংক্রিয়ভাবে শিক্ষার্থীর উপস্থিতি, কুইজ স্কোর ও রায়হান স্যারের মন্তব্য পাঠানো হবে।
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Digital Student ID Badge Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full inline-block mb-3">
              Rayhan Special Batch
            </span>

            <h4 className="font-extrabold text-base text-white">অফিসিয়াল স্টুডেন্ট আইডি</h4>
            <p className="text-xs text-slate-400 mb-4">অফলাইন ক্লাসের জন্য ডিজিটাল পাস</p>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl shadow-lg inline-block my-2 border-2 border-blue-400/40">
              {profile?.qrCodeDataUrl ? (
                <img
                  src={profile.qrCodeDataUrl}
                  alt="Student QR Code"
                  className="w-40 h-40 object-contain mx-auto"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">
                  QR কোড লোড হচ্ছে...
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-lg text-white">{name || user?.name}</h3>
              <p className="inline-block px-3 py-1 bg-blue-600/40 rounded-lg text-blue-200 font-mono text-sm font-bold tracking-wider my-1 border border-blue-400/30">
                {profile?.studentIdNumber || 'RSB-26-XXX'}
              </p>
              <p className="text-xs text-slate-300 mt-1">{institutionName || 'শিক্ষা প্রতিষ্ঠান দেওয়া হয়নি'}</p>
              <p className="text-[11px] text-slate-400">{profile?.batch?.name || academicLevel}</p>
            </div>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>কার্ড ভিউ ও প্রিন্ট</span>
            </button>
          </div>
        </div>
      </div>

      {profile && (
        <QRBadgeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          student={{
            name: name || user?.name || '',
            studentId: profile.studentIdNumber,
            academicLevel: profile.academicLevel,
            batchName: profile.batch?.name,
            institution: institutionName,
            phone: studentPhone,
            qrCodeDataUrl: profile.qrCodeDataUrl,
          }}
        />
      )}
    </div>
  );
};

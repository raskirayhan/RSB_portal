import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { playPop, playSuccessChime, playFanfare } from '../../utils/soundFX';
import {
  GraduationCap,
  ShieldCheck,
  User,
  Phone,
  Building,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  QrCode
} from 'lucide-react';

export const CompleteProfilePage: React.FC = () => {
  const { user, profile, updateProfileState, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || profile?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || profile?.studentPhone || '');
  const [classLevel, setClassLevel] = useState(profile?.academicLevel || 'HSC_11');
  const [batchName, setBatchName] = useState(profile?.batchName || 'Special Exam Batch');
  const [institution, setInstitution] = useState(profile?.institutionName || '');
  const [fatherName, setFatherName] = useState(profile?.fatherName || '');
  const [guardianPhone, setGuardianPhone] = useState(profile?.guardianPhone || '');
  const [batchSecretCode, setBatchSecretCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCelebration, setSuccessCelebration] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playPop();
    setError(null);

    // Validate 11-digit BD Phone
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(phone.trim())) {
      setError('সঠিক ১১ ডিজিটের শিক্ষার্থী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (!bdPhoneRegex.test(guardianPhone.trim())) {
      setError('সঠিক ১১ ডিজিটের অভিভাবকের মোবাইল নম্বর দিন (যেমন: 018XXXXXXXX)।');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/student/complete-onboarding', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        classLevel,
        batchName,
        institution: institution.trim(),
        fatherName: fatherName.trim(),
        guardianPhone: guardianPhone.trim(),
        batchSecretCode: batchSecretCode.trim(),
      });

      if (res.data.success) {
        setSuccessCelebration(true);
        playSuccessChime();
        playFanfare();

        if (res.data.data?.profile) {
          updateProfileState(res.data.data.profile);
        }
        await refreshUserData();

        setTimeout(() => {
          navigate('/dashboard');
        }, 2200);
      }
    } catch (err: any) {
      console.error('Onboarding Error:', err);
      setError(
        err?.response?.data?.message ||
          'তথ্য সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে সকল তথ্য পুনরায় যাচাই করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
      >
        {/* Header with Avatar */}
        <div className="text-center space-y-3 border-b border-slate-800/80 pb-6">
          <div className="relative inline-block">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Student Avatar"
                className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-xl object-cover mx-auto"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center mx-auto shadow-xl">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full border-2 border-slate-900 text-white">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Mandatory Student Identity Verification</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              স্বাগতম, Rayhan's Science Lab-এ!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1 leading-relaxed">
              আপনার ডিজিটাল কিউআর আইডি কার্ড, লাইভ এক্সাম এরিনা ও স্টাডি ভল্ট আনলক করতে নিচের তথ্যগুলো নির্ভুলভাবে পূরণ করুন।
            </p>
          </div>

          {/* Google Account Tag (Read-only) */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span>Google Account:</span>
            <span className="font-bold text-blue-400">{user?.email || 'Connected'}</span>
          </div>
        </div>

        {/* Success Modal / Banner */}
        {successCelebration && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-2"
          >
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-black text-emerald-300">
              Identity Verified! Generating your RSB QR ID Card...
            </h3>
            <p className="text-xs text-emerald-200">
              আপনার তথ্য সফলভাবে যাচাই করা হয়েছে। আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
            </p>
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                শিক্ষার্থীর পূর্ণ নাম (Full Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 2. Student Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                শিক্ষার্থীর মোবাইল নম্বর (Phone Number) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 3. Class Level */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                শ্রেণি নির্বাচন (Class) *
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SSC_9">SSC Class 9 (নবম শ্রেণি বিজ্ঞান)</option>
                <option value="SSC_10">SSC Class 10 (দশম শ্রেণি বিজ্ঞান)</option>
                <option value="HSC_11">HSC Class 11 (একাদশ শ্রেণি বিজ্ঞান)</option>
                <option value="HSC_12">HSC Class 12 (দ্বাদশ শ্রেণি বিজ্ঞান)</option>
              </select>
            </div>

            {/* 4. Batch Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ব্যাচের নাম (Batch Name) *
              </label>
              <select
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Morning Batch">Morning Batch (সকাল ব্যাচ)</option>
                <option value="Afternoon Batch">Afternoon Batch (দুপুর ব্যাচ)</option>
                <option value="Evening Batch">Evening Batch (সন্ধ্যা ব্যাচ)</option>
                <option value="Special Exam Batch">Special Exam Batch (স্পেশাল ব্যাচ)</option>
              </select>
            </div>
          </div>

          {/* 5. School / College Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              স্কুল বা কলেজের নাম (School / College Name) *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="যেমন: খুলনা জিলা স্কুল / নটর ডেম কলেজ"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 6. Father's Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                পিতার নাম (Father's Name) *
              </label>
              <input
                type="text"
                required
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="পিতার নাম লিখুন"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 7. Guardian Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                অভিভাবকের ফোন নম্বর (Guardian Phone) *
              </label>
              <input
                type="tel"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 8. Batch Secret Code */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-blue-400">
              <KeyRound className="w-4 h-4" />
              <label className="text-xs font-black uppercase tracking-wider">
                ব্যাচ সিক্রেট এক্সেস কোড (Batch Access Code)
              </label>
            </div>
            <input
              type="text"
              value={batchSecretCode}
              onChange={(e) => setBatchSecretCode(e.target.value)}
              placeholder="ক্লাসে রায়হান স্যারের প্রদত্ত কোড লিখুন (যেমন: RSB26)"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-blue-500/40 rounded-xl text-xs sm:text-sm text-white font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
            />
            <p className="text-[11px] text-slate-400">
              * সঠিক কোড দিলে তৎক্ষণাৎ আপনার প্রোফাইল ইনস্ট্যান্ট ভেরিফাইড হয়ে যাবে এবং অফিসিয়াল কিউআর আইডি কার্ড জেনারেট হবে।
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || successCelebration}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <QrCode className="w-4 h-4" />
            <span>{loading ? 'যাচাই করা হচ্ছে...' : 'আইডেন্টিটি নিশ্চিত করুন ও ড্যাশবোর্ডে প্রবেশ করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

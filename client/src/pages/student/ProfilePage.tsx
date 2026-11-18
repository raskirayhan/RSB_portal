import React, { useState, useEffect, useRef } from 'react';
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
  Printer,
  Camera,
  Trash2,
  Upload,
  GraduationCap
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'avatar-1', label: 'Student 1', emoji: '👨‍🎓' },
  { id: 'avatar-2', label: 'Student 2', emoji: '👩‍🎓' },
  { id: 'avatar-3', label: 'Scientist 1', emoji: '🧑‍🔬' },
  { id: 'avatar-4', label: 'Scientist 2', emoji: '👩‍🔬' },
  { id: 'avatar-5', label: 'Prodigy', emoji: '⚡' },
  { id: 'avatar-6', label: 'Explorer', emoji: '🚀' },
];

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfileState, refreshUserData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [academicLevel, setAcademicLevel] = useState('HSC_2026');
  const [institutionName, setInstitutionName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

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
          setAvatarUrl(p.avatarUrl || '');
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

  // Handle Photo File Upload with Canvas Compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'অনুগ্রহ করে একটি ছবি ফাইল (JPG, PNG) নির্বাচন করুন।' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে হবে।' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setAvatarUrl(dataUrl);
        setStatusMsg({ type: 'success', text: 'ছবি সফলভাবে যুক্ত হয়েছে! নিচের বাটনে ক্লিক করে প্রোফাইল সংরক্ষণ করুন।' });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (emoji: string) => {
    // Generate an SVG data URL for the chosen emoji avatar
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#grad)" stroke="#818cf8" stroke-width="4"/>
        <text x="50" y="65" font-size="46" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatarUrl(dataUrl);
    setStatusMsg({ type: 'success', text: 'অবতার সিলেক্ট হয়েছে! প্রোফাইল আপডেট বাটনে ক্লিক করুন।' });
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setStatusMsg({ type: 'success', text: 'ছবি মুছে ফেলা হয়েছে। আপডেট সংরক্ষণ করতে বাটনে ক্লিক করুন।' });
  };

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
        avatarUrl,
      });

      if (res.data.success) {
        updateProfileState(res.data.data);
        setStatusMsg({ type: 'success', text: res.data.message || 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' });

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
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                {profile?.studentIdNumber || 'RSB-26-XXX'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {academicLevel === 'CLASS_8' ? '৮ম শ্রেণি (JSC)' : academicLevel.startsWith('SSC') ? 'এসএসসি (SSC Science)' : 'এইচএসসি (HSC Science)'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              শিক্ষার্থী প্রোফাইল ও গার্ডিয়ান পোর্টাল
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              সঠিক যোগাযোগের জন্য শিক্ষার্থী ও অভিভাবকের তথ্য ১০০% পূরণ থাকা আবশ্যক। আপনার ছবি আপলোড করুন যাতে ডিজিটাল আইডি কার্ডে ছবি যুক্ত হয়।
            </p>
          </div>

          {/* Completion Progress Gauge */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center min-w-[180px]">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">প্রোফাইল কমপ্লিশন</p>
            <div className="flex items-center justify-center space-x-1.5 my-1">
              <span className={`text-2xl font-black ${completionPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {completionPercent}%
              </span>
              {completionPercent === 100 && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
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
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
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
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <form onSubmit={handleSaveProfile} className="space-y-6">

            {/* Profile Picture Upload Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-slate-800/80 dark:via-indigo-950/30 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-3">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>শিক্ষার্থীর ছবি / প্রোফাইল অবতার</span>
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Avatar Preview */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-blue-400/60 shadow-md flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Student Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-blue-600">
                        {name ? name.charAt(0) : user?.name?.charAt(0) || '🎓'}
                      </span>
                    )}
                  </div>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      title="ছবি মুছুন"
                      className="absolute -top-2 -right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Upload & Preset Options */}
                <div className="space-y-2.5 flex-1 text-center sm:text-left">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="avatar-file-input"
                    />
                    <label
                      htmlFor="avatar-file-input"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm shadow-blue-500/20 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>গ্যালারি / ক্যামেরা থেকে ছবি আপলোড</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      JPG বা PNG (সর্বোচ্চ ৫ মেগাবাইট) • ডিজিটাল আইডি কার্ডে দৃশ্যমান হবে
                    </p>
                  </div>

                  {/* Preset Avatars */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                      বা পছন্দের অবতার নির্বাচন করুন:
                    </span>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      {PRESET_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => handleSelectPresetAvatar(av.emoji)}
                          className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:scale-110 flex items-center justify-center text-base shadow-xs transition-transform"
                          title={av.label}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Academic & Personal */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                <User className="w-4 h-4 text-blue-600" />
                <span>ব্যক্তিগত ও শিক্ষা প্রতিষ্ঠানের তথ্য</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">শিক্ষার্থীর নাম</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল (লগইন আইডি)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">স্কুল / কলেজ / মাদ্রাসা</label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="যেমন: নটর ডেম কলেজ / আইডিয়াল স্কুল"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">শ্রেণি / শিক্ষাস্তর</label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="CLASS_8">🏫 ৮ম শ্রেণি (JSC বিজ্ঞান ও গণিত)</option>
                    <option value="SSC_2026">🎓 এসএসসি (SSC Science ২০২৬)</option>
                    <option value="HSC_2026">🔬 এইচএসসি (HSC Science ১ম/২য় বর্ষ ২০২৬)</option>
                    <option value="HSC_2027">🔬 এইচএসসি (HSC Science ২০২৭)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">অন্তর্ভুক্ত ব্যাচ</label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>অভিভাবকের তথ্য (Guardian Details)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="পিতার নাম"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">মাতার নাম</label>
                  <input
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="মাতার নাম"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">শিক্ষার্থীর মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">অভিভাবকের মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    অভিভাবকের ইমেইল (মাসিক প্রগ্রেস ডাইজেস্টের জন্য)
                  </label>
                  <input
                    type="email"
                    required
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="guardian@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
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
            <p className="text-xs text-slate-400 mb-3">অফলাইন ক্লাসের জন্য ডিজিটাল পাস</p>

            {/* Avatar on Card if available */}
            {avatarUrl && (
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-blue-400/70 shadow-lg">
                <img src={avatarUrl} alt={name || user?.name} className="w-full h-full object-cover" />
              </div>
            )}

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl shadow-lg inline-block my-1 border-2 border-blue-400/40">
              {profile?.qrCodeDataUrl ? (
                <img
                  src={profile.qrCodeDataUrl}
                  alt="Student QR Code"
                  className="w-36 h-36 object-contain mx-auto"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                  QR কোড লোড হচ্ছে...
                </div>
              )}
            </div>

            <div className="mt-3">
              <h3 className="font-bold text-lg text-white">{name || user?.name}</h3>
              <p className="inline-block px-3 py-1 bg-blue-600/40 rounded-lg text-blue-200 font-mono text-sm font-bold tracking-wider my-1 border border-blue-400/30">
                {profile?.studentIdNumber || 'RSB-26-XXX'}
              </p>
              <p className="text-xs text-slate-300 mt-1">{institutionName || 'শিক্ষা প্রতিষ্ঠান দেওয়া হয়নি'}</p>
              <p className="text-[11px] text-slate-400">
                {academicLevel === 'CLASS_8' ? '৮ম শ্রেণি (JSC)' : academicLevel.startsWith('SSC') ? 'এসএসসি (SSC Science)' : 'এইচএসসি (HSC Science)'}
              </p>
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
            academicLevel: academicLevel,
            batchName: profile.batch?.name || (academicLevel === 'CLASS_8' ? '৮ম শ্রেণি (JSC)' : academicLevel.startsWith('SSC') ? 'এসএসসি (SSC Science)' : 'এইচএসসি (HSC Science)'),
            institution: institutionName,
            phone: studentPhone,
            qrCodeDataUrl: profile.qrCodeDataUrl,
            avatarUrl: avatarUrl || profile.avatarUrl,
          }}
        />
      )}
    </div>
  );
};
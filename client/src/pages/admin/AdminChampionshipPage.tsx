import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { playPop, playSuccessChime } from '../../utils/soundFX';
import {
  Trophy,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  FileCode,
  FolderOpen,
  Send,
  Eye,
  Trash2,
  RefreshCw,
  Award,
  Crown,
  Binary,
  BookOpen,
  PlusCircle,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const AdminChampionshipPage: React.FC = () => {
  const [adminSection, setAdminSection] = useState<'SSC_CHAMPIONSHIP' | 'HSC_ICT_BANK'>('SSC_CHAMPIONSHIP');

  // SSC Championship States
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [title, setTitle] = useState('SSC Science 24-Hour Live Board Championship');
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('বোর্ড স্পেশাল অধ্যায়ভিত্তিক সংকলন');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(12);
  const [durationHours, setDurationHours] = useState(24);
  const [rawJson, setRawJson] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [presets, setPresets] = useState<any>(null);

  // HSC ICT Question Bank States
  const [ictQuestions, setIctQuestions] = useState<any[]>([]);
  const [ictStats, setIctStats] = useState<any>(null);
  const [ictChapterFilter, setIctChapterFilter] = useState<string>('ALL');
  const [loadingIct, setLoadingIct] = useState(false);
  const [ictRawJson, setIctRawJson] = useState('');
  const [uploadingIct, setUploadingIct] = useState(false);
  const [parsedIctCount, setParsedIctCount] = useState(0);

  // Load Active Session & Presets
  const loadData = async () => {
    try {
      setLoading(true);
      const [sessRes, presRes] = await Promise.all([
        api.get('/games/championship/active'),
        api.get('/games/championship/presets'),
      ]);

      if (sessRes.data.success) {
        setActiveSession(sessRes.data.data?.session);
      }
      if (presRes.data.success) {
        setPresets(presRes.data.data);
      }
    } catch (err: any) {
      console.error('Error loading championship admin data', err);
    } finally {
      setLoading(false);
    }
  };

  // Load HSC ICT Bank & Config
  const loadIctData = async () => {
    try {
      setLoadingIct(true);
      const [configRes, listRes] = await Promise.all([
        api.get('/hsc-ict/config'),
        api.get(`/hsc-ict/admin/questions${ictChapterFilter !== 'ALL' ? `?chapter=${ictChapterFilter}` : ''}`),
      ]);

      if (configRes.data.success) {
        setIctStats(configRes.data.data);
      }
      if (listRes.data.success) {
        setIctQuestions(listRes.data.data || []);
      }
    } catch (err: any) {
      console.error('Error loading ICT admin data', err);
    } finally {
      setLoadingIct(false);
    }
  };

  useEffect(() => {
    loadData();
    loadIctData();
  }, []);

  useEffect(() => {
    if (adminSection === 'HSC_ICT_BANK') {
      loadIctData();
    }
  }, [ictChapterFilter, adminSection]);

  // Handle Preset Load for SSC
  const handleLoadPreset = (key: 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY') => {
    playPop();
    if (!presets || !presets[key]) return;
    const preset = presets[key];
    setTitle(preset.title);
    setSubject(preset.subject);
    setChapter(preset.chapter);
    setTimeLimitMinutes(preset.timeLimitMinutes || 12);
    setParsedQuestions(preset.questions);
    setRawJson(JSON.stringify(preset.questions, null, 2));
    setStatusMsg({
      type: 'success',
      text: `${preset.subject} ২৫টি বোর্ড এমসিকিউ প্রিসেট সফলভাবে লোড হয়েছে!`,
    });
  };

  // Handle JSON Textarea Change & Validation for SSC
  const handleJsonChange = (text: string) => {
    setRawJson(text);
    if (!text.trim()) {
      setParsedQuestions([]);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setParsedQuestions(parsed);
        setStatusMsg({
          type: 'success',
          text: `মোট ${parsed.length}টি প্রশ্ন সঠিকভাবে পার্স হয়েছে।`,
        });
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        setParsedQuestions(parsed.questions);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.chapter) setChapter(parsed.chapter);
        setStatusMsg({
          type: 'success',
          text: `মোট ${parsed.questions.length}টি প্রশ্ন সঠিকভাবে পার্স হয়েছে।`,
        });
      }
    } catch (e) {
      // Invalid JSON typing in progress
    }
  };

  // Launch SSC Live Championship
  const handleLaunchChampionship = async (e: React.FormEvent) => {
    e.preventDefault();
    playPop();
    setStatusMsg(null);

    if (parsedQuestions.length < 5) {
      setStatusMsg({
        type: 'error',
        text: 'কমপক্ষে ৫টি অথবা ২৫টি প্রশ্ন যুক্ত করুন।',
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/games/championship/create', {
        title,
        subject,
        chapter,
        timeLimitMinutes: Number(timeLimitMinutes),
        durationHours: Number(durationHours),
        questions: parsedQuestions,
      });

      if (res.data.success) {
        playSuccessChime();
        setStatusMsg({
          type: 'success',
          text: `অভিনন্দন! ২৪ ঘণ্টার লাইভ চ্যাম্পিয়নশিপ '${title}' সফলভাবে চালু হয়েছে!`,
        });
        loadData();
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'চ্যাম্পিয়নশিপ শুরু করতে ব্যর্থ হয়েছে।',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Deactivate SSC Session
  const handleDeactivate = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে বর্তমান ২৪-ঘণ্টা সেশনটি বন্ধ করতে চান?')) return;
    try {
      await api.post('/games/championship/deactivate');
      playPop();
      setStatusMsg({ type: 'success', text: 'সেশন সফলভাবে নিষ্ক্রিয় করা হয়েছে।' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'সেশন বন্ধ করতে সমস্যা হয়েছে।' });
    }
  };

  // 1-Click Seed HSC Master Guide Presets
  const handleSeedIctPresets = async () => {
    try {
      playPop();
      setUploadingIct(true);
      const res = await api.post('/hsc-ict/admin/seed-presets');
      if (res.data.success) {
        playSuccessChime();
        setStatusMsg({
          type: 'success',
          text: res.data.message || 'মাস্টার গাইড প্রিসেট প্রশ্ন সফলভাবে লোড হয়েছে!',
        });
        loadIctData();
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'প্রিসেট লোড করতে সমস্যা হয়েছে।',
      });
    } finally {
      setUploadingIct(false);
    }
  };

  // HSC JSON change
  const handleIctJsonChange = (text: string) => {
    setIctRawJson(text);
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setParsedIctCount(parsed.length);
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        setParsedIctCount(parsed.questions.length);
      } else {
        setParsedIctCount(0);
      }
    } catch {
      setParsedIctCount(0);
    }
  };

  // Upload bulk HSC ICT questions
  const handleUploadIctQuestions = async () => {
    if (!ictRawJson.trim()) return;
    try {
      setUploadingIct(true);
      playPop();
      const parsed = JSON.parse(ictRawJson);
      const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

      const res = await api.post('/hsc-ict/admin/upload-questions', { questions });
      if (res.data.success) {
        playSuccessChime();
        setStatusMsg({
          type: 'success',
          text: res.data.message || 'প্রশ্ন সফলভাবে আপলোড হয়েছে!',
        });
        setIctRawJson('');
        setParsedIctCount(0);
        loadIctData();
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'ভুল JSON ফরম্যাট। অনুগ্রহ করে সঠিক ফরম্যাট দিন।',
      });
    } finally {
      setUploadingIct(false);
    }
  };

  // Delete an HSC Question
  const handleDeleteIctQuestion = async (id: string) => {
    if (!window.confirm('আপনি কি এই প্রশ্নটি মুছে ফেলতে চান?')) return;
    try {
      const res = await api.delete(`/hsc-ict/admin/questions/${id}`);
      if (res.data.success) {
        playPop();
        setIctQuestions((prev) => prev.filter((q) => q.id !== id));
        loadIctData();
      }
    } catch (err: any) {
      alert('প্রশ্ন মুছতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Top Main Section Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              playPop();
              setAdminSection('SSC_CHAMPIONSHIP');
            }}
            className={`flex-1 sm:flex-initial px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              adminSection === 'SSC_CHAMPIONSHIP'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>🔬 এসএসসি সায়েন্স ২৪-ঘণ্টা লাইভ চ্যাম্পিয়নশিপ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPop();
              setAdminSection('HSC_ICT_BANK');
            }}
            className={`flex-1 sm:flex-initial px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              adminSection === 'HSC_ICT_BANK'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Binary className="w-4 h-4 text-cyan-300" />
            <span>💻 এইচএসসি আইসিটি প্রশ্ন ব্যাংক ও মাস্টার গাইড</span>
          </button>
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
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {adminSection === 'SSC_CHAMPIONSHIP' ? (
        /* ========================================================
           SECTION 1: SSC SCIENCE 24-HOUR LIVE CHAMPIONSHIP
           ======================================================== */
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>অ্যাডমিন সায়েন্স চ্যাম্পিয়নশিপ কন্ট্রোল রুম</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ২৪-ঘণ্টা লাইভ ২৫-MCQ চ্যাম্পিয়নশিপ ব্যবস্থাপনা
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
                আপনার গুগল ড্রাইভের SSC Physics, Chemistry ও Biology বোর্ড প্রশ্নপত্র থেকে ২৫টি এমসিকিউ JSON আপলোড বা প্রিসেট নির্বাচন করে ১-ক্লিকে ২৪ ঘণ্টার লাইভ প্রতিযোগিতা চালু করুন।
              </p>
            </div>

            {/* Google Drive Folder Links Pill */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs space-y-2">
              <p className="font-bold text-amber-200 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4" />
                <span>গুগল ড্রাইভ প্রশ্ন ব্যাঙ্ক ফোল্ডার:</span>
              </p>
              <div className="flex flex-col gap-1 text-[11px]">
                <a
                  href="https://drive.google.com/drive/u/0/mobile/folders/1W28xlhKsi6ktR6cPYs7VnqNTSAsjJxjS?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:underline truncate"
                >
                  📁 পদার্থবিজ্ঞান ড্রাইভ ফোল্ডার ↗
                </a>
                <a
                  href="https://drive.google.com/drive/u/0/mobile/folders/1otH4FsffFL9meu4yi3Y5vzZkNztdam5B?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:underline truncate"
                >
                  📁 রসায়ন ড্রাইভ ফোল্ডার ↗
                </a>
                <a
                  href="https://drive.google.com/drive/u/0/mobile/folders/1IB_m0bKrGW9VLkAOqrqj673e4K5Z66PC?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:underline truncate"
                >
                  📁 জীববিজ্ঞান ড্রাইভ ফোল্ডার ↗
                </a>
              </div>
            </div>
          </div>

          {/* Currently Active Live Session Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                  বর্তমান সক্রিয় সেশন
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeSession ? activeSession.title : 'বর্তমানে কোনো লাইভ চ্যাম্পিয়নশিপ চালু নেই'}
                </h3>
                {activeSession && (
                  <p className="text-xs text-slate-500">
                    বিষয়: {activeSession.subject} • প্রশ্ন সংখ্যা: {activeSession.totalQuestions}টি • সময়: {activeSession.timeLimitMinutes} মিনিট • অংশগ্রহণকারী: {activeSession.totalParticipants || 0} জন
                  </p>
                )}
              </div>

              {activeSession && (
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>লাইভ চলছে</span>
                  </span>
                  <button
                    onClick={handleDeactivate}
                    className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Presets Box */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>বোর্ড স্ট্যান্ডার্ড রেডিমেড প্রিসেট (১-ক্লিকে লোড করুন)</span>
              </h4>
              <span className="text-[11px] text-slate-500">প্রতিটিতে ২৫টি প্রশ্ন ও নির্ভুল ব্যাখ্যা</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleLoadPreset('PHYSICS')}
                className="p-4 rounded-2xl bg-white border border-blue-200 hover:border-blue-400 text-left transition-all shadow-xs group"
              >
                <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600">
                  ⚛️ এসএসসি পদার্থবিজ্ঞান
                </div>
                <div className="text-[11px] text-slate-500 mt-1">গতি, বল ও শক্তি (২৫টি MCQ)</div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('CHEMISTRY')}
                className="p-4 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 text-left transition-all shadow-xs group"
              >
                <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">
                  🧪 এসএসসি রসায়ন
                </div>
                <div className="text-[11px] text-slate-500 mt-1">পর্যায় সারণি ও রাসায়নিক বন্ধন (২৫টি MCQ)</div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('BIOLOGY')}
                className="p-4 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 text-left transition-all shadow-xs group"
              >
                <div className="font-bold text-slate-900 text-sm group-hover:text-purple-600">
                  🧬 এসএসসি জীববিজ্ঞান
                </div>
                <div className="text-[11px] text-slate-500 mt-1">কোষ বিভাজন ও প্রজনন (২৫টি MCQ)</div>
              </button>
            </div>
          </div>

          {/* Launch Form */}
          <form onSubmit={handleLaunchChampionship} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileCode className="w-5 h-5 text-amber-500" />
              <span>নতুন ২৪-ঘণ্টা সেশন কনফিগার ও ড্রাইভ JSON আপলোড</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">সেশন শিরোনাম (Title)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">বিষয় (Subject)</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Physics">Physics (পদার্থবিজ্ঞান)</option>
                  <option value="Chemistry">Chemistry (রসায়ন)</option>
                  <option value="Biology">Biology (জীববিজ্ঞান)</option>
                  <option value="Combined">সমন্বিত বিজ্ঞান (Mega Science)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">সময়সীমা (মিনিট)</label>
                <input
                  type="number"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  min={5}
                  max={60}
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* JSON Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>গুগল ড্রাইভ ২৫-MCQ JSON ডাটা পেস্ট করুন:</span>
                </label>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  পার্স করা প্রশ্ন: {parsedQuestions.length}টি
                </span>
              </div>

              <textarea
                rows={9}
                value={rawJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='[ { "questionText": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..." } ]'
                className="w-full font-mono text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || parsedQuestions.length === 0}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitting ? 'চালু করা হচ্ছে...' : '২৪-ঘণ্টা লাইভ চ্যাম্পিয়নশিপ শুরু করুন (Start Live 24h Round) 🚀'}
                </span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================
           SECTION 2: HSC ICT QUESTION BANK & MASTER GUIDE MANAGER
           ======================================================== */
        <div className="space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-500/30">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold">
                <Binary className="w-3.5 h-3.5 text-cyan-300" />
                <span>এইচএসসি আইসিটি মাস্টার গাইড কন্ট্রোল প্যানেল</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                আইসিটি আনলিমিটেড প্রশ্ন ব্যাংক ও প্রিসেট ম্যানেজার
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                এইচএসসি পরীক্ষার্থীদের জন্য অধ্যায়ভিত্তিক বহুনির্বাচনি প্রশ্ন ব্যাংক তৈরি করুন। শিক্ষার্থীরা এখান থেকে যেকোনো সময় ৩০ বা ৪০ প্রশ্নের ডাইনামিক পরীক্ষায় অংশ নিতে পারে।
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSeedIctPresets}
                disabled={uploadingIct}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>রেহান স্যারের মাস্টার গাইড প্রিসেট লোড করুন</span>
              </button>
            </div>
          </div>

          {/* Chapter Stats Grid */}
          {ictStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {ictStats.chapters?.map((ch: any) => (
                <div
                  key={ch.id}
                  onClick={() => setIctChapterFilter(String(ch.id))}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    ictChapterFilter === String(ch.id)
                      ? 'bg-blue-600/20 border-blue-500 shadow-md text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 truncate">অধ্যায় {ch.id}</div>
                  <div className="text-xs font-bold truncate mt-0.5">{ch.title.split(':')[1] || ch.title}</div>
                  <div className="text-sm font-black text-cyan-400 mt-1">{ch.totalQuestions}টি প্রশ্ন</div>
                </div>
              ))}
            </div>
          )}

          {/* Bulk JSON Upload Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" /> বাল্ক আইসিটি প্রশ্ন আপলোড (Bulk JSON Paste)
              </h3>
              {parsedIctCount > 0 && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                  পার্স করা হয়েছে: {parsedIctCount}টি প্রশ্ন
                </span>
              )}
            </div>

            <textarea
              rows={8}
              value={ictRawJson}
              onChange={(e) => handleIctJsonChange(e.target.value)}
              placeholder={`[
  {
    "chapter": 3,
    "chapterTitle": "অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
    "topic": "সংখ্যা পদ্ধতি",
    "questionText": "বাইনারি (1101)2 এর দশমিক মান কত?",
    "options": ["11", "13", "15", "17"],
    "correctIndex": 1,
    "explanation": "1*8 + 1*4 + 0*2 + 1*1 = 13।",
    "boardYear": "বোর্ড স্ট্যান্ডার্ড"
  }
]`}
              className="w-full font-mono text-xs p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleUploadIctQuestions}
                disabled={uploadingIct || !ictRawJson.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs md:text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{uploadingIct ? 'আপলোড হচ্ছে...' : 'প্রশ্ন যুক্ত করুন (Upload to Question Bank)'}</span>
              </button>
            </div>
          </div>

          {/* Question List Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  আইসিটি প্রশ্ন ব্যাংক তালিকা ({ictQuestions.length}টি প্রশ্ন)
                </h3>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={ictChapterFilter}
                  onChange={(e) => setIctChapterFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none"
                >
                  <option value="ALL">সকল অধ্যায় (All Chapters)</option>
                  <option value="1">অধ্যায় ১: বিশ্ব ও বাংলাদেশ প্রেক্ষিত</option>
                  <option value="2">অধ্যায় ২: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং</option>
                  <option value="3">অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস</option>
                  <option value="4">অধ্যায় ৪: ওয়েব ডিজাইন ও HTML</option>
                  <option value="5">অধ্যায় ৫: সি প্রোগ্রামিং (C Programming)</option>
                  <option value="6">অধ্যায় ৬: ডেটাবেজ ম্যানেজমেন্ট সিস্টেম</option>
                </select>
              </div>
            </div>

            {loadingIct ? (
              <div className="text-center py-10 text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> প্রশ্ন লোড হচ্ছে...
              </div>
            ) : ictQuestions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                কোনো প্রশ্ন পাওয়া যায়নি। উপরে "মাস্টার গাইড প্রিসেট লোড করুন" বাটনে ক্লিক করে প্রিসেট লোড করুন।
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {ictQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </span>
                        <span className="text-slate-300 font-semibold">{q.chapterTitle}</span>
                        {q.topic && <span className="text-slate-500">• {q.topic}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {q.boardYear && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded">
                            {q.boardYear}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteIctQuestion(q.id)}
                          className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="প্রশ্ন মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-white">{q.questionText}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                      {q.options?.map((opt: string, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl border text-[11px] ${
                            optIdx === q.correctIndex
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          {['ক', 'খ', 'গ', 'ঘ'][optIdx] || optIdx + 1}. {opt}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-indigo-300 pt-1">
                        <span className="font-semibold text-cyan-400">ব্যাখ্যা:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

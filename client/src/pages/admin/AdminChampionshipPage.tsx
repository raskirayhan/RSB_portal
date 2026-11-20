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
  Crown
} from 'lucide-react';

export const AdminChampionshipPage: React.FC = () => {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [title, setTitle] = useState('SSC Science 24-Hour Live Board Championship');
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('বোর্ড স্পেশাল অধ্যায়ভিত্তিক সংকলন');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(12);
  const [durationHours, setDurationHours] = useState(24);
  const [rawJson, setRawJson] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [presets, setPresets] = useState<any>(null);

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

  useEffect(() => {
    loadData();
  }, []);

  // Handle Preset Load
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

  // Handle JSON Textarea Change & Validation
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

  // Launch Live Championship
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

  // Deactivate Session
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

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
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
                className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition-colors"
              >
                সেশন বন্ধ করুন
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1-Click Curated Presets Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-base">১-ক্লিক বোর্ড স্পেশাল প্রিসেট লোডার (২৫টি করে MCQ)</h3>
        </div>
        <p className="text-xs text-slate-400">
          আপনার ড্রাইভের সিলেবাস অনুযায়ী সাজানো ২৫টি করে নির্ভুল এমসিকিউ সরাসরি লোড করে নিন:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleLoadPreset('PHYSICS')}
            className="p-4 rounded-2xl bg-blue-950/60 border border-blue-500/40 hover:border-blue-400 text-left transition-all group"
          >
            <span className="text-xs font-extrabold text-blue-300 block mb-1">⚡ SSC পদার্থবিজ্ঞান</span>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-200">
              গতি, বল, শক্তি, চলতড়িৎ (২৫টি MCQ)
            </h4>
            <p className="text-[10px] text-slate-400 mt-2">১-ক্লিকে লোড করুন ↗</p>
          </button>

          <button
            type="button"
            onClick={() => handleLoadPreset('CHEMISTRY')}
            className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all group"
          >
            <span className="text-xs font-extrabold text-emerald-300 block mb-1">⚗️ SSC রসায়ন</span>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-200">
              পর্যায় সারণি, বন্ধন, মোল ও জৈব যৌগ (২৫টি)
            </h4>
            <p className="text-[10px] text-slate-400 mt-2">১-ক্লিকে লোড করুন ↗</p>
          </button>

          <button
            type="button"
            onClick={() => handleLoadPreset('BIOLOGY')}
            className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/40 hover:border-purple-400 text-left transition-all group"
          >
            <span className="text-xs font-extrabold text-purple-300 block mb-1">🧬 SSC জীববিজ্ঞান</span>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-200">
              কোষ, জীবনীশক্তি, সংবহন ও ডিএনএ (২৫টি)
            </h4>
            <p className="text-[10px] text-slate-400 mt-2">১-ক্লিকে লোড করুন ↗</p>
          </button>
        </div>
      </div>

      {/* Upload & Create Championship Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-indigo-600" />
          <span>ড্রাইভ ২৫-MCQ ব্যাচ আপলোড / কাস্টমাইজেশন</span>
        </h3>

        <form onSubmit={handleLaunchChampionship} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">চ্যাম্পিয়নশিপ শিরোনাম (Title)</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বিষয় (Subject)</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold"
              >
                <option value="Physics">পদার্থবিজ্ঞান (Physics)</option>
                <option value="Chemistry">রসায়ন (Chemistry)</option>
                <option value="Biology">জীববিজ্ঞান (Biology)</option>
                <option value="Higher Math">উচ্চতর গণিত (Higher Math)</option>
                <option value="General Science">সাধারণ বিজ্ঞান (General Science)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যায় / সিলেবাস বিবরণ</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="যেমন: অধ্যায় ২-৪ বা অলিম্পিয়াড রাউন্ড"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সময়সীমা (মিনিট)</label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সেশনের মেয়াদ (ঘণ্টা)</label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold"
                />
              </div>
            </div>
          </div>

          {/* JSON Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                ২৫টি MCQ প্রশ্নের JSON ডেটা (Paste or Edit JSON)
              </label>
              <span className="text-xs font-bold text-indigo-600">
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

          {/* Question Preview Table */}
          {parsedQuestions.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  প্রশ্নের প্রিভিউ ({parsedQuestions.length}টি)
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs p-2">
                {parsedQuestions.slice(0, 10).map((q, idx) => (
                  <div key={idx} className="p-2 space-y-1">
                    <p className="font-bold text-slate-800">
                      {idx + 1}. {q.questionText}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      সঠিক উত্তর: অপশন {['ক', 'খ', 'গ', 'ঘ'][q.correctIndex || 0]} ({q.options?.[q.correctIndex || 0]})
                    </p>
                  </div>
                ))}
                {parsedQuestions.length > 10 && (
                  <p className="text-[11px] text-center text-slate-400 py-1">
                    ...আরও {parsedQuestions.length - 10}টি প্রশ্ন অন্তর্ভুক্ত রয়েছে।
                  </p>
                )}
              </div>
            </div>
          )}

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
    </div>
  );
};

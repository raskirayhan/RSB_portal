import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  BookOpen,
  PlusCircle,
  Video,
  CheckCircle2,
  AlertCircle,
  FileText,
  Play
} from 'lucide-react';

export const AdminMaterialsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [demoVideos, setDemoVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Material Form State
  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [materialType, setMaterialType] = useState('LECTURE_SHEET');

  // New Demo Video Form State
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubject, setVideoSubject] = useState('Physics');
  const [videoChapter, setVideoChapter] = useState('');
  const [videoDuration, setVideoDuration] = useState('৩:৩০ মিনিট');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const fetchData = async () => {
    try {
      const subRes = await api.get('/vault/subjects');
      if (subRes.data.success) setSubjects(subRes.data.data);

      const landRes = await api.get('/public/landing-data');
      if (landRes.data.success) setDemoVideos(landRes.data.data.demoVideos || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !chapterId) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/admin/materials', {
        title,
        chapterId,
        materialType,
        fileUrl: 'generated',
      });

      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'নতুন স্টাডি মেটেরিয়াল ভল্টে সফলভাবে যুক্ত হয়েছে।' });
        setTitle('');
        await fetchData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'মেটেরিয়াল যুক্ত করতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !youtubeUrl) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/admin/demo-videos', {
        title: videoTitle,
        subject: videoSubject,
        chapter: videoChapter,
        duration: videoDuration,
        youtubeUrl,
      });

      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'পাবলিক ডেমো ক্লাস সফলভাবে যুক্ত হয়েছে।' });
        setVideoTitle('');
        setYoutubeUrl('');
        await fetchData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'ভিডিও যুক্ত করতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  const currentChapters = subjects.find((s) => s.id === selectedSubjectId)?.chapters || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900">
          স্টাডি মেটেরিয়াল ও ডেমো ক্লাস ম্যানেজমেন্ট
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          বিজ্ঞান বিষয়ের নতুন লেকচার শিট, সূত্রের শিট ও পাবলিক ল্যান্ডিং পেজের ২-৪ মিনিটের ডেমো ভিডিও যুক্ত করুন।
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center space-x-3 ${
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

      {/* Grid: 2 Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form 1: Add Study Material */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-blue-600 border-b border-slate-100 pb-3">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-base">নতুন লেকচার শিট যুক্ত করুন</h3>
          </div>

          <form onSubmit={handleCreateMaterial} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">মেটেরিয়াল শিরোনাম</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: ভেক্টর - বোর্ড ও ক্যাডেট কলেজ CQ প্রশ্নব্যাংক"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বিষয় নির্বাচন করুন</label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setChapterId('');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- বিষয় নির্বাচন করুন --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যায় নির্বাচন করুন</label>
              <select
                required
                disabled={!selectedSubjectId}
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">-- অধ্যায় নির্বাচন করুন --</option>
                {currentChapters.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">মেটেরিয়াল ধরন</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LECTURE_SHEET">লেকচার শিট</option>
                <option value="FORMULA_SHEET">সূত্রের শিট</option>
                <option value="CQ_QUESTION_BANK">ক্যাডেট কলেজ CQ প্রশ্নব্যাংক</option>
                <option value="MCQ_SHEET">MCQ শিট</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>স্টাডি ভল্টে যুক্ত করুন</span>
            </button>
          </form>
        </div>

        {/* Form 2: Add Demo Video */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-purple-600 border-b border-slate-100 pb-3">
            <Video className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-base">২-৪ মিনিট ফ্রি ডেমো ক্লাস</h3>
          </div>

          <form onSubmit={handleCreateVideo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ভিডিও শিরোনাম</label>
              <input
                type="text"
                required
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="যেমন: কার্নো ম্যাপ ও লজিক গেটের সহজ ট্রিকস"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিষয়</label>
                <select
                  value={videoSubject}
                  onChange={(e) => setVideoSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Higher Math">Higher Math</option>
                  <option value="Biology">Biology</option>
                  <option value="ICT">ICT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মেয়াদ</label>
                <input
                  type="text"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="৩:৩০ মিনিট"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যায় / টপিক</label>
              <input
                type="text"
                value={videoChapter}
                onChange={(e) => setVideoChapter(e.target.value)}
                placeholder="যেমন: ডিজিটাল লজিক"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">YouTube URL / Video Link</label>
              <input
                type="url"
                required
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ডেমো ক্লাসে পাবলিশ করুন</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

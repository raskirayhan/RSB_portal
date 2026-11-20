import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  BookOpen,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Layers
} from 'lucide-react';

interface StudyNote {
  id: string;
  classLevel: string;
  subject: string;
  chapterNumber: number;
  chapterName: string;
  title: string;
  driveFileUrl: string;
  previewUrl: string;
  downloadUrl: string;
  isGoogleDoc: boolean;
  createdAt: string;
}

export const AdminMaterialsPage: React.FC = () => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');

  // Google Drive Study Vault Form State
  const [classLevel, setClassLevel] = useState('SSC');
  const [subject, setSubject] = useState('PHYSICS');
  const [chapterNumber, setChapterNumber] = useState<number>(2);
  const [chapterName, setChapterName] = useState('গতি');
  const [title, setTitle] = useState('');
  const [driveFileUrl, setDriveFileUrl] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/study-vault/notes?classLevel=ALL');
      if (res.data.success) {
        setNotes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !driveFileUrl) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/study-vault/admin/notes', {
        classLevel,
        subject,
        chapterNumber: Number(chapterNumber) || 0,
        chapterName: chapterName || 'সাধারণ অধ্যায়',
        title,
        driveFileUrl,
      });

      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'নতুন ড্রাইভ স্টাডি নোট সফলভাবে যুক্ত হয়েছে।' });
        setTitle('');
        setDriveFileUrl('');
        await fetchNotes();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.response?.data?.message || 'নোট যুক্ত করতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string, noteTitle: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${noteTitle}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await api.delete(`/study-vault/admin/notes/${id}`);
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'নোট সফলভাবে মুছে ফেলা হয়েছে।' });
        fetchNotes();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'নোট মুছতে সমস্যা হয়েছে।' });
    }
  };

  const handleRestoreMasterSeeds = async () => {
    if (!window.confirm('রায়হান স্যারের ২১টি মাস্টার ড্রাইভ নোট ও মডেল টেস্ট ডেটাবেজে রিস্টোর করতে চান?')) return;
    setLoading(true);
    try {
      const res = await api.post('/study-vault/admin/seed-notes');
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: res.data.message || 'মাস্টার নোটগুলো রিস্টোর হয়েছে!' });
        await fetchNotes();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'রিস্টোর করতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.chapterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'ALL' || n.subject.toUpperCase() === filterSubject;
    const matchesClass = filterClass === 'ALL' || n.classLevel.toUpperCase().includes(filterClass);
    return matchesSearch && matchesSubject && matchesClass;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-1">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Rayhan Sir's Vault Panel</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            গুগল ড্রাইভ স্টাডি ভল্ট ও মেটেরিয়াল ম্যানেজমেন্ট
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            এসএসসি ও এইচএসসি বিজ্ঞান বিভাগের অধ্যায়ভিত্তিক গুগল ড্রাইভ PDF লেকচার শিট, হ্যান্ডনোট ও মডেল টেস্ট পরিচালনা করুন।
          </p>
        </div>

        <button
          onClick={handleRestoreMasterSeeds}
          disabled={loading}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-1.5 self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>২১টি মাস্টার ড্রাইভ নোট রিস্টোর করুন</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center space-x-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
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

      {/* Form: Add New Google Drive Note */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center space-x-2 text-blue-600 border-b border-slate-100 dark:border-slate-800 pb-3">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            নতুন গুগল ড্রাইভ স্টাডি নোট / শিট যুক্ত করুন
          </h3>
        </div>

        <form onSubmit={handleCreateNote} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                শ্রেণি (Class Level)
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SSC">এসএসসি (SSC 2026/2027)</option>
                <option value="HSC">এইচএসসি (HSC 2026/2027)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিষয় (Subject)
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PHYSICS">পদার্থবিজ্ঞান (Physics)</option>
                <option value="CHEMISTRY">রসায়ন (Chemistry)</option>
                <option value="HIGHER_MATH">উচ্চতর গণিত (Higher Math)</option>
                <option value="GENERAL_MATH">সাধারণ গণিত (General Math)</option>
                <option value="BIOLOGY">জীববিজ্ঞান (Biology)</option>
                <option value="ICT">তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                অধ্যায় নং (Chapter Number)
              </label>
              <input
                type="number"
                required
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 0)}
                placeholder="0 = বোর্ড প্রশ্ন, 99 = মডেল টেস্ট"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                অধ্যায়ের নাম (Chapter Name)
              </label>
              <input
                type="text"
                required
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="যেমন: গতি, বল, সংখ্যা পদ্ধতি..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              নোটের পূর্ণ শিরোনাম (Material Title)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: SSC Practice + Model Test Solve (CQ+MCQ) — Chapter 02"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Google Drive অথবা Docs লিংক
            </label>
            <input
              type="url"
              required
              value={driveFileUrl}
              onChange={(e) => setDriveFileUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/... অথবা https://docs.google.com/document/d/..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * সিস্টেম স্বয়ংক্রিয়ভাবে Google Drive এর ফাইল আইডি শনাক্ত করে ইন-অ্যাপ ভিউয়ার ও ১-ক্লিক ডিরেক্ট ডাউনলোড লিংক তৈরি করবে।
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'যুক্ত হচ্ছে...' : 'স্টাডি ভল্টে যুক্ত করুন'}</span>
          </button>
        </form>
      </div>

      {/* Existing Study Notes Inventory */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base">
              বর্তমান স্টাডি ভল্ট নোটসমূহ ({filteredNotes.length}টি)
            </h3>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">সকল শ্রেণি</option>
              <option value="SSC">এসএসসি (SSC)</option>
              <option value="HSC">এইচএসসি (HSC)</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">সকল বিষয়</option>
              <option value="PHYSICS">পদার্থবিজ্ঞান</option>
              <option value="CHEMISTRY">রসায়ন</option>
              <option value="HIGHER_MATH">উচ্চতর গণিত</option>
              <option value="GENERAL_MATH">সাধারণ গণিত</option>
              <option value="BIOLOGY">জীববিজ্ঞান</option>
              <option value="ICT">ICT</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নোট বা অধ্যায়ের নাম লিখে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-3">শ্রেণি ও বিষয়</th>
                <th className="py-3 px-3">অধ্যায়</th>
                <th className="py-3 px-3">শিরোনাম</th>
                <th className="py-3 px-3">ড্রাইভ লিংক</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNotes.map((note) => (
                <tr key={note.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {note.classLevel}
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      {note.subject}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    <span className="font-bold">Ch {note.chapterNumber}:</span> {note.chapterName}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                    {note.title}
                  </td>
                  <td className="py-3 px-3">
                    <a
                      href={note.previewUrl || note.driveFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:underline"
                    >
                      <span>খুলুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteNote(note.id, note.title)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

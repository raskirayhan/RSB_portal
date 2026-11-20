import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { NctbBooksSection } from '../../components/NctbBooksSection';
import { playPop, playSuccessChime } from '../../utils/soundFX';
import {
  BookOpen,
  FileText,
  Download,
  Eye,
  Search,
  Sparkles,
  GraduationCap,
  Plus,
  Trash2,
  ExternalLink,
  X,
  CheckCircle,
  AlertCircle,
  Layers,
  FolderOpen,
  RefreshCw,
  Clock,
  ArrowRight
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
  fileId?: string;
  createdAt: string;
}

export const StudyVaultPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();

  // Determine student's default level (SSC or HSC)
  const getInitialLevel = (): 'SSC' | 'HSC' => {
    const paramLvl = searchParams.get('level')?.toUpperCase();
    if (paramLvl === 'HSC' || paramLvl === 'SSC') return paramLvl;

    const saved = localStorage.getItem('rsb_selected_academic_level');
    if (saved === 'HSC' || saved === 'SSC') return saved;

    const profileLvl = (profile?.academicLevel || '').toUpperCase();
    if (profileLvl.includes('HSC') || profileLvl.includes('11') || profileLvl.includes('12')) {
      return 'HSC';
    }
    return 'SSC';
  };

  const [activeLevel, setActiveLevel] = useState<'SSC' | 'HSC'>(getInitialLevel());
  const [activeVaultTab, setActiveVaultTab] = useState<'NOTES' | 'NCTB_BOOKS'>('NOTES');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewNote, setPreviewNote] = useState<StudyNote | null>(null);

  // Admin Controls
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [addForm, setAddForm] = useState({
    classLevel: 'SSC',
    subject: 'PHYSICS',
    chapterNumber: 2,
    chapterName: 'গতি',
    title: '',
    driveFileUrl: '',
  });

  // Fetch Study Notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
      let url = `/study-vault/notes?classLevel=${activeLevel}`;
      if (selectedSubject !== 'ALL') {
        url += `&subject=${selectedSubject}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setNotes(res.data.data);
      }
    } catch (err) {
      console.error('[Study Vault] Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [activeLevel, selectedSubject, searchQuery]);

  // Subject Tabs for SSC vs HSC
  const sscSubjects = [
    { key: 'ALL', label: 'সকল বিষয় (All)' },
    { key: 'PHYSICS', label: 'পদার্থবিজ্ঞান', color: 'bg-blue-600' },
    { key: 'CHEMISTRY', label: 'রসায়ন', color: 'bg-emerald-600' },
    { key: 'HIGHER_MATH', label: 'উচ্চতর গণিত', color: 'bg-indigo-600' },
    { key: 'GENERAL_MATH', label: 'সাধারণ গণিত', color: 'bg-amber-600' },
    { key: 'BIOLOGY', label: 'জীববিজ্ঞান', color: 'bg-rose-600' },
  ];

  const hscSubjects = [
    { key: 'ALL', label: 'সকল বিষয় (All)' },
    { key: 'ICT', label: 'ICT (তথ্য ও প্রযুক্তি)', color: 'bg-cyan-600' },
    { key: 'PHYSICS', label: 'পদার্থবিজ্ঞান', color: 'bg-blue-600' },
    { key: 'CHEMISTRY', label: 'রসায়ন', color: 'bg-emerald-600' },
    { key: 'HIGHER_MATH', label: 'উচ্চতর গণিত', color: 'bg-indigo-600' },
    { key: 'BIOLOGY', label: 'জীববিজ্ঞান', color: 'bg-rose-600' },
  ];

  const currentSubjectList = activeLevel === 'SSC' ? sscSubjects : hscSubjects;

  // Format Subject Label & Color Badge
  const getSubjectBadge = (subj: string) => {
    switch (subj.toUpperCase()) {
      case 'PHYSICS':
        return { label: 'পদার্থবিজ্ঞান', bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' };
      case 'CHEMISTRY':
        return { label: 'রসায়ন', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' };
      case 'HIGHER_MATH':
        return { label: 'উচ্চতর গণিত', bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' };
      case 'GENERAL_MATH':
        return { label: 'সাধারণ গণিত', bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' };
      case 'BIOLOGY':
        return { label: 'জীববিজ্ঞান', bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' };
      case 'ICT':
        return { label: 'ICT', bg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30' };
      default:
        return { label: subj, bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30' };
    }
  };

  // Group Notes By Chapter
  const groupedNotes = notes.reduce((acc, note) => {
    const key = `${note.chapterNumber}:::${note.chapterName}`;
    if (!acc[key]) {
      acc[key] = {
        chapterNumber: note.chapterNumber,
        chapterName: note.chapterName,
        items: [],
      };
    }
    acc[key].items.push(note);
    return acc;
  }, {} as Record<string, { chapterNumber: number; chapterName: string; items: StudyNote[] }>);

  // Sort groups: Ch 0 (Question banks) first, 1..98, then Ch 99 (Model tests)
  const sortedChapterKeys = Object.keys(groupedNotes).sort((a, b) => {
    const numA = groupedNotes[a].chapterNumber;
    const numB = groupedNotes[b].chapterNumber;
    if (numA === 0) return -1;
    if (numB === 0) return 1;
    return numA - numB;
  });

  // Admin: Delete Note
  const handleDeleteNote = async (id: string, title: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${title}" নোটটি মুছে ফেলতে চান?`)) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/study-vault/admin/notes/${id}`);
      if (res.data.success) {
        playSuccessChime();
        setFeedbackMsg({ type: 'success', text: 'নোটটি সফলভাবে মুছে ফেলা হয়েছে।' });
        fetchNotes();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.response?.data?.message || 'নোট মুছতে ব্যর্থ হয়েছে।' });
    } finally {
      setActionLoading(false);
    }
  };

  // Admin: Create Note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await api.post('/study-vault/admin/notes', addForm);
      if (res.data.success) {
        playSuccessChime();
        setShowAddModal(false);
        setFeedbackMsg({ type: 'success', text: 'নতুন ড্রাইভ নোট ভল্টে যুক্ত হয়েছে!' });
        setAddForm({
          classLevel: activeLevel,
          subject: 'PHYSICS',
          chapterNumber: 1,
          chapterName: '',
          title: '',
          driveFileUrl: '',
        });
        fetchNotes();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.response?.data?.message || 'নোট যুক্ত করতে সমস্যা হয়েছে।' });
    } finally {
      setActionLoading(false);
    }
  };

  // Admin: Restore 21 Master Seeds
  const handleRestoreSeeds = async () => {
    if (!window.confirm('রায়হান স্যারের নির্ধারিত ২১টি মাস্টার ড্রাইভ নোট ও মডেল টেস্ট রিস্টোর করতে চান?')) return;
    setActionLoading(true);
    try {
      const res = await api.post('/study-vault/admin/seed-notes');
      if (res.data.success) {
        playSuccessChime();
        setFeedbackMsg({ type: 'success', text: res.data.message || 'ডিফল্ট নোটগুলো রিস্টোর হয়েছে।' });
        fetchNotes();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'রিস্টোর করতে সমস্যা হয়েছে।' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Academic Class Switcher (SSC vs HSC) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              শ্রেণি / শিক্ষাস্তর নির্বাচন:
            </span>
            <span className="text-sm font-extrabold text-white">
              {activeLevel === 'SSC' ? 'এসএসসি বিজ্ঞান বিভাগ (SSC 2026/2027)' : 'এইচএসসি বিজ্ঞান ও আইসিটি (HSC 2026/2027)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              playPop();
              setActiveLevel('SSC');
              setSelectedSubject('ALL');
              localStorage.setItem('rsb_selected_academic_level', 'SSC');
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all text-center flex items-center justify-center space-x-2 ${
              activeLevel === 'SSC'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🎓</span>
            <span>এসএসসি (SSC)</span>
          </button>

          <button
            onClick={() => {
              playPop();
              setActiveLevel('HSC');
              setSelectedSubject('ALL');
              localStorage.setItem('rsb_selected_academic_level', 'HSC');
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all text-center flex items-center justify-center space-x-2 ${
              activeLevel === 'HSC'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🔬</span>
            <span>এইচএসসি (HSC)</span>
          </button>
        </div>
      </div>

      {/* Primary Vault Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => {
            playPop();
            setActiveVaultTab('NOTES');
          }}
          className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeVaultTab === 'NOTES'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span>অধ্যায়ভিত্তিক নোটস, প্রশ্নব্যাংক ও সমাধান (Drive/PDF)</span>
        </button>

        <button
          onClick={() => {
            playPop();
            setActiveVaultTab('NCTB_BOOKS');
          }}
          className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeVaultTab === 'NCTB_BOOKS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          <span>NCTB মূল পাঠ্যপুস্তক ভল্ট (Official Textbooks)</span>
        </button>
      </div>

      {/* Tab 2: NCTB Main Textbooks */}
      {activeVaultTab === 'NCTB_BOOKS' && <NctbBooksSection initialLevel={activeLevel} />}

      {/* Tab 1: Rayhan Sir's Study Notes & PDFs Vault */}
      {activeVaultTab === 'NOTES' && (
        <div className="space-y-6">
          {/* Hero Banner with Actions */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Rayhan Sir's Verified Study Materials</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  স্মার্ট স্টাডি ভল্ট — {activeLevel === 'SSC' ? 'এসএসসি' : 'এইচএসসি'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  রায়হান স্যারের গুগল ড্রাইভের সকল বোর্ড স্ট্যান্ডার্ড লেকচার শিট, হ্যান্ডনোট, ক্যাডেট কলেজ CQ+MCQ প্রশ্নব্যাংক ও পূর্ণাঙ্গ মডেল টেস্ট সলভ। এক ক্লিকে যেকোনো ডিভাইসে প্রিভিউ করুন বা ডাউনলোড করুন।
                </p>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => {
                      playPop();
                      setShowAddModal(true);
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন ড্রাইভ নোট যোগ করুন</span>
                  </button>
                  <button
                    onClick={handleRestoreSeeds}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                    <span>২১টি মাস্টার নোট রিস্টোর</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Alert */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="font-semibold">{feedbackMsg.text}</span>
              </div>
              <button onClick={() => setFeedbackMsg(null)} className="p-1 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Subject Pills & Search Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Subject Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {currentSubjectList.map((subj) => (
                <button
                  key={subj.key}
                  onClick={() => {
                    playPop();
                    setSelectedSubject(subj.key);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    selectedSubject === subj.key
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{subj.label}</span>
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নোটের নাম, অধ্যায় বা বিষয়ের নাম লিখে খুঁজুন (যেমন: গতি, ভেক্টর, ICT, বোর্ড প্রশ্ন...)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">স্টাডি ভল্ট লোড হচ্ছে...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">কোনো নোট পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                এই ফিল্টারে কোনো নোট নেই। অন্য বিষয় নির্বাচন করুন অথবা আপনার সার্চ টার্ম পরিবর্তন করুন।
              </p>
              {isAdmin && (
                <button
                  onClick={handleRestoreSeeds}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>২১টি মাস্টার ড্রাইভ নোট রিস্টোর করুন</span>
                </button>
              )}
            </div>
          ) : (
            /* Grouped Chapters & Notes */
            <div className="space-y-8">
              {sortedChapterKeys.map((key) => {
                const group = groupedNotes[key];
                const isBoardBank = group.chapterNumber === 0;
                const isModelTest = group.chapterNumber === 99;

                return (
                  <div key={key} className="space-y-4">
                    {/* Chapter Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">
                          {isBoardBank ? '🏛️' : isModelTest ? '🏆' : '📑'}
                        </span>
                        <div>
                          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            {isBoardBank
                              ? 'বোর্ড প্রশ্ন ব্যাংক ও স্পেশাল সমাধান'
                              : isModelTest
                              ? 'পূর্ণাঙ্গ ফাইনাল মডেল টেস্ট (Final Model Tests)'
                              : `অধ্যায় ${String(group.chapterNumber).padStart(2, '0')}: ${group.chapterName}`}
                          </h2>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {group.items.length}টি লেকচার শিট ও সমাধান
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {group.items.map((note) => {
                        const badge = getSubjectBadge(note.subject);
                        return (
                          <div
                            key={note.id}
                            className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
                          >
                            <div>
                              {/* Card Header: Subject & File Format Badge */}
                              <div className="flex items-center justify-between mb-3">
                                <span
                                  className={`text-[10px] font-black px-2.5 py-1 rounded-xl border ${badge.bg}`}
                                >
                                  {badge.label}
                                </span>

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1 ${
                                    note.isGoogleDoc
                                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  <span>{note.isGoogleDoc ? '📝 Google Doc' : '📑 PDF'}</span>
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-2">
                                {note.title}
                              </h3>

                              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-4">
                                <Clock className="w-3.5 h-3.5" />
                                <span>বোর্ড স্ট্যান্ডার্ড • সম্পূর্ণ সলভ সহ</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                              {/* 1. Read PDF (In-App Preview Modal) */}
                              <button
                                onClick={() => {
                                  playPop();
                                  setPreviewNote(note);
                                }}
                                className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-blue-200 dark:border-blue-900"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>পড়ুন 👁️</span>
                              </button>

                              {/* 2. Download PDF (Instant 1-Click) */}
                              <a
                                href={note.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>ডাউনলোড ⬇️</span>
                              </a>

                              {/* Admin Delete Action */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteNote(note.id, note.title)}
                                  disabled={actionLoading}
                                  title="নোট মুছুন"
                                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* In-App PDF / Document Reader Modal */}
      <AnimatePresence>
        {previewNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Top Header */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm sm:text-base font-extrabold truncate text-white">
                      {previewNote.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {previewNote.chapterName} • {previewNote.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Download Link */}
                  <a
                    href={previewNote.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড</span>
                  </a>

                  {/* Open in Drive directly */}
                  <a
                    href={previewNote.driveFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="ড্রাইভে খুলুন"
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Close Modal */}
                  <button
                    onClick={() => setPreviewNote(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Responsive Iframe Reader */}
              <div className="flex-1 w-full h-full bg-slate-950 relative">
                <iframe
                  src={previewNote.previewUrl}
                  title={previewNote.title}
                  className="w-full h-full border-0"
                  allow="autoplay"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin: Add New Google Drive Note Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Plus className="w-5 h-5" />
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    নতুন গুগল ড্রাইভ স্টাডি নোট যুক্ত করুন
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNote} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      শ্রেণি (Class)
                    </label>
                    <select
                      value={addForm.classLevel}
                      onChange={(e) => setAddForm({ ...addForm, classLevel: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="SSC">এসএসসি (SSC)</option>
                      <option value="HSC">এইচএসসি (HSC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      বিষয় (Subject)
                    </label>
                    <select
                      value={addForm.subject}
                      onChange={(e) => setAddForm({ ...addForm, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="PHYSICS">Physics (পদার্থবিজ্ঞান)</option>
                      <option value="CHEMISTRY">Chemistry (রসায়ন)</option>
                      <option value="HIGHER_MATH">Higher Math (উচ্চতর গণিত)</option>
                      <option value="GENERAL_MATH">General Math (সাধারণ গণিত)</option>
                      <option value="BIOLOGY">Biology (জীববিজ্ঞান)</option>
                      <option value="ICT">ICT (তথ্য ও প্রযুক্তি)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      অধ্যায় নং
                    </label>
                    <input
                      type="number"
                      required
                      value={addForm.chapterNumber}
                      onChange={(e) => setAddForm({ ...addForm, chapterNumber: parseInt(e.target.value, 10) || 0 })}
                      placeholder="0 (বোর্ড), 2, 99 (মডেল টেস্ট)"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      অধ্যায়ের নাম
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.chapterName}
                      onChange={(e) => setAddForm({ ...addForm, chapterName: e.target.value })}
                      placeholder="যেমন: গতি, বল, সংখ্যা পদ্ধতি..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    নোটের পুরো শিরোনাম (Title)
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    placeholder="যেমন: SSC Model Test Solve (CQ+MCQ) — Chapter 02"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Google Drive অথবা Docs শেয়ারিং লিংক
                  </label>
                  <input
                    type="url"
                    required
                    value={addForm.driveFileUrl}
                    onChange={(e) => setAddForm({ ...addForm, driveFileUrl: e.target.value })}
                    placeholder="https://drive.google.com/file/d/... অথবা https://docs.google.com/document/d/..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * লিংক পেস্ট করলেই সিস্টেম স্বয়ংক্রিয়ভাবে ইন-অ্যাপ রিডার এবং ১-ক্লিক ডিরেক্ট ডাউনলোড তৈরি করবে।
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{actionLoading ? 'যুক্ত হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

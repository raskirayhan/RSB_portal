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
  ArrowRight,
  Zap,
  FlaskConical,
  Calculator,
  Compass,
  Dna,
  Laptop,
  ChevronRight,
  BookmarkCheck,
  Award
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
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Subject Configurations
  const sscSubjects = [
    {
      key: 'ALL',
      label: 'সব বিষয়',
      shortName: 'সকল বিষয়',
      icon: Layers,
      gradient: 'from-slate-800 to-slate-900',
      accentColor: 'text-blue-400',
      description: 'এসএসসি বিজ্ঞান শাখার সকল বিষয় এক নজরে',
    },
    {
      key: 'PHYSICS',
      label: 'পদার্থবিজ্ঞান',
      shortName: 'পদার্থ',
      icon: Zap,
      gradient: 'from-blue-600 via-indigo-600 to-blue-800',
      accentColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
      description: 'গতি, বল, কাজ-ক্ষমতা-শক্তি ও আধুনিক ইলেকট্রনিক্স',
    },
    {
      key: 'CHEMISTRY',
      label: 'রসায়ন',
      shortName: 'রসায়ন',
      icon: FlaskConical,
      gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      description: 'পদার্থের অবস্থা, রাসায়নিক বন্ধন ও বোর্ড প্রশ্নব্যাংক',
    },
    {
      key: 'HIGHER_MATH',
      label: 'উচ্চতর গণিত',
      shortName: 'হায়ার ম্যাথ',
      icon: Calculator,
      gradient: 'from-indigo-600 via-purple-600 to-indigo-800',
      accentColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
      description: 'সেট ও ফাংশন, বীজগণিত, সূচক-লগ ও পরিমিতি সলভ',
    },
    {
      key: 'GENERAL_MATH',
      label: 'সাধারণ গণিত',
      shortName: 'গণিত',
      icon: Compass,
      gradient: 'from-amber-600 via-orange-600 to-amber-800',
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
      description: 'বোর্ড প্রশ্নব্যাংক, জ্যামিতি ও গাণিতিক সমাধান',
    },
    {
      key: 'BIOLOGY',
      label: 'জীববিজ্ঞান',
      shortName: 'বায়োলজি',
      icon: Dna,
      gradient: 'from-rose-600 via-pink-600 to-rose-800',
      accentColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
      description: 'জীবকোষ ও টিস্যু, বংশগতি ও বিবর্তন স্পেশাল শিট',
    },
  ];

  const hscSubjects = [
    {
      key: 'ALL',
      label: 'সব বিষয়',
      shortName: 'সকল বিষয়',
      icon: Layers,
      gradient: 'from-slate-800 to-slate-900',
      accentColor: 'text-cyan-400',
      description: 'এইচএসসি বিজ্ঞান ও আইসিটি সকল বিষয় এক নজরে',
    },
    {
      key: 'ICT',
      label: 'তথ্য ও প্রযুক্তি (ICT)',
      shortName: 'ICT',
      icon: Laptop,
      gradient: 'from-cyan-600 via-blue-600 to-indigo-800',
      accentColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
      description: 'সংখ্যা পদ্ধতি, ডিজিটাল লজিক, C প্রোগ্রামিং ও DBMS',
    },
    {
      key: 'PHYSICS',
      label: 'পদার্থবিজ্ঞান',
      shortName: 'পদার্থ',
      icon: Zap,
      gradient: 'from-blue-600 via-indigo-600 to-blue-800',
      accentColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
      description: 'ভেক্টর, গতিবিদ্যা, বলবিদ্যা ও তাপগতিবিদ্যা',
    },
    {
      key: 'CHEMISTRY',
      label: 'রসায়ন',
      shortName: 'রসায়ন',
      icon: FlaskConical,
      gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      description: 'জৈব যৌগ, গুণগত রসায়ন ও পর্যায়বৃত্ত ধর্ম',
    },
    {
      key: 'HIGHER_MATH',
      label: 'উচ্চতর গণিত',
      shortName: 'হায়ার ম্যাথ',
      icon: Calculator,
      gradient: 'from-indigo-600 via-purple-600 to-indigo-800',
      accentColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
      description: 'ম্যাট্রিক্স ও নির্ণায়ক, সরলরেখা, ক্যালকুলাস সলভ',
    },
    {
      key: 'BIOLOGY',
      label: 'জীববিজ্ঞান',
      shortName: 'বায়োলজি',
      icon: Dna,
      gradient: 'from-rose-600 via-pink-600 to-rose-800',
      accentColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
      description: 'কোষ বিভাজন, জিনতত্ত্ব ও মানব শারীরতত্ত্ব',
    },
  ];

  const currentSubjectList = activeLevel === 'SSC' ? sscSubjects : hscSubjects;

  const getSubjectMeta = (subjKey: string) => {
    return currentSubjectList.find((s) => s.key === subjKey.toUpperCase()) || {
      key: subjKey,
      label: subjKey,
      shortName: subjKey,
      icon: FileText,
      gradient: 'from-slate-700 to-slate-800',
      accentColor: 'text-blue-400',
      borderColor: 'border-slate-500/30',
      badgeColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30',
      description: 'স্পেশাল স্টাডি শিট ও সমাধান',
    };
  };

  // Partition Notes into Section A (Chapter-wise 1..98) and Section B (Model Tests & Board QBs: 0 & 99)
  const isAllSubjectsActive = selectedSubject === 'ALL' && !searchQuery.trim();

  const chapterWiseNotes = notes
    .filter((n) => n.chapterNumber > 0 && n.chapterNumber < 99)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const specialNotes = notes
    .filter((n) => n.chapterNumber === 0 || n.chapterNumber >= 99)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  // Group chapter-wise notes by chapter
  const groupedChapterNotes = chapterWiseNotes.reduce((acc, note) => {
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

  const sortedChapterKeys = Object.keys(groupedChapterNotes).sort((a, b) => {
    return groupedChapterNotes[a].chapterNumber - groupedChapterNotes[b].chapterNumber;
  });

  // Admin: Delete Note
  const handleDeleteNote = async (id: string, noteTitle: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${noteTitle}" নোটটি মুছে ফেলতে চান?`)) return;
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
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16 overflow-x-hidden">
      {/* 1. Mobile-First Academic Class Switcher (SSC vs HSC) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              শ্রেণি / শিক্ষাস্তর নির্বাচন:
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white">
              {activeLevel === 'SSC'
                ? 'এসএসসি বিজ্ঞান বিভাগ (SSC 2026/2027)'
                : 'এইচএসসি বিজ্ঞান ও আইসিটি (HSC 2026/2027)'}
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
            className={`min-h-[42px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all text-center flex items-center justify-center space-x-1.5 ${
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
            className={`min-h-[42px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all text-center flex items-center justify-center space-x-1.5 ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => {
            playPop();
            setActiveVaultTab('NOTES');
          }}
          className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            activeVaultTab === 'NOTES'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">অধ্যায়ভিত্তিক নোটস ও মডেল টেস্ট (Drive/PDF)</span>
        </button>

        <button
          onClick={() => {
            playPop();
            setActiveVaultTab('NCTB_BOOKS');
          }}
          className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            activeVaultTab === 'NCTB_BOOKS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">NCTB মূল পাঠ্যপুস্তক ভল্ট (Official Textbooks)</span>
        </button>
      </div>

      {/* Tab 2: NCTB Main Textbooks */}
      {activeVaultTab === 'NCTB_BOOKS' && <NctbBooksSection initialLevel={activeLevel} />}

      {/* Tab 1: Rayhan Sir's Study Notes & PDFs Vault */}
      {activeVaultTab === 'NOTES' && (
        <div className="space-y-6">
          {/* Responsive Top Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Rayhan Sir's Verified Study Materials</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                  স্মার্ট স্টাডি ভল্ট — {activeLevel === 'SSC' ? 'এসএসসি' : 'এইচএসসি'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  বোর্ড স্ট্যান্ডার্ড লেকচার শিট, হ্যান্ডনোট, ক্যাডেট কলেজ CQ+MCQ প্রশ্নব্যাংক ও পূর্ণাঙ্গ মডেল টেস্ট সলভ। যেকোনো ডিভাইসে এক ক্লিকে সরাসরি পড়ুন অথবা ডাউনলোড করুন।
                </p>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => {
                      playPop();
                      setShowAddModal(true);
                    }}
                    className="min-h-[40px] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন ড্রাইভ নোট যোগ করুন</span>
                  </button>
                  <button
                    onClick={handleRestoreSeeds}
                    disabled={actionLoading}
                    className="min-h-[40px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
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
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="font-semibold">{feedbackMsg.text}</span>
              </div>
              <button onClick={() => setFeedbackMsg(null)} className="p-1 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile-First Sticky / Smooth Horizontal Scrollable Subject Pills & Search */}
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            {/* Horizontal Swipeable Subject Pills (no-scrollbar, mobile friendly touch targets) */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
              {currentSubjectList.map((subj) => {
                const IconComponent = subj.icon;
                const isSelected = selectedSubject === subj.key;
                return (
                  <button
                    key={subj.key}
                    onClick={() => {
                      playPop();
                      setSelectedSubject(subj.key);
                    }}
                    className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 flex-shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-102'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{subj.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Responsive Search Input */}
            <div className="relative pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নোটের নাম বা অধ্যায় লিখে খুঁজুন (যেমন: গতি, ভেক্টর, ICT, বোর্ড প্রশ্ন...)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
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
          ) : isAllSubjectsActive ? (
            /* ======================================================== */
            /* 2. SUBJECT-FIRST BENTO OVERVIEW (Default "সব বিষয়" View) */
            /* ======================================================== */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    বিষয়ভিত্তিক স্টাডি ভল্ট (Subject Bento Overview)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    যে বিষয়ের নোটস ও মডেল টেস্ট পড়তে চান, সেই বিষয়ে ক্লিক করুন
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  মোট {notes.length}টি শিট
                </span>
              </div>

              {/* Subject Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSubjectList
                  .filter((s) => s.key !== 'ALL')
                  .map((subj) => {
                    const IconComp = subj.icon;
                    const subjectNotes = notes.filter((n) => n.subject.toUpperCase() === subj.key);
                    const chapterCount = new Set(
                      subjectNotes.filter((n) => n.chapterNumber > 0 && n.chapterNumber < 99).map((n) => n.chapterNumber)
                    ).size;
                    const specialCount = subjectNotes.filter(
                      (n) => n.chapterNumber === 0 || n.chapterNumber >= 99
                    ).length;

                    return (
                      <motion.div
                        key={subj.key}
                        whileHover={{ y: -3 }}
                        onClick={() => {
                          playPop();
                          setSelectedSubject(subj.key);
                        }}
                        className={`group cursor-pointer rounded-3xl p-5 bg-gradient-to-br ${subj.gradient} text-white shadow-lg hover:shadow-2xl transition-all border border-white/10 flex flex-col justify-between`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                              <IconComp className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20">
                              {subjectNotes.length}টি শিট
                            </span>
                          </div>

                          <div>
                            <h3 className="text-lg font-black text-white tracking-tight">
                              {subj.label}
                            </h3>
                            <p className="text-xs text-white/80 line-clamp-2 mt-1">
                              {subj.description}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/15 mt-4 flex items-center justify-between text-xs font-bold">
                          <span className="text-[11px] text-white/90">
                            {chapterCount > 0 ? `${chapterCount}টি অধ্যায়` : 'বোর্ড প্রশ্নব্যাংক'}
                            {specialCount > 0 ? ` • ${specialCount}টি টেস্ট` : ''}
                          </span>
                          <span className="inline-flex items-center space-x-1 text-white group-hover:translate-x-1 transition-transform">
                            <span>Explore Notes</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* 3. CLEAN CHAPTER & MODEL TEST GROUPING (Filtered View)   */
            /* ======================================================== */
            <div className="space-y-8">
              {/* Back to All Subjects pill when a subject is filtered */}
              {selectedSubject !== 'ALL' && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      playPop();
                      setSelectedSubject('ALL');
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>← সকল বিষয়ের ভিউতে ফিরে যান</span>
                  </button>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    ফিল্টারকৃত: {notes.length}টি লেকচার শিট
                  </span>
                </div>
              )}

              {/* SECTION A: অধ্যায়ভিত্তিক লেকচার ও সলভ শিট (Chapter-Wise Sheets: 1..98) */}
              {chapterWiseNotes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2.5 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <BookmarkCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        সেকশন A: অধ্যায়ভিত্তিক লেকচার ও সলভ শিট (Chapter-Wise Sheets)
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        ক্রম অনুসারে সাজানো প্রতিটি অধ্যায়ের কনসেপ্ট শিট ও ক্যাডেট কলেজ CQ সলভ
                      </p>
                    </div>
                  </div>

                  {/* Chapter-wise Subsections */}
                  <div className="space-y-6">
                    {sortedChapterKeys.map((key) => {
                      const group = groupedChapterNotes[key];
                      return (
                        <div key={key} className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                            <span className="inline-flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                অধ্যায় {String(group.chapterNumber).padStart(2, '0')}: {group.chapterName}
                              </span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {group.items.length}টি শিট
                            </span>
                          </div>

                          {/* Responsive Document Cards (Mobile: Stacked with 2-col full width buttons | Desktop: Sleek horizontal row) */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                            {group.items.map((note) => (
                              <DocumentCard
                                key={note.id}
                                note={note}
                                meta={getSubjectMeta(note.subject)}
                                isAdmin={isAdmin}
                                onRead={() => {
                                  playPop();
                                  setPreviewNote(note);
                                }}
                                onDelete={() => handleDeleteNote(note.id, note.title)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION B: ফাইনাল মডেল টেস্ট ও বোর্ড প্রশ্নব্যাংক (Model Tests & Board QBs: 0 & 99) */}
              {specialNotes.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <Award className="w-5 h-5 text-amber-500" />
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        সেকশন B: ফাইনাল মডেল টেস্ট ও বোর্ড প্রশ্নব্যাংক (Model Tests & Board QBs)
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        বোর্ড প্রশ্নব্যাংক (২০২২–২০২৬) ও পূর্ণাঙ্গ রিভিশন মডেল টেস্ট সমাধান
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                    {specialNotes.map((note) => (
                      <DocumentCard
                        key={note.id}
                        note={note}
                        meta={getSubjectMeta(note.subject)}
                        isAdmin={isAdmin}
                        isSpecial
                        onRead={() => {
                          playPop();
                          setPreviewNote(note);
                        }}
                        onDelete={() => handleDeleteNote(note.id, note.title)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Responsive PDF Reader Modal (Mobile: full-screen w-full h-[90vh] | Desktop: max-w-4xl h-[85vh]) */}
      <AnimatePresence>
        {previewNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full sm:max-w-4xl h-[92vh] sm:h-[86vh] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Top Header */}
              <div className="p-3.5 sm:p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs sm:text-sm font-extrabold truncate text-white">
                      {previewNote.title}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {previewNote.chapterName} • {previewNote.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Direct Download Button in Header */}
                  <a
                    href={previewNote.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ডাউনলোড</span>
                  </a>

                  {/* External Drive link */}
                  <a
                    href={previewNote.driveFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="ড্রাইভে খুলুন"
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Close Modal (✕) */}
                  <button
                    onClick={() => setPreviewNote(null)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                    title="বন্ধ করুন"
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
                    Google Drive অথবা Docs লিংক
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

/**
 * Mobile-First Responsive Document Card
 * - On Mobile (< 640px): Stacked vertical layout with full-width side-by-side touch buttons at bottom.
 * - On Desktop (>= 640px): Sleek horizontal row card with PDF icon & details on left, action buttons on right.
 */
interface DocumentCardProps {
  note: StudyNote;
  meta: any;
  isAdmin: boolean;
  isSpecial?: boolean;
  onRead: () => void;
  onDelete: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  note,
  meta,
  isAdmin,
  isSpecial = false,
  onRead,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Left: Info */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${meta.badgeColor}`}
          >
            {meta.shortName}
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
              isSpecial
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {note.chapterNumber === 0
              ? 'বোর্ড প্রশ্নব্যাংক'
              : note.chapterNumber === 99
              ? 'ফাইনাল মডেল টেস্ট'
              : `অধ্যায় ${String(note.chapterNumber).padStart(2, '0')}`}
          </span>

          <span className="text-[10px] font-semibold text-slate-400">
            {note.isGoogleDoc ? '📝 Google Doc' : '📑 PDF'}
          </span>
        </div>

        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
          {note.title}
        </h3>

        <p className="text-[11px] text-slate-400 truncate">
          {note.chapterName} • সম্পূর্ণ সলভ সহ
        </p>
      </div>

      {/* Right / Bottom: Action Buttons */}
      <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
        {/* Read Button */}
        <button
          onClick={onRead}
          className="min-h-[40px] px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-blue-200 dark:border-blue-900 flex-1 sm:flex-initial"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>পড়ুন 👁️</span>
        </button>

        {/* Instant Download Button */}
        <a
          href={note.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[40px] px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md flex-1 sm:flex-initial text-center"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ডাউনলোড ⬇️</span>
        </a>

        {/* Admin Delete */}
        {isAdmin && (
          <button
            onClick={onDelete}
            title="মুছে ফেলুন"
            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all col-span-2 sm:col-span-1 flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

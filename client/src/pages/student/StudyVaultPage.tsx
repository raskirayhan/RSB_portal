import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, API_BASE_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { NctbBooksSection } from '../../components/NctbBooksSection';
import { playPop } from '../../utils/soundFX';
import {
  BookOpen,
  FileText,
  Download,
  Filter,
  Search,
  Lock,
  ShieldAlert,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Eye,
  GraduationCap
} from 'lucide-react';

export const StudyVaultPage: React.FC = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();

  // Determine student's active level (CLASS_8, SSC, or HSC)
  const getStudentLevel = (): 'CLASS_8' | 'SSC' | 'HSC' => {
    const saved = localStorage.getItem('rsb_selected_academic_level');
    if (saved === 'CLASS_8' || saved === 'SSC' || saved === 'HSC') return saved;
    const lvl = (profile?.academicLevel || '').toUpperCase();
    if (lvl.includes('8') || lvl.includes('JSC')) return 'CLASS_8';
    if (lvl.includes('SSC')) return 'SSC';
    return 'HSC';
  };

  const [activeLevel, setActiveLevel] = useState<'CLASS_8' | 'SSC' | 'HSC'>(getStudentLevel());
  const [activeVaultTab, setActiveVaultTab] = useState<'SHEETS' | 'NCTB_BOOKS'>('SHEETS');

  const [subjects, setSubjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get('subject') || '');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Subjects & Chapters
    api.get('/vault/subjects')
      .then((res) => {
        if (res.data.success) {
          setSubjects(res.data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    // Fetch Materials with Filters
    let url = `/vault/materials?`;
    if (selectedSubject) url += `subjectId=${selectedSubject}&`;
    if (selectedChapter) url += `chapterId=${selectedChapter}&`;
    if (selectedType) url += `materialType=${selectedType}&`;

    api.get(url)
      .then((res) => {
        if (res.data.success) {
          setMaterials(res.data.data);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedSubject, selectedChapter, selectedType]);

  // Handle Dynamic Watermarked PDF Download
  const handleDownload = async (materialId: string, title: string) => {
    setDownloadingId(materialId);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('rsb_token');
      const response = await fetch(`${API_BASE_URL}/vault/download/${materialId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-device-id': localStorage.getItem('rsb_device_id') || 'web',
        },
      });

      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.message || 'ডাউনলোড ব্যর্থ হয়েছে।');
      }

      // Convert to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_RSB.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Download Error', err);
      setErrorMessage(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const levelFilteredSubjects = subjects.filter((s) => {
    if (activeLevel === 'CLASS_8') {
      return s.academicLevel === 'CLASS_8' || s.code.includes('CLASS_8') || s.code.includes('JSC');
    }
    if (activeLevel === 'SSC') {
      return s.academicLevel === 'SSC' || s.academicLevel === 'BOTH';
    }
    if (activeLevel === 'HSC') {
      return s.academicLevel === 'HSC' || s.academicLevel === 'BOTH';
    }
    return true;
  });

  const currentChapters = subjects.find((s) => s.id === selectedSubject)?.chapters || [];

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.chapter?.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Academic Level Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md">
        <div className="flex items-center space-x-2.5">
          <GraduationCap className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              শিক্ষাস্তর / বিভাগ নির্বাচন:
            </span>
            <span className="text-[11px] text-slate-400">
              {activeLevel === 'CLASS_8' ? '৮ম শ্রেণি (JSC বিজ্ঞান ও গণিত)' : activeLevel === 'SSC' ? 'এসএসসি বিজ্ঞান শাখা (Physics, Chem, Math, Bio)' : 'এইচএসসি বিজ্ঞান শাখা (উচ্চ মাধ্যমিক)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => {
              playPop();
              setActiveLevel('CLASS_8');
              localStorage.setItem('rsb_selected_academic_level', 'CLASS_8');
              setSelectedSubject('');
            }}
            className={`px-2.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all text-center truncate ${
              activeLevel === 'CLASS_8'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            🏫 ৮ম (JSC)
          </button>

          <button
            onClick={() => {
              playPop();
              setActiveLevel('SSC');
              localStorage.setItem('rsb_selected_academic_level', 'SSC');
              setSelectedSubject('');
            }}
            className={`px-2.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all text-center truncate ${
              activeLevel === 'SSC'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            🎓 এসএসসি
          </button>

          <button
            onClick={() => {
              playPop();
              setActiveLevel('HSC');
              localStorage.setItem('rsb_selected_academic_level', 'HSC');
              setSelectedSubject('');
            }}
            className={`px-2.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all text-center truncate ${
              activeLevel === 'HSC'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            🔬 এইচএসসি
          </button>
        </div>
      </div>

      {/* Primary Vault Navigation Tabs - responsive 2-column or overflow safe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => {
            playPop();
            setActiveVaultTab('SHEETS');
          }}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all text-center ${
            activeVaultTab === 'SHEETS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">লেকচার শিট ও অধ্যায়ভিত্তিক নোটস</span>
        </button>

        <button
          onClick={() => {
            playPop();
            setActiveVaultTab('NCTB_BOOKS');
          }}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all text-center ${
            activeVaultTab === 'NCTB_BOOKS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">NCTB মূল বোর্ড বইসমূহ (Textbooks PDF)</span>
        </button>
      </div>

      {/* Tab 2: NCTB Main Textbooks */}
      {activeVaultTab === 'NCTB_BOOKS' && (
        <NctbBooksSection initialLevel={activeLevel} />
      )}

      {/* Tab 1: Lecture Sheets & Materials */}
      {activeVaultTab === 'SHEETS' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Anti-Piracy Protected
                </span>
                <span className="text-xs text-slate-500 font-medium">Dynamic Watermarking Active</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                স্মার্ট স্টাডি ভল্ট ({activeLevel === 'CLASS_8' ? '৮ম শ্রেণি' : activeLevel === 'SSC' ? 'এসএসসি' : 'এইচএসসি'})
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                অধ্যায়ভিত্তিক স্পেশাল লেকচার শিট, সূত্রের শিট ও ক্যাডেট কলেজ CQ প্রশ্নব্যাংক। প্রতিটি নোটে আপনার ছাত্র আইডি ও ফোন নম্বর দিয়ে ডায়নামিক ওয়াটারমার্ক থাকবে।
              </p>
            </div>

            <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200/60 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>
                নিরাপত্তা নোটিশ: প্রতিটি নোটে আপনার নাম <strong>({profile?.studentIdNumber})</strong> ব্যাকগ্রাউন্ডে ওয়াটারমার্ক হয়ে ডাউনলোড হবে।
              </span>
            </div>
          </div>

          {/* Error / Gatekeeper Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">অ্যাক্সেস সংরক্ষিত:</p>
                <p>{errorMessage}</p>
                {errorMessage.includes('profile') && (
                  <Link to="/profile" className="mt-2 inline-block font-bold text-rose-900 underline">
                    প্রোফাইল পূরণ করতে এখানে ক্লিক করুন →
                  </Link>
                )}
                {errorMessage.includes('fees') && (
                  <Link to="/billing" className="mt-2 inline-block font-bold text-rose-900 underline">
                    টিউশন ফি পরিশোধ করতে এখানে ক্লিক করুন →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            {/* Subject Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => {
                  setSelectedSubject('');
                  setSelectedChapter('');
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedSubject === ''
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                সকল বিষয় ({materials.length})
              </button>
              {levelFilteredSubjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubject(sub.id);
                    setSelectedChapter('');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    selectedSubject === sub.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* Secondary Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নোটস বা অধ্যায়ের নাম লিখে খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  disabled={!selectedSubject}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">সকল অধ্যায় (All Chapters)</option>
                  {currentChapters.map((ch: any) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">সকল ধরন (Material Type)</option>
                  <option value="LECTURE_SHEET">লেকচার শিট</option>
                  <option value="FORMULA_SHEET">সূত্রের শিট</option>
                  <option value="CQ_QUESTION_BANK">CQ প্রশ্নব্যাংক</option>
                  <option value="MCQ_SHEET">MCQ শিট</option>
                </select>
              </div>
            </div>
          </div>

          {/* Material Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((mat) => {
              const isDownloading = downloadingId === mat.id;
              return (
                <div
                  key={mat.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 uppercase">
                        {mat.materialType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono font-medium">{mat.fileSize || '2.4 MB'}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug mb-1">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{mat.chapter?.title}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">PDF • ওয়াটারমার্কড</span>
                    <button
                      onClick={() => handleDownload(mat.id, mat.title)}
                      disabled={isDownloading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloading ? 'ওয়াটারমার্ক হচ্ছে...' : 'ডাউনলোড'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, API_BASE_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
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
  Eye
} from 'lucide-react';

export const StudyVaultPage: React.FC = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();

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

  const currentChapters = subjects.find((s) => s.id === selectedSubject)?.chapters || [];

  const filteredMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.chapter?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Anti-Piracy Protected
            </span>
            <span className="text-xs text-slate-500 font-medium">Dynamic Watermarking Active</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            স্মার্ট স্টাডি ভল্ট (লেকচার শিট ও প্রশ্নব্যাংক)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান ও আইসিটির সকল অধ্যায়ভিত্তিক স্পেশাল লেকচার শিট, সূত্রের শিট ও ক্যাডেট কলেজ CQ প্রশ্নব্যাংক।
          </p>
        </div>

        <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/60 text-xs text-blue-900 flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>
            নিরাপত্তা নোটিশ: প্রতিটি নোটে আপনার নাম <strong>({profile?.studentIdNumber})</strong> ও ফোন নম্বর ব্যাকগ্রাউন্ডে ওয়াটারমার্ক হয়ে ডাউনলোড হবে।
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
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
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
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল বিষয় ({materials.length})
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubject(sub.id);
                setSelectedChapter('');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedSubject === sub.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নোটস বা অধ্যায়ের নাম লিখে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">সকল অধ্যায় (All Chapters)</option>
              {currentChapters.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                    {mat.materialType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-medium">{mat.fileSize || '2.4 MB'}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mb-1">
                  {mat.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{mat.chapter?.title}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
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

        {filteredMaterials.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-base">কোনো স্টাডি মেটেরিয়াল পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-400 mt-1">অন্য কোনো বিষয় বা ফিল্টার নির্বাচন করে চেষ্টা করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};

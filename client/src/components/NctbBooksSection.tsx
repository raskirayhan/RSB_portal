import React, { useState } from 'react';
import { NCTB_BOOKS, type NctbBook } from '../data/nctbBooks';
import { BookOpen, Download, ExternalLink, Sparkles, Filter, Search } from 'lucide-react';
import { playPop } from '../utils/soundFX';

interface NctbBooksSectionProps {
  initialLevel?: string;
}

export const NctbBooksSection: React.FC<NctbBooksSectionProps> = ({ initialLevel }) => {
  // Normalize initial level to CLASS_8, SSC, or HSC
  const getInitial = (): 'ALL' | 'CLASS_8' | 'SSC' | 'HSC' => {
    if (!initialLevel) return 'ALL';
    const lvl = initialLevel.toUpperCase();
    if (lvl.includes('8') || lvl.includes('JSC')) return 'CLASS_8';
    if (lvl.includes('SSC')) return 'SSC';
    if (lvl.includes('HSC')) return 'HSC';
    return 'ALL';
  };

  const [activeTab, setActiveTab] = useState<'ALL' | 'CLASS_8' | 'SSC' | 'HSC'>(getInitial());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = NCTB_BOOKS.filter((b) => {
    const matchesTab = activeTab === 'ALL' || b.classLevel === activeTab;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.classLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-500/30">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>NCTB অফিসিয়াল পাঠ্যপুস্তক ভল্ট</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            মূল বোর্ড বইসমূহ (NCTB Main Textbooks PDF)
          </h3>
          <p className="text-xs text-emerald-200/90 max-w-xl">
            জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত ৮ম শ্রেণি, এসএসসি এবং এইচএসসি বিজ্ঞান বিভাগের মূল পাঠ্যবইসমূহ ফ্রি ডাউনলোড ও পড়ুন।
          </p>
        </div>

        {/* Level Indicator Pill */}
        <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center sm:text-right">
          <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">উপলব্ধ মূল বই</p>
          <p className="text-lg font-black text-amber-300">{filteredBooks.length}টি পাঠ্যবই</p>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => { playPop(); setActiveTab('ALL'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            সব শ্রেণি (All)
          </button>

          <button
            onClick={() => { playPop(); setActiveTab('CLASS_8'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'CLASS_8'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            🏫 ৮ম শ্রেণি (JSC)
          </button>

          <button
            onClick={() => { playPop(); setActiveTab('SSC'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'SSC'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            🎓 এসএসসি (SSC)
          </button>

          <button
            onClick={() => { playPop(); setActiveTab('HSC'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'HSC'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            🔬 এইচএসসি (HSC)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="বইয়ের নাম বা বিষয় খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {book.classLabel}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  {book.fileSize}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {book.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF ডাউনলোড</span>
              </a>

              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="বইটি দেখুন"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

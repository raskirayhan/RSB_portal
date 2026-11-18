import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Video, ArrowRight } from 'lucide-react';
import { playPop } from '../utils/soundFX';

export interface PeriodicSubject {
  symbol: string;
  atomicNumber: number;
  name: string;
  banglaName: string;
  category: string;
  accentColor: string;
  borderGlow: string;
  bgGlow: string;
  notesCount: number;
  videosCount: number;
  highlightTopic: string;
  code: string;
}

export const PERIODIC_SUBJECTS: PeriodicSubject[] = [
  {
    symbol: 'Ph',
    atomicNumber: 1,
    name: 'Physics',
    banglaName: 'পদার্থবিজ্ঞান',
    category: 'Mechanics & Waves',
    accentColor: 'text-amber-500 dark:text-amber-400',
    borderGlow: 'hover:border-amber-400 hover:shadow-amber-500/30',
    bgGlow: 'from-amber-500/10 to-orange-500/5',
    notesCount: 9,
    videosCount: 4,
    highlightTopic: 'ভেক্টর ও গতিবিদ্যা',
    code: 'PHYSICS',
  },
  {
    symbol: 'Ch',
    atomicNumber: 2,
    name: 'Chemistry',
    banglaName: 'রসায়ন',
    category: 'Organic & Equilibrium',
    accentColor: 'text-emerald-500 dark:text-emerald-400',
    borderGlow: 'hover:border-emerald-400 hover:shadow-emerald-500/30',
    bgGlow: 'from-emerald-500/10 to-teal-500/5',
    notesCount: 9,
    videosCount: 3,
    highlightTopic: 'জৈব রসায়ন ও গুণগত রসায়ন',
    code: 'CHEMISTRY',
  },
  {
    symbol: 'Ma',
    atomicNumber: 3,
    name: 'Higher Math',
    banglaName: 'উচ্চতর গণিত',
    category: 'Calculus & Matrices',
    accentColor: 'text-purple-500 dark:text-purple-400',
    borderGlow: 'hover:border-purple-400 hover:shadow-purple-500/30',
    bgGlow: 'from-purple-500/10 to-indigo-500/5',
    notesCount: 9,
    videosCount: 4,
    highlightTopic: 'ম্যাট্রিক্স ও অন্তরীকরণ',
    code: 'HIGHER_MATH',
  },
  {
    symbol: 'Bi',
    atomicNumber: 4,
    name: 'Biology',
    banglaName: 'জীববিজ্ঞান',
    category: 'Genetics & Physiology',
    accentColor: 'text-lime-500 dark:text-lime-400',
    borderGlow: 'hover:border-lime-400 hover:shadow-lime-500/30',
    bgGlow: 'from-lime-500/10 to-green-500/5',
    notesCount: 6,
    videosCount: 2,
    highlightTopic: 'কোষ ও জিনতত্ত্ব',
    code: 'BIOLOGY',
  },
  {
    symbol: 'Ic',
    atomicNumber: 5,
    name: 'ICT',
    banglaName: 'তথ্য ও প্রযুক্তি',
    category: 'Logic Gates & C Code',
    accentColor: 'text-cyan-500 dark:text-cyan-400',
    borderGlow: 'hover:border-cyan-400 hover:shadow-cyan-500/30',
    bgGlow: 'from-cyan-500/10 to-blue-500/5',
    notesCount: 6,
    videosCount: 3,
    highlightTopic: 'ডিজিটাল লজিক ও প্রোগ্রামিং',
    code: 'ICT',
  },
];

interface Props {
  selectedSubject?: string;
  onSelectSubject?: (code: string) => void;
  title?: string;
  subtitle?: string;
}

export const PeriodicSubjectSelector: React.FC<Props> = ({
  selectedSubject,
  onSelectSubject,
  title = 'Interactive Science Element Selector',
  subtitle = 'পর্যায় সারণি ধাঁচের বিষয়ভিত্তিক ড্যাশবোর্ড নেভিগেশন',
}) => {
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  const handleSelect = (code: string) => {
    playPop();
    if (onSelectSubject) {
      onSelectSubject(code);
    }
  };

  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
              [SCIENCE_CORE]
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {PERIODIC_SUBJECTS.map((item) => {
          const isSelected = selectedSubject === item.code;
          const isHovered = hoveredSymbol === item.symbol;

          return (
            <motion.div
              key={item.symbol}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onHoverStart={() => {
                setHoveredSymbol(item.symbol);
                playPop();
              }}
              onHoverEnd={() => setHoveredSymbol(null)}
              onClick={() => handleSelect(item.code)}
              className={`relative cursor-pointer select-none rounded-2xl p-4 transition-all duration-300 border ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:shadow-xl'
              } ${item.borderGlow} backdrop-blur-md overflow-hidden`}
            >
              {/* Subtle Ambient Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGlow} opacity-60 pointer-events-none`} />

              {/* Atomic Number & Series Tag */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                  {String(item.atomicNumber).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Core
                </span>
              </div>

              {/* Element Chemical Symbol */}
              <div className="flex items-baseline space-x-1.5 mb-1">
                <span className={`text-3xl font-black font-mono tracking-tighter ${item.accentColor}`}>
                  {item.symbol}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {item.name}
                </span>
              </div>

              {/* Bangla Subject Title */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 truncate">
                {item.banglaName}
              </p>

              {/* Subtitle / Category */}
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                {item.category}
              </div>

              {/* Stats Footer Badge */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                  <FileText className="w-3 h-3 text-blue-500" />
                  <span>{item.notesCount} Notes</span>
                </span>
                <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                  <Video className="w-3 h-3 text-rose-500" />
                  <span>{item.videosCount}</span>
                </span>
              </div>

              {/* Floating Hover Details Pill */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-x-2 bottom-2 p-2 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-white text-[10px] shadow-2xl backdrop-blur-md z-20 border border-slate-700/60"
                  >
                    <div className="flex items-center justify-between font-bold mb-0.5 text-blue-300">
                      <span>টপিক হাইলাইট</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                    <p className="text-slate-200 line-clamp-1">{item.highlightTopic}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

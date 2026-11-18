import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, Zap, Sparkles, BookOpen, ChevronRight, Award, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playPop } from '../utils/soundFX';

export interface SkillNode {
  id: string;
  title: string;
  banglaTitle: string;
  subject: string;
  status: 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED';
  xpReward: number;
  totalSubtopics: number;
  completedSubtopics: number;
  coreConcepts: string[];
}

const DEFAULT_PHYSICS_NODES: SkillNode[] = [
  {
    id: 'node-1',
    title: 'Vectors & 3D Calculations',
    banglaTitle: 'ভেক্টর ও ত্রিমাত্রিক স্থানাঙ্ক ব্যবস্থা',
    subject: 'Physics',
    status: 'UNLOCKED',
    xpReward: 150,
    totalSubtopics: 4,
    completedSubtopics: 4,
    coreConcepts: ['ডট ও ক্রস গুণন', 'লম্ব একক ভেক্টর', 'নদী ও নৌকার বেগ', 'ত্রিমাত্রিক ভেক্টর ক্ষেত্রফল'],
  },
  {
    id: 'node-2',
    title: 'Newtonian Mechanics',
    banglaTitle: 'নিউটনীয় বলবিদ্যা ও ঘর্ষণ বল',
    subject: 'Physics',
    status: 'UNLOCKED',
    xpReward: 200,
    totalSubtopics: 5,
    completedSubtopics: 5,
    coreConcepts: ['ভরবেগের সংরক্ষণশীলতা', 'রকেটের ত্বরণ ও ভরক্ষয়', 'রাস্তার ব্যাংকিং কোণ', 'জড়তার ভ্রামক'],
  },
  {
    id: 'node-3',
    title: 'Work, Power & Energy',
    banglaTitle: 'কাজ, ক্ষমতা ও স্প্রিং শক্তি',
    subject: 'Physics',
    status: 'IN_PROGRESS',
    xpReward: 250,
    totalSubtopics: 4,
    completedSubtopics: 2,
    coreConcepts: ['পরিবর্তনশীল বলের কাজ', 'কুয়া খালি করার কাজ', 'স্প্রিং বলের সংরক্ষণশীলতা', 'ক্ষমতা ও কর্মদক্ষতা'],
  },
  {
    id: 'node-4',
    title: 'Gravitation & Planetary Laws',
    banglaTitle: 'মহাকর্ষ ও কেপলারের পর্যায়কাল সূত্র',
    subject: 'Physics',
    status: 'LOCKED',
    xpReward: 200,
    totalSubtopics: 4,
    completedSubtopics: 0,
    coreConcepts: ['কেপলারের ৩য় সূত্র', 'অভিকর্ষজ ত্বরণের পরিবর্তন', 'মুক্তিবেগ (Escape Velocity)', 'ভূ-স্থির উপগ্রহের উচ্চতা'],
  },
  {
    id: 'node-5',
    title: 'Periodic Motion & Waves',
    banglaTitle: 'পর্যায়বৃত্ত গতি ও সরল ছন্দিত স্পন্দন',
    subject: 'Physics',
    status: 'LOCKED',
    xpReward: 300,
    totalSubtopics: 5,
    completedSubtopics: 0,
    coreConcepts: ['সরল দোলকের সূত্রাবলী', 'স্প্রিং ভর ব্যবস্থার কম্পাঙ্ক', 'শক্তি সংরক্ষণশীলতার লেখচিত্র', 'দোলনকাল নির্ণয়'],
  },
];

export const SkillTreeMap: React.FC = () => {
  const [nodes, setNodes] = useState<SkillNode[]>(DEFAULT_PHYSICS_NODES);
  const [activeNodeId, setActiveNodeId] = useState<string>(DEFAULT_PHYSICS_NODES[2].id);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  const triggerSkillUnlock = () => {
    // Find first IN_PROGRESS or LOCKED node and unlock it
    const updated = [...nodes];
    const targetIdx = updated.findIndex((n) => n.status === 'IN_PROGRESS');

    if (targetIdx !== -1) {
      updated[targetIdx].status = 'UNLOCKED';
      updated[targetIdx].completedSubtopics = updated[targetIdx].totalSubtopics;
      if (targetIdx + 1 < updated.length) {
        updated[targetIdx + 1].status = 'IN_PROGRESS';
        updated[targetIdx + 1].completedSubtopics = 1;
        setActiveNodeId(updated[targetIdx + 1].id);
      }
      setNodes(updated);
      setCelebrationMsg(`🎉 Level Up! ${updated[targetIdx].title} সফলভাবে আনলক হয়েছে! (+${updated[targetIdx].xpReward} XP)`);
    } else {
      setCelebrationMsg('🏆 অভিনন্দন! আপনি ফিজিক্স সিলেবাসের সব অধ্যায় সফলভাবে আনলক করে ফেলেছেন!');
    }

    playSuccessChime();

    // Trigger visual confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    });

    setTimeout(() => {
      setCelebrationMsg(null);
    }, 4500);
  };

  return (
    <div className="w-full my-6 p-5 sm:p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Interactive Concept Skill Tree (RPG সিলেবাস ম্যাপ)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            অধ্যায়ভিত্তিক নলেজ নোড ও প্রোগ্রেস ট্র্যাকার — এক নোড শেষ করে পরের নোডে এগিয়ে যান
          </p>
        </div>

        {/* Unlock simulator action */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={triggerSkillUnlock}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>পরবর্তী স্কিল আনলক টেস্ট করুন</span>
        </motion.button>
      </div>

      {/* Celebration Notification */}
      <AnimatePresence>
        {celebrationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2"
          >
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{celebrationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Node Mind-Map Flow (7 cols) */}
        <div className="lg:col-span-7 space-y-3 relative">
          {nodes.map((node, index) => {
            const isSelected = activeNodeId === node.id;
            const isUnlocked = node.status === 'UNLOCKED';
            const isInProgress = node.status === 'IN_PROGRESS';
            const isLocked = node.status === 'LOCKED';

            return (
              <div key={node.id} className="relative">
                {/* Connecting Line to next node */}
                {index < nodes.length - 1 && (
                  <div
                    className={`absolute left-6 top-12 w-0.5 h-6 z-0 ${
                      isUnlocked
                        ? 'bg-emerald-400 dark:bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                )}

                <motion.div
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    playPop();
                    setActiveNodeId(node.id);
                  }}
                  className={`relative z-10 cursor-pointer flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50/90 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Node Status Icon Pin */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isUnlocked
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : isInProgress
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isUnlocked && <CheckCircle2 className="w-5 h-5" />}
                      {isInProgress && <Zap className="w-5 h-5" />}
                      {isLocked && <Lock className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          STAGE 0{index + 1}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isUnlocked
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : isInProgress
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isUnlocked ? 'Unlocked ✅' : isInProgress ? 'In Progress ⚡' : 'Locked 🔒'}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {node.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {node.banglaTitle}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      +{node.xpReward} XP
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {node.completedSubtopics}/{node.totalSubtopics} Topics
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Node Detail Inspector Card (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                Node Inspector
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+{activeNode.xpReward} XP Reward</span>
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1">
              {activeNode.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {activeNode.banglaTitle}
            </p>

            {/* Core Concepts Checklist */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                মূল শিখনফল ও সৃজনশীল কনসেপ্ট:
              </span>
              {activeNode.coreConcepts.map((concept, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="line-clamp-1">{concept}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60">
            <a
              href="/vault"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>এই অধ্যায়ের লেকচার শিট ও CQ দেখুন</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

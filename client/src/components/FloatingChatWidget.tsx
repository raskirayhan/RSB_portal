import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Phone, MapPin, Sparkles } from 'lucide-react';

export const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '8801779181871';
  const displayPhone = '01779-181871';
  const defaultMessage = encodeURIComponent(
    'Hello Rayhan Sir! I want to know details about your SSC/HSC Science Batch in Khulna & Bagerhat.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Quick Chat Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-80 sm:w-96 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3.5 right-3.5 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg border border-white/30 shadow-inner">
                    RR
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight flex items-center space-x-1">
                    <span>Sheikh Raski Rayhan</span>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  </h4>
                  <p className="text-[11px] text-blue-100 leading-tight">
                    CSE Engineer & Science Mentor
                  </p>
                  <p className="text-[10px] text-emerald-300 flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <span>Active Now • Khulna & Bagerhat</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  আসসালামু আলাইকুম! বিজ্ঞান ব্যাচের ভর্তি, সময়সূচি বা কোনো কনসেপ্ট নিয়ে কথা বলতে সরাসরি মেসেজ বা কল করুন।
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>অফলাইন ব্যাচ: খুলনা ও বাগেরহাট</span>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="space-y-2 pt-1">
                {/* WhatsApp Direct */}
                <a
                  href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-600/25 group"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">💬</span>
                    <span>WhatsApp-এ সরাসরি চ্যাট করুন</span>
                  </div>
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Direct Call */}
                <a
                  href={`tel:+${phoneNumber}`}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>কল করুন: {displayPhone}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">হটলাইন</span>
                </a>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 text-center">
              Rayhan's Science Lab • 24/7 Academic Support
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold shadow-2xl shadow-emerald-500/40 border-2 border-white/40 cursor-pointer select-none"
        aria-label="Open Rayhan Sir WhatsApp chat"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs hidden sm:inline-block">চ্যাট বা কল করুন</span>
      </motion.button>
    </div>
  );
};

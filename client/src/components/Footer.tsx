import React from 'react';
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Linkedin,
  Facebook,
  Youtube
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/25">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-white text-xl tracking-tight block">
                  Rayhan's Science Lab
                </span>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                  RSB_Portal
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              SSC ও HSC বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান ও আইসিটি বিষয়ের শতভাগ কনসেপ্ট-বেইজড প্রফেশনাল মেন্টরশিপ।
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80">
              <p className="text-xs font-bold text-white mb-0.5">
                শেখ রাসকি রায়হান (Sheikh Raski Rayhan)
              </p>
              <p className="text-[11px] text-slate-400">
                CSE Engineer & Dedicated Science Educator
              </p>
            </div>

            {/* Social Icons Bar */}
            <div className="flex items-center space-x-3 pt-1">
              <a
                href="https://wa.me/8801779181871"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800 shadow-sm"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/sheikh-raski-rayhan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800 shadow-sm"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/raskirayhan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800 shadow-sm"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800 shadow-sm"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Subjects (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center space-x-2">
              <span className="w-1.5 h-3.5 bg-blue-500 rounded-full" />
              <span>বিজ্ঞান বিষয়সমূহ</span>
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">• পদার্থবিজ্ঞান (Physics 1st & 2nd)</li>
              <li className="hover:text-white transition-colors cursor-pointer">• রসায়ন বিজ্ঞান (Chemistry 1st & 2nd)</li>
              <li className="hover:text-white transition-colors cursor-pointer">• উচ্চতর গণিত (Higher Math)</li>
              <li className="hover:text-white transition-colors cursor-pointer">• সাধারণ গণিত (General Math)</li>
              <li className="hover:text-white transition-colors cursor-pointer">• জীববিজ্ঞান (Biology)</li>
              <li className="hover:text-white transition-colors cursor-pointer">• তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</li>
            </ul>
          </div>

          {/* Special Portal Features (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center space-x-2">
              <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full" />
              <span>স্মার্ট সুবিধা</span>
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>• ওয়াটারমার্কড নোটস</li>
              <li>• ডিজিটাল QR আইডি</li>
              <li>• ২-ডিভাইস সুরক্ষা</li>
              <li>• গার্ডিয়ান রিপোর্ট</li>
              <li>• ব্রেন অ্যারেনা গেমস</li>
              <li>• সৃজনশীল CQ ব্যাংক</li>
            </ul>
          </div>

          {/* Contact & Location (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4 flex items-center space-x-2">
              <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
              <span>লোকেশন ও সরাসরি যোগাযোগ</span>
            </h3>

            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold text-xs">অফলাইন প্রাইভেট ব্যাচ:</p>
                  <p className="text-xs text-slate-400 mt-0.5">খুলনা ও বাগেরহাট, বাংলাদেশ</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <a
                    href="tel:+8801779181871"
                    className="text-white hover:text-blue-400 font-mono font-bold text-xs transition-colors"
                  >
                    +880 1779-181871
                  </a>
                  <span className="text-[10px] text-slate-500 block">সরাসরি কল বা WhatsApp</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <a
                  href="mailto:raskirayhan@gmail.com"
                  className="text-slate-300 hover:text-white text-xs transition-colors truncate"
                >
                  raskirayhan@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/8801779181871"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-600/30 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp-এ মেসেজ পাঠান</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Rayhan's Science Lab (RSB_Portal). All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">Mentored by Sheikh Raski Rayhan</span>
            <span>•</span>
            <span className="text-blue-400 font-medium">Khulna & Bagerhat Science Batches</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

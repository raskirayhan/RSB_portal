import React from 'react';
import { GraduationCap, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg">Rayhan Special Batch</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              SSC ও HSC বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান ও আইসিটি বিষয়ের পূর্ণাঙ্গ কনসেপ্ট-বেইজড স্পেশাল প্রাইভেট কোচিং।
            </p>
            <div className="flex items-center space-x-2 text-xs text-blue-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dedicated To Academic Perfection</span>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">বিজ্ঞান বিষয়সমূহ</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-white transition-colors">• পদার্থবিজ্ঞান (Physics 1st & 2nd)</li>
              <li className="hover:text-white transition-colors">• রসায়ন বিজ্ঞান (Chemistry 1st & 2nd)</li>
              <li className="hover:text-white transition-colors">• উচ্চতর গণিত (Higher Math)</li>
              <li className="hover:text-white transition-colors">• সাধারণ গণিত (General Math)</li>
              <li className="hover:text-white transition-colors">• জীববিজ্ঞান (Biology)</li>
              <li className="hover:text-white transition-colors">• তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</li>
            </ul>
          </div>

          {/* Special Features */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">স্পেশাল ফিচারস</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• অ্যান্টি-লিক ওয়াটারমার্কড লেকচার শিট</li>
              <li>• ২-ডিভাইস সিকিউর অ্যাকাউন্ট প্রটেকশন</li>
              <li>• ডিজিটাল QR আইডি কার্ড ও অফলাইন অ্যাটেনডেন্স</li>
              <li>• মাসিক স্বয়ংক্রিয় গার্ডিয়ান প্রগ্রেস রিপোর্ট</li>
              <li>• ইন-অ্যাপ সায়েন্স কুইজ ও মিনি গেমস</li>
              <li>• ক্যাডেট কলেজ ও বোর্ড সৃজনশীল প্রশ্নব্যাংক</li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">যোগাযোগ ও লোকেশন</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+880 1711-223344 (রায়হান স্যার)</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>rayhansir.science@gmail.com</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>ধানমন্ডি ও ফার্মগেট ব্যাচ সেন্টার, ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Rayhan Special Batch (RSB_portal). সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="mt-2 sm:mt-0 font-medium">Developed for Rayhan Sir's Science Excellence Program</p>
        </div>
      </div>
    </footer>
  );
};

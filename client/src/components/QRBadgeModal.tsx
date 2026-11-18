import React from 'react';
import { X, Printer, ShieldCheck, Sparkles } from 'lucide-react';

interface QRBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    name: string;
    studentId: string;
    academicLevel: string;
    batchName?: string;
    institution?: string;
    phone?: string;
    qrCodeDataUrl?: string;
    avatarUrl?: string;
  };
}

export const QRBadgeModal: React.FC<QRBadgeModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>অফিসিয়াল স্টুডেন্ট আইডি কার্ড</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="p-6">
          <div
            id="student-id-card"
            className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-500/30 overflow-hidden text-center"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            {/* RSB Header */}
            <div className="mb-4">
              <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full mb-1">
                Rayhan Special Batch
              </span>
              <h3 className="font-extrabold text-base tracking-tight text-white">STUDENT IDENTIFICATION CARD</h3>
              <p className="text-[11px] text-blue-200/80">SSC & HSC Science Coaching</p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-xl shadow-lg inline-block my-2 border-2 border-blue-400/50">
              {student.qrCodeDataUrl ? (
                <img
                  src={student.qrCodeDataUrl}
                  alt="Student QR Code"
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="mt-3">
              <h4 className="font-bold text-lg text-white">{student.name}</h4>
              <div className="inline-block px-3 py-1 bg-blue-600/40 rounded-lg text-blue-200 font-mono text-sm font-bold tracking-wider my-1 border border-blue-400/30">
                {student.studentId}
              </div>
              <p className="text-xs text-slate-300 font-medium">{student.batchName || student.academicLevel}</p>
              {student.institution && (
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{student.institution}</p>
              )}
            </div>

            {/* Footer Seal */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>Rayhan Sir Verified</span>
              <div className="flex items-center space-x-1 text-amber-400">
                <Sparkles className="w-3 h-3" />
                <span>Science Master</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
            অফলাইন ব্যাচে আসার সময় আপনার ফোনে এই কিউআর (QR) কোডটি দেখান অথবা প্রিন্ট করে নিয়ে আসুন।
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-3 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট আইডি কার্ড</span>
          </button>
        </div>
      </div>
    </div>
  );
};

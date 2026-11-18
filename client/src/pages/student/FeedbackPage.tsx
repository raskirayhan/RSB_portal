import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  Sparkles,
  Calendar,
  HelpCircle
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/feedback');
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSendReply = async (feedbackId: string) => {
    if (!replyText.trim()) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/feedback/reply', {
        feedbackId,
        replyText: replyText.trim(),
      });

      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'আপনার মতামত ও প্রশ্ন রায়হান স্যারের কাছে পৌঁছেছে।' });
        setReplyText('');
        setActiveFeedbackId(null);
        await fetchFeedback();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'রিপ্লাই পাঠাতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2 text-blue-600 mb-2">
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">দ্বি-মুখী যোগাযোগ</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          রায়হান স্যারের পার্সোনালাইজড ফিডব্যাক ও ডাউট বক্স
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          আপনার পড়াশোনার উন্নতি, সবল ও দুর্বল দিকগুলো নিয়ে স্যারের পরামর্শ দেখুন এবং কোনো টপিক বুঝতে সমস্যা হলে সরাসরি প্রশ্ন জানান।
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center space-x-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Feedbacks List */}
      <div className="space-y-6">
        {feedbacks.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  RS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.authorName}</h4>
                  <p className="text-[11px] text-slate-400">সিনিয়র সায়েন্স মেন্টর</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.month}</span>
              </div>
            </div>

            {/* Teacher Remarks Body */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs sm:text-sm text-slate-800 space-y-3">
              <p className="italic font-medium leading-relaxed">
                "{item.remarks}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-blue-100/80 text-xs">
                {item.strengths && (
                  <div className="text-emerald-700 font-medium">
                    <span className="font-bold">✓ সবল দিক:</span> {item.strengths}
                  </div>
                )}
                {item.areasToImprove && (
                  <div className="text-rose-700 font-medium">
                    <span className="font-bold">⚠ উন্নতির জায়গা:</span> {item.areasToImprove}
                  </div>
                )}
              </div>
            </div>

            {/* Student's Existing Reply */}
            {item.studentReply && (
              <div className="pl-6 border-l-2 border-blue-500 text-xs sm:text-sm bg-slate-50 p-3.5 rounded-r-2xl">
                <p className="text-[11px] font-bold text-blue-700 mb-1">আপনার উত্তর / প্রশ্ন:</p>
                <p className="text-slate-700">{item.studentReply}</p>
              </div>
            )}

            {/* Reply Input Form */}
            {!item.studentReply && (
              <div>
                {activeFeedbackId === item.id ? (
                  <div className="space-y-3 pt-2">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="স্যারকে আপনার মতামত লিখুন বা কোনো চ্যাপ্টারে সমস্যা থাকলে জানান..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setActiveFeedbackId(null)}
                        className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => handleSendReply(item.id)}
                        disabled={loading || !replyText.trim()}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>পাঠান</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveFeedbackId(item.id)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1 pt-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>স্যারকে কোনো প্রশ্ন বা মতামত থাকলে লিখুন →</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {feedbacks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p>এখনও কোনো ফিডব্যাক পোস্ট করা হয়নি।</p>
          </div>
        )}
      </div>
    </div>
  );
};

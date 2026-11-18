import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  GraduationCap,
  Play,
  CheckCircle,
  Users,
  Shield,
  FileText,
  Smartphone,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  X,
  Star,
  BookOpen
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [landingData, setLandingData] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  useEffect(() => {
    api.get('/public/landing-data')
      .then((res) => {
        if (res.data.success) {
          setLandingData(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load landing data', err));
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/80 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>SSC & HSC 2026-2027 স্পেশাল সায়েন্স ব্যাচ অ্যাডমিশন শুরু</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                বিজ্ঞান বিভাগে নিখুঁত কনসেপ্ট আর সর্বোচ্চ ফলাফলের জন্য{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  রায়হান স্পেশাল ব্যাচ
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান ও আইসিটি—প্রতিটি বিষয়ে শতভাগ কনসেপ্ট ক্লিয়ারিং, ব্যক্তিগত কেয়ার, অ্যান্টি-লিক ওয়াটারমার্কড নোটস এবং নিয়মিত গার্ডিয়ান প্রগ্রেস রিপোর্ট।
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-base"
                >
                  <span>অনলাইনে ব্যাচে ভর্তি হোন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#demo-classes"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all flex items-center justify-center space-x-2 text-base"
                >
                  <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                  <span>ফ্রি ডেমো ক্লাস দেখুন</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-extrabold text-blue-600">৪৮+ জন</p>
                  <p className="text-xs text-slate-500 font-medium">বিগত ব্যাচে গোল্ডেন A+</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-indigo-600">১০০%</p>
                  <p className="text-xs text-slate-500 font-medium">কনসেপ্ট ক্লিয়ারিং গ্যারান্টি</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-purple-600">২-ডিভাইস</p>
                  <p className="text-xs text-slate-500 font-medium">নিরাপদ স্টুডেন্ট পোর্টাল</p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                    RS
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">রায়হান স্যার</h3>
                    <p className="text-xs font-semibold text-blue-600">সিনিয়র সায়েন্স ইন্সট্রাক্টর ও মেন্টর</p>
                    <p className="text-[11px] text-slate-500">১০+ বছর ধরে বুয়েট, মেডিকেল ও বোর্ড পরীক্ষায় সাফল্যের ইতিহাস</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">অ্যান্টি-লিক ওয়াটারমার্কড স্টাডি ভল্ট</p>
                      <p className="text-[11px] text-slate-500">প্রতিটি লেকচার শিটে স্টুডেন্টের নাম, আইডি ও ফোন স্বয়ংক্রিয়ভাবে ওয়াটারমার্ক হবে।</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                    <Smartphone className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">ডুয়াল-ডিভাইস সিকিউর লগইন</p>
                      <p className="text-[11px] text-slate-500">সর্বোচ্চ ২টি ডিভাইসে (মোবাইল + ল্যাপটপ) লগইন প্রযোজ্য। অ্যাকাউন্ট শেয়ারিং সম্পূর্ণ সুরক্ষিত।</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                    <Users className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">অটো গার্ডিয়ান রিপোর্ট ও QR ব্যাজ</p>
                      <p className="text-[11px] text-slate-500">মাসিক উপস্থিতি ও পারফরম্যান্স অভিভাবকের কাছে পৌঁছাবে এবং অফলাইনে থাকবে ডিজিটাল QR কার্ড।</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Demo Video Classes Gallery */}
      <section id="demo-classes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
            ফ্রি কনসেপ্ট ডেমো ক্লাস
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            লগইন ছাড়াই দেখে নিন রায়হান স্যারের ক্লাসের মান
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            জটিল বিজ্ঞানের থিওরি কীভাবে ২ থেকে ৪ মিনিটে অ্যানিমেশন ও প্র্যাকটিক্যাল উদাহরণের মাধ্যমে পানির মতো সহজ করে দেওয়া হয়:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {landingData?.demoVideos?.map((video: any) => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-video bg-slate-800 overflow-hidden">
                <img
                  src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600/90 group-hover:bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {video.duration}
                </div>
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {video.subject}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-semibold mb-1">{video.chapter}</p>
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h4>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>রায়হান স্যার স্পেশাল</span>
                  <span className="font-semibold text-blue-600 group-hover:underline">প্লে করুন →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full overflow-hidden border border-slate-700 shadow-2xl">
            <div className="p-4 bg-slate-800 flex items-center justify-between text-white border-b border-slate-700">
              <div>
                <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded font-bold uppercase">{selectedVideo.subject}</span>
                <h3 className="text-sm font-bold text-white mt-1">{selectedVideo.title}</h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center relative">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeUrl.includes('v=') ? selectedVideo.youtubeUrl.split('v=')[1] : 'dQw4w9WgXcQ'}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>অধ্যায়: {selectedVideo.chapter} • মেয়াদ: {selectedVideo.duration}</span>
              <Link
                to="/register"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500"
              >
                সম্পূর্ণ ব্যাচে ভর্তি হোন
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Batch Schedules & Details */}
      <section id="batches" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">
            বর্তমান ব্যাচের সময়সূচী
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            SSC ও HSC অফলাইন ও অনলাইন বিজ্ঞান ব্যাচসমূহ
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            প্রতিটি ব্যাচে সীমিত সংখ্যক আসন বরাদ্দ থাকে যাতে প্রতিটি স্টুডেন্টকে ব্যক্তিগত নজরদারি করা সম্ভব হয়।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {landingData?.batches?.map((b: any) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {b.academicLevel} সায়েন্স
                  </span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ভর্তি চলছে
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{b.name}</h3>
                <p className="text-2xl font-black text-slate-900 mb-4">
                  ৳ {b.monthlyFee.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">/ মাসিক টিউশন ফি</span>
                </p>

                <div className="space-y-2.5 py-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>ক্লাস ডেস: <strong>{b.scheduleDays}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>সময়: <strong>{b.timeSlot}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>বর্তমান শিক্ষার্থী: <strong>{b._count?.students || 0} জন</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  to="/register"
                  className="w-full block text-center py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                >
                  এই ব্যাচে যোগ দিন
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews & Achievements */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white">শিক্ষার্থী ও অভিভাবকদের আস্থা</h2>
            <p className="text-slate-400 text-sm mt-2">
              বিগত বছরগুলোর রায়হান স্যারের স্পেশাল ব্যাচের কৃতী শিক্ষার্থীদের মতামত
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {landingData?.reviews?.map((rev: any, index: number) => (
              <div
                key={index}
                className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 font-bold flex items-center justify-center text-sm text-white">
                    {rev.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{rev.studentName}</h4>
                    <p className="text-[11px] text-blue-400 font-medium">{rev.badge} • {rev.college}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              বিজ্ঞান বিভাগের সেরা প্রস্তুতির জন্য আজই জয়েন করুন
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              দেরি না করে আপনার বা আপনার সন্তানের উজ্জ্বল একাডেমিক ভবিষ্যতের জন্য রায়হান স্যারের স্পেশাল ব্যাচ পোর্টালে রেজিস্ট্রেশন করুন।
            </p>
          </div>
          <Link
            to="/register"
            className="px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-extrabold rounded-2xl shadow-xl transition-all whitespace-nowrap text-base"
          >
            রেজিস্ট্রেশন করুন এখনই →
          </Link>
        </div>
      </section>
    </div>
  );
};

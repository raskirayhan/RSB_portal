import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { getUserGems } from '../utils/rewards';
import {
  AlertTriangle,
  Flame,
  Award,
  BookOpen,
  LayoutDashboard,
  UserCheck,
  CreditCard,
  Gamepad2,
  MessageSquare,
  Smartphone,
  Gem
} from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  const [gems, setGems] = React.useState<number>(() => getUserGems(user?.id));

  React.useEffect(() => {
    setGems(getUserGems(user?.id));
    const handleGemsUpdate = (e: any) => {
      if (e.detail?.gems !== undefined) setGems(e.detail.gems);
    };
    window.addEventListener('rsb_gems_updated', handleGemsUpdate);
    return () => window.removeEventListener('rsb_gems_updated', handleGemsUpdate);
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const navLinks = [
    { to: '/dashboard', label: 'ওভারভিউ', icon: LayoutDashboard },
    { to: '/vault', label: 'স্টাডি ভল্ট (নোটস)', icon: BookOpen },
    { to: '/profile', label: 'প্রোফাইল ও QR কার্ড', icon: UserCheck },
    { to: '/billing', label: 'পেমেন্ট ও রসিদ', icon: CreditCard },
    { to: '/games', label: 'সায়েন্স গেমস', icon: Gamepad2 },
    { to: '/feedback', label: 'টিচার ফিডব্যাক', icon: MessageSquare },
    { to: '/devices', label: 'ডিভাইস সেশন', icon: Smartphone },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      {/* Profile Incomplete Banner */}
      {profile && !profile.isCompleted && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 shadow-sm text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-center sm:text-left">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-bounce" />
              <span className="font-medium">
                আপনার প্রোফাইল এখনও ১০০% সম্পন্ন হয়নি! স্টাডি ভল্ট নোটস ডাউনলোড ও ফুল অ্যাক্সেস পেতে প্রোফাইল ফর্মটি পূরণ করুন।
              </span>
            </div>
            <Link
              to="/profile"
              className="px-3 py-1 bg-white text-amber-700 font-bold text-xs rounded-lg shadow-sm hover:bg-amber-50 transition-colors whitespace-nowrap"
            >
              প্রোফাইল পূরণ করুন →
            </Link>
          </div>
        </div>
      )}

      {/* Student Top Bar: Streak, XP & Batch */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate">
              স্বাগতম, {user.name} 👋
            </h2>
            <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              {profile?.studentIdNumber || 'ID Pending'}
            </span>
            <span className="hidden md:inline-block text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {profile?.batch?.name || profile?.academicLevel || 'Science Batch'}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Daily Streak */}
            <div className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-[11px] sm:text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{profile?.currentStreak || 1} Days</span>
            </div>

            {/* Total Gems */}
            <Link
              to="/games"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-[11px] sm:text-xs font-bold hover:scale-105 transition-transform"
            >
              <Gem className="w-3.5 h-3.5 text-cyan-500" />
              <span>{gems} Gems 💎</span>
            </Link>
          </div>
        </div>

        {/* Secondary Navigation Pills - Scrollable with no scrollbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-2.5 sm:mt-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1.5 sm:space-x-2 pb-1 text-xs sm:text-sm whitespace-nowrap">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

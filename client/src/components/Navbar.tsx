import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLabTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  BookOpen,
  Gamepad2,
  QrCode,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  CreditCard,
  MessageSquare,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Gem,
  Star,
  UserCheck
} from 'lucide-react';
import { getUserGems } from '../utils/rewards';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { isDeepFocus, setMode, isMuted, toggleSound } = useLabTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gems, setGems] = useState<number>(() => getUserGems(user?.id, profile?.totalXp));

  React.useEffect(() => {
    setGems(getUserGems(user?.id, profile?.totalXp));

    const handleGemsUpdate = (e: any) => {
      if (e.detail?.gems !== undefined) {
        setGems(e.detail.gems);
      }
    };
    window.addEventListener('rsb_gems_updated', handleGemsUpdate);
    return () => window.removeEventListener('rsb_gems_updated', handleGemsUpdate);
  }, [user?.id, profile?.totalXp]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-2">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0 flex-shrink">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-sm sm:text-base md:text-lg text-slate-900 dark:text-white tracking-tight truncate max-w-[130px] xs:max-w-[170px] sm:max-w-none">
                  Rayhan's Science Lab
                </span>
                <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md flex-shrink-0">
                  RSB
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:block truncate">
                SSC & HSC Science Excellence • Khulna & Bagerhat
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Home
            </Link>
            <a
              href="/#demo-classes"
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Demo Classes
            </a>
            <a
              href="/#subjects"
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Subjects
            </a>
            <a
              href="/#how-it-works"
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              How It Works
            </a>
            <Link
              to="/games"
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center space-x-1"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Brain Games</span>
            </Link>
            {user && (
              <Link
                to="/vault"
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center space-x-1"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Study Vault</span>
              </Link>
            )}
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'সাউন্ড আনমিউট করুন' : 'সাউন্ড মিউট করুন'}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>

            {/* Theme Toggle (Day / Deep Focus) */}
            <button
              onClick={() => setMode(isDeepFocus ? 'day' : 'deep')}
              title={isDeepFocus ? 'ডে মোড চালু করুন' : 'ডিপ ফোকাস নাইট মোড'}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDeepFocus ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {user.role === 'SUPER_ADMIN' ? (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Admin</span>
                  </Link>
                ) : (
                  <>
                    {/* Live Gems & XP Pill Widget (Hidden on small mobile, available on dashboard) */}
                    <Link
                      to="/games"
                      title="আপনার অর্জিত Gems ও Stars — গেমস খেলুন"
                      className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-amber-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 shadow-xs hover:border-cyan-500/40 transition-all group"
                    >
                      <Gem className="w-3.5 h-3.5 text-cyan-500 group-hover:scale-110 transition-transform" />
                      <span>{gems}</span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 group-hover:rotate-12 transition-transform" />
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                        {profile?.totalXp || 0} XP
                      </span>
                    </Link>

                    <Link
                      to="/dashboard"
                      className="hidden xs:flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dashboard</span>
                    </Link>
                  </>
                )}

                {/* User Avatar Button & Dropdown */}
                <div className="relative group">
                  <button className="flex items-center p-0.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                  </button>

                  {/* Desktop Dropdown */}
                  <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 hidden group-hover:block transition-all z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{profile?.studentIdNumber || user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <QrCode className="w-4 h-4 text-blue-500" />
                      <span>Student ID & QR</span>
                    </Link>

                    <Link
                      to="/billing"
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <span>Fees & Receipts</span>
                    </Link>

                    <Link
                      to="/devices"
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Smartphone className="w-4 h-4 text-purple-500" />
                      <span>Devices (Max 2)</span>
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 flex items-center space-x-1 whitespace-nowrap"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile menu toggle hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu full drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-1 animate-fade-in max-h-[80vh] overflow-y-auto">
            {user && (
              <div className="p-3 mb-2 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center overflow-hidden">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-blue-600 font-mono font-bold">{profile?.studentIdNumber || user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-cyan-600 font-black text-xs">
                    <Gem className="w-3 h-3" />
                    <span>{gems}</span>
                  </div>
                  <div className="text-[10px] text-amber-500 font-bold">
                    {profile?.totalXp || 0} XP
                  </div>
                </div>
              </div>
            )}

            {/* Core Links */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              হোম (Home)
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>স্টুডেন্ট ড্যাশবোর্ড (Dashboard)</span>
                </Link>

                <Link
                  to="/vault"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>স্টাডি ভল্ট ও NCTB বইসমূহ (Study Vault)</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <QrCode className="w-4 h-4 text-blue-500" />
                  <span>ডিজিটাল স্টুডেন্ট আইডি ও ছবি (QR Badge)</span>
                </Link>

                <Link
                  to="/billing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>মাসিক টিউশন ফি ও মানি রিসিট (Billing)</span>
                </Link>

                <Link
                  to="/devices"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <Smartphone className="w-4 h-4 text-purple-500" />
                  <span>লগইন ডিভাইস ম্যানেজমেন্ট (Max 2)</span>
                </Link>
              </>
            )}

            <Link
              to="/games"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>সায়েন্স ব্রেন গেমস ও লিডারবোর্ড (Brain Games)</span>
            </Link>

            <a
              href="/#demo-classes"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              ডেমো ক্লাস (3-Min Demo Videos)
            </a>

            <a
              href="/#subjects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              সিলেবাস ও বিষয়সমূহ (Subjects)
            </a>

            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              কাজের ধাপসমূহ (How It Works)
            </a>

            {user ? (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-2 w-full px-3.5 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট করুন (Log Out)</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  স্টুডেন্ট লগইন
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20"
                >
                  ব্যাচে ভর্তি হন 🚀
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

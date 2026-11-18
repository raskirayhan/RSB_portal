import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { isDeepFocus, setMode, mode, isMuted, toggleSound } = useLabTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  Rayhan's Science Lab
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md">
                  RSB
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                SSC & HSC Science Excellence • Khulna & Bagerhat
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <Link
              to="/"
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Home
            </Link>
            <a
              href="#demo-classes"
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Demo Classes
            </a>
            <a
              href="#subjects"
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Subjects
            </a>
            <a
              href="#how-it-works"
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
          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Sound Muted' : 'Sound Enabled'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>

            {/* Theme Toggle (Day / Deep Focus) */}
            <button
              onClick={() => setMode(isDeepFocus ? 'day' : 'deep')}
              title={isDeepFocus ? 'Deep Focus Mode' : 'Day Lab Mode'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDeepFocus ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === 'SUPER_ADMIN' ? (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  </button>

                  {/* Dropdown */}
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
                      to="/sessions"
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
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 flex items-center space-x-1"
                >
                  <span>Join Batch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Home
            </Link>
            <a
              href="#demo-classes"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Demo Classes
            </a>
            <a
              href="#subjects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Subjects
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              How It Works
            </a>
            <Link
              to="/games"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Brain Games
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

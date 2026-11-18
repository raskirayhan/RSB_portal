import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  MessageSquare
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">Rayhan Special Batch</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md">RSB</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">SSC & HSC Science Excellence</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              হোম (Home)
            </Link>
            <Link
              to="/#batches"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              ব্যাচসমূহ
            </Link>
            <Link
              to="/#demo-classes"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              ডেমো ক্লাস
            </Link>

            {user && (
              <>
                <Link
                  to="/vault"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors flex items-center space-x-1.5"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>স্টাডি ভল্ট</span>
                </Link>
                <Link
                  to="/games"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors flex items-center space-x-1.5"
                >
                  <Gamepad2 className="w-4 h-4 text-amber-500" />
                  <span>সায়েন্স গেমস</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === 'SUPER_ADMIN' ? (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">অ্যাডমিন কন্ট্রোল</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">ড্যাশবোর্ড</span>
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 hidden group-hover:block transition-all z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{profile?.studentIdNumber || user.email}</p>
                    </div>

                    {user.role === 'STUDENT' && (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>প্রোফাইল ও QR কার্ড</span>
                        </Link>
                        <Link
                          to="/billing"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>পেমেন্ট ও বিলিং</span>
                        </Link>
                        <Link
                          to="/feedback"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>টিচার ফিডব্যাক</span>
                        </Link>
                        <Link
                          to="/devices"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>লগইন ডিভাইস (২টি)</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>লগআউট (Logout)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
                >
                  স্টুডেন্ট জয়েন
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  QrCode,
  BookOpen,
  LogOut,
  Sparkles,
  ExternalLink,
  Trophy
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { to: '/admin', label: 'ওভারভিউ অ্যানালিটিক্স', icon: LayoutDashboard },
    { to: '/admin/students', label: 'স্টুডেন্ট ডিরেক্টরি', icon: Users },
    { to: '/admin/payments', label: 'bKash পেমেন্ট ভেরিফিকেশন', icon: CreditCard },
    { to: '/admin/scanner', label: 'অফলাইন QR অ্যাটেনডেন্স স্ক্যানার', icon: QrCode },
    { to: '/admin/materials', label: 'স্টাডি মেটেরিয়াল ও ডেমো ভিডিও', icon: BookOpen },
    { to: '/admin/championship', label: '২৪-ঘণ্টা MCQ চ্যাম্পিয়নশিপ', icon: Trophy },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight">RSB Control Room</h1>
              <p className="text-xs text-indigo-400 font-medium">রায়হান স্যার (সুপার অ্যাডমিন)</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mb-2"
          >
            <span className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>পাবলিক পোর্টাল দেখুন</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              সুপার অ্যাডমিন কন্ট্রোল রুম
            </span>
            <h2 className="text-base font-bold text-slate-800 hidden sm:block">
              {navItems.find((n) => n.to === location.pathname)?.label || 'অ্যাডমিন ড্যাশবোর্ড'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{user.name}</p>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              RS
            </div>
          </div>
        </header>

        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

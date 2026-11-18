import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ProfilePage } from './pages/student/ProfilePage';
import { StudyVaultPage } from './pages/student/StudyVaultPage';
import { BillingPage } from './pages/student/BillingPage';
import { GamesPage } from './pages/student/GamesPage';
import { FeedbackPage } from './pages/student/FeedbackPage';
import { DeviceSessionsPage } from './pages/student/DeviceSessionsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminQRScannerPage } from './pages/admin/AdminQRScannerPage';
import { AdminMaterialsPage } from './pages/admin/AdminMaterialsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Student Portal (Protected) */}
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/vault" element={<StudyVaultPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/devices" element={<DeviceSessionsPage />} />
          </Route>

          {/* Super Admin Control Room (Protected for Rayhan Sir) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="scanner" element={<AdminQRScannerPage />} />
            <Route path="materials" element={<AdminMaterialsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

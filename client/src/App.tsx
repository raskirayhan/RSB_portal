import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

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
import { AdminChampionshipPage } from './pages/admin/AdminChampionshipPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
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
              <Route path="/sessions" element={<DeviceSessionsPage />} />
            </Route>

            {/* Admin Portal (Protected) */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminStudentsPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/scanner" element={<AdminQRScannerPage />} />
              <Route path="/admin/materials" element={<AdminMaterialsPage />} />
              <Route path="/admin/championship" element={<AdminChampionshipPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

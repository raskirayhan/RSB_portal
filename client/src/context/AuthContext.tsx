import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'SUPER_ADMIN';
}

export interface StudentProfile {
  id: string;
  studentIdNumber: string;
  academicLevel: string;
  institutionName?: string;
  batchId?: string;
  batch?: { name: string; monthlyFee: number };
  fatherName?: string;
  motherName?: string;
  studentPhone?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  avatarUrl?: string;
  qrCodeDataUrl?: string;
  isCompleted: boolean;
  totalXp: number;
  currentStreak: number;
}

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User, profile?: StudentProfile) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateProfileState: (updated: StudentProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('rsb_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
      }
    } catch (err) {
      console.error('Failed to load user session', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = (newToken: string, newUser: User, newProfile?: StudentProfile) => {
    localStorage.setItem('rsb_token', newToken);
    setToken(newToken);
    setUser(newUser);
    if (newProfile) setProfile(newProfile);
  };

  const logout = () => {
    localStorage.removeItem('rsb_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshUserData = async () => {
    await fetchCurrentUser();
  };

  const updateProfileState = (updated: StudentProfile) => {
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        logout,
        refreshUserData,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

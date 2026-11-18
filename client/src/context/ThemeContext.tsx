import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSoundMuted, setSoundMuted as persistSoundMuted } from '../utils/soundFX';

export type LabThemeMode = 'day' | 'deep' | 'auto';

interface ThemeContextType {
  mode: LabThemeMode;
  isDeepFocus: boolean;
  setMode: (mode: LabThemeMode) => void;
  greeting: string;
  isMuted: boolean;
  toggleSound: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<LabThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rsb_lab_theme');
      if (saved === 'day' || saved === 'deep' || saved === 'auto') return saved;
    }
    return 'auto';
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => isSoundMuted());

  // Check if current hour falls in Deep Focus Mode (6:00 PM to 5:59 AM)
  const computeIsDeepFocus = (currentMode: LabThemeMode): boolean => {
    if (currentMode === 'day') return false;
    if (currentMode === 'deep') return true;
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  };

  const [isDeepFocus, setIsDeepFocus] = useState<boolean>(() => computeIsDeepFocus(mode));

  useEffect(() => {
    const active = computeIsDeepFocus(mode);
    setIsDeepFocus(active);

    const root = document.documentElement;
    if (active) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [mode]);

  // Keep auto-theme updated if hour changes while app is open
  useEffect(() => {
    if (mode !== 'auto') return;
    const interval = setInterval(() => {
      const active = computeIsDeepFocus('auto');
      setIsDeepFocus(active);
      const root = document.documentElement;
      if (active) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [mode]);

  const setMode = (newMode: LabThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('rsb_lab_theme', newMode);
    const active = computeIsDeepFocus(newMode);
    setIsDeepFocus(active);
    const root = document.documentElement;
    if (active) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    persistSoundMuted(next);
  };

  // Dynamic greeting based on time of day and theme
  const getGreeting = (name?: string): string => {
    const hour = new Date().getHours();
    const user = name ? `, ${name.split(' ')[0]}` : '';

    if (hour >= 5 && hour < 12) {
      return `Good Morning${user}! Rayhan's Lab is Open — Ready to conquer today's syllabus? ☀️`;
    } else if (hour >= 12 && hour < 17) {
      return `Afternoon Boost${user}! Stay sharp, review your formulas, and solve problems. ⚡`;
    } else if (hour >= 17 && hour < 22) {
      return `Evening Study Session${user}! Deep focus mode is activated. Let's master the concepts. 🧪`;
    } else {
      return `Late Night Grind Mode${user} 🌙 — Grab a warm cup of tea and conquer the hard topics!`;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDeepFocus,
        setMode,
        greeting: getGreeting(),
        isMuted,
        toggleSound,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useLabTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useLabTheme must be used within a ThemeProvider');
  }
  return context;
};

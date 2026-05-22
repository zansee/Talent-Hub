import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext({});

export const themeColorsMap = {
  olive: { name: 'Olive Green', primary: '#6B7C3A', hover: '#505E2B', light: '#8D9F56', lightest: '#F5F7F2' },
  navy: { name: 'Navy Blue', primary: '#1E3A8A', hover: '#172554', light: '#3B82F6', lightest: '#EFF6FF' },
  burgundy: { name: 'Burgundy', primary: '#800020', hover: '#5C0017', light: '#A30029', lightest: '#FFF5F6' },
  teal: { name: 'Teal', primary: '#0D9488', hover: '#0F766E', light: '#2DD4BF', lightest: '#F0FDFA' },
  'slate-blue': { name: 'Slate Blue', primary: '#475569', hover: '#334155', light: '#64748B', lightest: '#F8FAFC' },
  'forest-green': { name: 'Forest Green', primary: '#1E4620', hover: '#143016', light: '#2E6931', lightest: '#F4F9F4' },
  terracotta: { name: 'Terracotta', primary: '#C2593F', hover: '#99412D', light: '#D97D65', lightest: '#FDF6F4' },
  purple: { name: 'Purple', primary: '#6B21A8', hover: '#581C87', light: '#A855F7', lightest: '#FAF5FF' },
  charcoal: { name: 'Charcoal', primary: '#374151', hover: '#1F2937', light: '#6B7280', lightest: '#F9FAFB' },
  rose: { name: 'Rose', primary: '#BE185D', hover: '#9D174D', light: '#F43F5E', lightest: '#FFF1F2' }
};

export const ThemeProvider = ({ children }) => {
  const { profile, updateProfile } = useAuth();
  const [themeColor, setThemeColorState] = useState('olive');
  const [darkMode, setDarkModeState] = useState('system');

  // Load from profile or local storage
  useEffect(() => {
    if (profile) {
      if (profile.theme_color) {
        // If theme_color is a hex code, find closest key, else use string key
        const key = Object.keys(themeColorsMap).find(
          k => themeColorsMap[k].primary.toLowerCase() === profile.theme_color.toLowerCase()
        ) || profile.theme_color;
        
        if (themeColorsMap[key]) {
          setThemeColorState(key);
        }
      }
      if (profile.dark_mode) {
        setDarkModeState(profile.dark_mode);
      }
    } else {
      const savedColor = localStorage.getItem('theme-color') || 'olive';
      const savedMode = localStorage.getItem('dark-mode') || 'system';
      setThemeColorState(savedColor);
      setDarkModeState(savedMode);
    }
  }, [profile]);

  // Apply colors and dark mode variables to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    const colors = themeColorsMap[themeColor] || themeColorsMap.olive;

    // Apply primary colors CSS custom variables
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--primary-hover-color', colors.hover);
    root.style.setProperty('--primary-light-color', colors.light);
    root.style.setProperty('--primary-lightest-color', colors.lightest);

    // Persist local settings if not logged in
    if (!profile) {
      localStorage.setItem('theme-color', themeColor);
    }
  }, [themeColor, profile]);

  useEffect(() => {
    const root = document.documentElement;
    
    const applyDarkMode = (isDark) => {
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    if (darkMode === 'dark') {
      applyDarkMode(true);
    } else if (darkMode === 'light') {
      applyDarkMode(false);
    } else {
      // System preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyDarkMode(mediaQuery.matches);

      const listener = (e) => applyDarkMode(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    if (!profile) {
      localStorage.setItem('dark-mode', darkMode);
    }
  }, [darkMode, profile]);

  const setThemeColor = async (colorName) => {
    if (!themeColorsMap[colorName]) return;
    setThemeColorState(colorName);
    if (profile) {
      try {
        await updateProfile({ theme_color: colorName });
      } catch (err) {
        console.error('Failed to save theme color to profile:', err);
      }
    }
  };

  const setDarkMode = async (mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) return;
    setDarkModeState(mode);
    if (profile) {
      try {
        await updateProfile({ dark_mode: mode });
      } catch (err) {
        console.error('Failed to save dark mode to profile:', err);
      }
    }
  };

  const value = {
    themeColor,
    darkMode,
    setThemeColor,
    setDarkMode,
    colors: themeColorsMap[themeColor] || themeColorsMap.olive
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

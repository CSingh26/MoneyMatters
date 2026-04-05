import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@synaxis_theme';

// ─── Dark Mode Colors ───
const DarkColors = {
  bgPrimary: '#0D0D1A',
  bgSecondary: '#1A1A2E',
  cardBg: '#1A1A2E',
  cardBorder: '#2A2A3E',
  
  primary50: '#2A2063',
  primary100: '#3B2F8A',
  primary200: '#4C3DB5',
  primary300: '#7B5EA7',
  primary400: '#8B5CF6',
  primary500: '#7B5EA7',
  primary600: '#9B7BD4',

  accent: '#E040FB',
  accentLight: 'rgba(224, 64, 251, 0.15)',

  blue50: 'rgba(61, 90, 128, 0.2)',
  blue100: 'rgba(61, 90, 128, 0.3)',
  blue500: '#3D5A80',
  blue600: '#5A8AC0',

  lavender100: 'rgba(123, 94, 167, 0.2)',
  lavender400: '#9B7BD4',

  gray50: '#16213E',
  gray100: '#1E2A4A',
  gray200: '#2A2A3E',
  gray300: '#3A3A5E',
  gray400: '#6B6B8A',
  gray500: '#B0B0C3',
  gray600: '#C0C0D3',
  gray700: '#D0D0E3',
  gray800: '#E8E8F0',
  gray900: '#FFFFFF',

  success: '#00B894',
  successLight: 'rgba(0, 184, 148, 0.15)',
  warning: '#FDCB6E',
  warningLight: 'rgba(253, 203, 110, 0.15)',
  danger: '#FF7675',
  dangerLight: 'rgba(255, 118, 117, 0.15)',
  info: '#74B9FF',
  infoLight: 'rgba(116, 185, 255, 0.15)',

  white: '#FFFFFF',
  black: '#000000',

  chartColors: ['#3D5A80', '#7B5EA7', '#E040FB', '#00B894', '#FDCB6E', '#FF7675'],
  statusBar: 'light-content',
};

// ─── Light Mode Colors ───
const LightColors = {
  bgPrimary: '#F8F4FF',
  bgSecondary: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(108, 92, 231, 0.06)',

  primary50: '#F0EDFF',
  primary100: '#DDD6FE',
  primary200: '#C4B5FD',
  primary300: '#A78BFA',
  primary400: '#8B5CF6',
  primary500: '#FF4081',
  primary600: '#E91E63',

  accent: '#E040FB',
  accentLight: 'rgba(224, 64, 251, 0.1)',

  blue50: '#EBF5FF',
  blue100: '#DBEAFE',
  blue500: '#3B82F6',
  blue600: '#2563EB',

  lavender100: '#E8E4F8',
  lavender400: '#AB47BC',

  gray50: '#F8F9FE',
  gray100: '#F1F3F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#6B6B8A',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1A1A2E',
  gray900: '#1A1A2E',

  success: '#00B894',
  successLight: '#E6F9F3',
  warning: '#FDCB6E',
  warningLight: '#FFF8E7',
  danger: '#FF7675',
  dangerLight: '#FFE8E8',
  info: '#74B9FF',
  infoLight: '#EBF5FF',

  white: '#FFFFFF',
  black: '#000000',

  chartColors: ['#FF4081', '#AB47BC', '#FFD600', '#FF6D00', '#00B894', '#3B82F6'],
  statusBar: 'dark-content',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'dark') setIsDark(true);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light').catch(() => {});
  };

  const colors = isDark ? DarkColors : LightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { type ThemeContextValue, type ThemePreference, type ThemeProviderProps } from './types';

const THEME_STORAGE_KEY = 'eva-labs-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'dark' || value === 'light' || value === 'system';
}

function getThemePreference() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return isThemePreference(storedTheme) ? storedTheme : 'system';
}

function getInitialThemePreference() {
  return typeof window === 'undefined' ? 'system' : getThemePreference();
}

function applyTheme(theme: ThemePreference) {
  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function ThemeProvider(props: ThemeProviderProps) {
  const { children } = props;
  const [theme, setThemeState] = useState<ThemePreference>(getInitialThemePreference);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => applyTheme(theme);

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  function setTheme(nextTheme: ThemePreference) {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setThemeState(nextTheme);
  }

  return <ThemeContext.Provider value={{ setTheme, theme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider.');
  }

  return theme;
}

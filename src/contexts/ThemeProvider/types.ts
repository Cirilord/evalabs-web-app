import { type ReactNode } from 'react';

export type ThemePreference = 'dark' | 'light' | 'system';

export type ThemeProviderProps = Readonly<{
  children: ReactNode;
}>;

export type ThemeContextValue = Readonly<{
  setTheme: (theme: ThemePreference) => void;
  theme: ThemePreference;
}>;

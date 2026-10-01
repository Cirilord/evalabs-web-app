'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/lib/i18n';
import { type Locale } from '@/lib/i18n/translations';

import { type LocaleContextValue, type LocaleProviderProps } from './types';

const LOCALE_STORAGE_KEY = 'eva-labs-locale';
const LocaleContext = createContext<LocaleContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en-US';

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

  if (storedLocale === 'en-US' || storedLocale === 'pt-BR') return storedLocale;

  if (storedLocale === 'en') {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en-US');
    return 'en-US';
  }

  return window.navigator.language.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en-US';
}

export function LocaleProvider(props: LocaleProviderProps) {
  const { children } = props;
  const [locale, setLocaleState] = useState<Locale>('en-US');

  useEffect(() => {
    const initialLocale = getInitialLocale();

    void i18n.changeLanguage(initialLocale).then(() => {
      document.documentElement.lang = initialLocale;
      setLocaleState(initialLocale);
    });
  }, []);

  function setLocale(nextLocale: Locale) {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    document.documentElement.lang = nextLocale;
    void i18n.changeLanguage(nextLocale);
    setLocaleState(nextLocale);
  }

  return (
    <I18nextProvider i18n={i18n}>
      <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  );
}

export function useLocale() {
  const locale = useContext(LocaleContext);

  if (!locale) throw new Error('useLocale must be used within LocaleProvider.');

  return locale;
}

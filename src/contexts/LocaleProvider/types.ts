import { type ReactNode } from 'react';

import { type Locale } from '@/lib/i18n/translations';

export type LocaleProviderProps = Readonly<{
  children: ReactNode;
}>;

export type LocaleContextValue = Readonly<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>;

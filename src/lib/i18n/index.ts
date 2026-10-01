import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { translations } from './translations';

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  fallbackLng: 'en-US',
  interpolation: { escapeValue: false },
  keySeparator: false,
  lng: 'en-US',
  resources: {
    'en-US': { translation: translations['en-US'] },
    'pt-BR': { translation: translations['pt-BR'] },
  },
});

export { i18n };

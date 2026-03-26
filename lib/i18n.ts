import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ml from '../locales/ml.json';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

i18n.use(initReactI18next).init({
  resources: {
    ml: { translation: ml },
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: 'ml', // Malayalam by default
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

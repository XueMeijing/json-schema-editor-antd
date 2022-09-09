import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import zh from './locales/zh';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'zh',
    fallbackLng: 'zh',
    load: 'all',
    resources: {
      en: {
        translation: en,
      },
      zh: {
        translation: zh,
      },
    },
    detection: {
      lookupLocalStorage: 'lang',
    },
  });

export default i18n;

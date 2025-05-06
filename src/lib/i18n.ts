import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../i18n/locales/en.json';
import deTranslations from '../i18n/locales/de.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      de: {
        translation: deTranslations
      }
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n; 
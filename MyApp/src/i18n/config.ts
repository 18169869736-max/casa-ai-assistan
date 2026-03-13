import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import de from './locales/de.json';

const LANGUAGE_STORAGE_KEY = '@interioriq_language';

// Map of supported languages
const SUPPORTED_LANGUAGES = ['en', 'de'];

// Function to get device language
const getDeviceLanguage = (): string => {
  const deviceLocale = Localization.getLocales()[0];
  const languageCode = deviceLocale?.languageCode || 'en';

  // Check if the device language is supported, otherwise default to English
  return SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : 'en';
};

// Custom language detector for React Native
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // First, check if user has manually selected a language
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        // If no saved language, use device language
        const deviceLanguage = getDeviceLanguage();
        callback(deviceLanguage);
      }
    } catch (error) {
      console.error('Error loading language from storage:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language to storage:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

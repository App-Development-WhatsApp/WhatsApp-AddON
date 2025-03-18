import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

// Import translation files
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";
import gu from "./locales/gu.json";

// Language detection (optional)

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  gu: { translation: gu },
};

const defaultLanguage = RNLocalize.findBestAvailableLanguage(Object.keys(resources))?.languageTag || "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  lng: defaultLanguage, // Set default language
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;

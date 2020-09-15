import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import English from "../locales/en.json";
import ChineseSimplified from "../locales/zh-CN.json";
import ChineseTraditional from "../locales/zh-TW.json";

const findBrowserLang = () => {
  let found: string[] = [];

  if (typeof navigator !== "undefined") {
    if (navigator.languages) {
      // chrome only; not an array, so can't use .push.apply instead of iterating
      for (let i = 0; i < navigator.languages.length; i++) {
        found.push(navigator.languages[i]);
      }
    }
    // @ts-ignore
    if (navigator.userLanguage) {
      // @ts-ignore
      found.push(navigator.userLanguage);
    }
    if (navigator.language) {
      found.push(navigator.language);
    }
  }

  return found.length > 0 ? found[0] : undefined;
};

const findBestLang = () => {
  const lang = localStorage.getItem("rariLang");

  if (!lang) {
    return findBrowserLang();
  } else {
    return lang;
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: English },

    "zh-CN": { translation: ChineseSimplified },
    "zh-TW": { translation: ChineseTraditional },
  },

  lng: findBestLang() ?? "en",
  fallbackLng: "en",

  keySeparator: false,

  interpolation: {
    escapeValue: false,
  },
});

import i18n from "i18n-js";
import en from "./locales/en.json";
import tr from "./locales/tr.json";

i18n.defaultLocale = 'en';
i18n.fallbacks = true;
i18n.translations = {en, tr};

export default i18n;

import en from "./i18n/locales/en";
import ko from "./i18n/locales/ko";
import de from "./i18n/locales/de";
import it from "./i18n/locales/it";
import fr from "./i18n/locales/fr";
import { validateCopy, type LocaleCopy } from "./i18n/types";
import catalogue from "./data/videos.json";
import videoDescriptions from "./data/video-descriptions.json";
import articles from "./data/press.json";

/** Register a language here; ordering, navigation and SEO use this registry. */
export const localeConfig = {
  en: { label: "EN", nativeName: "English", dateLocale: "en-GB", ogLocale: "en_GB", copy: en },
  ko: { label: "한국어", nativeName: "한국어", dateLocale: "ko-KR", ogLocale: "ko_KR", copy: ko },
  de: { label: "DE", nativeName: "Deutsch", dateLocale: "de-DE", ogLocale: "de_DE", copy: de },
  it: { label: "IT", nativeName: "Italiano", dateLocale: "it-IT", ogLocale: "it_IT", copy: it },
  fr: { label: "FR", nativeName: "Français", dateLocale: "fr-FR", ogLocale: "fr_FR", copy: fr },
} satisfies Record<string, { label: string; nativeName: string; dateLocale: string; ogLocale: string; copy: LocaleCopy }>;

export type Language = keyof typeof localeConfig;
export const languages = Object.keys(localeConfig) as Language[];
export const defaultLanguage: Language = "en";
export const isLanguage = (value: string): value is Language => Object.hasOwn(localeConfig, value);
export const getCopy = (lang: Language): LocaleCopy => localeConfig[lang].copy;

export function formatCopy(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Missing text placeholder: ${key}`);
    return String(values[key]);
  });
}

const descriptions = videoDescriptions as Record<string, Partial<Record<Language, string>>>;
for (const lang of languages) {
  validateCopy(en, getCopy(lang), lang);
  for (const video of catalogue.videos) {
    if (!descriptions[video.id]?.[lang]?.trim()) throw new Error(`Missing ${lang} video description: ${video.id}`);
  }
  for (const article of articles) {
    if (!getCopy(lang).press.articles[article.id]) throw new Error(`Missing ${lang} press article: ${article.id}`);
  }
}

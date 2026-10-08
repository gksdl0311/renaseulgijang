import { defaultLanguage, isLanguage, languages, type Language } from "../i18n";
import { sitePath, siteRelativePath } from "../site-paths";
import type { PageKey } from "./types";

export const pageKeys = {
  "": "home", biography: "biography", repertoire: "repertoire", schedule: "schedule",
  "media/video": "video", "media/photo": "photo", "media/photo/onstage": "onstage",
  "media/photo/portrait": "portrait", press: "press", contact: "contact",
} as const satisfies Record<string, PageKey>;

export const normalizePagePath = (path: string) => path.replace(/^\/+|\/+$/g, "");

// Inspect filenames only; importing page components here would create cycles.
const wrappers = import.meta.glob("../pages/**/index.astro");
const availability = Object.fromEntries(languages.map(lang => [lang, new Set<string>()])) as Record<Language, Set<string>>;
for (const filename of Object.keys(wrappers)) {
  const match = filename.match(/^\.\.\/pages\/([^/]+)\/(.*)index\.astro$/);
  if (match && isLanguage(match[1])) availability[match[1]].add(normalizePagePath(match[2]));
}
for (const lang of languages) {
  if (!availability[lang].has("")) throw new Error(`A homepage is required before enabling language: ${lang}`);
  for (const path of availability[lang]) {
    if (!Object.hasOwn(pageKeys, path)) throw new Error(`No page translation section registered for: ${lang}/${path}`);
  }
}

export const availablePages = (lang: Language) => [...availability[lang]].sort();
export const hasLocalizedPage = (lang: Language, page: string) => availability[lang].has(normalizePagePath(page));
export const localizedPath = (lang: Language, page = "") => {
  const requested = normalizePagePath(page);
  const destination = hasLocalizedPage(lang, requested) ? requested : "";
  return sitePath(`${lang}/${destination ? `${destination}/` : ""}`);
};

export const pageKeyForPath = (pathname: string): PageKey | undefined => {
  const segments = siteRelativePath(pathname).split("/").filter(Boolean);
  if (!segments[0] || !isLanguage(segments[0])) return undefined;
  const page = segments.slice(1).join("/");
  return pageKeys[page as keyof typeof pageKeys];
};

export const pagePathForRequest = (pathname: string) => {
  const segments = siteRelativePath(pathname).split("/").filter(Boolean);
  return segments[0] && isLanguage(segments[0]) ? segments.slice(1).join("/") : "";
};

export const alternateLanguages = (page: string) => languages.filter(lang => hasLocalizedPage(lang, page));
export const defaultPath = (page: string) => localizedPath(defaultLanguage, page);

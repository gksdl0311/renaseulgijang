import { languages, getCopy, type Language } from "../i18n";
import type { NavigationCopy } from "./types";

export const navigationCopy = Object.fromEntries(
  languages.map(lang => [lang, getCopy(lang).navigation]),
) as Record<Language, NavigationCopy>;

/** The masthead and footer share the same public destinations and labels. */
export function getNavigationLinks(lang: Language) {
  const { navigation: copy, editorial } = getCopy(lang);
  return [
    { page: "biography", label: copy.biography },
    { page: "repertoire", label: copy.repertoire },
    { page: "schedule", label: editorial.navigation.performances },
    { page: "media/video", label: editorial.navigation.listen },
    { page: "media/photo", label: editorial.navigation.gallery },
    { page: "press", label: copy.press },
    { page: "contact", label: copy.contact },
  ];
}

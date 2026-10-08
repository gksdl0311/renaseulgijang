import { languages, getCopy, type Language } from "../i18n";
import type { NavigationCopy } from "./types";

export const navigationCopy = Object.fromEntries(
  languages.map(lang => [lang, getCopy(lang).navigation]),
) as Record<Language, NavigationCopy>;

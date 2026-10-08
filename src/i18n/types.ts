export interface NavigationCopy {
  home: string; biography: string; repertoire: string; schedule: string;
  media: string; video: string; photo: string; onstage: string; portrait: string;
  press: string; contact: string; primary: string; mobile: string; languages: string;
  openMenu: string; closeMenu: string; mediaMenu: string; photoMenu: string;
  skip: string; instagram: string; youtube: string;
}

interface PageCopy { description: string }

export interface LocaleCopy {
  navigation: NavigationCopy;
  home: PageCopy & { voice: string; name: string; hero: string; portrait: string; metaTitle: string };
  biography: PageCopy & {
    title: string; videoTitle: string; pronunciationLabel: string; pronunciationTitle: string;
    pronunciationGuide: string; guideLanguage: string; pronunciationUnavailable: string;
    pronunciationError: string; paragraphs: string[];
  };
  contact: PageCopy & { title: string; intro: string; email: string; note: string };
  repertoire: PageCopy & {
    title: string; intro: string; name: string; photoAlt: string; photoCaption: string;
    browse: string; headings: Record<string, string>; schubert: string; workTitles: Record<string, string>;
  };
  schedule: PageCopy & {
    title: string; upcoming: string; past: string; noUpcoming: string; noPast: string;
    more: string; time: string; eventTitles: Record<string, string>;
    cities: Record<string, string>; countries: Record<string, string>;
  };
  press: PageCopy & {
    title: string; name: string; intro: string; selection: string; count: string; read: string;
    originalTitle: string; newTab: string; note: string;
    articles: Record<string, { publisher: string; title: string; summary: string; imageAlt: string }>;
  };
  photo: PageCopy & {
    title: string; portrait: string; portraitText: string; portraitAlt: string;
    onstage: string; onstageText: string; onstageAlt: string;
  };
  onstage: PageCopy & { title: string; gallery: string; dialog: string; close: string; alt: string; open: string };
  portrait: PageCopy & { title: string; gallery: string; alt: string };
  video: PageCopy & {
    title: string; carousel: string; carouselType: string; slide: string; previous: string;
    next: string; play: string; counter: string; library: string; channel: string;
    select: string; performanceDescription: string;
  };
}

export type PageKey = Exclude<keyof LocaleCopy, "navigation">;

/** Fail the build rather than silently publishing incomplete translations. */
export function validateCopy(reference: unknown, value: unknown, path: string): void {
  if (typeof reference === "string") {
    if (typeof value !== "string" || !value.trim()) throw new Error(`Missing translation: ${path}`);
    const tokens = (text: string) => [...text.matchAll(/\{\w+\}/g)].map(match => match[0]).sort().join(",");
    if (tokens(reference) !== tokens(value)) throw new Error(`Translation placeholders differ: ${path}`);
    return;
  }
  if (Array.isArray(reference)) {
    if (!Array.isArray(value) || value.length !== reference.length) throw new Error(`Translation list differs: ${path}`);
    reference.forEach((item, index) => validateCopy(item, value[index], `${path}[${index}]`));
    return;
  }
  if (!reference || typeof reference !== "object" || !value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid translation section: ${path}`);
  }
  const source = reference as Record<string, unknown>;
  const target = value as Record<string, unknown>;
  if (Object.keys(source).sort().join("\n") !== Object.keys(target).sort().join("\n")) {
    throw new Error(`Translation keys differ: ${path}`);
  }
  for (const key of Object.keys(source)) validateCopy(source[key], target[key], `${path}.${key}`);
}

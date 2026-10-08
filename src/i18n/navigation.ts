import type { Language } from "../i18n";

export const navigationCopy = {
  en: {
    home: "Home", biography: "Biography", repertoire: "Repertoire", schedule: "Schedule",
    media: "Media", video: "Video", photo: "Photo", onstage: "Onstage", portrait: "Portrait", contact: "Contact",
    primary: "Primary navigation", mobile: "Mobile navigation", languages: "Choose language",
    openMenu: "Open menu", closeMenu: "Close menu", mediaMenu: "Media submenu", photoMenu: "Photo submenu",
    skip: "Skip to content", instagram: "Instagram (opens in a new tab)", youtube: "YouTube (opens in a new tab)",
    languageNames: { en: "English", de: "Deutsch", ko: "한국어" },
  },
  de: {
    home: "Startseite", biography: "Biografie", repertoire: "Repertoire", schedule: "Termine",
    media: "Medien", video: "Videos", photo: "Fotos", onstage: "Auf der Bühne", portrait: "Porträts", contact: "Kontakt",
    primary: "Hauptnavigation", mobile: "Mobile Navigation", languages: "Sprache wählen",
    openMenu: "Menü öffnen", closeMenu: "Menü schließen", mediaMenu: "Untermenü Medien", photoMenu: "Untermenü Fotos",
    skip: "Zum Inhalt springen", instagram: "Instagram (öffnet in einem neuen Tab)", youtube: "YouTube (öffnet in einem neuen Tab)",
    languageNames: { en: "English", de: "Deutsch", ko: "한국어" },
  },
  ko: {
    home: "홈", biography: "소개", repertoire: "레퍼토리", schedule: "공연 일정",
    media: "미디어", video: "영상", photo: "사진", onstage: "무대 사진", portrait: "프로필 사진", contact: "문의",
    primary: "주요 메뉴", mobile: "모바일 메뉴", languages: "언어 선택",
    openMenu: "메뉴 열기", closeMenu: "메뉴 닫기", mediaMenu: "미디어 하위 메뉴", photoMenu: "사진 하위 메뉴",
    skip: "본문 바로가기", instagram: "인스타그램 (새 탭에서 열림)", youtube: "유튜브 (새 탭에서 열림)",
    languageNames: { en: "English", de: "Deutsch", ko: "한국어" },
  },
} satisfies Record<Language, Record<string, string | Record<Language, string>>>;

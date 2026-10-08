export const languages = ["en", "de", "ko"] as const;

export type Language = (typeof languages)[number];

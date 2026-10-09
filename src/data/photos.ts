/** Approved original photographs. Responsive derivatives are tracked in image-manifest.json. */
export const photoCollections = {
  onstage: Array.from({ length: 30 }, (_, index) => `media/photo/onstage/onstage-${String(index + 1).padStart(2, "0")}.JPG`),
  portrait: Array.from({ length: 5 }, (_, index) => `media/photo/portrait/portrait-${String(index + 1).padStart(2, "0")}.JPG`),
} as const;
export type PhotoCollection = keyof typeof photoCollections;

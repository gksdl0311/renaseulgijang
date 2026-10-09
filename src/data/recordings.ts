/** Musical metadata from the approved channel titles and editorial descriptions.
 * Portraits illustrate the artist; they are not documentation of these recordings.
 */
export interface RecordingInfo {
  composer: string;
  work: string;
  piece: string;
  image: string;
  category: "opera" | "orchestral" | "song";
}

const portrait = "/hero/portrait.jpg";
const studioPortrait = "/media/photo/portrait/portrait-03.JPG";
const outdoorPortrait = "/media/photo/portrait/portrait-04.JPG";

export const recordings: Record<string, RecordingInfo> = {
  V124lEJWrf0: { composer: "Mahler", work: "Symphony No. 4", piece: "Das himmlische Leben", image: portrait, category: "orchestral" },
  SQX4s5lqAqM: { composer: "Gershwin", work: "Porgy and Bess", piece: "My man’s gone now", image: portrait, category: "opera" },
  KlVq2Q6wltc: { composer: "Puccini", work: "La bohème", piece: "Sì, mi chiamano Mimì", image: studioPortrait, category: "opera" },
  HypvYrBaCMU: { composer: "Massenet", work: "Manon", piece: "Je suis encore tout étourdie", image: studioPortrait, category: "opera" },
  Dj7y0qa9x4A: { composer: "Gustave Charpentier", work: "Louise", piece: "Depuis le jour", image: portrait, category: "opera" },
  "2FblD-3GHaQ": { composer: "Bellini", work: "I Capuleti e i Montecchi", piece: "Eccomi in lieta vesta… Oh quante volte", image: studioPortrait, category: "opera" },
  jAYAw01yjj4: { composer: "Mozart", work: "Così fan tutte", piece: "Dove son? Son partiti… Soave sia il vento", image: outdoorPortrait, category: "opera" },
  "2uaQSSuPw80": { composer: "Mahler", work: "Rückert-Lieder", piece: "Liebst du um Schönheit", image: outdoorPortrait, category: "song" },
  "WYXIK4-Rm4c": { composer: "Bellini", work: "I puritani", piece: "Qui la voce… Vien, diletto", image: portrait, category: "opera" },
  H0MKllDxjs8: { composer: "Verdi", work: "La forza del destino", piece: "Pace, pace, mio Dio", image: portrait, category: "opera" },
};

export const homeRecordingIds = ["V124lEJWrf0", "KlVq2Q6wltc", "2uaQSSuPw80"] as const;

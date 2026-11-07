import type { Language } from "../i18n";

interface RecitalCopy {
  edition: string;
  introduction: string;
  artistHeading: string;
  biography: string;
  galleryLink: string;
  play: string;
  pause: string;
  progress: string;
  loading: string;
  buffering: string;
  startInPlayer: string;
  unavailable: string;
}

export const recitalCopy = {
  en: {
    edition: "Recital programme",
    introduction: "South Korean soprano based in Berlin.",
    artistHeading: "From Seoul to Berlin",
    biography: "Rena studied at Seoul National University and trained as a Young Artist with the Korea National Opera Studio. Her operatic repertoire includes Mimì, Adina and Susanna.",
    galleryLink: "View gallery",
    play: "Play recording",
    pause: "Pause recording",
    progress: "Playback progress",
    loading: "Loading the recording…",
    buffering: "Still buffering. You can also watch on YouTube.",
    startInPlayer: "Use Play in the video to begin.",
    unavailable: "The player could not load. Watch the recording on YouTube.",
  },
  ko: {
    edition: "리사이틀 프로그램",
    introduction: "베를린을 중심으로 활동하는 한국인 소프라노입니다.",
    artistHeading: "서울에서 베를린으로",
    biography: "레나 슬기 장은 서울대학교에서 공부한 뒤 국립오페라단 오페라 스튜디오에서 영아티스트로 훈련받았습니다. 주요 오페라 레퍼토리에는 미미, 아디나, 수잔나가 있습니다.",
    galleryLink: "갤러리 보기",
    play: "연주 재생",
    pause: "연주 일시정지",
    progress: "재생 진행률",
    loading: "연주 영상을 불러오는 중입니다…",
    buffering: "영상 로딩이 지연되고 있습니다. 유튜브에서도 감상하실 수 있습니다.",
    startInPlayer: "영상의 재생 버튼을 눌러 주세요.",
    unavailable: "영상을 불러오지 못했습니다. 유튜브에서 연주를 감상하실 수 있습니다.",
  },
  de: {
    edition: "Recitalprogramm",
    introduction: "Südkoreanische Sopranistin mit Sitz in Berlin.",
    artistHeading: "Von Seoul nach Berlin",
    biography: "Rena studierte an der Seoul National University und absolvierte eine Ausbildung als Young Artist am Korea National Opera Studio. Zu ihrem Opernrepertoire gehören Mimì, Adina und Susanna.",
    galleryLink: "Galerie ansehen",
    play: "Aufnahme abspielen",
    pause: "Aufnahme pausieren",
    progress: "Wiedergabefortschritt",
    loading: "Die Aufnahme wird geladen…",
    buffering: "Die Aufnahme lädt noch. Sie ist auch auf YouTube verfügbar.",
    startInPlayer: "Zum Starten auf die Wiedergabetaste im Video drücken.",
    unavailable: "Das Video konnte nicht geladen werden. Die Aufnahme ist auf YouTube verfügbar.",
  },
  it: {
    edition: "Programma di recital",
    introduction: "Soprano sudcoreana con base a Berlino.",
    artistHeading: "Da Seul a Berlino",
    biography: "Rena ha studiato alla Seoul National University e si è formata come Young Artist presso il Korea National Opera Studio. Il suo repertorio operistico comprende Mimì, Adina e Susanna.",
    galleryLink: "Vedi la galleria",
    play: "Riproduci la registrazione",
    pause: "Metti in pausa",
    progress: "Avanzamento della riproduzione",
    loading: "Caricamento della registrazione…",
    buffering: "Il caricamento continua. La registrazione è disponibile anche su YouTube.",
    startInPlayer: "Premi il pulsante di riproduzione nel video per iniziare.",
    unavailable: "Il video non si è caricato. La registrazione è disponibile su YouTube.",
  },
  fr: {
    edition: "Programme de récital",
    introduction: "Soprano sud-coréenne établie à Berlin.",
    artistHeading: "De Séoul à Berlin",
    biography: "Rena a étudié à l’université nationale de Séoul avant de se former comme Young Artist au Korea National Opera Studio. Son répertoire lyrique comprend notamment Mimì, Adina et Susanna.",
    galleryLink: "Voir la galerie",
    play: "Lire l’enregistrement",
    pause: "Mettre en pause",
    progress: "Progression de la lecture",
    loading: "Chargement de l’enregistrement…",
    buffering: "Le chargement se poursuit. L’enregistrement est aussi disponible sur YouTube.",
    startInPlayer: "Appuyez sur Lecture dans la vidéo pour commencer.",
    unavailable: "La vidéo n’a pas pu se charger. L’enregistrement est disponible sur YouTube.",
  },
} satisfies Record<Language, RecitalCopy>;

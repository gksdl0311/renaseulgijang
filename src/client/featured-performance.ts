interface Player {
  playVideo(): void;
  pauseVideo(): void;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
}

interface PlayerOptions {
  events: {
    onReady: (event: { target: Player }) => void;
    onStateChange: (event: { target: Player }) => void;
    onAutoplayBlocked: () => void;
    onError: () => void;
  };
}

type PlayerWindow = Window & {
  YT?: { Player?: new (frame: HTMLIFrameElement, options: PlayerOptions) => Player };
  onYouTubeIframeAPIReady?: () => void;
};

const pageWindow = window as PlayerWindow;
const PLAYING = 1;
const BUFFERING = 3;
const root = document.querySelector<HTMLElement>("[data-featured-performance]");

if (root) {
  const toggle = root.querySelector<HTMLButtonElement>("[data-toggle]")!;
  const screen = root.querySelector<HTMLElement>("[data-player]")!;
  const still = root.querySelector<HTMLElement>("[data-still]")!;
  const caption = root.querySelector<HTMLElement>("[data-caption]")!;
  const status = root.querySelector<HTMLElement>("[data-status]")!;
  const progressGroup = root.querySelector<HTMLElement>("[data-progress]")!;
  const progress = progressGroup.querySelector("progress")!;
  const time = progressGroup.querySelector<HTMLElement>("[data-time]")!;
  const { play, pause, loading, buffering, startInPlayer, unavailable, videoId } = root.dataset;
  let player: Player | undefined;
  let progressTimer: number | undefined;
  let readinessTimer: number | undefined;
  let bufferingTimer: number | undefined;

  const formatTime = (seconds: number) => {
    const whole = Math.floor(Math.max(0, seconds));
    return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
  };

  const updateProgress = (active: Player) => {
    const duration = active.getDuration();
    const elapsed = active.getCurrentTime();
    if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(elapsed)) return;
    progress.max = duration;
    progress.value = elapsed;
    time.textContent = formatTime(elapsed) + " / " + formatTime(duration);
    progressGroup.hidden = false;
    caption.hidden = true;
  };

  const updateState = (active: Player) => {
    window.clearInterval(progressTimer);
    window.clearTimeout(bufferingTimer);
    const state = active.getPlayerState();
    toggle.textContent = state === PLAYING || state === BUFFERING ? pause! : play!;
    status.textContent = state === BUFFERING ? loading! : "";
    updateProgress(active);
    if (state === PLAYING) progressTimer = window.setInterval(() => updateProgress(active), 500);
    if (state === BUFFERING) {
      bufferingTimer = window.setTimeout(() => { status.textContent = buffering!; }, 8000);
    }
  };

  const useNativeControls = (message: string) => {
    window.clearTimeout(readinessTimer);
    window.clearTimeout(bufferingTimer);
    window.clearInterval(progressTimer);
    toggle.hidden = true;
    status.textContent = message;
  };

  const mount = () => {
    toggle.disabled = true;
    status.textContent = loading!;
    const iframe = document.createElement("iframe");
    const url = new URL("https://www.youtube-nocookie.com/embed/" + videoId);
    url.search = new URLSearchParams({
      enablejsapi: "1", autoplay: "1", playsinline: "1", rel: "0", origin: window.location.origin,
    }).toString();
    iframe.title = root.querySelector("h2")!.textContent!.trim();
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.src = url.href;
    screen.append(iframe);
    screen.hidden = false;
    still.hidden = true;
    caption.hidden = true;

    const connect = () => {
      const YouTubePlayer = pageWindow.YT?.Player;
      if (!YouTubePlayer) return;
      new YouTubePlayer(iframe, {
        events: {
          onReady({ target }) {
            window.clearTimeout(readinessTimer);
            player = target;
            toggle.hidden = false;
            toggle.disabled = false;
            updateState(target);
          },
          onStateChange({ target }) { updateState(target); },
          onAutoplayBlocked() {
            window.clearTimeout(bufferingTimer);
            toggle.textContent = play!;
            status.textContent = startInPlayer!;
          },
          onError() { useNativeControls(unavailable!); },
        },
      });
    };

    readinessTimer = window.setTimeout(() => useNativeControls(startInPlayer!), 15000);
    if (pageWindow.YT?.Player) {
      connect();
      return;
    }
    const previousCallback = pageWindow.onYouTubeIframeAPIReady;
    pageWindow.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      connect();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener("error", () => useNativeControls(startInPlayer!), { once: true });
    document.head.append(script);
  };

  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    if (!player) {
      mount();
      return;
    }
    const state = player.getPlayerState();
    if (state === PLAYING || state === BUFFERING) player.pauseVideo();
    else player.playVideo();
  });
  window.addEventListener("pagehide", () => {
    window.clearInterval(progressTimer);
    window.clearTimeout(bufferingTimer);
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && player) updateState(player);
  });
}

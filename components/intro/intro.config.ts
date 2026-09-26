export type IntroMode = "layers" | "sequence";
export type IntroBreakpoint = "desktop" | "tablet" | "mobile";

export interface BreakpointSettings {
  diveScale: number;
  particles: number;
  petalLayers: 1 | 2;
  pinVh: number;
  showMiddleLayer: boolean;
}

interface IntroConfig {
  mode: IntroMode;
  focalPoint: { x: number; y: number };
  scrub: number;
  preload: {
    firstVisitMs: number;
    repeatVisitMs: number;
    maximumMs: number;
  };
  timeline: {
    brand: number;
    flower: number;
    dive: number;
    light: number;
    complete: number;
  };
  poem: readonly string[];
  assets: {
    desktopFlower: string;
    mobileFlower: string;
    petals: readonly [string, string];
    logo: string;
  };
  sequence: {
    directory: string;
    prefix: string;
    extension: string;
    padding: number;
    frameCount: number;
  };
  breakpoints: Record<IntroBreakpoint, BreakpointSettings>;
}

export const INTRO_MODE: IntroMode = "layers";

export const introConfig: IntroConfig = {
  mode: INTRO_MODE,
  focalPoint: { x: 50, y: 48 },
  scrub: 0.35,
  preload: {
    firstVisitMs: 450,
    repeatVisitMs: 0,
    maximumMs: 2500,
  },
  timeline: { brand: 0, flower: 15, dive: 35, light: 80, complete: 100 },
  poem: ["Shaped stem by stem…", "petal by petal…", "made to last forever."],
  assets: {
    desktopFlower: "/images/craft/closeup-macro.jpg",
    mobileFlower: "/images/craft/closeup-flower.jpg",
    petals: [
      "/images/hero/petal-layer-1-placeholder.svg",
      "/images/hero/petal-layer-2-placeholder.svg",
    ],
    logo: "/brand/logo-placeholder.svg",
  },
  sequence: {
    directory: "/sequence",
    prefix: "flower_",
    extension: "webp",
    padding: 4,
    frameCount: 150,
  },
  breakpoints: {
    desktop: {
      pinVh: 260,
      diveScale: 2,
      particles: 9,
      petalLayers: 2,
      showMiddleLayer: false,
    },
    tablet: {
      pinVh: 220,
      diveScale: 1.85,
      particles: 6,
      petalLayers: 2,
      showMiddleLayer: false,
    },
    mobile: {
      pinVh: 180,
      diveScale: 1.7,
      particles: 4,
      petalLayers: 1,
      showMiddleLayer: false,
    },
  },
};

export interface CanvasDprSignals {
  devicePixelRatio: number;
  lowPower: boolean;
  mobile: boolean;
}

export function getCanvasDpr({
  devicePixelRatio,
  lowPower,
  mobile,
}: CanvasDprSignals) {
  if (lowPower) return 1;
  return Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
}

export function getIntroRuntimeSettings(
  breakpoint: IntroBreakpoint,
  lowPower: boolean,
): BreakpointSettings {
  const settings = introConfig.breakpoints[breakpoint];
  if (!lowPower) return settings;
  return {
    ...settings,
    diveScale: Math.min(settings.diveScale, 1.55),
    particles: 0,
    petalLayers: 1,
    pinVh: Math.min(settings.pinVh, breakpoint === "mobile" ? 160 : 180),
    showMiddleLayer: false,
  };
}

export function getSequenceFrameUrl(index: number): string {
  const { directory, extension, padding, prefix } = introConfig.sequence;
  return `${directory}/${prefix}${String(index).padStart(padding, "0")}.${extension}`;
}

export function getSequenceFrameUrls(): string[] {
  return Array.from({ length: introConfig.sequence.frameCount }, (_, index) =>
    getSequenceFrameUrl(index + 1),
  );
}

export function getSequenceLoadOrder(
  urls: readonly string[] = getSequenceFrameUrls(),
): string[] {
  const uniqueUrls = Array.from(new Set(urls));
  const priority = uniqueUrls.filter(
    (_url, index) => index === 0 || (index + 1) % 10 === 0,
  );
  const prioritySet = new Set(priority);

  return [...priority, ...uniqueUrls.filter((url) => !prioritySet.has(url))];
}

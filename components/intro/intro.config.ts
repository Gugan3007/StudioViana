export type IntroMode = "layers" | "sequence";
export type IntroBreakpoint = "desktop" | "tablet" | "mobile";

interface BreakpointSettings {
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
  scrub: 1.2,
  preload: {
    firstVisitMs: 1800,
    repeatVisitMs: 800,
    maximumMs: 6000,
  },
  timeline: { brand: 0, flower: 15, dive: 35, light: 80, complete: 100 },
  poem: ["Shaped stem by stem…", "petal by petal…", "made to last forever."],
  assets: {
    desktopFlower: "/images/hero/flower-macro-placeholder.svg",
    mobileFlower: "/images/hero/flower-macro-mobile-placeholder.svg",
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
      pinVh: 400,
      diveScale: 6,
      particles: 9,
      petalLayers: 2,
      showMiddleLayer: true,
    },
    tablet: {
      pinVh: 300,
      diveScale: 4,
      particles: 6,
      petalLayers: 2,
      showMiddleLayer: true,
    },
    mobile: {
      pinVh: 220,
      diveScale: 3,
      particles: 4,
      petalLayers: 1,
      showMiddleLayer: false,
    },
  },
};

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

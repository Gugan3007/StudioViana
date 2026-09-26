export const motionTokens = {
  ease: {
    magnetic: "elastic.out(1, 0.4)",
    primary: "expo.out",
    scrub: "power2.inOut",
    ui: "power3.out",
    expo: "expo.out",
    entrance: "power3.out",
    framerExpo: [0.16, 1, 0.3, 1],
    transition: "power2.inOut",
    signature: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  duration: { fast: 0.4, base: 0.8, slow: 1.2, cinematic: 1.8 },
  overlay: {
    enter: 0.5,
    exit: 0.35,
    panelEnter: 0.5,
    stagger: 0.08,
  },
  labelStagger: 0.12,
  stagger: 0.08,
  revealDistance: 40,
  lenis: {
    lerp: 0.14,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
  },
} as const;

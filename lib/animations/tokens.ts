export const motionTokens = {
  ease: {
    expo: "expo.out",
    entrance: "power3.out",
    transition: "power2.inOut",
    signature: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  duration: { fast: 0.4, base: 0.8, slow: 1.2, cinematic: 1.8 },
  stagger: 0.08,
  revealDistance: 40,
} as const;

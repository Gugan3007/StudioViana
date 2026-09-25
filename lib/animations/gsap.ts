import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let pluginsRegistered = false;
let refreshFrame: number | null = null;

if (typeof window !== "undefined" && !pluginsRegistered) {
  gsap.registerPlugin(ScrollTrigger, Flip);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  pluginsRegistered = true;
}

export function refreshScrollTrigger() {
  if (typeof window === "undefined" || refreshFrame !== null) return;

  refreshFrame = window.requestAnimationFrame(() => {
    refreshFrame = null;
    ScrollTrigger.refresh();
  });
}

export { Flip, gsap, ScrollTrigger };

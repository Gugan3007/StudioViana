import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let pluginsRegistered = false;

if (typeof window !== "undefined" && !pluginsRegistered) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  pluginsRegistered = true;
}

export function refreshScrollTrigger() {
  if (typeof window === "undefined") return;

  window.requestAnimationFrame(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger };

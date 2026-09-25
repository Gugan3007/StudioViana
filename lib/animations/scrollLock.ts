import type Lenis from "lenis";

type ScrollLockToken = symbol;

const owners = new Map<ScrollLockToken, Lenis | null>();
const stoppedLenis = new Set<Lenis>();
let previousOverflow: { body: string; html: string } | null = null;

function lockNativeScroll() {
  if (typeof document === "undefined" || previousOverflow) return;
  previousOverflow = {
    body: document.body.style.overflow,
    html: document.documentElement.style.overflow,
  };
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockNativeScroll() {
  if (typeof document === "undefined" || !previousOverflow) return;
  document.documentElement.style.overflow = previousOverflow.html;
  document.body.style.overflow = previousOverflow.body;
  previousOverflow = null;
}

export function acquireScrollLock() {
  const token = Symbol("scroll-lock");
  if (owners.size === 0) lockNativeScroll();
  owners.set(token, null);
  return token;
}

export function connectScrollLock(token: ScrollLockToken, lenis: Lenis | null) {
  if (!owners.has(token)) return;
  owners.set(token, lenis);
  if (lenis && !stoppedLenis.has(lenis)) {
    lenis.stop();
    stoppedLenis.add(lenis);
  }
}

export function releaseScrollLock(token: ScrollLockToken) {
  if (!owners.delete(token) || owners.size > 0) return;
  unlockNativeScroll();
  stoppedLenis.forEach((lenis) => lenis.start());
  stoppedLenis.clear();
}

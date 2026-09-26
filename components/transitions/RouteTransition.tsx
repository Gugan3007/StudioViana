"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import {
  CurtainWipe,
  type CurtainPhase,
} from "@/components/transitions/CurtainWipe";
import { refreshScrollTrigger } from "@/lib/animations/gsap";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";

interface NavigationClickLike {
  altKey: boolean;
  button: number;
  ctrlKey: boolean;
  defaultPrevented: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export function shouldInterceptNavigation(
  event: NavigationClickLike,
  anchor: HTMLAnchorElement,
  current: URL,
) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.hasAttribute("download") ||
    (anchor.target && anchor.target !== "_self")
  ) {
    return false;
  }
  const rawHref = anchor.getAttribute("href");
  if (!rawHref || rawHref.startsWith("#")) return false;

  const destination = new URL(anchor.href, current);
  return (
    destination.protocol.startsWith("http") &&
    destination.origin === current.origin &&
    !destination.hash &&
    destination.pathname !== current.pathname
  );
}

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<CurtainPhase>("idle");
  const phaseRef = useRef<CurtainPhase>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay);
      timers.current.push(timer);
    };
    const navigate = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const current = new URL(window.location.href);
      if (!shouldInterceptNavigation(event, anchor, current)) return;

      event.preventDefault();
      const destination = new URL(anchor.href, current);
      const href = `${destination.pathname}${destination.search}`;
      sessionStorage.setItem("studio-viana:route-transition", "pending");
      if (shouldReduceMotion) {
        router.push(href);
        return;
      }
      setPhase("cover");
      schedule(() => router.push(href), 500);
    };

    document.addEventListener("click", navigate);
    return () => {
      document.removeEventListener("click", navigate);
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, [router, shouldReduceMotion]);

  useEffect(() => {
    const pending =
      sessionStorage.getItem("studio-viana:route-transition") === "pending";
    if (pending) {
      sessionStorage.removeItem("studio-viana:route-transition");
      window.scrollTo({ behavior: "auto", top: 0 });
    }
    if (phaseRef.current === "cover" || pending) {
      setPhase("reveal");
      const timer = window.setTimeout(() => setPhase("idle"), 380);
      timers.current.push(timer);
    }
    void document.fonts?.ready.then(() => {
      window.requestAnimationFrame(refreshScrollTrigger);
    });
  }, [pathname]);

  return (
    <>
      {children}
      <CurtainWipe phase={phase} />
    </>
  );
}

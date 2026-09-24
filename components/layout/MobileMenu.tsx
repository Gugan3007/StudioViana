"use client";

import type Lenis from "lenis";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import { MandalaMark } from "@/components/decor/MandalaMark";
import { gsap } from "@/lib/animations/gsap";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { site } from "@/lib/data/site";

export interface NavigationItem {
  href: `#${string}`;
  label: string;
  number: string;
}

interface MobileMenuProps {
  items: readonly NavigationItem[];
  lenis: Lenis | null;
  onClose: () => void;
  onNavigate: (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: `#${string}`,
  ) => void;
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({
  items,
  lenis,
  onClose,
  onNavigate,
  open,
  triggerRef,
}: MobileMenuProps) {
  const root = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !root.current) return;
    const menu = root.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const trigger = triggerRef.current;
    const focusable = Array.from(
      menu.querySelectorAll<HTMLElement>(focusableSelector),
    );

    lenis?.stop();
    focusable[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      lenis?.start();
      (trigger ?? previousFocus)?.focus();
    };
  }, [lenis, onClose, open, triggerRef]);

  useEffect(() => {
    if (!open || !root.current || shouldReduceMotion) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline();
      // The overlay expands from the mobile trigger corner, then the masked
      // links rise in sequence after the forest surface covers the viewport.
      timeline
        .fromTo(
          root.current,
          { clipPath: "circle(0% at calc(100% - 48px) 42px)" },
          {
            clipPath: "circle(150% at calc(100% - 48px) 42px)",
            duration: 0.75,
            ease: "power3.inOut",
          },
        )
        .fromTo(
          root.current!.querySelectorAll("[data-mobile-menu-link]"),
          { autoAlpha: 0, yPercent: 110 },
          { autoAlpha: 1, duration: 0.65, stagger: 0.08, yPercent: 0 },
          "-=0.25",
        );
    }, root);

    return () => context.revert();
  }, [open, shouldReduceMotion]);

  if (!open) return null;

  return (
    <div
      ref={root}
      aria-label="Mobile navigation"
      aria-modal="true"
      className="fixed inset-0 z-[90] overflow-y-auto bg-forest text-cream"
      data-lenis-prevent
      role="dialog"
      style={
        shouldReduceMotion
          ? { clipPath: "circle(150% at calc(100% - 48px) 42px)" }
          : undefined
      }
    >
      <div className="border-gold/55 pointer-events-none absolute inset-6 border" />
      <div className="mx-auto flex min-h-[100svh] max-w-content flex-col px-gutter pb-10 pt-28">
        <div className="flex-1">
          {items.map((item) => (
            <div
              key={item.href}
              className="border-gold/25 overflow-hidden border-b"
            >
              <a
                className="group grid min-h-20 grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-4"
                data-mobile-menu-link
                href={item.href}
                onClick={(event) => onNavigate(event, item.href)}
              >
                <span
                  aria-hidden="true"
                  className="font-body text-[0.65rem] tracking-[0.24em] text-gold"
                >
                  {item.number}
                </span>
                <span className="font-display text-[clamp(2.2rem,9vw,3rem)] leading-none">
                  {item.label}
                </span>
                <span
                  aria-hidden="true"
                  className="text-gold transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          ))}
        </div>

        <div className="border-gold/30 mt-12 grid gap-6 border-t pt-7 text-xs tracking-[0.1em] sm:grid-cols-2">
          <div>
            <p className="text-gold">CONTACT</p>
            <a className="mt-2 block" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <p className="text-cream/65 mt-1">{site.location}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-gold">FOLLOW</p>
            <a
              className="mt-2 inline-block"
              href={site.instagramUrl}
              rel="noreferrer"
              target="_blank"
            >
              {site.instagramHandle}
            </a>
          </div>
        </div>
        <MandalaMark className="mt-10 h-7 w-7 text-gold" />
      </div>
    </div>
  );
}

"use client";

import type Lenis from "lenis";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import { MandalaMark } from "@/components/decor/MandalaMark";
import { gsap } from "@/lib/animations/gsap";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useScrollLock } from "@/lib/animations/useScrollLock";
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
  const closeButton = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
  useScrollLock(lenis, open);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("studio-viana:overlay-change", {
        detail: { open, source: "mobile-menu" },
      }),
    );
    return () => {
      if (open) {
        window.dispatchEvent(
          new CustomEvent("studio-viana:overlay-change", {
            detail: { open: false, source: "mobile-menu" },
          }),
        );
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !root.current) return;
    const menu = root.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const trigger = triggerRef.current;
    if (shouldReduceMotion) closeButton.current?.focus();
    else menu.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      const focusable = Array.from(
        menu.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (event.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeInside = menu.contains(document.activeElement);
      if (
        event.shiftKey &&
        (!activeInside || document.activeElement === first)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (!activeInside || document.activeElement === last)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (trigger ?? previousFocus)?.focus();
    };
  }, [onClose, open, shouldReduceMotion, triggerRef]);

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
          {
            autoAlpha: 1,
            duration: 0.65,
            onComplete: () => closeButton.current?.focus(),
            stagger: 0.08,
            yPercent: 0,
          },
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
      tabIndex={-1}
      style={
        shouldReduceMotion
          ? { clipPath: "circle(150% at calc(100% - 48px) 42px)" }
          : undefined
      }
    >
      <div className="pointer-events-none absolute inset-6 border border-gold/55" />
      <button
        ref={closeButton}
        aria-label="Close menu"
        className="absolute right-6 top-5 z-10 grid h-12 w-12 place-items-center text-cream"
        onClick={onClose}
        type="button"
      >
        <span
          aria-hidden="true"
          className="absolute h-px w-7 rotate-45 bg-current"
        />
        <span
          aria-hidden="true"
          className="absolute h-px w-7 -rotate-45 bg-current"
        />
      </button>
      <div className="mx-auto flex min-h-[100svh] max-w-content flex-col px-gutter pb-10 pt-28">
        <div className="flex-1">
          {items.map((item) => (
            <div
              key={item.href}
              className="overflow-hidden border-b border-gold/25"
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

        <div className="mt-12 grid gap-6 border-t border-gold/30 pt-7 text-xs tracking-[0.1em] sm:grid-cols-2">
          <div>
            <p className="text-gold">CONTACT</p>
            <a className="mt-2 block" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <p className="mt-1 text-cream/65">{site.location}</p>
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

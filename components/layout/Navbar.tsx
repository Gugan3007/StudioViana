"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MandalaMark } from "@/components/decor/MandalaMark";
import { OrderBagButton } from "@/components/layout/OrderBagButton";
import {
  MobileMenu,
  type NavigationItem,
} from "@/components/layout/MobileMenu";
import { useNavTheme } from "@/components/layout/useNavTheme";
import { useScrollDirection } from "@/components/layout/useScrollDirection";
import { Button } from "@/components/ui/Button";
import { ScrollTrigger } from "@/lib/animations/gsap";
import { useLenis } from "@/lib/animations/useLenis";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useIntro } from "@/lib/context/IntroContext";
import { whatsappLink } from "@/lib/data/site";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "#collection", label: "Collection", number: "01" },
  { href: "#about", label: "About", number: "02" },
  { href: "#craft-closeup", label: "Craft", number: "03" },
  { href: "#gallery", label: "Gallery", number: "04" },
  { href: "#pricing", label: "Pricing", number: "05" },
  { href: "#order", label: "Order", number: "06" },
  { href: "#contact", label: "Contact", number: "07" },
] as const satisfies readonly NavigationItem[];

const whatsappHref = whatsappLink(
  "Hello Studio Viana! I’d love to know more about your handcrafted florals.",
);

export function Navbar() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { lenis } = useLenis();
  const { introComplete } = useIntro();
  const shouldReduceMotion = useReducedMotion();
  const direction = useScrollDirection(lenis);
  const theme = useNavTheme(lenis);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  useEffect(() => {
    const update = (scroll: number) => setScrolled(scroll > 80);
    update(lenis?.animatedScroll ?? window.scrollY);
    if (lenis) return lenis.on("scroll", (instance) => update(instance.scroll));

    const handleScroll = () => update(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lenis]);

  useEffect(() => {
    const sampleActiveSection = () => {
      const readingLine = window.innerHeight * 0.45;
      const active = navigationItems.find((item) => {
        const target = document.querySelector<HTMLElement>(item.href);
        if (!target) return false;
        const bounds = target.getBoundingClientRect();
        return bounds.top <= readingLine && bounds.bottom >= readingLine;
      });
      if (active) setActiveSection(active.href.slice(1));
    };

    const triggers = navigationItems.flatMap((item) => {
      const target = document.querySelector<HTMLElement>(item.href);
      if (!target) return [];

      return [
        ScrollTrigger.create({
          trigger: target,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (!self.isActive) return;
            setActiveSection(item.href.slice(1));
            window.requestAnimationFrame(sampleActiveSection);
          },
        }),
      ];
    });

    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navigate = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: `#${string}`) => {
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      event.preventDefault();
      setActiveSection(href.slice(1));
      setMenuOpen(false);

      const scroll = () => {
        if (lenis && !shouldReduceMotion) {
          // Passing the numeric document position prevents CSS scroll-margin
          // from being added to Lenis's explicit fixed-header offset twice.
          lenis.scrollTo(target.offsetTop, { duration: 1.4, offset: -84 });
        } else {
          target.scrollIntoView({
            behavior: shouldReduceMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      };
      if (menuOpen) window.requestAnimationFrame(scroll);
      else scroll();
    },
    [lenis, menuOpen, shouldReduceMotion],
  );

  const hidden = scrolled && direction === "down" && !menuOpen && !focusWithin;
  const dark = theme === "dark";

  return (
    <>
      <header
        className={cn(
          "ease-luxury fixed inset-x-0 top-0 z-[80] h-[72px] border-b transition-[transform,opacity,background-color,border-color,color] duration-500 lg:h-[84px]",
          dark ? "text-cream" : "text-charcoal",
          scrolled &&
            (dark
              ? "border-gold/40 bg-forest/[0.85] backdrop-blur-xl"
              : "border-gold/40 bg-cream/[0.85] backdrop-blur-xl"),
          !scrolled && "border-transparent bg-transparent",
          hidden && "-translate-y-full",
          !introComplete &&
            !scrolled &&
            !focusWithin &&
            "pointer-events-none opacity-0",
        )}
        data-nav-hidden={hidden || undefined}
        data-nav-theme={theme}
        data-nav-visible={introComplete || scrolled || focusWithin || undefined}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocusWithin(false);
          }
        }}
        onFocusCapture={() => setFocusWithin(true)}
      >
        <div className="mx-auto grid h-full max-w-content grid-cols-[1fr_auto] items-center px-gutter lg:grid-cols-[1fr_auto_1fr]">
          <a
            className="inline-flex w-fit items-center gap-2.5 font-display text-lg tracking-[-0.02em] lg:text-xl"
            href="#home"
            onClick={(event) => navigate(event, "#home")}
          >
            <MandalaMark className="h-6 w-6 text-gold" />
            <span>Studio Viana</span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-[clamp(1.35rem,2.4vw,2.8rem)] lg:flex"
          >
            {navigationItems.map((item) => {
              const active = activeSection === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  aria-current={active ? "page" : undefined}
                  className="group relative py-3 font-body text-[0.68rem] font-normal uppercase tracking-[0.17em]"
                  href={item.href}
                  onClick={(event) => navigate(event, item.href)}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 bottom-1 h-px origin-left bg-gold transition-transform duration-500",
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 justify-self-end lg:flex">
            <Button
              className={cn(
                "min-h-11 px-5 text-[0.63rem]",
                dark && "border-gold text-cream",
              )}
              href={whatsappHref}
              rel="noreferrer"
              target="_blank"
              variant="outline-gold"
            >
              Order on WhatsApp
            </Button>
            <OrderBagButton />
          </div>

          <div className="flex items-center gap-1 justify-self-end lg:hidden">
            <OrderBagButton />
            <button
              ref={triggerRef}
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              aria-hidden={menuOpen || undefined}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={cn(
                "relative z-[100] flex h-12 w-12 items-center justify-center text-current",
                menuOpen && "pointer-events-none text-cream",
              )}
              onClick={() => setMenuOpen((open) => !open)}
              tabIndex={menuOpen ? -1 : 0}
              type="button"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute h-px w-7 bg-current transition-transform duration-500",
                  menuOpen ? "rotate-45" : "-translate-y-1",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute h-px w-7 bg-current transition-transform duration-500",
                  menuOpen ? "-rotate-45" : "translate-y-1",
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-navigation">
        <MobileMenu
          items={navigationItems}
          lenis={lenis}
          onClose={closeMenu}
          onNavigate={navigate}
          open={menuOpen}
          triggerRef={triggerRef}
        />
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PaperGrain } from "@/components/decor/PaperGrain";
import { HeroCollage } from "@/components/sections/home/HeroCollage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useLenis } from "@/lib/animations/useLenis";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useIntro } from "@/lib/context/IntroContext";
import { whatsappLink } from "@/lib/data/site";

const whatsappHref = whatsappLink(
  "Hello Studio Viana! I’d love to order a handcrafted chenille floral piece.",
);

export function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const entered = useRef(false);
  const { lenis } = useLenis();
  const { introComplete } = useIntro();
  const shouldReduceMotion = useReducedMotion();
  const [heroVisible, setHeroVisible] = useState(false);
  const entranceReady = introComplete || heroVisible || shouldReduceMotion;

  useEffect(() => {
    const section = root.current;
    if (!section || introComplete || shouldReduceMotion) return;

    // A native anchor jump can reach Home before the pinned intro's onLeave
    // state propagates. First-view observation starts the same one-shot hero
    // timeline immediately, while IntroContext still owns navbar completion.
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          setHeroVisible(true);
          observer.disconnect();
        },
        { threshold: 0.1 },
      );
      observer.observe(section);
      return () => observer.disconnect();
    }

    const checkVisibility = () => {
      const bounds = section.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) {
        setHeroVisible(true);
      }
    };
    const frame = window.requestAnimationFrame(checkVisibility);
    window.addEventListener("scroll", checkVisibility, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", checkVisibility);
    };
  }, [introComplete, shouldReduceMotion]);

  useIsomorphicLayoutEffect(() => {
    const section = root.current;
    if (!section || entered.current) return;
    if (!entranceReady) return;

    entered.current = true;
    section.dataset.heroEntered = "true";
    const entranceTargets = section.querySelectorAll("[data-hero-entrance]");

    if (shouldReduceMotion) {
      gsap.set(entranceTargets, {
        autoAlpha: 1,
        clearProps: "transform,clipPath",
      });
      window.dispatchEvent(new CustomEvent("studio-viana:hero-entered"));
      return;
    }

    const context = gsap.context(() => {
      const label = section.querySelector("[data-hero-label]");
      const headline = section.querySelectorAll("[data-split-token]");
      const divider = section.querySelector("[data-hero-divider]");
      const copy = section.querySelectorAll("[data-hero-copy]");
      const images = section.querySelectorAll("[data-hero-image]");
      const imageFrames = Array.from(images).map(
        (image) => image.firstElementChild,
      );
      const badge = section.querySelector("[data-hero-badge]");

      // The 2.2s hand-off begins only after IntroContext completes: label,
      // split headline, supporting copy, image planes, badge, then nav signal.
      const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });
      timeline
        .addLabel("label", 0)
        .addLabel("headline", 0.12)
        .addLabel("copy", 0.55)
        .addLabel("images", 0.72)
        .addLabel("badge", 1.45)
        .addLabel("navigation", 1.7)
        .fromTo(
          label,
          { autoAlpha: 0, letterSpacing: "0.6em", y: 8 },
          {
            autoAlpha: 1,
            duration: 0.75,
            letterSpacing: "0.35em",
            y: 0,
          },
          "label",
        )
        .fromTo(
          headline,
          { autoAlpha: 0, yPercent: 110 },
          {
            autoAlpha: 1,
            duration: 1.2,
            stagger: 0.12,
            yPercent: 0,
          },
          "headline",
        )
        .fromTo(
          divider,
          { scaleX: 0 },
          { duration: 0.7, scaleX: 1, transformOrigin: "left center" },
          "copy",
        )
        .fromTo(
          copy,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, duration: 0.75, stagger: 0.08, y: 0 },
          "copy+=0.08",
        )
        .fromTo(
          images,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1,
            stagger: 0.15,
          },
          "images",
        )
        .fromTo(
          imageFrames,
          { scale: 1.2 },
          { duration: 1.1, scale: 1, stagger: 0.15 },
          "images",
        )
        .fromTo(
          badge,
          { autoAlpha: 0, rotation: -18, scale: 0.7 },
          { autoAlpha: 1, duration: 0.8, rotation: 0, scale: 1 },
          "badge",
        )
        .call(
          () =>
            window.dispatchEvent(new CustomEvent("studio-viana:hero-entered")),
          [],
          "navigation",
        );
    }, root);

    return () => context.revert();
  }, [entranceReady, shouldReduceMotion]);

  const scrollToCollection = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById("collection");
      if (!target) return;
      event.preventDefault();
      if (lenis && !shouldReduceMotion) {
        lenis.scrollTo(target.offsetTop, { duration: 1.4, offset: -84 });
      } else {
        target.scrollIntoView({
          behavior: shouldReduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [lenis, shouldReduceMotion],
  );

  return (
    <section
      ref={root}
      id="home"
      aria-labelledby="home-hero-heading"
      className="relative min-h-[100svh] scroll-mt-0 overflow-hidden bg-cream pb-12 pt-28 text-charcoal sm:pt-32 lg:flex lg:items-center lg:pb-16 lg:pt-[7.5rem]"
      data-home-hero
      data-testid="home-hero"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(233,201,201,0.3),transparent_37%)]"
      />
      <PaperGrain />

      <Container className="relative z-10" grid>
        <div className="col-span-12 flex flex-col justify-center lg:col-span-6 lg:pr-5 xl:pr-9">
          <SectionLabel
            className="max-w-xl text-[0.62rem] tracking-[0.31em] sm:text-label sm:tracking-label"
            data-hero-entrance
            data-hero-label
          >
            Handcrafted Chenille Florals
          </SectionLabel>

          <div
            className="mt-7 font-display text-[clamp(3rem,12.5vw,5.1rem)] font-medium leading-[0.98] tracking-[-0.045em] sm:text-[clamp(4rem,9vw,6rem)] lg:mt-8 lg:text-[clamp(3.5rem,5.2vw,5.7rem)]"
            data-controlled-split="true"
          >
            <h1
              id="home-hero-heading"
              aria-label="Where flowers become forever memories."
            >
              <span className="sr-only">
                Where flowers become forever memories.
              </span>
              <span aria-hidden="true">
                <span className="block overflow-hidden">
                  <span
                    className="inline-block"
                    data-hero-entrance
                    data-split-token
                  >
                    Where flowers
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span
                    className="inline-block"
                    data-hero-entrance
                    data-split-token
                  >
                    become <em className="font-normal text-gold">forever</em>
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span
                    className="inline-block"
                    data-hero-entrance
                    data-split-token
                  >
                    memories.
                  </span>
                </span>
              </span>
            </h1>
          </div>

          <GoldDivider className="mt-8" data-hero-divider data-hero-entrance />
          <p
            className="mt-7 max-w-[31rem] text-[0.92rem] font-light leading-7 text-muted sm:text-base sm:leading-8"
            data-hero-copy
            data-hero-entrance
          >
            Handcrafted chenille blooms, shaped stem by stem and petal by petal
            — made to order in Tamil Nadu, and made to last long after fresh
            flowers fade.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            data-hero-copy
            data-hero-entrance
          >
            <Button
              className="w-full sm:w-auto"
              href="#collection"
              onClick={scrollToCollection}
              variant="solid-forest"
            >
              Explore Collection
              <span aria-hidden="true" className="ml-3 text-base">
                →
              </span>
            </Button>
            <Button
              className="w-full sm:w-auto"
              href={whatsappHref}
              rel="noreferrer"
              target="_blank"
              variant="outline-gold"
            >
              Order on WhatsApp
            </Button>
          </div>

          <p
            className="mt-7 text-[0.58rem] font-medium uppercase tracking-[0.2em] text-muted sm:text-[0.63rem] sm:tracking-[0.27em]"
            data-hero-copy
            data-hero-entrance
          >
            Handmade <span className="px-2 text-gold">·</span> Made to Order{" "}
            <span className="px-2 text-gold">·</span> Custom Palettes
          </p>
        </div>

        <div className="col-span-12 mt-10 lg:col-span-6 lg:mt-0">
          <HeroCollage />
        </div>

        <div className="col-span-12 mt-9 flex items-end justify-between text-[0.6rem] uppercase tracking-[0.24em] text-muted lg:mt-3">
          <span
            className="flex items-end gap-3"
            data-hero-copy
            data-hero-entrance
          >
            <span className="bg-gold/30 relative h-12 w-px overflow-hidden">
              <span className="intro-scroll-drop absolute inset-x-0 top-0 h-5 bg-gold" />
            </span>
            Scroll
          </span>
          <span data-hero-copy data-hero-entrance>
            2026–27 Collection
          </span>
        </div>
      </Container>
    </section>
  );
}

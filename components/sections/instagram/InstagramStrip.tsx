"use client";

import Image from "next/image";
import { useRef } from "react";

import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import {
  instagramItems,
  instagramProfileUrl,
  type InstagramItem,
} from "@/lib/data/instagram";

function InstagramTile({
  decorative = false,
  item,
}: {
  decorative?: boolean;
  item: InstagramItem;
}) {
  const content = (
    <>
      <Image
        fill
        alt={decorative ? "" : item.alt}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        placeholder="blur"
        sizes="(min-width: 768px) 22vw, 68vw"
        src={item.src}
      />
      <span className="absolute inset-0 grid place-items-center bg-forest/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        <svg
          aria-hidden="true"
          className="h-8 w-8 text-cream"
          fill="none"
          viewBox="0 0 24 24"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            stroke="currentColor"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      </span>
    </>
  );

  if (decorative) {
    return (
      <a
        aria-hidden="true"
        className="group relative block aspect-square w-[min(68vw,19rem)] shrink-0 overflow-hidden sm:w-64 lg:w-[22vw]"
        data-cursor="link"
        data-instagram-duplicate
        href={instagramProfileUrl}
        rel="noreferrer"
        tabIndex={-1}
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <a
      aria-label={`View ${item.alt} on Instagram`}
      className="group relative block aspect-square w-[min(68vw,19rem)] shrink-0 overflow-hidden transition-transform duration-500 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:w-64 lg:w-[22vw]"
      data-cursor="view"
      href={instagramProfileUrl}
      rel="noreferrer"
      target="_blank"
    >
      {content}
    </a>
  );
}

export function InstagramStrip() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const visible = useRef(true);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current || !track.current) return;
    const compact = window.matchMedia?.("(max-width: 767px)").matches ?? false;
    const loop = gsap.timeline({ repeat: -1 });
    timeline.current = loop;
    loop.to(track.current, {
      duration: compact ? 48 : 34,
      ease: "none",
      modifiers: {
        xPercent: (value: string) => String(Number.parseFloat(value) % 50),
      },
      xPercent: -50,
    });

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            visible.current = entry.isIntersecting;
            if (entry.isIntersecting) loop.play();
            else loop.pause();
          });
    observer?.observe(root.current);

    let velocityTween: gsap.core.Tween | undefined;
    let settleTimer = 0;
    const trigger = ScrollTrigger.create({
      end: "bottom top",
      onUpdate(self) {
        const velocity = self.getVelocity();
        const magnitude = Math.min(3, 1 + Math.abs(velocity) / 2_000);
        velocityTween?.kill();
        velocityTween = gsap.to(loop, {
          duration: 0.4,
          overwrite: true,
          timeScale: (velocity < 0 ? -1 : 1) * magnitude,
        });
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          velocityTween?.kill();
          velocityTween = gsap.to(loop, {
            duration: 0.8,
            overwrite: true,
            timeScale: 1,
          });
        }, 180);
      },
      start: "top bottom",
      trigger: root.current,
    });

    return () => {
      window.clearTimeout(settleTimer);
      velocityTween?.kill();
      observer?.disconnect();
      trigger.kill();
      loop.kill();
      gsap.set(track.current, { clearProps: "transform" });
      timeline.current = null;
    };
  }, [shouldReduceMotion]);

  return (
    <section
      ref={root}
      id="instagram"
      aria-labelledby="instagram-heading"
      className="overflow-hidden bg-cream py-[clamp(6rem,10vw,9rem)]"
      data-theme="light"
    >
      <header className="px-gutter text-center">
        <SectionLabel>Follow the Bloom</SectionLabel>
        <h2
          id="instagram-heading"
          className="mt-5 font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-none tracking-[-0.045em] text-forest"
        >
          <a
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            href={instagramProfileUrl}
            rel="noreferrer"
            target="_blank"
          >
            @studio_viana.in
          </a>
        </h2>
      </header>

      <div
        className="mt-14 px-gutter"
        data-instagram-motion={shouldReduceMotion ? "static" : "loop"}
        data-instagram-rail
        onPointerEnter={() => timeline.current?.pause()}
        onPointerLeave={() => {
          if (visible.current) timeline.current?.play();
        }}
      >
        <div
          ref={track}
          className="flex w-max gap-3 will-change-transform md:gap-5"
        >
          <div className="flex gap-3 md:gap-5">
            {instagramItems.map((item) => (
              <InstagramTile key={item.id} item={item} />
            ))}
          </div>
          {!shouldReduceMotion ? (
            <div aria-hidden="true" className="flex gap-3 md:gap-5">
              {instagramItems.map((item) => (
                <InstagramTile
                  key={`duplicate-${item.id}`}
                  decorative
                  item={item}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-12 px-gutter text-center">
        <Button
          href={instagramProfileUrl}
          rel="noreferrer"
          target="_blank"
          variant="outline-gold"
        >
          Follow on Instagram
        </Button>
      </div>
    </section>
  );
}

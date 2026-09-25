"use client";

import Image from "next/image";
import { useRef } from "react";

import { AnnotationCallout } from "@/components/sections/craft/AnnotationCallout";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { craftMotion } from "@/lib/data/process";
import closeupFlower from "@/public/images/craft/closeup-flower.jpg";
import closeupMacro from "@/public/images/craft/closeup-macro.jpg";

const callouts = [
  {
    className: "md:-left-48 md:top-[18%]",
    description: "Soft fibres become a lasting stem.",
    label: "Hand-twisted chenille stems",
    path: "M180 58 C120 58 88 35 0 8",
  },
  {
    className: "md:-right-48 md:top-[42%] md:text-right",
    description: "No two blooms carry the same touch.",
    label: "Each petal shaped individually",
    path: "M0 60 C72 60 104 30 180 6",
  },
  {
    className: "md:-left-44 md:bottom-[8%]",
    description: "The final details, placed one by one.",
    label: "Finished with pearls & ribbon",
    path: "M180 10 C120 10 82 36 0 62",
  },
] as const;

export function UpClose() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const baseImage = useRef<HTMLImageElement>(null);
  const macroImage = useRef<HTMLImageElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!root.current || !media.current || shouldReduceMotion) return;

    const mediaQuery = gsap.matchMedia();
    // Desktop is one 200vh narrative: copy enters, the framed bloom magnifies,
    // the macro crossfades in, callout lines draw in order, then the image
    // settles before the pinned stage releases into the process story.
    mediaQuery.add("(min-width: 768px)", () => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          end: `+=${craftMotion.pinDistanceVh}%`,
          pin: stage.current,
          scrub: craftMotion.scrub,
          start: "top top",
          trigger: root.current,
        },
      });

      timeline
        .fromTo(
          "[data-up-close-copy] > *",
          { opacity: 0, y: 30 },
          { opacity: 1, stagger: 0.08, y: 0 },
        )
        .to(media.current, { scale: craftMotion.desktopMediaZoom }, "<0.15")
        .fromTo(
          macroImage.current,
          { opacity: 0, scale: 1.12 },
          { opacity: 1, scale: 1 },
        )
        .to(baseImage.current, { opacity: 0 }, "<")
        .fromTo(
          "[data-callout-line]",
          { strokeDashoffset: 1 },
          {
            stagger: craftMotion.calloutStagger,
            strokeDashoffset: 0,
          },
        )
        .fromTo(
          "[data-callout-label]",
          { opacity: 0, y: 10 },
          { opacity: 1, stagger: craftMotion.calloutStagger, y: 0 },
          "<",
        )
        .to(media.current, { scale: craftMotion.desktopReleaseZoom });
    });

    mediaQuery.add("(max-width: 767px)", () =>
      gsap.fromTo(
        media.current,
        { scale: 1 },
        {
          ease: "none",
          scale: craftMotion.mobileMediaZoom,
          scrollTrigger: {
            end: "bottom top",
            scrub: craftMotion.scrub,
            start: "top bottom",
            trigger: media.current,
          },
        },
      ),
    );

    return () => mediaQuery.revert();
  }, [shouldReduceMotion]);

  return (
    <section
      ref={root}
      id="craft-closeup"
      aria-labelledby="craft-closeup-heading"
      className="relative min-h-[100svh] overflow-hidden bg-forest-deep text-cream md:h-[200vh]"
      data-theme="dark"
    >
      <div
        ref={stage}
        className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-16 px-gutter py-28 md:grid-cols-[0.72fr_1.28fr] md:gap-16 md:py-20"
      >
        <div data-up-close-copy>
          <SectionLabel className="text-gold-light">Up Close</SectionLabel>
          <h2
            id="craft-closeup-heading"
            className="mt-6 max-w-xl text-balance font-display text-[clamp(3.2rem,6vw,6.2rem)] leading-[0.92] tracking-[-0.045em]"
          >
            Every fibre, shaped by hand.
          </h2>
          <p className="mt-8 max-w-lg font-body text-sm font-light leading-7 text-cream/70 md:text-base md:leading-8">
            No moulds, no printing, no shortcuts. Each stem is twisted, bent and
            layered by hand until it holds its bloom — soft to the touch, and
            made to last for years.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative overflow-hidden border border-gold/65 p-3 md:p-4">
            <div className="relative aspect-[4/5] overflow-hidden">
              <div
                ref={media}
                className="absolute inset-0 origin-center will-change-transform"
              >
                <Image
                  ref={baseImage}
                  fill
                  alt="Pink chenille gerbera handcrafted petal by petal"
                  className="object-cover"
                  placeholder="blur"
                  sizes="(min-width: 768px) 48vw, 88vw"
                  src={closeupFlower}
                />
                <Image
                  ref={macroImage}
                  fill
                  alt="Macro detail of soft chenille fibres and pearl finishing"
                  className="object-cover"
                  placeholder="blur"
                  sizes="(min-width: 768px) 48vw, 88vw"
                  src={closeupMacro}
                  style={{ opacity: shouldReduceMotion ? 1 : 0 }}
                />
              </div>
            </div>
          </div>

          <ol className="mt-9 grid gap-6 md:absolute md:inset-0 md:mt-0 md:block">
            {callouts.map((callout, index) => (
              <AnnotationCallout
                key={callout.label}
                {...callout}
                index={index + 1}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

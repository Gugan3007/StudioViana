"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { TestimonialSlide } from "@/components/sections/testimonials/TestimonialSlide";
import { TrustStats } from "@/components/sections/testimonials/TrustStats";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { testimonials } from "@/lib/data/testimonials";

const AUTOPLAY_MS = 6_000;
const SWIPE_THRESHOLD = 48;

export function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const pointerStart = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const navigate = useCallback((nextDirection: -1 | 1) => {
    setDirection(nextDirection);
    setActiveIndex(
      (index) =>
        (index + nextDirection + testimonials.length) % testimonials.length,
    );
    setResetKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setIsIntersecting(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry?.isIntersecting ?? false),
      { threshold: 0.3 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const autoplaying = isIntersecting && !isHovered && !shouldReduceMotion;
  useEffect(() => {
    if (!autoplaying) return;
    const timer = window.setInterval(() => navigate(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplaying, navigate, resetKey]);

  return (
    <section
      ref={root}
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden bg-cream px-gutter py-[clamp(6rem,12vw,11rem)]"
      data-theme="light"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 font-display text-[min(50vw,25rem)] leading-none text-gold/[0.08]"
      >
        “
      </span>
      <header className="relative mx-auto max-w-4xl text-center">
        <SectionLabel>Kind Words</SectionLabel>
        <h2
          id="testimonials-heading"
          className="mt-5 text-balance font-display text-[clamp(2.8rem,6vw,5.7rem)] leading-[0.98] tracking-[-0.045em] text-forest"
        >
          Loved by those who gift, and those who receive.
        </h2>
      </header>

      <div
        aria-label="Customer testimonials"
        aria-live="polite"
        className="relative mx-auto mt-16 max-w-5xl md:mt-20"
        onPointerDown={(event) => {
          pointerStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (pointerStart.current === null) return;
          const travel = event.clientX - pointerStart.current;
          pointerStart.current = null;
          if (Math.abs(travel) >= SWIPE_THRESHOLD)
            navigate(travel < 0 ? 1 : -1);
        }}
        role="region"
      >
        <p className="sr-only">
          {testimonials[activeIndex].quote}{" "}
          <span data-testid="testimonial-name">
            {testimonials[activeIndex].name}
          </span>
          , {testimonials[activeIndex].occasion},{" "}
          {testimonials[activeIndex].product}
        </p>
        <TestimonialSlide
          direction={direction}
          testimonial={testimonials[activeIndex]}
        />

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            aria-label="Previous testimonial"
            className="grid h-11 w-11 place-items-center border border-gold/50 text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            onClick={() => navigate(-1)}
            type="button"
          >
            ←
          </button>
          <div className="h-px w-32 overflow-hidden bg-gold/25 md:w-48">
            {autoplaying ? (
              <motion.span
                key={resetKey}
                animate={{ scaleX: 1 }}
                className="block h-full origin-left bg-gold"
                initial={{ scaleX: 0 }}
                transition={{ duration: AUTOPLAY_MS / 1_000, ease: "linear" }}
              />
            ) : null}
          </div>
          <button
            aria-label="Next testimonial"
            className="grid h-11 w-11 place-items-center border border-gold/50 text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            onClick={() => navigate(1)}
            type="button"
          >
            →
          </button>
        </div>
      </div>

      <TrustStats active={isIntersecting} />
    </section>
  );
}
